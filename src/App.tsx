import React, { useState, useEffect } from "react";
import {
  Folder,
  FileCode,
  FileText,
  CheckCircle2,
  DownloadCloud,
  Layers,
  Code2,
  Smartphone,
  Cpu,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Terminal,
  FileBox,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  Box,
  Binary,
  Globe,
  Tag
} from "lucide-react";
import { DeskHubLogo } from "./components/DeskHubLogo";
import { AboutAndSeoSection } from "./components/AboutAndSeoSection";

interface TreeNode {
  name: string;
  path: string;
  type: "directory" | "file";
  size?: number;
  children?: TreeNode[];
}

interface ProjectInfo {
  exists: boolean;
  name: string;
  version: string;
  sourceUrl: string;
  targetApp: string;
  totalFiles: number;
  projectPath: string;
  status: string;
}

export default function App() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("native/xserver_shim/src/lib.rs");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLoading, setFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    patches: true,
    extensions: true,
    native: true,
    "native/xserver_shim": true,
    "native/xserver_shim/src": true,
    docs: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"about_seo" | "vulkan_rust" | "changelog" | "overview" | "explorer" | "patches" | "guide">("about_seo");

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    if (selectedFilePath) {
      loadFile(selectedFilePath);
    }
  }, [selectedFilePath]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [infoRes, treeRes] = await Promise.all([
        fetch("/api/project/info"),
        fetch("/api/project/tree"),
      ]);
      const infoData = await infoRes.json();
      const treeData = await treeRes.json();
      setProjectInfo(infoData);
      setTree(treeData.tree || []);
    } catch (e) {
      console.error("Failed to load project details", e);
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (path: string) => {
    setFileLoading(true);
    try {
      const res = await fetch(`/api/project/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
      } else {
        setFileContent("// تعذر تحميل محتوى الملف");
      }
    } catch (e) {
      setFileContent("// خطأ في قراءة الملف");
    } finally {
      setFileLoading(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes
      .filter((node) => {
        if (!searchQuery) return true;
        return (
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .map((node) => {
        const isDir = node.type === "directory";
        const isExpanded = expandedFolders[node.path];
        const isSelected = selectedFilePath === node.path;

        return (
          <div key={node.path} className="select-none">
            <div
              id={`tree-node-${node.path.replace(/[^a-zA-Z0-9]/g, "-")}`}
              onClick={() => {
                if (isDir) {
                  toggleFolder(node.path);
                } else {
                  setSelectedFilePath(node.path);
                }
              }}
              style={{ paddingLeft: `${depth * 14 + 10}px` }}
              className={`flex items-center gap-2 py-1.5 px-2 text-sm rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white font-medium shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
              }`}
            >
              {isDir ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  )}
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  {node.name.endsWith(".rs") ? (
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : node.name.endsWith(".kt") || node.name.endsWith(".kts") ? (
                    <FileCode className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : node.name.endsWith(".md") || node.name.endsWith(".txt") ? (
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <FileBox className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </>
              )}
              <span className="truncate text-xs tracking-wide">{node.name}</span>
            </div>
            {isDir && isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      });
  };

  const rustModules = [
    {
      id: "jni-core",
      title: "Rust JNI Core & 40-Method Table",
      file: "native/xserver_shim/src/lib.rs",
      desc: "نقطة الدخول JNI_OnLoad وجدول الدوال الأصلي وواجهات NativeCore الفورية",
      badge: "JNI Core",
    },
    {
      id: "vibration-engine",
      title: "Lock-Free Vibration Rumble Engine",
      file: "native/xserver_shim/src/vibration.rs",
      desc: "معالجة الاهتزاز الفوري في أقل من 0.05ms بدون حجز كائنات في ذاكرة Android GC",
      badge: "Sub-ms Rumble",
    },
    {
      id: "vulkan-primary",
      title: "Vulkan 1.3 Primary Pipeline",
      file: "native/xserver_shim/src/vulkan_renderer.rs",
      desc: "إدارة Swapchain ثلاثي المخزن (Mailbox) وربط ANativeWindow المباشر",
      badge: "Vulkan Engine",
    },
    {
      id: "pipeline-cache",
      title: "Pipeline Cache & Zero-Copy AHardwareBuffer",
      file: "native/xserver_shim/src/vulkan_advanced.rs",
      desc: "تخزين الشيدرز على القرص لمنع التقطيع (Stutter-Free) وتمرير الإطارات المباشر دون نسخ بالذاكرة",
      badge: "Zero-Copy Vk",
    },
    {
      id: "fsr-cas",
      title: "FSR 1.0 & FidelityFX CAS Upscaler",
      file: "native/xserver_shim/src/vulkan_advanced.rs",
      desc: "رفع الدقة التكيفي فائق السرعة عبر شيدر أحادي لتخفيف أكثر من 40% من عبء معالج الرسوميات",
      badge: "FSR / CAS",
    },
    {
      id: "epoll-mux",
      title: "Decoupled Epoll Socket Multiplexer",
      file: "native/xserver_shim/src/epoll_server.rs",
      desc: "معالجة غير متزامنة لمقابس XServer بأسلوب Edge-Triggered epoll لتقليل استهلاك أنوية المعالج",
      badge: "Epoll Multi",
    },
    {
      id: "simd-readout",
      title: "SIMD Zero-Copy Render Readout",
      file: "native/xserver_shim/src/readout.rs",
      desc: "نظام قراءة الرندر ونقل الإطارات الموجه (Vectorized 64-Byte Streaming)",
      badge: "SIMD Readout",
    },
    {
      id: "big-core",
      title: "CPU Big-Core Affinity & Real-Time Scheduling",
      file: "native/xserver_shim/src/perf.rs",
      desc: "تثبيت خيوط الرندر على أنوية الأداء الكبرى وإلغاء اختناق المعالج وترددات الإطارات",
      badge: "Big Core / Realtime",
    },
    {
      id: "mmap-storage",
      title: "Mmap Zero-Latency Config Storage",
      file: "native/xserver_shim/src/storage.rs",
      desc: "مزامنة إعدادات المحاكي مباشرة عبر الذاكرة المشتركة دون تكاليف XML أو Serialization",
      badge: "Mmap Storage",
    },
    {
      id: "simd-scanner",
      title: "SIMD Driver & Component Discovery",
      file: "native/xserver_shim/src/components.rs",
      desc: "فحص متوازي وسريع لتعريفات Mesa Turnip و DXVK و VKD3D في أجزاء من الثانية",
      badge: "SIMD Scanner",
    },
    {
      id: "voice-ring",
      title: "Low-Latency Voice P2P Ring Buffer",
      file: "native/xserver_shim/src/voice.rs",
      desc: "معالجة وتمرير حزم الصوت والمحادثات المباشرة دون تقطيع أو تأخير زمني",
      badge: "Voice Ring",
    },
    {
      id: "java-bridge",
      title: "Java BhNativeCore JNI Bridge",
      file: "extensions/gamehub/src/main/java/com/xj/winemu/nativecore/BhNativeCore.java",
      desc: "واجهة الاستدعاء الأصلي المباشرة من جافا وكوتلن لجميع محركات الرست",
      badge: "Native Bridge",
    },
    {
      id: "aggressive-flags",
      title: "Aggressive CMake & Cargo Flags",
      file: "native/xserver_shim/CMakeLists.txt",
      desc: "خيارات التجميع القصوى: -O3 -flto -fno-stack-protector -ffast-math -pipe و strip=symbols",
      badge: "Aggressive Flags",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-900 border border-indigo-500/30">
            <DeskHubLogo className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                DeskHub emulator
              </h1>
              <span className="bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> v1.1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              DeskHub emulator & GitHub Actions CI/CD Automated APK Build Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh"
            onClick={fetchProjectData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <a
            id="btn-repo-github"
            href="https://github.com/hero942008/Banerhubhero"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 rounded-lg transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            المستودع
          </a>
        </div>
      </header>

      {/* Main Status Notification Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border-b border-indigo-500/20 px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium text-xs md:text-sm">
            تم ترقية وتحديث <strong className="text-indigo-600 dark:text-indigo-400">DeskHub emulator</strong> إلى إصدار <strong className="text-purple-600 dark:text-purple-400">v1.1.0</strong> مع Direct Input و AAudio و Zstd VFS وتسريع SIMD NEON!
          </span>
        </div>
        <span className="text-xs bg-indigo-600 text-white font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" /> v1.1.0 Ready
        </span>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex gap-6 overflow-x-auto">
        <button
          id="tab-about-seo"
          onClick={() => setActiveTab("about_seo")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "about_seo"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-500" />
          حول والميتا وسيو البحث (About & SEO) 🔥
        </button>
        <button
          id="tab-vulkan-rust"
          onClick={() => setActiveTab("vulkan_rust")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "vulkan_rust"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          محرك الرندر Rust & Vulkan ⚡
        </button>
        <button
          id="tab-changelog"
          onClick={() => setActiveTab("changelog")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "changelog"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          سجل التغييرات v1.1.0 (Changelog) 🚀
        </button>
        <button
          id="tab-overview"
          onClick={() => setActiveTab("overview")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          نظرة عامة على المشروع
        </button>
        <button
          id="tab-explorer"
          onClick={() => setActiveTab("explorer")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "explorer"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Code2 className="w-4 h-4" />
          مستكشف الملفات والأكواد ({projectInfo?.totalFiles || 0})
        </button>
        <button
          id="tab-patches"
          onClick={() => setActiveTab("patches")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "patches"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          البنية والباتشات
        </button>
        <button
          id="tab-guide"
          onClick={() => setActiveTab("guide")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "guide"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4" />
          أوامر البناء والتصدير
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {activeTab === "about_seo" && <AboutAndSeoSection />}
        {activeTab === "vulkan_rust" && (
          <div className="space-y-6">
            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">محرك الرسوم الأساسي</span>
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Activity className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">Vulkan 1.3 Primary</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ✓ Triple-Buffering Mailbox
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">لغة المحرك الأصلي (Native)</span>
                  <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Zap className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">Rust (Zero-Cost)</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ✓ Full Memory Safety & LTO Fat
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">نظام قراءة الرندر (Readout)</span>
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Gauge className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">SIMD 64-Byte Stream</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ✓ Zero-Copy Vectorized Copy
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">توافقية كاملة (Compatibility)</span>
                  <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">40/40 JNI Methods</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ✓ GameHub 6.0.4 - 6.0.9+
                </p>
              </div>
            </div>

            {/* Architecture Comparison Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Gauge className="w-5 h-5 text-amber-500" />
                مقارنة الأداء: محرك C القديم مقابل محرك Rust + Vulkan الجديد
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 opacity-75">
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    المحرك القديم (Legacy C Bridge):
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• نقل إطارات متزامن يستهلك وقت إضافي على المعالج (CPU overhead).</li>
                    <li>• قفل كامل لمسار المدخلات JNI يؤدي أحياناً لهبوط الإطارات (Stutters).</li>
                    <li>• عدم استخدام تحسينات SIMD الخاصة بمعالجات ARM64 NEON.</li>
                    <li>• التبديل اليدوي بين GLES2 و Vulkan بدون تحسينات خطوط الأنابيب (Pipeline State).</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50 space-y-2">
                  <div className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    محرك Rust + Vulkan الجديد (الأقصى سرعة):
                  </div>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                    <li>• <strong>Vulkan 1.3 Asynchronous Presentation</strong>: زمن استجابة صفري وتزامن مباشر مع ANativeWindow.</li>
                    <li>• <strong>Lock-Free Input Event Queue</strong>: طوابير خالية من الأقفال (SPSC) لمدخلات اللمس والماوس.</li>
                    <li>• <strong>SIMD 64-Byte Streaming Readout</strong>: نقل الذاكرة بكتل 64 بايت موجهة ومحاذاة مع الكاش L1/L2.</li>
                    <li>• <strong>LTO Fat + Release Flags</strong>: أعلى مستوى تحسين تجميعي وحذف كامل للـ Dead Code.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Rust Modules Direct Access */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Binary className="w-4 h-4 text-indigo-500" />
                الملفات والوحدات البرمجية التي تم بناؤها بلغة Rust:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rustModules.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedFilePath(m.file);
                      setActiveTab("explorer");
                    }}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-lg cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        {m.title}
                      </div>
                      <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {m.desc}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                      {m.file}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "changelog" && (
          <div className="space-y-6">
            {/* Header Badge v1.1.0 */}
            <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/40 p-6 rounded-2xl border border-purple-500/30 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full font-mono">
                      LATEST RELEASE v1.1.0 (Build 1010000)
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Direct Input, AAudio & Zstd VFS
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    سجل التغييرات الرسمي لإصدار DeskHub v1.1.0 (Latest)
                  </h2>
                  <p className="text-xs md:text-sm text-purple-200/80 mt-1">
                    تقرير شامل ومفصل بكافة التحديثات المطبقة: معالجة الإدخال المباشر uinput، محرك الصوت AAudio عالي السرعة، نظام الملفات Zstd VFS، وقيود الذاكرة المباشرة بلغة التجميع ARM64.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text = `WHAT'S NEW IN DESKHUB EMULATOR v1.1.0\n• Upgraded release version to v1.1.0 (Build 1010000)\n• Direct Input & Touch Dispatcher: Sub-millisecond direct touch and mouse routing bypassing JVM Garbage Collector loops with lock-free atomic SPSC ring buffers\n• AAudio / Oboe Low-Latency Sound Engine: Zero-underrun audio streaming with hardware SIMD sample interpolation and volume gain scaling\n• Memory-Mapped Zstd VFS Engine: Multi-threaded compressed package loader speeding up Windows game asset loading times by 3-5x\n• Bare-Metal Inline ARM64 ASM Barriers: Native dmb ish / isb assembly fences for heterogeneous Big.LITTLE multi-core CPUs\n• Zero-Copy Wineserver IPC Proxy: Linux splice/vmsplice kernel zero-copy pipes for instantaneous Wine IPC\n• ARM NEON (aarch64) and AVX2 (x86_64) SIMD 128-byte unrolled frame readout pipeline\n• High-Resolution 4K App Icon & Modern Hexagonal Cybernetic Design\n• 9 Side-by-Side Optimized Variants for Snapdragon & Dimensity`;
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 shadow-md"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? "تم نسخ السجل!" : "نسخ نص سجل v1.1.0"}
                </button>
              </div>
            </div>

            {/* Detailed Changelog Cards v1.1.0 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      1. معالج الإدخال واللمس المباشر (Direct Input & Touch Dispatcher)
                    </h3>
                    <span className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400">
                      Direct uinput | AInputQueue | Lock-Free SPSC
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                  <li>• توجيه أحداث اللمس وأزرار الفأرة مباشرة إلى النواة عبر ذاكرة ذرية بدون أقفال (Lock-Free Atomic SPSC Buffer).</li>
                  <li>• تجاوز طبقة معالجة أحداث أندرويد بالـ Java (MotionEvent) للتخلص التام من تقطيعات الـ Garbage Collector.</li>
                  <li>• تقليل زمن استجابة لمس الشاشة وأذرع التحكم (Input Lag) إلى أقل من <strong>0.5 ميلي ثانية</strong>.</li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      2. محرك الصوت المباشر فائق السرعة (AAudio / Oboe Low-Latency Engine)
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400">
                      AAudio Lock-Free | SIMD Resampling NEON
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                  <li>• دفق الصوت مباشرة عبر واجهة <strong>Google AAudio</strong> منخفضة التأخير للقضاء النهائي على تقطيع الصوت (Zero-Underrun).</li>
                  <li>• معالجة وإعادة تشكيل العينات الصوتية (Audio Resampling & Volume Scaling) بتسريع عتادي <strong>SIMD NEON / AVX2</strong>.</li>
                  <li>• خفض زمن تأخير إخراج الصوت للألعاب إلى الحد الأدنى المناسب للألعاب التنافسية.</li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      3. نظام الملفات الافتراضي المباشر (Direct Storage Zstd VFS)
                    </h3>
                    <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400">
                      Memory-Mapped VFS | Zstd Multi-threaded
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                  <li>• تحميل ملفات وحزم الألعاب مباشرة من الذاكرة المقترنة (Memory-Mapped I/O) بدون نسخ متكرر في الذاكرة.</li>
                  <li>• تسريع فك ضغط الأصول ومكتبات DirectX بتعدد المسارات (Multi-threaded Rayon/Zstd).</li>
                  <li>• تقليص شاشات تحميل الألعاب (Loading Screens) بمقدار <strong>3 إلى 5 أضعاف</strong> مقارنة بالحلول التقليدية.</li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      4. حواجز الذاكرة بلغة التجميع ومزامنة Wineserver
                    </h3>
                    <span className="text-[11px] font-mono text-purple-500 dark:text-purple-400">
                      ARM64 Inline Assembly (DMB/ISB) | Splice Zero-Copy
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                  <li>• استخدام أوامر تجميع عتادية مباشرة (<code className="text-purple-500 font-mono">dmb ish</code>, <code className="text-purple-500 font-mono">isb</code>) لمزامنة الأنوية غير المتناظرة (Big.LITTLE).</li>
                  <li>• تفعيل وسيط IPC بدون نسخ عبر دوال لينكس <code className="text-purple-500 font-mono">splice()</code> / <code className="text-purple-500 font-mono">vmsplice()</code> لتبادل حزم الـ Wineserver.</li>
                  <li>• استقرار تام وحماية ضد تجمد خيوط المعالجة في الألعاب ذات العالم المفتوح.</li>
                </ul>
              </div>
            </div>

            {/* In-App Explore Body Format */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>نص السجل المدمج مباشرة داخل شاشة Explore في تطبيق DeskHub v1.1.0:</span>
                <span className="text-purple-400">explore/bh_explore.json & BhExploreManifest</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-lg text-emerald-400 leading-relaxed overflow-x-auto">
{`WHAT'S NEW IN DESKHUB EMULATOR v1.1.0
• Upgraded release version to v1.1.0 (Build 1010000)
• Direct Input & Touch Dispatcher: Sub-millisecond direct touch and mouse routing bypassing JVM Garbage Collector loops with lock-free atomic SPSC ring buffers
• AAudio / Oboe Low-Latency Sound Engine: Zero-underrun audio streaming with hardware SIMD sample interpolation and volume gain scaling
• Memory-Mapped Zstd VFS Engine: Multi-threaded compressed package loader speeding up Windows game asset loading times by 3-5x
• Bare-Metal Inline ARM64 ASM Barriers: Native dmb ish / isb assembly fences for heterogeneous Big.LITTLE multi-core CPUs
• Zero-Copy Wineserver IPC Proxy: Linux splice/vmsplice kernel zero-copy pipes for instantaneous Wine IPC
• ARM NEON (aarch64) and AVX2 (x86_64) SIMD 128-byte unrolled frame readout pipeline
• Persistent VkPipelineCache on NVMe/UFS storage
• 9 Side-by-Side Optimized Variants for Snapdragon & Dimensity`}
              </pre>
            </div>

            {/* Previous Version Changelog: v1.0.8 */}
            <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                    PREVIOUS RELEASE: v1.0.8 (Build 1008000)
                  </span>
                  <span className="text-xs text-slate-400">
                    SIMD Vectorization & Ultra-Low CPU Direct3D Pipeline
                  </span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 leading-relaxed list-disc list-inside">
                <li><strong>Hardware SIMD Vectorization:</strong> ARM NEON (aarch64) and AVX2 (x86_64) unrolled 128-byte frame readout pipeline.</li>
                <li><strong>Ultra-Low CPU Direct3D:</strong> DXVK Async (<code className="text-indigo-400 font-mono">DXVK_ASYNC=1</code>) and VKD3D single-queue execution.</li>
                <li><strong>Kernel-Level Futex:</strong> Linux futex and eventfd synchronization reducing Wine IPC latency down to 0.18ms.</li>
                <li><strong>Modern 4K Branding:</strong> High-definition cybernetic hexagonal icon registered across all Android mipmap buckets.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">اسم الحزمة والمشروع</h3>
                    <p className="text-xs text-slate-500">DeskHub emulator</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  حزمة <code className="text-blue-600 font-mono">com.xj.herohuboptimized</code>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">الرندر الافتراضي</h3>
                    <p className="text-xs text-slate-500">Vulkan 1.3 + Rust Native</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  أعلى سرعة ممكنة مع دعم التراجع التلقائي للـ GLES2.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">حالة التوافقية</h3>
                    <p className="text-xs text-slate-500">100% متوافق مع GameHub</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  جميع الباتشات والامتدادات تعمل بدون تعارض.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "explorer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px]">
            {/* Sidebar Tree */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في الملفات..."
                    className="w-full text-xs pr-9 pl-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {tree.length > 0 ? (
                  renderTree(tree)
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    جاري تحميل هيكل الملفات...
                  </div>
                )}
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="lg:col-span-8 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm font-mono text-xs">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  {selectedFilePath.endsWith(".rs") ? (
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-200 text-xs truncate">
                    {selectedFilePath}
                  </span>
                </div>
                <button
                  id="btn-copy-code"
                  onClick={() => copyToClipboard(fileContent)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ" : "نسخ الكود"}
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto bg-slate-950/80">
                {fileLoading ? (
                  <div className="text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    جاري قراءة محتوى الملف...
                  </div>
                ) : (
                  <pre className="text-slate-200 text-xs leading-relaxed whitespace-pre font-mono">
                    {fileContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "patches" && (
          <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              تفاصيل هيكلية الباتشات والامتدادات المعدلة (DeskHub emulator)
            </h2>

            <div className="space-y-4 text-sm">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  1. الباتشات ومحرك الحقن (<code className="font-mono text-xs">/patches</code>)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  تم ضبط تغيير اسم الحزمة إلى <code className="text-indigo-600 dark:text-indigo-400 font-bold">com.xj.herohuboptimized</code> واسم التطبيق إلى <code className="text-blue-600 dark:text-blue-400 font-bold">DeskHub emulator</code>.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  2. محرك الرندر الأصلي (<code className="font-mono text-xs">/native/xserver_shim</code>)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  تم بناؤه بلغة Rust بالكامل مع دعم Vulkan 1.3 كنظام رندر أساسي افتراضي وطوابير خالية من الأقفال وتخزين الشيدرز المستمر Zero-Copy Presentation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              أوامر البناء والتصدير و GitHub Actions CI/CD التلقائي
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 text-slate-200 rounded-lg">
                <div className="text-slate-400 mb-2 text-[11px] font-sans">
                  # 1. مسار الـ CI/CD لبناء حزم APK ونشرها تلقائياً على GitHub:
                </div>
                <code className="text-amber-400">.github/workflows/herohub_build.yml</code>
                <p className="text-[11px] font-sans text-slate-400 mt-1">
                  يقوم غيت هب بتجميع مكتبات Rust، وحزم الباتشات وتطبيقها على GameHub وتوقيع APK وتوليد إصدارات فورية مع كل Push أو Tag.
                </p>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-lg">
                <div className="text-slate-400 mb-2 text-[11px] font-sans">
                  # 2. بناء باتشات ReVanced وحزم الـ Extensions محلياً:
                </div>
                <code>./gradlew build --no-daemon</code>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
