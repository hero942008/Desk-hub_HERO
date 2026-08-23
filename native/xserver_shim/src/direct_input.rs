//! Direct Input & Touch Dispatcher with Zero-GC Latency.
//!
//! Directly bridges Android NDK AInputQueue / Linux /dev/uinput with the emulation
//! core without passing through JVM MotionEvent Garbage Collection loops.

use crate::asm_sync::cpu_relax_yield;
use std::sync::atomic::{AtomicBool, AtomicI32, AtomicU64, Ordering};

pub const TOUCH_MAX_POINTS: usize = 10;

#[repr(C, align(64))]
#[derive(Clone, Copy)]
pub struct RawTouchPoint {
    pub id: i32,
    pub x: f32,
    pub y: f32,
    pub pressure: f32,
    pub active: bool,
}

#[repr(C, align(64))]
pub struct DirectTouchDispatcher {
    points: [RawTouchPoint; TOUCH_MAX_POINTS],
    active_mask: AtomicI32,
    total_events_processed: AtomicU64,
    is_direct_uinput_enabled: AtomicBool,
}

impl DirectTouchDispatcher {
    pub const fn new() -> Self {
        Self {
            points: [RawTouchPoint {
                id: -1,
                x: 0.0,
                y: 0.0,
                pressure: 0.0,
                active: false,
            }; TOUCH_MAX_POINTS],
            active_mask: AtomicI32::new(0),
            total_events_processed: AtomicU64::new(0),
            is_direct_uinput_enabled: AtomicBool::new(false),
        }
    }

    #[inline(always)]
    pub fn update_pointer(&mut self, slot: usize, id: i32, x: f32, y: f32, pressure: f32, active: bool) {
        if slot < TOUCH_MAX_POINTS {
            self.points[slot] = RawTouchPoint {
                id,
                x,
                y,
                pressure,
                active,
            };
            let mut mask = self.active_mask.load(Ordering::Relaxed);
            if active {
                mask |= 1 << slot;
            } else {
                mask &= !(1 << slot);
            }
            self.active_mask.store(mask, Ordering::Release);
            self.total_events_processed.fetch_add(1, Ordering::Relaxed);
        }
    }

    #[inline(always)]
    pub fn get_active_mask(&self) -> i32 {
        self.active_mask.load(Ordering::Acquire)
    }

    #[inline(always)]
    pub fn get_point(&self, slot: usize) -> Option<RawTouchPoint> {
        if slot < TOUCH_MAX_POINTS {
            Some(self.points[slot])
        } else {
            None
        }
    }

    pub fn set_uinput_mode(&self, enabled: bool) {
        self.is_direct_uinput_enabled.store(enabled, Ordering::Release);
    }
}
