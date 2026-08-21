//! Ultra Low-Latency Voice & P2P Audio Routing Engine.
//!
//! Handles lock-free audio packet buffering, low-latency PCM/Opus stream queuing,
//! and jitter-buffer smoothing for in-game and peer-to-peer voice communications.

use std::sync::atomic::{AtomicBool, AtomicU32, AtomicUsize, Ordering};

pub const MAX_AUDIO_FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo
pub const AUDIO_RING_CAPACITY: usize = 64;

#[repr(C)]
#[derive(Clone, Copy)]
pub struct AudioPacket {
    pub sample_rate: u32,
    pub channels: u16,
    pub pcm_len: u16,
    pub sequence_number: u32,
    pub timestamp_ms: u64,
    pub samples: [i16; MAX_AUDIO_FRAME_SIZE],
}

impl AudioPacket {
    pub const fn empty() -> Self {
        Self {
            sample_rate: 48000,
            channels: 2,
            pcm_len: 0,
            sequence_number: 0,
            timestamp_ms: 0,
            samples: [0; MAX_AUDIO_FRAME_SIZE],
        }
    }
}

pub struct NativeVoiceEngine {
    packets: Box<[AudioPacket]>,
    head: AtomicUsize,
    tail: AtomicUsize,
    is_muted: AtomicBool,
    volume_percent: AtomicU32,
}

impl NativeVoiceEngine {
    pub fn new() -> Self {
        let mut buf = Vec::with_capacity(AUDIO_RING_CAPACITY);
        for _ in 0..AUDIO_RING_CAPACITY {
            buf.push(AudioPacket::empty());
        }

        Self {
            packets: buf.into_boxed_slice(),
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
            is_muted: AtomicBool::new(false),
            volume_percent: AtomicU32::new(100),
        }
    }

    #[inline(always)]
    pub fn push_pcm(&self, samples: &[i16], sample_rate: u32, channels: u16) -> bool {
        if self.is_muted.load(Ordering::Relaxed) || samples.is_empty() {
            return false;
        }

        let cap = self.packets.len();
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Acquire);

        if head.wrapping_sub(tail) >= cap {
            // Drop oldest packet to keep latency sub-20ms
            self.tail.store(tail.wrapping_add(1), Ordering::Release);
        }

        let idx = head % cap;
        let p_ptr = unsafe { self.packets.as_ptr().add(idx) as *mut AudioPacket };

        unsafe {
            let p = &mut *p_ptr;
            p.sample_rate = sample_rate;
            p.channels = channels;
            let copy_len = samples.len().min(MAX_AUDIO_FRAME_SIZE);
            p.samples[..copy_len].copy_from_slice(&samples[..copy_len]);
            p.pcm_len = copy_len as u16;
        }

        self.head.store(head.wrapping_add(1), Ordering::Release);
        true
    }

    #[inline(always)]
    pub fn pop_pcm(&self, dst: &mut [i16]) -> usize {
        let tail = self.tail.load(Ordering::Relaxed);
        let head = self.head.load(Ordering::Acquire);

        if tail == head {
            return 0;
        }

        let cap = self.packets.len();
        let idx = tail % cap;
        let p_ptr = unsafe { self.packets.as_ptr().add(idx) as *const AudioPacket };

        let copied = unsafe {
            let p = &*p_ptr;
            let len = (p.pcm_len as usize).min(dst.len());
            dst[..len].copy_from_slice(&p.samples[..len]);
            len
        };

        self.tail.store(tail.wrapping_add(1), Ordering::Release);
        copied
    }

    pub fn set_mute(&self, muted: bool) {
        self.is_muted.store(muted, Ordering::Release);
    }
}
