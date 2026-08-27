#include <cstdlib>
#include <fstream>
#include <string>
#include <unistd.h>
#include <android/log.h>

#define DXVK_CONF_PATH "/data/data/com.xj.herohuboptimized/files/dxvk.conf"

class DxvkConfigManager {
public:
    static void enforceAsyncPipelineConfig() {
        // Enforce DXVK environment flags
        setenv("DXVK_ASYNC", "1", 1);
        setenv("DXVK_STATE_CACHE", "1", 1);
        setenv("DXVK_ENABLE_NVAPI", "0", 1);
        setenv("VKD3D_CONFIG", "single_queue,no_upload_hvv", 1);

        // Write dxvk.conf for strict background worker thread compilation
        std::ofstream conf(DXVK_CONF_PATH, std::ios::trunc);
        if (conf.is_open()) {
            conf << "# DeskHub Async DXVK Runtime Settings\n";
            conf << "dxvk.enableAsync = true\n";
            conf << "dxvk.numCompilerThreads = 6\n";
            conf << "dxvk.useRawSsbo = true\n";
            conf << "dxvk.useEarlyDiscard = true\n";
            conf << "d3d11.maxTessFactor = 8\n";
            conf << "d3d11.samplerAnisotropy = 16\n";
            conf.close();
        }
    }
};
