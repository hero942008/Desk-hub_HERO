#include <jni.h>
#include <dlfcn.h>
#include <android/log.h>
#include <atomic>

#define LOG_TAG "DeskHub_RendererBridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

enum class RendererMode : int32_t {
    NATIVE_VULKAN = 0,
    LEGACY_XSERVER = 1
};

static std::atomic<RendererMode> g_activeRenderer{RendererMode::NATIVE_VULKAN};
static void* g_legacyHandle = nullptr;

extern "C" JNIEXPORT void JNICALL
Java_com_xj_winemu_renderer_BhRendererController_nativeSetRendererMode(
    JNIEnv* env,
    jclass clazz,
    jint mode
) {
    RendererMode requested = static_cast<RendererMode>(mode);
    if (requested == RendererMode::LEGACY_XSERVER && !g_legacyHandle) {
        g_legacyHandle = dlopen("libxserver_legacy.so", RTLD_NOW | RTLD_LOCAL);
        LOGI("Switched to Legacy GLES2 XServer Shim Renderer");
    } else if (requested == RendererMode::NATIVE_VULKAN && g_legacyHandle) {
        dlclose(g_legacyHandle);
        g_legacyHandle = nullptr;
        LOGI("Switched to Native Vulkan 1.3 Passthrough Renderer");
    }
    g_activeRenderer.store(requested, std::memory_order_release);
}
