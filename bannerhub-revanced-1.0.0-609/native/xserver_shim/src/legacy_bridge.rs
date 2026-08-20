//! Safe Dynamic Linker and Legacy JNI Interceptor.
//!
//! Harvests legacy symbols from `libxserver_legacy.so` if user requests legacy GLES2 mode,
//! while isolating 6.0.7 deleted symbols to prevent `NoSuchMethodError` crashes.

use std::ffi::CStr;
use std::os::raw::{c_char, c_int, c_void};
use std::sync::atomic::{AtomicBool, Ordering};

pub const LEGACY_SONAME: &str = "libxserver_legacy.so\0";

#[repr(C)]
pub struct CapturedFunction {
    pub name: *const c_char,
    pub fn_ptr: *mut c_void,
}

pub static mut CAPTURED_FUNCS: [Option<CapturedFunction>; 32] = [None; 32];
pub static CAPTURED_COUNT: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
pub static LEGACY_LOADED: AtomicBool = AtomicBool::new(false);

pub unsafe fn find_captured_fn(name: &str) -> Option<*mut c_void> {
    let count = CAPTURED_COUNT.load(Ordering::Acquire);
    for i in 0..count {
        if let Some(ref cap) = CAPTURED_FUNCS[i] {
            if !cap.name.is_null() {
                if let Ok(c_str) = CStr::from_ptr(cap.name).to_str() {
                    if c_str == name {
                        return Some(cap.fn_ptr);
                    }
                }
            }
        }
    }
    None
}
