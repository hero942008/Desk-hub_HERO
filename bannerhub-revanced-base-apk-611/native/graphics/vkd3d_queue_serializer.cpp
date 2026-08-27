#include <vulkan/vulkan.h>
#include <mutex>
#include <android/log.h>

class Vkd3dSingleQueueSerializer {
private:
    static std::mutex queueMutex_;
    static VkQueue primaryQueue_;

public:
    static void setPrimaryQueue(VkQueue queue) {
        std::lock_guard<std::mutex> lock(queueMutex_);
        primaryQueue_ = queue;
    }

    /**
     * Serializes multi-threaded D3D12 command queue submissions into one
     * high-priority Vulkan presentation/graphics queue to eliminate mobile GPU lock contention.
     */
    static VkResult submitSerialized(
        uint32_t submitCount,
        const VkSubmitInfo* pSubmits,
        VkFence fence
    ) {
        std::lock_guard<std::mutex> lock(queueMutex_);
        if (primaryQueue_ == VK_NULL_HANDLE) {
            return VK_ERROR_INITIALIZATION_FAILED;
        }
        return vkQueueSubmit(primaryQueue_, submitCount, pSubmits, fence);
    }
};

std::mutex Vkd3dSingleQueueSerializer::queueMutex_;
VkQueue Vkd3dSingleQueueSerializer::primaryQueue_ = VK_NULL_HANDLE;
