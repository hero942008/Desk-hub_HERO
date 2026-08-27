#include <vulkan/vulkan.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <android/log.h>
#include <vector>
#include <string>

#define CACHE_DIR "/data/data/com.xj.herohuboptimized/files/cache/"
#define CACHE_FILE CACHE_DIR "vk_pipeline_cache.bin"
#define LOG_TAG "DeskHub_Vulkan"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class DeskHubPipelineCacheManager {
public:
    static VkPipelineCache loadOrCreateCache(VkDevice device, const VkAllocationCallbacks* allocator) {
        mkdir(CACHE_DIR, 0777);
        
        int fd = open(CACHE_FILE, O_RDONLY);
        std::vector<uint8_t> cacheData;

        if (fd >= 0) {
            struct stat st;
            if (fstat(fd, &st) == 0 && st.st_size > 0) {
                cacheData.resize(st.st_size);
                read(fd, cacheData.data(), st.st_size);
                LOGI("Loaded persistent VkPipelineCache (%zu bytes) from NVMe/UFS", cacheData.size());
            }
            close(fd);
        }

        VkPipelineCacheCreateInfo createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_CACHE_CREATE_INFO;
        if (!cacheData.empty()) {
            createInfo.initialDataSize = cacheData.size();
            createInfo.pInitialData = cacheData.data();
        }

        VkPipelineCache cache = VK_NULL_HANDLE;
        VkResult res = vkCreatePipelineCache(device, &createInfo, allocator, &cache);
        if (res != VK_SUCCESS) {
            LOGE("vkCreatePipelineCache failed: %d, falling back to empty cache", res);
            createInfo.initialDataSize = 0;
            createInfo.pInitialData = nullptr;
            vkCreatePipelineCache(device, &createInfo, allocator, &cache);
        }
        return cache;
    }

    static bool saveCache(VkDevice device, VkPipelineCache cache) {
        if (cache == VK_NULL_HANDLE) return false;

        size_t dataSize = 0;
        VkResult res = vkGetPipelineCacheData(device, cache, &dataSize, nullptr);
        if (res != VK_SUCCESS || dataSize == 0) {
            LOGE("Failed to get pipeline cache size: %d", res);
            return false;
        }

        std::vector<uint8_t> data(dataSize);
        res = vkGetPipelineCacheData(device, cache, &dataSize, data.data());
        if (res != VK_SUCCESS) {
            LOGE("Failed to retrieve pipeline cache binary: %d", res);
            return false;
        }

        int fd = open(CACHE_FILE, O_WRONLY | O_CREAT | O_TRUNC, 0666);
        if (fd >= 0) {
            write(fd, data.data(), data.size());
            fsync(fd);
            close(fd);
            LOGI("Atomically persisted VkPipelineCache (%zu bytes) to storage", data.size());
            return true;
        }
        return false;
    }
};
