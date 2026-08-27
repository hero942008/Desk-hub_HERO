//! Wine Server Zero-Copy IPC Protocol Engine
//! Utilizes kernel pipe buffers via splice(2) and vmsplice(2) to pass memory pages with zero user-space copies.

use libc::{c_int, c_void, size_t, iovec, SPLICE_F_MOVE, SPLICE_F_NONBLOCK};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

pub const IPC_PIPE_SIZE: usize = 65536 * 4; // 256KB kernel pipe buffer

pub struct ZeroCopyIpcEngine {
    is_active: AtomicBool,
    pipe_read_fd: c_int,
    pipe_write_fd: c_int,
    total_bytes_spliced: AtomicU64,
}

impl ZeroCopyIpcEngine {
    pub fn new() -> Result<Self, String> {
        let mut pipefds: [c_int; 2] = [-1, -1];
        let res = unsafe { libc::pipe2(pipefds.as_mut_ptr(), libc::O_NONBLOCK | libc::O_CLOEXEC) };
        if res != 0 {
            return Err("Failed to create IPC kernel pipe".to_string());
        }

        unsafe {
            libc::fcntl(pipefds[0], libc::F_SETPIPE_SZ, IPC_PIPE_SIZE as c_int);
        }

        Ok(Self {
            is_active: AtomicBool::new(true),
            pipe_read_fd: pipefds[0],
            pipe_write_fd: pipefds[1],
            total_bytes_spliced: AtomicU64::new(0),
        })
    }

    /// Zero-copy transfer from user memory into pipe using vmsplice(2)
    #[inline(always)]
    pub unsafe fn vmsplice_into_pipe(&self, user_ptr: *const u8, len: usize) -> isize {
        let iov = iovec {
            iov_base: user_ptr as *mut c_void,
            iov_len: len as size_t,
        };

        let written = libc::vmsplice(
            self.pipe_write_fd,
            &iov,
            1,
            SPLICE_F_NONBLOCK,
        );

        if written > 0 {
            self.total_bytes_spliced
                .fetch_add(written as u64, Ordering::Relaxed);
        }
        written
    }

    /// Zero-copy pass from pipe directly into target socket descriptor using splice(2)
    #[inline(always)]
    pub unsafe fn splice_to_socket(&self, target_socket_fd: c_int, len: usize) -> isize {
        let transferred = libc::splice(
            self.pipe_read_fd,
            core::ptr::null_mut(),
            target_socket_fd,
            core::ptr::null_mut(),
            len as size_t,
            SPLICE_F_MOVE | SPLICE_F_NONBLOCK,
        );

        if transferred > 0 {
            self.total_bytes_spliced
                .fetch_add(transferred as u64, Ordering::Relaxed);
        }
        transferred
    }

    pub fn shutdown(&mut self) {
        self.is_active.store(false, Ordering::Release);
        unsafe {
            if self.pipe_read_fd >= 0 {
                libc::close(self.pipe_read_fd);
                self.pipe_read_fd = -1;
            }
            if self.pipe_write_fd >= 0 {
                libc::close(self.pipe_write_fd);
                self.pipe_write_fd = -1;
            }
        }
    }
}

impl Drop for ZeroCopyIpcEngine {
    fn drop(&mut self) {
        self.shutdown();
    }
}
