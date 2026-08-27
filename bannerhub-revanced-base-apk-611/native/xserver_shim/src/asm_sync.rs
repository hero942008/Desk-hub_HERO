//! Bare-Metal ARM64 Assembly Hardware Barriers for JIT Execution & IPC Loop Synchronization

/// Instruction Synchronization Barrier (ISB)
/// Flushes the CPU pipeline and forces re-fetch of instructions for JIT code updates.
#[inline(always)]
pub fn arm64_isb() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("isb", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::SeqCst);
    }
}

/// Data Synchronization Barrier (DSB SY)
/// Ensures all memory accesses (loads and stores) complete before the next instruction executes.
#[inline(always)]
pub fn arm64_dsb_sy() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("dsb sy", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::SeqCst);
    }
}

/// Data Memory Barrier - Inner Shareable Loads (DMB ISHLD)
/// Lightweight barrier ensuring all preceding read operations complete before subsequent reads.
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

/// Data Memory Barrier - Inner Shareable Stores (DMB ISHST)
/// Ensures all preceding store operations commit before subsequent stores (optimal for ring buffers).
#[inline(always)]
pub fn arm64_dmb_ishst() {
    #[cfg(target_arch = "aarch64")]
    unsafe {
        core::arch::asm!("dmb ishst", options(nostack, preserves_flags));
    }
    #[cfg(not(target_arch = "aarch64"))]
    {
        core::sync::atomic::fence(core::sync::atomic::Ordering::Release);
    }
}

/// Data Memory Barrier - Full Inner Shareable (DMB ISH)
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

/// Hardware Yield Hint for low-power spin-locks
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
