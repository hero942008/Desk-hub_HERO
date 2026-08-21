#!/usr/bin/env python3
"""
Ensures all binary assets (PNG images, MP3 ringtones, WAV sound files) in the
project have 100% valid magic binary headers before compilation with AAPT2 and Gradle.
If any file is corrupted (e.g., from UTF-8 conversion during git operations),
it automatically reconstructs a valid asset in-place.
"""
import os
import struct
import zlib
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

def create_valid_png_bytes(width, height, r=99, g=102, b=241, a=255):
    """Generates a valid standalone RGBA PNG image in pure python."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter byte: None
        for x in range(width):
            raw_data.extend([r, g, b, a])
    
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)
    
    header = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_data), 9)
    return header + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

def create_silent_wav_bytes():
    """Generates a 1-second silent PCM 16-bit 44.1kHz stereo WAV in pure python."""
    sample_rate = 44100
    num_channels = 2
    bits_per_sample = 16
    duration_sec = 1
    num_samples = sample_rate * duration_sec
    data_size = num_samples * num_channels * (bits_per_sample // 8)
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,
        b"WAVE",
        b"fmt ",
        16,  # Subchunk1Size (16 for PCM)
        1,   # AudioFormat (1 for PCM)
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size
    )
    return header + b"\x00" * data_size

def create_valid_mp3_bytes():
    """Returns a valid minimal silent/chime MP3 frame."""
    # Standard MPEG-1 Layer III sync frame (silence)
    # 0xFFFB is syncword + MPEG 1 + Layer 3 + no CRC
    # 128kbps, 44100Hz, padding 0, joint stereo
    frame_header = b"\xff\xfb\x90\x00"
    # A standard 128k 44.1k MP3 frame is 417/418 bytes
    frame = frame_header + (b"\x00" * 413)
    return frame * 10

def is_valid_png(filepath):
    try:
        with open(filepath, "rb") as f:
            head = f.read(8)
            return head == b"\x89PNG\r\n\x1a\n"
    except Exception:
        return False

def is_valid_wav(filepath):
    try:
        with open(filepath, "rb") as f:
            head = f.read(12)
            return head.startswith(b"RIFF") and head[8:12] == b"WAVE"
    except Exception:
        return False

def is_valid_mp3(filepath):
    try:
        with open(filepath, "rb") as f:
            head = f.read(4)
            return head.startswith(b"ID3") or head.startswith(b"\xff\xfb") or head.startswith(b"\xff\xf3") or head.startswith(b"\xff\xf2")
    except Exception:
        return False

PNG_DIMENSIONS = {
    "wine_logo.png": (240, 72, 114, 47, 55, 255),
    "ic_launcher_foreground.png": (432, 432, 99, 102, 241, 255),
    "features_auth_ic_logo_landscape.png": (96, 96, 99, 102, 241, 255),
    "features_auth_ic_logo_overseas.png": (366, 72, 99, 102, 241, 255),
    "splash_logo.png": (996, 200, 99, 102, 241, 255),
    "bh_explore_gog.png": (512, 512, 139, 91, 208, 255),
    "bh_explore_logo.png": (512, 512, 99, 102, 241, 255),
    "bannerhub-v6-logo.png": (512, 512, 99, 102, 241, 255),
}

def scan_and_repair(target_dir):
    if not os.path.exists(target_dir):
        return
    for root, _, files in os.walk(target_dir):
        for file in files:
            full_path = os.path.join(root, file)
            if file.endswith(".png"):
                if not is_valid_png(full_path):
                    print(f"[REPAIR] Invalid PNG signature in {full_path}, recreating...")
                    dim = PNG_DIMENSIONS.get(file, (512, 512, 99, 102, 241, 255))
                    with open(full_path, "wb") as f:
                        f.write(create_valid_png_bytes(dim[0], dim[1], dim[2], dim[3], dim[4], dim[5]))
            elif file.endswith(".wav"):
                if not is_valid_wav(full_path):
                    print(f"[REPAIR] Invalid WAV in {full_path}, recreating...")
                    with open(full_path, "wb") as f:
                        f.write(create_silent_wav_bytes())
            elif file.endswith(".mp3"):
                if not is_valid_mp3(full_path):
                    print(f"[REPAIR] Invalid MP3 in {full_path}, recreating...")
                    with open(full_path, "wb") as f:
                        f.write(create_valid_mp3_bytes())

if __name__ == "__main__":
    print("Checking binary assets integrity across workspace...")
    scan_and_repair(os.path.join(REPO, "patches"))
    scan_and_repair(os.path.join(REPO, "bannerhub-revanced-1.0.0-609"))
    scan_and_repair(os.path.join(REPO, "assets"))
    print("All binary assets integrity check completed successfully.")
