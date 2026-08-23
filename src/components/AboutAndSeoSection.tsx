import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Globe,
  Tag,
  Share2,
  FileText,
  Copy,
  Check,
  Zap,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  Shield,
  Gamepad2,
  Flame,
  Award,
  BookOpen
} from "lucide-react";
import { DeskHubLogo } from "./DeskHubLogo";

export const AboutAndSeoSection: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const topics = [
    "deskhub",
    "deskhub-emulator",
    "gamehub",
    "gamehub-revanced",
    "wine-android",
    "pc-gaming-on-android",
    "vulkan-1-3",
    "vulkan-1-4",
    "simd-neon",
    "turnip-driver",
    "dxvk",
    "vkd3d-proton",
    "box64",
    "fex-emu",
    "windows-emulator",
    "steam-on-android",
    "rust-native-core",
    "snapdragon-gaming",
    "adreno-driver",
    "low-cpu-emulation",
    "revanced-patches",
    "android-games"
  ];

  const shortDescription =
    "DeskHub emulator v1.0.8 - High-performance GameHub ReVanced modification with Rust Vulkan 1.3/1.4 native core, ARM NEON/AVX2 SIMD vectorization, Ultra-Low CPU Wine Direct3D optimization, zero-copy frame pipeline, and automated GitHub Actions CI/CD APK builds for playing AAA Windows & Steam games on Android.";

  const githubAbout =
    "⚡ DeskHub emulator v1.0.8: Next-Gen PC gaming on Android (GameHub ReVanced mod). Powered by Rust native Vulkan 1.3/1.4 engine, ARM NEON SIMD vectorization, DXVK Async, VKD3D single-queue, kernel Futex/Eventfd, and automated CI/CD builds.";

  const fullMarkdownAbout = `## 🎮 About DeskHub emulator v1.0.8

**DeskHub emulator** is the premier, high-performance Android ReVanced modification based on **XiaoJi GameHub 6.0.9**, re-engineered from the ground up with a **native Rust Vulkan 1.3/1.4 core** and **ARM NEON SIMD vectorization** for ultra-low latency, zero-copy presentation, and uncompromised frame rates when running AAA PC and Steam games on ARM64 Android devices.

### 🌟 Key Highlights & Architectural Features

- ⚡ **Zero-Copy Native Vulkan Core & SIMD Pipeline**: Pure Rust \`xserver_shim\` native pipeline interfacing directly with \`ANativeWindow\` and \`AHardwareBuffer\`, accelerated with 128-byte unrolled ARM NEON (AArch64) registers for instantaneous pixel transfers without CPU thrashing.
- 🚀 **Ultra-Low CPU Direct3D Pipeline**: Pre-configured with \`DXVK_ASYNC=1\` asynchronous shader compilation and VKD3D-Proton single-queue execution to eliminate frame drops and stuttering.
- 🛡️ **Kernel-Level Synchronization**: Zero-overhead IPC using Linux \`futex\` (\`WINEFSYNC=1\`) and \`eventfd\` (\`WINEESYNC=1\`), eliminating wineserver polling overhead.
- 🎯 **Lock-Free SPSC Input Queues**: Cacheline-separated (64-byte aligned) sub-millisecond touch, mouse, and Dual-Motor XInput vibration rumble routing without Android Garbage Collector pauses.
- 📦 **9 Side-by-Side Optimized Variants**: Multiple package signatures (\`Optimized\`, \`Normal\`, \`Lite\`, \`PuBG\`, \`AnTuTu\`, \`alt-AnTuTu\`, \`PuBG-CrossFire\`, \`Ludashi\`, \`Genshin\`, \`Original\`) to bypass OEM/driver throttling on Snapdragon & Dimensity chipsets.
- 🔒 **Privacy-Hardened & No Login**: 100% stripped telemetry, ads, and login bypass allowing direct offline access and component management.
- 🔄 **Automated CI/CD Workflows**: Multi-stage GitHub Actions workflows that compile Rust binaries, bundle ReVanced patches, sign APKs with stable v1+v2+v3 keys, and publish releases automatically.`;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 md:p-8 rounded-2xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-400/40 bg-slate-900 shrink-0 p-1">
            <DeskHubLogo className="w-full h-full object-cover rounded-xl" />
          </div>

          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Official Release v1.0.8
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">
                SIMD Vectorized & Low CPU
              </span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">
                GameHub ReVanced Engine
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              DeskHub emulator — أقوى محاكي لتشغيل ألعاب PC على أندرويد
            </h2>

            <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              محرك ReVanced المتطور المبني على نواة Rust و تسريع SIMD NEON مع تخفيف ضغط المعالج إلى الحد الأدنى لتشغيل ألعاب Windows والـ Steam بسلاسة فائقة.
            </p>
          </div>
        </div>
      </div>

      {/* SEO & GitHub Repository Metadata Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About & Short Description */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  وصف المشروع (Repository Description)
                </h3>
                <p className="text-xs text-slate-500">
                  الوصف المخصص للـ About في GitHub ومحركات البحث
                </p>
              </div>
            </div>
            <button
              onClick={() => copyText("githubAbout", githubAbout)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors"
            >
              {copiedKey === "githubAbout" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "githubAbout" ? "تم النسخ" : "نسخ"}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            {githubAbout}
          </div>

          {/* Full SEO Description */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                الوصف الشامل لمحركات البحث (Meta Description)
              </span>
              <button
                onClick={() => copyText("shortDesc", shortDescription)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === "shortDesc" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedKey === "shortDesc" ? "تم النسخ" : "نسخ الوصف"}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {shortDescription}
            </p>
          </div>
        </div>

        {/* Repository Topics / Tags */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  الوسوم والكلمات المفتاحية (Topics & Keywords)
                </h3>
                <p className="text-xs text-slate-500">
                  ضع هذه الكلمات في خانة GitHub Topics للظهور الفوري في نتائج البحث
                </p>
              </div>
            </div>
            <button
              onClick={() => copyText("topics", topics.join(", "))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-600 dark:text-purple-300 text-xs font-semibold rounded-lg transition-colors"
            >
              {copiedKey === "topics" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "topics" ? "تم النسخ" : "نسخ الكل"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <span
                key={t}
                onClick={() => copyText(t, t)}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700"
                title="انقر لنسخ الوسم"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>نصيحة SEO لـ Google:</strong> إضافة وسوم <code>deskhub</code> و <code>gamehub-revanced</code> و <code>wine-android</code> ستجعل مستودعك يتصدر نتائج بحث اللاعبين المهتمين بتشغيل ألعاب الكمبيوتر على الهواتف.
            </span>
          </div>
        </div>
      </div>

      {/* Full Markdown Documentation for README / Releases */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                قسم About المفصل لملف README.md والإصدارات
              </h3>
              <p className="text-xs text-slate-500">
                جاهز للنسخ المباشر ووضعه في مقدمة ملف المستودع الرئيسي
              </p>
            </div>
          </div>
          <button
            onClick={() => copyText("markdownAbout", fullMarkdownAbout)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            {copiedKey === "markdownAbout" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === "markdownAbout" ? "تم نسخ الماركداون!" : "نسخ كود Markdown"}
          </button>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
            {fullMarkdownAbout}
          </pre>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Rust Native Core</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أعلى كفاءة في استهلاك الذاكرة بدون أي توقف لجامع المهملات (GC-Free).
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ultra-Low CPU</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تجميع DXVK Asynchronous و Futex لتشغيل ألعاب AAA بأعلى إطارات.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Zero-Copy Frames</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تمرير مباشر لسطح العرض عبر AHardwareBuffer مع استجابة فورية للمس.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Privacy & Offline</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            حذف كافة أدوات التتبع والحسابات وتوفير وصول كامل دون إنترنت.
          </p>
        </div>
      </div>
    </div>
  );
};
