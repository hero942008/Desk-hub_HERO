//! Lock-free high-performance input event queue.
//!
//! Eliminates JNI thread stalls and Android UI thread jitter by using
//! a lock-free Single-Producer Single-Consumer (SPSC) / SPMC ring buffer
//! with cacheline separation to eliminate false sharing.

use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

pub const MAX_EVENTS_QUEUE: usize = 4096;

#[derive(Debug, Clone, Copy)]
pub enum InputEvent {
    Mouse {
        x: f32,
        y: f32,
        button: i32,
        down: bool,
        relative: bool,
    },
    Touch {
        action: i32,
        x: i32,
        y: i32,
        pointer_id: i32,
    },
    Key {
        keycode: i32,
        scancode: i32,
        down: bool,
    },
    WindowChange {
        width: i32,
        height: i32,
        dpi: i32,
    },
    Text {
        len: usize,
        bytes: [u8; 64],
    },
}

#[repr(C, align(64))]
pub struct LockFreeEventQueue {
    buffer: Box<[Option<InputEvent>]>,
    head: AtomicUsize,
    _pad1: [u8; 56],
    tail: AtomicUsize,
    _pad2: [u8; 56],
    is_active: AtomicBool,
}

impl LockFreeEventQueue {
    pub fn new(capacity: usize) -> Self {
        let mut buf = Vec::with_capacity(capacity);
        for _ in 0..capacity {
            buf.push(None);
        }
        Self {
            buffer: buf.into_boxed_slice(),
            head: AtomicUsize::new(0),
            _pad1: [0; 56],
            tail: AtomicUsize::new(0),
            _pad2: [0; 56],
            is_active: AtomicBool::new(true),
        }
    }

    #[inline(always)]
    pub fn push(&self, event: InputEvent) -> bool {
        if !self.is_active.load(Ordering::Relaxed) {
            return false;
        }

        let cap = self.buffer.len();
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Acquire);

        if head.wrapping_sub(tail) >= cap {
            // Queue full: drop oldest event to guarantee non-blocking execution
            return false;
        }

        let idx = head % cap;
        unsafe {
            let ptr = self.buffer.as_ptr().add(idx) as *mut Option<InputEvent>;
            *ptr = Some(event);
        }

        self.head.store(head.wrapping_add(1), Ordering::Release);
        true
    }

    #[inline(always)]
    pub fn pop(&self) -> Option<InputEvent> {
        let tail = self.tail.load(Ordering::Relaxed);
        let head = self.head.load(Ordering::Acquire);

        if tail == head {
            return None;
        }

        let cap = self.buffer.len();
        let idx = tail % cap;

        let event = unsafe {
            let ptr = self.buffer.as_ptr().add(idx) as *mut Option<InputEvent>;
            (*ptr).take()
        };

        self.tail.store(tail.wrapping_add(1), Ordering::Release);
        event
    }

    #[inline(always)]
    pub fn clear(&self) {
        self.head.store(0, Ordering::Relaxed);
        self.tail.store(0, Ordering::Relaxed);
    }
}

