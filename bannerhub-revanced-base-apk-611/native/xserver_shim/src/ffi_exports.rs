//! C-ABI FFI Exports for Native C++/JNI Integration with Zero Reflection Cost

use crate::spsc_input_dispatcher::{SpscInputRingBuffer, UInputPacket};
use crate::vfs_zstd_mmap::NativeVfsEngine;
use crate::wineserver_zero_copy_ipc::ZeroCopyIpcEngine;
use std::ffi::{CStr, c_char, c_int, c_uchar};
use std::sync::{Mutex, OnceLock};

static GLOBAL_VFS: OnceLock<NativeVfsEngine> = OnceLock::new();
static GLOBAL_IPC: OnceLock<ZeroCopyIpcEngine> = OnceLock::new();
static GLOBAL_INPUT: OnceLock<Mutex<SpscInputRingBuffer>> = OnceLock::new();

#[no_mangle]
pub unsafe extern "C" fn deskhub_vfs_mount(archive_path: *const c_char, virtual_dir: *const c_char) -> c_int {
    if archive_path.is_null() || virtual_dir.is_null() {
        return -1;
    }
    let p_archive = match CStr::from_ptr(archive_path).to_str() {
        Ok(s) => s,
        Err(_) => return -2,
    };
    let p_virt = match CStr::from_ptr(virtual_dir).to_str() {
        Ok(s) => s,
        Err(_) => return -3,
    };

    let vfs = GLOBAL_VFS.get_or_init(NativeVfsEngine::new);
    match vfs.mount_archive(p_archive, p_virt) {
        Ok(_) => 0,
        Err(_) => -4,
    }
}

#[no_mangle]
pub unsafe extern "C" fn deskhub_vfs_read_exact(
    virtual_path: *const c_char,
    offset: u64,
    out_buf: *mut c_uchar,
    buf_len: usize,
) -> isize {
    if virtual_path.is_null() || out_buf.is_null() || buf_len == 0 {
        return -1;
    }
    let p_virt = match CStr::from_ptr(virtual_path).to_str() {
        Ok(s) => s,
        Err(_) => return -2,
    };

    let vfs = GLOBAL_VFS.get_or_init(NativeVfsEngine::new);
    let slice = std::slice::from_raw_parts_mut(out_buf, buf_len);
    match vfs.read_asset_exact(p_virt, offset, slice) {
        Ok(n) => n as isize,
        Err(_) => -3,
    }
}

#[no_mangle]
pub unsafe extern "C" fn deskhub_ipc_zero_copy_relay(
    src_ptr: *const c_uchar,
    len: usize,
    target_socket_fd: c_int,
) -> isize {
    if src_ptr.is_null() || len == 0 || target_socket_fd < 0 {
        return -1;
    }
    let ipc = match GLOBAL_IPC.get_or_init(|| ZeroCopyIpcEngine::new().expect("IPC init failed")) {
        engine => engine,
    };

    let spliced = ipc.vmsplice_into_pipe(src_ptr, len);
    if spliced <= 0 {
        return spliced;
    }
    ipc.splice_to_socket(target_socket_fd, spliced as usize)
}

#[no_mangle]
pub unsafe extern "C" fn deskhub_input_push_event(type_: u16, code: u16, value: i32) -> c_int {
    let input_lock = GLOBAL_INPUT.get_or_init(|| Mutex::new(SpscInputRingBuffer::new()));
    if let Ok(mut buffer) = input_lock.lock() {
        let packet = UInputPacket {
            type_,
            code,
            value,
            timestamp_ns: 0,
        };
        if buffer.push(packet) {
            0
        } else {
            -2 // Buffer full
        }
    } else {
        -1
    }
}
