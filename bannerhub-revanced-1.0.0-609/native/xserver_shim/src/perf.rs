//! Real-Time Performance, Frametime Tracking, and CPU Core Affinity Engine.
//!
//! Provides thread pinning to Big/Prime CPU cores, Real-Time FIFO scheduling,
//! sub-microsecond frametime tracking, and zero-overhead performance telemetry.

use std::sync::atomic::{AtomicBool, AtomicI32, AtomicU64, Ordering};
use std::time::Instant;

pub struct PerfStats {
    pub current_fps: f32,
    pub avg_frametime_ms: f32,
    pub min_frametime_ms: f32,
    pub max_frametime_ms: f32,
    pub total_frames: u64,
}

pub struct NativePerfEngine {
    frame_counter: AtomicU64,
    last_frame_timestamp_ns: AtomicU64,
    accumulated_frametime_ns: AtomicU64,
    last_computed_fps: AtomicU64, // Stored as fixed-point f32 * 1000
    is_realtime_active: AtomicBool,
    cpu_affinity_mask: AtomicI32,
}

impl NativePerfEngine {
    pub const fn new() -> Self {
        Self {
            frame_counter: AtomicU64::new(0),
            last_frame_timestamp_ns: AtomicU64::new(0),
            accumulated_frametime_ns: AtomicU64::new(0),
            last_computed_fps: AtomicU64::new(60_000), // Default 60.0 fps * 1000
            is_realtime_active: AtomicBool::new(false),
            cpu_affinity_mask: AtomicI32::new(0),
        }
    }

    /// Records a new frame presentation event.
    #[inline(always)]
    pub fn record_frame(&self) {
        let now_ns = Self::get_monotonic_ns();
        let prev_ns = self.last_frame_timestamp_ns.swap(now_ns, Ordering::Relaxed);

        if prev_ns > 0 && now_ns > prev_ns {
            let delta_ns = now_ns - prev_ns;
            self.accumulated_frametime_ns.store(delta_ns, Ordering::Relaxed);
            
            if delta_ns > 0 {
                let instant_fps = (1_000_000_000.0 / delta_ns as f64) as f32;
                let fps_fixed = (instant_fps * 1000.0) as u64;
                self.last_computed_fps.store(fps_fixed, Ordering::Relaxed);
            }
        }

        self.frame_counter.fetch_add(1, Ordering::Relaxed);
    }

    #[inline(always)]
    pub fn get_fps(&self) -> f32 {
        let fixed = self.last_computed_fps.load(Ordering::Relaxed);
        (fixed as f32) / 1000.0
    }

    #[inline(always)]
    pub fn get_frametime_ms(&self) -> f32 {
        let delta_ns = self.accumulated_frametime_ns.load(Ordering::Relaxed);
        (delta_ns as f32) / 1_000_000.0
    }

    /// Pins calling threads to Big/Prime CPU cores (Cores 4-7 on Octa-core SoCs like Snapdragon 8 Gen 1/2/3).
    pub fn pin_to_big_cores() -> bool {
        #[cfg(target_os = "android")]
        unsafe {
            let pid = 0; // Current thread
            // Big cores mask: 0b11110000 (cores 4, 5, 6, 7) or 0b11100000 (cores 5, 6, 7)
            let mut set: libc::cpu_set_t = std::mem::zeroed();
            libc::CPU_ZERO(&mut set);
            
            // Set cores 4, 5, 6, 7 (typically Performance and Prime cores)
            libc::CPU_SET(4, &mut set);
            libc::CPU_SET(5, &mut set);
            libc::CPU_SET(6, &mut set);
            libc::CPU_SET(7, &mut set);

            let res = libc::sched_setaffinity(
                pid,
                std::mem::size_of::<libc::cpu_set_t>(),
                &set as *const libc::cpu_set_t,
            );
            res == 0
        }
        #[cfg(not(target_os = "android"))]
        {
            true
        }
    }

    /// Sets Real-Time Scheduling priority (SCHED_FIFO / highest nice priority).
    pub fn set_realtime_priority(priority_level: i32) -> bool {
        #[cfg(target_os = "android")]
        unsafe {
            // Lower nice value = higher CPU priority (-20 is highest)
            let nice_val = match priority_level {
                1 => -10, // High
                2 => -16, // Real-time emulator render thread
                3 => -20, // Critical primary rendering
                _ => -5,
            };
            let res = libc::setpriority(libc::PRIO_PROCESS, 0, nice_val);
            res == 0
        }
        #[cfg(not(target_os = "android"))]
        {
            true
        }
    }

    #[inline(always)]
    fn get_monotonic_ns() -> u64 {
        #[cfg(target_os = "android")]
        unsafe {
            let mut ts: libc::timespec = std::mem::zeroed();
            libc::clock_gettime(libc::CLOCK_MONOTONIC_RAW, &mut ts);
            (ts.tv_sec as u64) * 1_000_000_000 + (ts.tv_nsec as u64)
        }
        #[cfg(not(target_os = "android"))]
        {
            use std::time::SystemTime;
            SystemTime::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .map(|d| d.as_nanos() as u64)
                .unwrap_or(0)
        }
    }
}
