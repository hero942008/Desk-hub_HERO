//! Vulkan 1.3 / 1.4 Native Integration & Pipeline Acceleration

use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

pub struct VulkanPipelineManager {
    pub is_initialized: AtomicBool,
    pub active_queue_family: AtomicU32,
}

impl VulkanPipelineManager {
    pub const fn new() -> Self {
        Self {
            is_initialized: AtomicBool::new(false),
            active_queue_family: AtomicU32::new(0),
        }
    }

    pub fn set_queue_family(&self, family_index: u32) {
        self.active_queue_family.store(family_index, Ordering::Release);
        self.is_initialized.store(true, Ordering::Release);
    }
}
