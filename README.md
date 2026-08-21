# 🚀 HeroHub Optimized (GameHub 6.0.9 Mod)

[![Forked From](https://img.shields.io/badge/Forked%20From-The412Banner%2Fbannerhub--revanced-blue?style=for-the-badge&logo=github)](https://github.com/The412Banner/bannerhub-revanced)
[![Vulkan](https://img.shields.io/badge/Vulkan-1.3-red?style=for-the-badge&logo=vulkan)](https://www.vulkan.org/)
[![Rust Core](https://img.shields.io/badge/Core-Rust-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Android](https://img.shields.io/badge/Platform-Android-green?style=for-the-badge&logo=android)](https://www.android.com/)

A high-performance modification of **GameHub 6.0.9** powered by an ultra-fast Rust native backend, Vulkan 1.3 zero-copy rendering pipeline, and dynamic CPU task scheduling.

---

## ⚡ Performance Features

* **Direct-to-Display Native Vulkan 1.3**: Bypasses traditional Android composition overhead for minimal display latency.
* **Anti-Stutter Pipeline**: Persistent `VkPipelineCache` saved to internal storage to eliminate runtime shader compilation hitches.
* **Zero-Copy Pipeline**: `AHardwareBuffer` direct frame presentation reducing memory bandwidth consumption.
* **Decoupled Architecture**: Edge-triggered `epoll` socket multiplexing for non-blocking asynchronous system operations.
* **FSR 1.0 / FidelityFX CAS**: Integrated ultra-fast adaptive spatial upscaler pass for crisp rendering at lower internal resolutions.
* **Lock-Free Controller Rumble**: High-priority instant vibration processing executing at under `<0.05ms` latency.
* **CPU Affinity Optimization**: Intelligent thread pinning targeting ARM Prime and Big performance cores automatically.

---

## 📦 Package Information

| Parameter | Value |
| :--- | :--- |
| **Primary Package Name** | `com.xj.herohuboptimized` |
| **Coexistence** | Up to 9 side-by-side variants supported |
| **Base Version** | GameHub 6.0.9 |
| **Native Engine** | Rust + Vulkan 1.3 NDK |

---

## 🛠️ Architecture Overview

## 📥 Installation

1. Go to the [Releases](../../releases) tab.
2. Download the latest APK corresponding to your preferred variant (`com.xj.herohuboptimized` or side-by-side builds).
3. Install the APK on your Android device.
4. Ensure Vulkan 1.3 graphics driver compatibility on your chipset for full feature acceleration.

---

## 📜 Upstream & Acknowledgments

* **Original Base**: GameHub 6.0.9
* **Upstream Fork**: [The412Banner/bannerhub-revanced](https://github.com/The412Banner/bannerhub-revanced)
* **Upscaling Engine**: AMD FidelityFX Super Resolution (FSR) / CAS
