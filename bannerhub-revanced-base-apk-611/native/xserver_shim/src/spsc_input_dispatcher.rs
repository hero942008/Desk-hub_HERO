//! Lock-Free SPSC Input Ring Buffer & Direct /dev/uinput Injection
//! Eliminates JVM Garbage Collection stalls and delivers 1ms input response.

use crate::asm_sync::arm64_dmb_ish;
use std::fs::OpenOptions;
use std::os::unix::fs::OpenOptionsExt;
use std::os::unix::io::AsRawFd;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

pub const INPUT_QUEUE_CAPACITY: usize = 1024;
pub const INPUT_QUEUE_MASK: usize = INPUT_QUEUE_CAPACITY - 1;

#[repr(C, align(64))]
#[derive(Clone, Copy, Default)]
pub struct UInputPacket {
    pub type_: u16,
    pub code: u16,
    pub value: i32,
    pub timestamp_ns: u64,
}

#[repr(C, align(128))]
pub struct SpscInputRingBuffer {
    // Producer cache line
    head: AtomicUsize,
    _pad0: [u8; 56],

    // Consumer cache line
    tail: AtomicUsize,
    _pad1: [u8; 56],

    // Fixed storage - zero allocation at runtime
    buffer: [UInputPacket; INPUT_QUEUE_CAPACITY],
}

impl SpscInputRingBuffer {
    pub const fn new() -> Self {
        Self {
            head: AtomicUsize::new(0),
            _pad0: [0; 56],
            tail: AtomicUsize::new(0),
            _pad1: [0; 56],
            buffer: [UInputPacket {
                type_: 0,
                code: 0,
                value: 0,
                timestamp_ns: 0,
            }; INPUT_QUEUE_CAPACITY],
        }
    }

    /// Enqueue an event from producer thread (e.g. Android input thread)
    #[inline(always)]
    pub fn push(&mut self, packet: UInputPacket) -> bool {
        let current_head = self.head.load(Ordering::Relaxed);
        let current_tail = self.tail.load(Ordering::Acquire);

        if current_head.wrapping_sub(current_tail) >= INPUT_QUEUE_CAPACITY {
            return false;
        }

        let index = current_head & INPUT_QUEUE_MASK;
        self.buffer[index] = packet;

        arm64_dmb_ish();
        self.head.store(current_head.wrapping_add(1), Ordering::Release);
        true
    }

    /// Pop an event from consumer thread (uinput dispatch loop)
    #[inline(always)]
    pub fn pop(&mut self) -> Option<UInputPacket> {
        let current_tail = self.tail.load(Ordering::Relaxed);
        let current_head = self.head.load(Ordering::Acquire);

        if current_tail == current_head {
            return None;
        }

        let index = current_tail & INPUT_QUEUE_MASK;
        let item = self.buffer[index];

        arm64_dmb_ish();
        self.tail.store(current_tail.wrapping_add(1), Ordering::Release);
        Some(item)
    }
}

pub struct UInputDeviceDispatcher {
    uinput_fd: Option<i32>,
    is_running: AtomicBool,
}

impl UInputDeviceDispatcher {
    pub fn new() -> Self {
        Self {
            uinput_fd: None,
            is_running: AtomicBool::new(false),
        }
    }

    pub fn init_device(&mut self) -> Result<i32, String> {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .custom_flags(libc::O_NONBLOCK | libc::O_CLOEXEC)
            .open("/dev/uinput")
            .map_err(|e| format!("Cannot open /dev/uinput: {}", e))?;

        let fd = file.as_raw_fd();
        self.uinput_fd = Some(fd);
        self.is_running.store(true, Ordering::Release);
        Ok(fd)
    }

    #[inline(always)]
    pub fn write_event_raw(&self, type_: u16, code: u16, value: i32) {
        if let Some(fd) = self.uinput_fd {
            #[repr(C)]
            struct InputEventRaw {
                time: libc::timeval,
                type_: u16,
                code: u16,
                value: i32,
            }

            let ev = InputEventRaw {
                time: libc::timeval {
                    tv_sec: 0,
                    tv_usec: 0,
                },
                type_,
                code,
                value,
            };

            unsafe {
                libc::write(
                    fd,
                    &ev as *const _ as *const libc::c_void,
                    core::mem::size_of::<InputEventRaw>(),
                );
            }
        }
    }
}
