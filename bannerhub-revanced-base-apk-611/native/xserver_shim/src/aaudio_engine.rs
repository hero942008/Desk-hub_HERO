//! AAudio Low-Latency Stream & High-Performance Audio Dispatcher

use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

pub struct AAudioStreamState {
    pub is_running: AtomicBool,
    pub sample_rate: AtomicU32,
    pub channels: AtomicU32,
}

impl AAudioStreamState {
    pub const fn new() -> Self {
        Self {
            is_running: AtomicBool::new(false),
            sample_rate: AtomicU32::new(48000),
            channels: AtomicU32::new(2),
        }
    }
}
