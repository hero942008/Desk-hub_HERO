//! Inline ARM64 / AArch64 Assembly Synchronization & Memory Barriers.
//!
//! Provides bare-metal CPU hardware fence instructions (ISB, DSB, DMB, YIELD)
//! to guarantee zero-latency cache consistency on heterogeneous big.LITTLE / DynamIQ SoCs
//! (Snapdragon 8 Gen 1/2/3/4 & Dimensity 9000/9200/9300/9400).

#[inline(always)]
pub fn arm64_dmb_ish() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("dmb ish", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::SeqCst);
    }
}

#[inline(always)]
pub fn arm64_dmb_ishld() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("dmb ishld", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::Acquire);
    }
}

#[inline(always)]
pub fn arm64_dsb_ish() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("dsb ish", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::SeqCst);
    }
}

#[inline(always)]
pub fn arm64_isb() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("isb", options(nostack, preserves_flags));
    }
}

#[inline(always)]
pub fn cpu_relax_yield() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("yield", options(nomem, nostack, preserves_flags));
    }
    #[cfg(target_arch = "x86_64")]
    unsafe {
        core::arch::x86_64::_mm_pause();
    }
    #[cfg(not(any(target_arch = "aarch64", target_arch = "x86_64")))]
    {
        std::hint::spin_loop();
    }
}
