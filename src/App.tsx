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
  Sparkles
} from "lucide-react";

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
  const [selectedFilePath, setSelectedFilePath] = useState<string>("README.md");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLoading, setFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    patches: true,
    extensions: true,
    native: true,
    docs: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "explorer" | "patches" | "guide">("overview");

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
        return node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase());
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
                  {node.name.endsWith(".kt") || node.name.endsWith(".kts") ? (
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

  const keyFiles = [
    { name: "README.md", path: "README.md", desc: "التوثيق الكامل والمواصفات للمشروع" },
    { name: "build.gradle.kts", path: "build.gradle.kts", desc: "إعدادات البناء الرئيسية (Root Gradle)" },
    { name: "settings.gradle.kts", path: "settings.gradle.kts", desc: "وحدات المشروع (Patches, Extensions, Native)" },
    { name: "patches/build.gradle.kts", path: "patches/build.gradle.kts", desc: "إعدادات باتشات ReVanced" },
    { name: "gradle.properties", path: "gradle.properties", desc: "خصائص إصدارات GameHub و ReVanced" },
    { name: "PRIVACY.md", path: "PRIVACY.md", desc: "سياسة الخصوصية وتعديلات التتبع" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                BannerHub ReVanced
              </h1>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                v1.0.0-609
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Android Source Code & ReVanced Workspace
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
            href="https://github.com/The412Banner/bannerhub-revanced/tree/v1.0.0-609"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 rounded-lg transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            المستودع الأصلي
          </a>
        </div>
      </header>

      {/* Main Status Notification Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            تم تحميل واستخراج كود المصدر بالكامل بنجاح في بيئة العمل! جاهز لاستقبال طلبات التعديل والبناء.
          </span>
        </div>
        <span className="text-xs bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full">
          {projectInfo ? `${projectInfo.totalFiles} ملف جاهز` : "جاهز"}
        </span>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex gap-6">
        <button
          id="tab-overview"
          onClick={() => setActiveTab("overview")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "patches"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          البنية والباتشات (Patches & Extensions)
        </button>
        <button
          id="tab-guide"
          onClick={() => setActiveTab("guide")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "guide"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4" />
          خطوات التعديل وإعادة البناء
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">تطبيق الهدف (Target App)</h3>
                    <p className="text-xs text-slate-500">GameHub 6.0.8 / 6.0.9</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  حزمة <code className="text-blue-600 font-mono">com.xiaoji.egggame</code> - مع دعم تعديلات ReVanced.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">وحدات المشروع</h3>
                    <p className="text-xs text-slate-500">Gradle Kotlin DSL Multi-module</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  يشمل <code className="font-mono text-purple-600">/patches</code> و <code className="font-mono text-purple-600">/extensions</code> و <code className="font-mono text-purple-600">/native</code>.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">حالة التنزيل والجاهزية</h3>
                    <p className="text-xs text-slate-500">تم فك الحزمة بنجاح</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  جميع الملفات والأصول وشهادات التوقيع (Keystore) متوفرة محلياً.
                </p>
              </div>
            </div>

            {/* Core Features Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                الميزات والباتشات الرئيسية المتضمنة في هذا المشروع:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    🔓 إزالة قفل تسجيل الدخول (No Login Requirement)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    تخطي شاشات تسجيل الدخول الإلزامية والتحقق في GameHub.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    🌐 توجيه الـ API إلى Cloudflare Worker
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    إعادة توجيه كتالوج الألعاب إلى سيرفرات وسيطة بديلة خاصة بـ BannerHub.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    🎮 دعم XInput Rumble لألعاب Wine
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    توليد اهتزازات يد التحكم بدقة لألعاب الويندوز والـ PC على الأندرويد.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    🛍️ تكامل GOG ومكتبة الألعاب في تبويب Explore
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    إمكانية تسجيل الدخول في GOG وتحميل وتثبيت الألعاب مباشرة من التطبيق.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick File Shortcuts */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                أهم ملفات التكوين والإعداد السريع:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {keyFiles.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => {
                      setSelectedFilePath(file.path);
                      setActiveTab("explorer");
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 rounded-lg cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      <FileCode className="w-4 h-4" />
                      {file.name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {file.desc}
                    </p>
                  </div>
                ))}
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
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-200 text-xs">{selectedFilePath}</span>
                </div>
                <button
                  id="btn-copy-code"
                  onClick={() => copyToClipboard(fileContent)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
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
              تفاصيل هيكلية الباتشات والامتدادات (ReVanced Architecture)
            </h2>

            <div className="space-y-4 text-sm">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  1. مجلد الباتشات (<code className="font-mono text-xs">/patches</code>)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  يحتوي على فئات وتعديلات ReVanced Patcher بلغة Kotlin، والتي تعيد كتابة أوامر الـ Smali وحقن الـ Bytecode في تطبيق GameHub.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFilePath("patches/build.gradle.kts");
                      setActiveTab("explorer");
                    }}
                    className="text-xs font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    patches/build.gradle.kts
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  2. الامتدادات والمكونات (<code className="font-mono text-xs">/extensions</code>)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  تحتوي على حزم المكونات البرمجية التي يتم حقنها في التطبيق، مثل واجهات المستخدم الخاصة بـ GOG وخدمات التحكم والمحاكيات.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  3. الكود الأصلي والمحاكيات (<code className="font-mono text-xs">/native</code>)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  يتضمن شيم خادم XServer ومكتبات الـ C/C++ المرتبطة بمحاكاة شاشات العرض والمدخلات.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              جاهزية استقبال تعليمات التعديل وإعادة البناء
            </h2>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm space-y-2">
              <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                أخبرني بأي تعديل ترغب في تطبيقه:
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-blue-800 dark:text-blue-300">
                <li>تعديل أسماء الحزم (Package IDs) أو أسماء التطبيق والأيقونات.</li>
                <li>تغيير روابط السيرفرات أو Cloudflare Workers أو مفاتيح الـ API.</li>
                <li>إضافة باتشات مخصصة أو تعديل باتشات ReVanced الحالية.</li>
                <li>تعديل واجهات المستخدم أو تبويب Explore أو قوائم الإعدادات.</li>
                <li>تعديل إعدادات التوقيع ومفاتيح الـ Keystore.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
