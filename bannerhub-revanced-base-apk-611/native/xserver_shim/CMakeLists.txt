cmake_minimum_required(VERSION 3.18)
project(deskhub_core_native C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/../audio
    ${CMAKE_CURRENT_SOURCE_DIR}/../graphics
    ${CMAKE_CURRENT_SOURCE_DIR}/../renderer_bridge
)

# Output libxserver.so with enhanced shim and dynamic renderer bridge
add_library(xserver SHARED
    xserver_shim.c
    ../renderer_bridge/dynamic_renderer_switcher.cpp
    ../graphics/vk_pipeline_cache.cpp
    ../graphics/dxvk_config_manager.cpp
    ../graphics/vkd3d_queue_serializer.cpp
    ../audio/aaudio_engine.cpp
)

target_link_libraries(xserver
    log
    aaudio
    dl
)

# arm64-v8a target with 16KB page alignment
set_target_properties(xserver PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")

