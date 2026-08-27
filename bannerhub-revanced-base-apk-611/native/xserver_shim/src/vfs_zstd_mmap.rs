//! High-Performance Memory-Mapped Virtual File System (VFS)
//! Streaming Zstandard decompression directly into virtual memory pages without heap copies.

use memmap2::{Mmap, MmapOptions};
use std::collections::HashMap;
use std::fs::File;
use std::io::{Cursor, Read};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::RwLock;

pub const PAGE_SIZE: usize = 4096;

pub struct MmapArchive {
    pub file_path: PathBuf,
    pub mmap_handle: Mmap,
    pub file_size: u64,
}

pub struct VfsMountEntry {
    pub archive: MmapArchive,
    pub virtual_mount: PathBuf,
    pub is_zstd: bool,
}

pub struct NativeVfsEngine {
    is_active: AtomicBool,
    total_bytes_decompressed: AtomicU64,
    mounts: RwLock<HashMap<String, VfsMountEntry>>,
}

impl NativeVfsEngine {
    pub fn new() -> Self {
        Self {
            is_active: AtomicBool::new(false),
            total_bytes_decompressed: AtomicU64::new(0),
            mounts: RwLock::new(HashMap::with_capacity(32)),
        }
    }

    /// Mounts an archive using kernel mmap (MAP_SHARED / PROT_READ)
    pub fn mount_archive<P: AsRef<Path>>(&self, archive_path: P, virtual_dir: P) -> Result<(), String> {
        let p = archive_path.as_ref();
        let file = File::open(p).map_err(|e| format!("Failed to open {}: {}", p.display(), e))?;
        let metadata = file.metadata().map_err(|e| e.to_string())?;
        let file_size = metadata.size();

        let mmap = unsafe {
            MmapOptions::new()
                .map(&file)
                .map_err(|e| format!("Mmap failed: {}", e))?
        };

        // Detect Zstandard Magic Number: 0xFD2FB528
        let is_zstd = if mmap.len() >= 4 {
            mmap[0..4] == [0x28, 0xB5, 0x2F, 0xFD]
        } else {
            false
        };

        let key = virtual_dir.as_ref().to_string_lossy().to_string();
        let entry = VfsMountEntry {
            archive: MmapArchive {
                file_path: p.to_path_buf(),
                mmap_handle: mmap,
                file_size,
            },
            virtual_mount: virtual_dir.as_ref().to_path_buf(),
            is_zstd,
        };

        let mut lock = self.mounts.write().map_err(|e| e.to_string())?;
        lock.insert(key, entry);
        self.is_active.store(true, Ordering::Release);

        Ok(())
    }

    /// Zero-copy read into target slice directly from mmap or via streaming Zstd decoder
    pub fn read_asset_exact(
        &self,
        virtual_path: &str,
        offset: u64,
        out_buffer: &mut [u8],
    ) -> Result<usize, String> {
        let lock = self.mounts.read().map_err(|e| e.to_string())?;
        let entry = lock
            .get(virtual_path)
            .ok_or_else(|| "Virtual mount not found".to_string())?;

        let mmap = &entry.archive.mmap_handle;
        if entry.is_zstd {
            let cursor = Cursor::new(&mmap[offset as usize..]);
            let mut decoder = zstd::stream::read::Decoder::new(cursor)
                .map_err(|e| format!("Zstd stream init failed: {}", e))?;
            
            let bytes_read = decoder
                .read(out_buffer)
                .map_err(|e| format!("Decompression failed: {}", e))?;

            self.total_bytes_decompressed
                .fetch_add(bytes_read as u64, Ordering::Relaxed);
            Ok(bytes_read)
        } else {
            let start = offset as usize;
            let end = (start + out_buffer.len()).min(mmap.len());
            let available = end.saturating_sub(start);
            out_buffer[..available].copy_from_slice(&mmap[start..end]);
            Ok(available)
        }
    }
}
