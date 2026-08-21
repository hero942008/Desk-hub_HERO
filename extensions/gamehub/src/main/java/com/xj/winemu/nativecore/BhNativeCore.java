package com.xj.winemu.nativecore;

import android.util.Log;

/**
 * BhNativeCore — High-Performance JNI Bridge to BannerHub Rust & Vulkan Core.
 *
 * Provides sub-millisecond execution for:
 * - Direct CPU Big/Prime Core Affinity Pinning
 * - Real-Time Rendering Scheduling (SCHED_FIFO / Priority)
 * - Zero-Allocation XInput Rumble Processor
 * - Memory-Mapped (mmap) Low-Latency Config Sync
 * - Vectorized Turnip/DXVK/VKD3D Component Discovery Scanner
 * - Microsecond-Accurate Frametime & FPS Telemetry
 */
public final class BhNativeCore {

    private static final String TAG = "BhNativeCore";
    private static volatile boolean sInitialized = false;

    static {
        try {
            System.loadLibrary("xserver");
            sInitialized = true;
            Log.i(TAG, "libxserver.so Rust Vulkan & High-Performance Core loaded successfully.");
        } catch (Throwable t) {
            Log.e(TAG, "Failed to load libxserver.so native library", t);
            sInitialized = false;
        }
    }

    public static boolean isAvailable() {
        return sInitialized;
    }

    // ── Native Rust JNI Signatures ──────────────────────────────────────────

    public static native boolean nativeInit(String storageDir);

    public static native int nativeProcessRumble(int slot, int left, int right);

    public static native String nativeScanComponents(String baseDir);

    public static native boolean nativePinBigCores();

    public static native boolean nativeSetRealtimePriority(int priority);

    public static native float nativeGetFps();

    public static native float nativeGetFrametimeMs();

    public static native boolean nativeInitPipelineCache(String cachePath);

    public static native boolean nativeSetUpscalerConfig(int mode, float sharpness, float renderScale);

    public static native boolean nativeSetZeroCopy(boolean enabled);

    public static native boolean nativeStartEpoll();

    public static native long nativeAdvanceTimeline();

    // ── High-Level Java Helper Wrappers ─────────────────────────────────────

    public static boolean init(String storageDir) {
        if (!sInitialized) return false;
        try {
            boolean ok = nativeInit(storageDir);
            nativeInitPipelineCache(storageDir + "/vk_pipeline.bin");
            nativeSetZeroCopy(true);
            nativeStartEpoll();
            return ok;
        } catch (Throwable t) {
            Log.w(TAG, "nativeInit failed", t);
            return false;
        }
    }

    public static boolean setUpscaler(int mode, float sharpness, float renderScale) {
        if (!sInitialized) return false;
        try {
            return nativeSetUpscalerConfig(mode, sharpness, renderScale);
        } catch (Throwable t) {
            Log.w(TAG, "nativeSetUpscalerConfig failed", t);
            return false;
        }
    }

    public static boolean setZeroCopy(boolean enabled) {
        if (!sInitialized) return false;
        try {
            return nativeSetZeroCopy(enabled);
        } catch (Throwable t) {
            return false;
        }
    }

    public static long advanceTimeline() {
        if (!sInitialized) return 0L;
        try {
            return nativeAdvanceTimeline();
        } catch (Throwable t) {
            return 0L;
        }
    }

    public static boolean pinBigCores() {
        if (!sInitialized) return false;
        try {
            return nativePinBigCores();
        } catch (Throwable t) {
            Log.w(TAG, "nativePinBigCores failed", t);
            return false;
        }
    }

    public static boolean setRealtimePriority(int priority) {
        if (!sInitialized) return false;
        try {
            return nativeSetRealtimePriority(priority);
        } catch (Throwable t) {
            Log.w(TAG, "nativeSetRealtimePriority failed", t);
            return false;
        }
    }

    public static float getFps() {
        if (!sInitialized) return 60.0f;
        try {
            return nativeGetFps();
        } catch (Throwable t) {
            return 60.0f;
        }
    }

    public static float getFrametimeMs() {
        if (!sInitialized) return 16.66f;
        try {
            return nativeGetFrametimeMs();
        } catch (Throwable t) {
            return 16.66f;
        }
    }
}
