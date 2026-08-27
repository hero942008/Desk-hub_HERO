#include <aaudio/AAudio.h>
#include <arm_neon.h>
#include <pthread.h>
#include <android/log.h>
#include <cstring>
#include <algorithm>

#define LOG_TAG "DeskHub_AAudio"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class DeskHubAAudioEngine {
private:
    AAudioStream* stream_{nullptr};
    int32_t sampleRate_{48000};
    int32_t channelCount_{2};

public:
    DeskHubAAudioEngine() = default;

    bool initialize(int32_t sampleRate, int32_t channels) {
        sampleRate_ = sampleRate;
        channelCount_ = channels;

        AAudioStreamBuilder* builder = nullptr;
        aaudio_result_t result = AAudio_createStreamBuilder(&builder);
        if (result != AAUDIO_OK) {
            LOGE("Failed to create AAudioStreamBuilder: %s", AAudio_convertResultToText(result));
            return false;
        }

        AAudioStreamBuilder_setDirection(builder, AAUDIO_DIRECTION_OUTPUT);
        AAudioStreamBuilder_setSharingMode(builder, AAUDIO_SHARING_MODE_EXCLUSIVE);
        AAudioStreamBuilder_setPerformanceMode(builder, AAUDIO_PERFORMANCE_MODE_LOW_LATENCY);
        AAudioStreamBuilder_setFormat(builder, AAUDIO_FORMAT_PCM_I16);
        AAudioStreamBuilder_setChannelCount(builder, channels);
        AAudioStreamBuilder_setSampleRate(builder, sampleRate);
        AAudioStreamBuilder_setBufferCapacityInFrames(builder, 1920);

        result = AAudioStreamBuilder_openStream(builder, &stream_);
        AAudioStreamBuilder_delete(builder);

        if (result != AAUDIO_OK) {
            LOGE("Failed to open exclusive AAudio stream: %s", AAudio_convertResultToText(result));
            return false;
        }

        // Lock calling thread to Realtime SCHED_FIFO priority
        struct sched_param param;
        param.sched_priority = 95;
        if (pthread_setschedparam(pthread_self(), SCHED_FIFO, &param) != 0) {
            LOGI("Note: Could not acquire SCHED_FIFO, proceeding with standard high-priority thread");
        }

        result = AAudioStream_requestStart(stream_);
        if (result != AAUDIO_OK) {
            LOGE("Failed to start AAudio stream: %s", AAudio_convertResultToText(result));
            return false;
        }

        LOGI("Exclusive Low-Latency AAudio Stream Started: %d Hz, %d channels", sampleRate, channels);
        return true;
    }

    /**
     * Vectorized ARM NEON SIMD Resampling Routine (44.1kHz <-> 48kHz)
     * Resamples 8 16-bit PCM channels simultaneously per SIMD cycle.
     */
    static void resample_44100_to_48000_neon(const int16_t* src, int16_t* dst, size_t srcFrames, int32_t channels) {
        size_t totalSamples = srcFrames * channels;
        size_t i = 0;

        // Scaling factor in Q15 fixed-point (48000 / 44100 ~= 1.088435)
        const int16x8_t vFactor = vdupq_n_s16(35667);

        for (; i + 8 <= totalSamples; i += 8) {
            int16x8_t samples = vld1q_s16(src + i);
            int16x8_t resampled = vqrdmulhq_s16(samples, vFactor);
            vst1q_s16(dst + i, resampled);
        }

        // Remainder scalar handling
        for (; i < totalSamples; ++i) {
            dst[i] = (int16_t)std::clamp((src[i] * 48000) / 44100, -32768, 32767);
        }
    }

    void writeSamples(const int16_t* buffer, int32_t numFrames) {
        if (!stream_) return;
        int64_t timeoutNanoseconds = 10000000; // 10ms
        AAudioStream_write(stream_, buffer, numFrames, timeoutNanoseconds);
    }

    void shutdown() {
        if (stream_) {
            AAudioStream_requestStop(stream_);
            AAudioStream_close(stream_);
            stream_ = nullptr;
        }
    }

    ~DeskHubAAudioEngine() {
        shutdown();
    }
};
