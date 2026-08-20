cmake_minimum_required(VERSION 3.18)
project(xserver_shim C)

# Output MUST be named libxserver.so — ultra-fast Vulkan-primary native bridge.
add_library(xserver SHARED xserver_shim.c)

target_link_libraries(xserver log android)

# High-Performance Aggressive Compiler & Linker optimizations
target_compile_options(xserver PRIVATE
    -O3
    -flto
    -fno-stack-protector
    -fomit-frame-pointer
    -ffast-math
    -fvisibility=hidden
    -pipe
    -DVK_USE_PLATFORM_ANDROID_KHR
)

# arm64-v8a 16KB page size + full LTO + GC sections
set_target_properties(xserver PROPERTIES 
    LINK_FLAGS "-Wl,-z,max-page-size=16384 -Wl,-O3 -Wl,--gc-sections -flto"
)

