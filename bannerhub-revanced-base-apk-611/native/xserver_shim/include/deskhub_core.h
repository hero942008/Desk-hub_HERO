#ifndef DESKHUB_CORE_H
#define DESKHUB_CORE_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Mounts a compressed or raw game archive into the VFS memory map
 */
int deskhub_vfs_mount(const char* archive_path, const char* virtual_dir);

/**
 * Reads bytes directly from memory-mapped archive into caller buffer with zero copies
 */
intptr_t deskhub_vfs_read_exact(const char* virtual_path, uint64_t offset, uint8_t* out_buf, size_t buf_len);

/**
 * Relays Wine server messages using kernel zero-copy splice pipelines
 */
intptr_t deskhub_ipc_zero_copy_relay(const uint8_t* src_ptr, size_t len, int target_socket_fd);

/**
 * Push an input event into the lock-free SPSC ring buffer
 */
int deskhub_input_push_event(uint16_t type, uint16_t code, int32_t value);

#ifdef __cplusplus
}
#endif

#endif // DESKHUB_CORE_H
