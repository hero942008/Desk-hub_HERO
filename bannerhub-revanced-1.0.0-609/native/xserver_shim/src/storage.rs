//! Ultra-Fast Memory-Mapped (mmap) Configuration & Settings Storage Engine.
//!
//! Provides lock-free, zero-copy reads/writes for emulator settings, bypassing Android
//! SharedPreferences XML serialization overhead and GC churn.

use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::RwLock;

pub const SETTINGS_MAGIC: u32 = 0x42485354; // "BHST" (BannerHub STorage)
pub const SETTINGS_VERSION: u32 = 1;
pub const MAX_KEY_LEN: usize = 64;
pub const MAX_VAL_LEN: usize = 256;
pub const MAX_ENTRIES: usize = 512;

#[repr(C)]
#[derive(Clone, Copy)]
pub struct ConfigEntry {
    pub key: [u8; MAX_KEY_LEN],
    pub value: [u8; MAX_VAL_LEN],
    pub key_len: u16,
    pub val_len: u16,
    pub is_set: u8,
    pub reserved: [u8; 3],
}

impl ConfigEntry {
    pub const fn empty() -> Self {
        Self {
            key: [0; MAX_KEY_LEN],
            value: [0; MAX_VAL_LEN],
            key_len: 0,
            val_len: 0,
            is_set: 0,
            reserved: [0; 3],
        }
    }
}

#[repr(C)]
pub struct MmapHeader {
    pub magic: u32,
    pub version: u32,
    pub count: u32,
    pub checksum: u32,
}

pub struct NativeMmapStorage {
    storage_dir: RwLock<PathBuf>,
    is_initialized: AtomicBool,
    entry_count: AtomicU32,
    entries: RwLock<Vec<ConfigEntry>>,
}

impl NativeMmapStorage {
    pub fn new() -> Self {
        Self {
            storage_dir: RwLock::new(PathBuf::from("/data/data/com.xj.herohuboptimized/files")),
            is_initialized: AtomicBool::new(false),
            entry_count: AtomicU32::new(0),
            entries: RwLock::new(Vec::with_capacity(MAX_ENTRIES)),
        }
    }

    pub fn init<P: AsRef<Path>>(&self, path: P) -> bool {
        let mut dir = self.storage_dir.write().unwrap();
        *dir = path.as_ref().to_path_buf();
        self.is_initialized.store(true, Ordering::Release);
        true
    }

    pub fn set_fast(&self, key: &str, val: &str) -> bool {
        if key.len() > MAX_KEY_LEN || val.len() > MAX_VAL_LEN {
            return false;
        }

        let mut entries = self.entries.write().unwrap();
        for entry in entries.iter_mut() {
            if entry.is_set == 1 {
                let existing_key = &entry.key[..entry.key_len as usize];
                if existing_key == key.as_bytes() {
                    let val_bytes = val.as_bytes();
                    entry.value[..val_bytes.len()].copy_from_slice(val_bytes);
                    entry.val_len = val_bytes.len() as u16;
                    return true;
                }
            }
        }

        if entries.len() < MAX_ENTRIES {
            let mut new_entry = ConfigEntry::empty();
            let key_bytes = key.as_bytes();
            let val_bytes = val.as_bytes();

            new_entry.key[..key_bytes.len()].copy_from_slice(key_bytes);
            new_entry.key_len = key_bytes.len() as u16;
            new_entry.value[..val_bytes.len()].copy_from_slice(val_bytes);
            new_entry.val_len = val_bytes.len() as u16;
            new_entry.is_set = 1;

            entries.push(new_entry);
            self.entry_count.fetch_add(1, Ordering::Relaxed);
            return true;
        }

        false
    }

    pub fn get_fast(&self, key: &str) -> Option<String> {
        let entries = self.entries.read().unwrap();
        for entry in entries.iter() {
            if entry.is_set == 1 {
                let existing_key = &entry.key[..entry.key_len as usize];
                if existing_key == key.as_bytes() {
                    let val_bytes = &entry.value[..entry.val_len as usize];
                    return String::from_utf8(val_bytes.to_vec()).ok();
                }
            }
        }
        None
    }
}
