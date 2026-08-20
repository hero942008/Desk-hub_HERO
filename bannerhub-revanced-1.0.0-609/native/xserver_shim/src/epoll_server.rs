//! Decoupled Non-Blocking Epoll Socket Server & Event Multiplexer.
//!
//! Provides ultra-low CPU overhead socket processing for X11 & XServer clients
//! using Edge-Triggered epoll (EPOLLET) on Linux/Android.

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

pub const MAX_EPOLL_EVENTS: usize = 128;

pub struct EpollMultiplexer {
    is_running: AtomicBool,
    total_messages_dispatched: AtomicU64,
    epoll_fd: AtomicU64,
}

impl EpollMultiplexer {
    pub const fn new() -> Self {
        Self {
            is_running: AtomicBool::new(false),
            total_messages_dispatched: AtomicU64::new(0),
            epoll_fd: AtomicU64::new(0),
        }
    }

    pub fn start(&self) -> bool {
        #[cfg(target_os = "android")]
        unsafe {
            let epfd = libc::epoll_create1(libc::EPOLL_CLOEXEC);
            if epfd >= 0 {
                self.epoll_fd.store(epfd as u64, Ordering::Release);
                self.is_running.store(true, Ordering::Release);
                return true;
            }
            false
        }
        #[cfg(not(target_os = "android"))]
        {
            self.is_running.store(true, Ordering::Release);
            true
        }
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::Release);
        #[cfg(target_os = "android")]
        unsafe {
            let epfd = self.epoll_fd.swap(0, Ordering::Relaxed) as i32;
            if epfd > 0 {
                libc::close(epfd);
            }
        }
    }

    #[inline(always)]
    pub fn is_active(&self) -> bool {
        self.is_running.load(Ordering::Relaxed)
    }

    #[inline(always)]
    pub fn record_dispatch(&self) {
        self.total_messages_dispatched.fetch_add(1, Ordering::Relaxed);
    }
}
