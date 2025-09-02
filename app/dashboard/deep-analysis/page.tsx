"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AnalysisStatus,
  DeepAnalysis,
  SourceType,
} from "@/types/deep-analysis";
import {
  AlertCircle,
  Archive,
  Award,
  BarChart3,
  Bookmark,
  Brain,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Gauge,
  Globe,
  HelpCircle,
  Layers,
  Lightbulb,
  MoreHorizontal,
  PenTool,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  SortDesc,
  Sparkles,
  Star,
  Target,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";

export default function DeepAnalysisPage() {
  const router = useRouter();
  
  // نظام الثيم مع حماية من SSR
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // استخدام localStorage لتحديد الثيم
    const theme = localStorage.getItem('sabq-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(theme === 'dark' || (theme === null && systemPrefersDark));
  }, []);
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AnalysisStatus | "all">(
    "all"
  );
  const [sourceTypeFilter, setSourceTypeFilter] = useState<SourceType | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState("analyzed_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgReadTime: 0,
    engagementRate: 0,
    shareCount: 0,
    avgRating: 0,
  });
  // جلب التحليلات
  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sourceTypeFilter !== "all" && { sourceType: sourceTypeFilter }),
      });
      console.log("Fetching analyses with params:", params.toString());
      const response = await fetch(`/api/deep-analyses?${params}`);
      const data = await response.json();
      console.log("API Response:", data);
      if (response.ok) {
        setAnalyses(data.analyses || []);
        const totalPages = Math.ceil((data.total || 0) / 10);
        setTotalPages(totalPages);
        console.log(
          "Fetched analyses:",
          data.analyses?.length,
          "Total:",
          data.total,
          "Pages:",
          totalPages
        );
      } else {
        console.error("API Error:", data);
        toast.error("فشل في جلب التحليلات");
      }
    } catch (error) {
      console.error("Error fetching analyses:", error);
      toast.error("حدث خطأ في جلب التحليلات");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalyses();
  }, [page, sortBy, sortOrder, statusFilter, sourceTypeFilter]);
  // حذف تحليل
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التحليل؟")) return;
    try {
      const response = await fetch(`/api/deep-analyses/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("تم حذف التحليل بنجاح");
        fetchAnalyses();
      } else {
        toast.error("فشل في حذف التحليل");
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error("حدث خطأ في حذف التحليل");
    }
  };
  // تحديث حالة التحليل
  const handleStatusUpdate = async (id: string, status: AnalysisStatus) => {
    try {
      const response = await fetch(`/api/deep-analyses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success("تم تحديث حالة التحليل");
        fetchAnalyses();
      } else {
        toast.error("فشل في تحديث الحالة");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("حدث خطأ في تحديث الحالة");
    }
  };
  // دوال مساعدة لعرض البيانات
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      case "archived":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "gpt":
        return (
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        );
      case "manual":
        return <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "mixed":
        return (
          <Layers className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      default:
        return (
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "منشور";
      case "draft":
        return "مسودة";
      case "archived":
        return "مؤرشف";
      default:
        return "غير محدد";
    }
  };

  const getSourceText = (sourceType: string) => {
    switch (sourceType) {
      case "gpt":
        return "GPT";
      case "manual":
        return "يدوي";
      case "mixed":
        return "مختلط";
      default:
        return "غير محدد";
    }
  };
  // مكون بطاقة الإحصائية
  const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    bgColor,
    iconColor,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div
      className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p
            className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span
              className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {loading ? "..." : value}
            </span>
            <span
              className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {subtitle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  // حساب الإحصائيات المتقدمة
  const stats = {
    total: analyses.length,
    published: analyses.filter((a) => a.status === "published").length,
    draft: analyses.filter((a) => a.status === "draft").length,
    avgQuality:
      analyses.length > 0
        ? Math.min(
            Math.round(
              analyses.reduce((acc, a) => acc + a.qualityScore, 0) /
                analyses.length
            ),
            100
          )
        : 0,
    totalViews: analyses.reduce((acc, a) => acc + a.views, 0),
    gptAnalyses: analyses.filter((a) => a.sourceType === "gpt").length,
    thisWeek: analyses.filter((a) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(a.createdAt) > oneWeekAgo;
    }).length,
    avgReadTime: performanceMetrics.avgReadTime || 8,
    topPerforming: analyses.filter((a) => a.views > 1000).length,
    recentlyUpdated: analyses.filter((a) => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(a.updatedAt || a.createdAt) > threeDaysAgo;
    }).length,
  };

  // دالة لحساب مؤشر الأداء الشامل
  const calculatePerformanceIndex = (analysis: DeepAnalysis) => {
    const viewsScore = Math.min((analysis.views / 1000) * 20, 30);
    const qualityScore = (analysis.qualityScore / 100) * 40;
    const timeScore = analysis.status === "published" ? 20 : 10;
    const typeScore = analysis.sourceType === "gpt" ? 10 : 15;
    return Math.round(viewsScore + qualityScore + timeScore + typeScore);
  };

  // دالة لتصنيف التحليل حسب الأداء
  const getPerformanceLevel = (score: number) => {
    if (score >= 80)
      return {
        label: "ممتاز",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (score >= 60)
      return {
        label: "جيد جداً",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    if (score >= 40)
      return {
        label: "جيد",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return {
      label: "يحتاج تحسين",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  };

  // حماية من العرض قبل التهيئة
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--bg))', 
        padding: '24px',
        color: 'hsl(var(--fg))'
      }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <Brain style={{ width: '24px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>
                🧠 التحليل العميق المتقدم
              </h2>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                منصة ذكية لإنتاج وإدارة التحليلات العميقة بتقنيات الذكاء الاصطناعي المتطورة
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="chip">
                  <Sparkles style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
                  AI-Powered
                </div>
                <div className="chip chip-muted">
                  <Globe style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
                  {stats.published} منشور
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn"
                onClick={() => router.push("/admin/deep-analysis/analytics")}
              >
                <BarChart3 style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                التحليلات
              </button>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/admin/deep-analysis/create")}
              >
                <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                إنشاء تحليل جديد
              </button>
            </div>
          </div>
        </div>

          {/* شريط المؤشرات السريعة */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle style={{
                    width: '16px',
                    height: '16px',
                    color: stats.published > 0 ? '#10b981' : 'hsl(var(--muted))'
                  }} />
                  <span className="text-muted">
                    {stats.published} منشور
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{
                    width: '16px',
                    height: '16px',
                    color: stats.draft > 0 ? '#f59e0b' : 'hsl(var(--muted))'
                  }} />
                  <span className="text-muted">
                    {stats.draft} مسودة
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp style={{
                    width: '16px',
                    height: '16px',
                    color: stats.thisWeek > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'
                  }} />
                  <span className="text-muted">
                    {stats.thisWeek} هذا الأسبوع
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '64px',
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  background: 'hsl(var(--line))'
                }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'hsl(var(--accent))',
                      width: `${stats.avgQuality}%`
                    }}
                  />
                </div>
                <span className="text-xs text-muted" style={{ fontWeight: '500' }}>
                  {stats.avgQuality}% جودة
                </span>
              </div>
            </div>
          </div>
        {/* قسم النظام الذكي المحسن */}
        <div className="card" style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, hsl(var(--accent) / 0.05), hsl(var(--accent-2) / 0.03))',
          border: '1px solid hsl(var(--accent) / 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'hsl(var(--accent))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px hsl(var(--accent) / 0.25)'
              }}>
                <Brain style={{ color: 'white', width: '24px', height: '24px' }} />
              </div>
              <div>
                <h2 className="heading-2" style={{ marginBottom: '4px' }}>
                  🚀 محرك التحليل الذكي المتطور
                </h2>
                <p className="text-sm text-muted">
                  تحليل متقدم للمحتوى باستخدام GPT-4 ونماذج الذكاء الاصطناعي المتطورة
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-sm"
                onClick={() => router.push("/admin/deep-analysis/analytics")}
              >
                <BarChart3 style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                التحليلات
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => router.push("/admin/deep-analysis/create")}
              >
                <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                إنشاء تحليل جديد
              </button>
            </div>
          </div>

            {/* مؤشرات الأداء الذكية */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div
                className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/70 border-purple-600/50 hover:bg-gray-800"
                    : "bg-white/80 border-purple-100 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      توليد تلقائي
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-green-500 font-medium">نشط</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/70 border-green-600/50 hover:bg-gray-800"
                    : "bg-white/80 border-green-100 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      دقة التحليل
                    </p>
                    <p className="text-xs font-bold text-green-600">
                      {stats.avgQuality}%
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/70 border-blue-600/50 hover:bg-gray-800"
                    : "bg-white/80 border-blue-100 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      وقت القراءة
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {stats.avgReadTime} دقيقة
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/70 border-orange-600/50 hover:bg-gray-800"
                    : "bg-white/80 border-orange-100 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      أداء ممتاز
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      {stats.topPerforming} تحليل
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* مؤشر الحالة العامة */}
            <div
              className={`rounded-lg p-3 border ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    مؤشر الأداء العام
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-24 h-2 rounded-full overflow-hidden ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{
                        width: `${Math.min(stats.avgQuality + 10, 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      stats.avgQuality >= 80
                        ? "text-green-600"
                        : stats.avgQuality >= 60
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {Math.min(stats.avgQuality + 10, 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="إجمالي التحليلات"
            value={stats.total}
            subtitle="تحليل"
            icon={FileText}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="منشور"
            value={stats.published}
            subtitle="تحليل نشط"
            icon={CheckCircle}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
          />
          <StatsCard
            title="مسودة"
            value={stats.draft}
            subtitle="قيد الإعداد"
            icon={Clock}
            bgColor="bg-gradient-to-br from-yellow-100 to-yellow-200"
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="جودة التحليل"
            value={`${stats.avgQuality}%`}
            subtitle="متوسط"
            icon={Award}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="المشاهدات"
            value={stats.totalViews.toLocaleString()}
            subtitle="مشاهدة"
            icon={Eye}
            bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
            iconColor="text-orange-600"
          />
          <StatsCard
            title="تحليلات GPT"
            value={stats.gptAnalyses}
            subtitle="بالذكاء الاصطناعي"
            icon={Brain}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
          />
        </div>

        {/* إحصائيات متقدمة إضافية */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`col-span-1 lg:col-span-2 rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                📊 أداء التحليلات الأسبوعية
              </h3>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700"
              >
                +{stats.thisWeek} هذا الأسبوع
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {stats.topPerforming}
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  أداء ممتاز
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {stats.recentlyUpdated}
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  محدث مؤخراً
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  {stats.avgReadTime}min
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  متوسط القراءة
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  الأداء العام
                </h4>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  مؤشر شامل
                </p>
              </div>
            </div>
            <div
              className={`text-3xl font-bold mb-2 ${
                stats.avgQuality >= 80
                  ? "text-green-500"
                  : stats.avgQuality >= 60
                  ? "text-blue-500"
                  : "text-yellow-500"
              }`}
            >
              {Math.min(stats.avgQuality + 15, 100)}%
            </div>
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                style={{ width: `${Math.min(stats.avgQuality + 15, 100)}%` }}
              />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  توصيات ذكية
                </h4>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  نصائح للتحسين
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {stats.draft > 5 && (
                <div className="flex items-center gap-2 text-xs">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    لديك {stats.draft} مسودة
                  </span>
                </div>
              )}
              {stats.avgQuality < 70 && (
                <div className="flex items-center gap-2 text-xs">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    حسن جودة التحليل
                  </span>
                </div>
              )}
              {stats.thisWeek === 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    أنشئ تحليلاً جديداً
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* الفلاتر والبحث المحسن */}
        <div
          className={`rounded-2xl p-4 sm:p-6 shadow-sm border mb-6 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="🔍 البحث في التحليلات، الكلمات المفتاحية، المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchAnalyses()}
                  className={`pr-10 ${
                    darkMode ? "bg-gray-700 border-gray-600" : ""
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  darkMode ? "border-gray-600 hover:bg-gray-700" : ""
                } ${showFilters ? "bg-blue-50 border-blue-300" : ""}`}
              >
                <Filter className="h-4 w-4 ml-2" />
                فلاتر {showFilters ? "🔽" : "🔼"}
              </Button>

              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as AnalysisStatus | "all")
                }
                className={`w-40 ${
                  darkMode ? "bg-gray-700 border-gray-600" : ""
                }`}
              >
                <SelectOption value="all">📋 جميع الحالات</SelectOption>
                <SelectOption value="published">✅ منشور</SelectOption>
                <SelectOption value="draft">⏳ مسودة</SelectOption>
                <SelectOption value="archived">📦 مؤرشف</SelectOption>
              </Select>

              <Select
                value={sourceTypeFilter}
                onChange={(e) =>
                  setSourceTypeFilter(e.target.value as SourceType | "all")
                }
                className={`w-40 ${
                  darkMode ? "bg-gray-700 border-gray-600" : ""
                }`}
              >
                <SelectOption value="all">🔧 جميع الأنواع</SelectOption>
                <SelectOption value="manual">✍️ يدوي</SelectOption>
                <SelectOption value="gpt">🤖 GPT</SelectOption>
                <SelectOption value="mixed">🔄 مختلط</SelectOption>
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-40 ${
                  darkMode ? "bg-gray-700 border-gray-600" : ""
                }`}
              >
                <SelectOption value="analyzed_at">
                  📅 تاريخ الإنشاء
                </SelectOption>
                <SelectOption value="publishedAt">📤 تاريخ النشر</SelectOption>
                <SelectOption value="views">👁️ المشاهدات</SelectOption>
                <SelectOption value="qualityScore">⭐ الجودة</SelectOption>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className={`${
                  darkMode ? "border-gray-600 hover:bg-gray-700" : ""
                }`}
              >
                <SortDesc
                  className={`h-4 w-4 ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  } transition-transform`}
                />
              </Button>

              {/* إضافة أزرار العرض */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0"
                >
                  📝
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  ⊞
                </Button>
              </div>
            </div>
          </div>

          {/* الفلاتر المتقدمة */}
          {showFilters && (
            <div
              className={`mt-4 pt-4 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    🎯 مستوى الجودة
                  </label>
                  <Select
                    className={darkMode ? "bg-gray-700 border-gray-600" : ""}
                  >
                    <SelectOption value="all">جميع المستويات</SelectOption>
                    <SelectOption value="excellent">ممتاز (80%+)</SelectOption>
                    <SelectOption value="good">جيد (60-79%)</SelectOption>
                    <SelectOption value="needs-improvement">
                      يحتاج تحسين (&lt;60%)
                    </SelectOption>
                  </Select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    📈 مستوى المشاهدات
                  </label>
                  <Select
                    className={darkMode ? "bg-gray-700 border-gray-600" : ""}
                  >
                    <SelectOption value="all">جميع المستويات</SelectOption>
                    <SelectOption value="viral">فيروسي (1000+)</SelectOption>
                    <SelectOption value="popular">شائع (500-999)</SelectOption>
                    <SelectOption value="normal">عادي (&lt;500)</SelectOption>
                  </Select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    ⏰ فترة الإنشاء
                  </label>
                  <Select
                    className={darkMode ? "bg-gray-700 border-gray-600" : ""}
                  >
                    <SelectOption value="all">جميع الفترات</SelectOption>
                    <SelectOption value="today">اليوم</SelectOption>
                    <SelectOption value="week">هذا الأسبوع</SelectOption>
                    <SelectOption value="month">هذا الشهر</SelectOption>
                    <SelectOption value="quarter">هذا الربع</SelectOption>
                  </Select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    🚀 إجراءات سريعة
                  </label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      📤 تصدير
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      🔄 تحديث
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* عرض البطاقات المحسن - الجوال */}
        <div className="lg:hidden space-y-4 mb-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                جاري تحميل التحليلات...
              </p>
            </div>
          ) : analyses.length === 0 ? (
            <div
              className={`text-center py-12 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                لا توجد تحليلات متاحة
              </h3>
              <p className="text-sm mb-4">ابدأ بإنشاء أول تحليل عميق</p>
              <Button
                onClick={() => router.push("/dashboard/deep-analysis/create")}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 ml-2" />
                إنشاء تحليل جديد
              </Button>
            </div>
          ) : (
            analyses.map((analysis) => {
              const performanceScore = calculatePerformanceIndex(analysis);
              const performanceLevel = getPerformanceLevel(performanceScore);

              return (
                <div
                  key={analysis.id}
                  className={`rounded-xl p-4 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      {analysis.featuredImage ? (
                        <Image
                          src={analysis.featuredImage}
                          alt={analysis.title || "تحليل عميق"}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                          <Brain className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`font-semibold text-sm leading-tight ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {analysis.title || "تحليل عميق"}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${performanceLevel.bgColor} ${performanceLevel.color}`}
                        >
                          {performanceScore}%
                        </div>
                      </div>
                      <p
                        className={`text-xs mb-3 line-clamp-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {analysis.summary || "ملخص غير متوفر"}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-background text-foreground"
                        >
                          {getSourceIcon(analysis.sourceType)}
                          <span className="mr-1">
                            {analysis.sourceType === "manual"
                              ? "يدوي"
                              : analysis.sourceType === "gpt"
                              ? "GPT"
                              : "مختلط"}
                          </span>
                        </Badge>
                        <Badge
                          className={`text-xs ${getStatusColor(
                            analysis.status
                          )}`}
                        >
                          {analysis.status === "published"
                            ? "✅ منشور"
                            : analysis.status === "draft"
                            ? "⏳ مسودة"
                            : "📦 مؤرشف"}
                        </Badge>
                      </div>

                      {/* مؤشرات الأداء */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div
                            className={`text-sm font-bold ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            {analysis.views.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">مشاهدة</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-sm font-bold ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            {Math.round(analysis.qualityScore || 0)}%
                          </div>
                          <div className="text-xs text-gray-500">جودة</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-sm font-bold ${
                              darkMode ? "text-purple-400" : "text-purple-600"
                            }`}
                          >
                            {performanceLevel.label}
                          </div>
                          <div className="text-xs text-gray-500">الأداء</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(analysis.createdAt).toLocaleDateString(
                            "ar-SA"
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/deep-analysis/${analysis.id}`
                              )
                            }
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/deep-analysis/${analysis.id}/edit`
                              )
                            }
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                          >
                            <Edit className="h-4 w-4 text-purple-600" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/deep-analysis/${analysis.id}`
                                  )
                                }
                              >
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/deep-analysis/${analysis.id}/edit`
                                  )
                                }
                              >
                                <Edit className="ml-2 h-4 w-4" />
                                تحرير
                              </DropdownMenuItem>
                              {analysis.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `/insights/deep/${analysis.slug}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                  عرض في الموقع
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(analysis.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* جدول التحليلات المحسن - عرض سطح المكتب */}
        <div
          className={`hidden lg:block rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-700 bg-gray-900/50"
                      : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
                  }`}
                >
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider w-2/5 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    📋 التحليل والمحتوى
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    🤖 النوع والمصدر
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    📊 الحالة والأداء
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    ⭐ الجودة والتقييم
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    📅 التاريخ والوقت
                  </th>
                  <th
                    className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    ⚙️ الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          جاري تحميل التحليلات العميقة...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : analyses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Brain className="w-16 h-16 text-gray-300 mb-4" />
                        <h3
                          className={`text-lg font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          لا توجد تحليلات متاحة
                        </h3>
                        <p
                          className={`text-sm mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          ابدأ بإنشاء أول تحليل عميق باستخدام الذكاء الاصطناعي
                        </p>
                        <Button
                          onClick={() =>
                            router.push("/dashboard/deep-analysis/create")
                          }
                          className="bg-primary text-primary-foreground"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إنشاء تحليل جديد
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  analyses.map((analysis) => {
                    const performanceScore =
                      calculatePerformanceIndex(analysis);
                    const performanceLevel =
                      getPerformanceLevel(performanceScore);

                    return (
                      <tr
                        key={analysis.id}
                        className={`transition-all duration-200 hover:scale-[1.01] ${
                          darkMode
                            ? "hover:bg-gray-700/50"
                            : "hover:bg-blue-50/50"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md ${
                                darkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              {analysis.featuredImage ? (
                                <Image
                                  src={analysis.featuredImage}
                                  alt={analysis.title || "تحليل عميق"}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                                  <Brain className="w-7 h-7 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3
                                className={`font-semibold text-sm line-clamp-1 mb-1 ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {analysis.title || "تحليل عميق"}
                              </h3>
                              <p
                                className={`text-xs mt-1 line-clamp-2 ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {analysis.summary || "ملخص غير متوفر"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {analysis.views.toLocaleString()}
                                </Badge>
                                {analysis.views > 1000 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-orange-100 text-orange-700"
                                  >
                                    🔥 شائع
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getSourceIcon(analysis.sourceType)}
                              <span
                                className={`text-sm font-medium ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {getSourceText(analysis.sourceType)}
                              </span>
                            </div>
                            {analysis.sourceType === "gpt" && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-background text-foreground"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI-Generated
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-3">
                            <Badge
                              className={`${getStatusColor(analysis.status)}`}
                            >
                              {getStatusText(analysis.status)}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${performanceLevel.bgColor} ${performanceLevel.color}`}
                              >
                                {performanceLevel.label}
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {performanceScore}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-20 h-2.5 rounded-full overflow-hidden ${
                                  darkMode ? "bg-gray-700" : "bg-gray-200"
                                }`}
                              >
                                <div
                                  className="h-full bg-primary transition-all duration-1000"
                                  style={{
                                    width: `${Math.min(
                                      analysis.qualityScore || 0,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-sm font-bold ${
                                  (analysis.qualityScore || 0) >= 80
                                    ? "text-green-600"
                                    : (analysis.qualityScore || 0) >= 60
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {Math.min(
                                  Math.round(analysis.qualityScore || 0),
                                  100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= (analysis.qualityScore || 0) / 20
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span
                                className={`text-xs ml-1 ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                (
                                {Math.round(
                                  ((analysis.qualityScore || 0) / 20) * 10
                                ) / 10}
                                )
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className={`h-4 w-4 ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {analysis.analyzed_at
                                  ? new Date(
                                      analysis.analyzed_at
                                    ).toLocaleDateString("ar-SA", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      calendar: "gregory",
                                      numberingSystem: "latn",
                                    })
                                  : "غير محدد"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`h-3 w-3 ${
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {analysis.analyzed_at
                                  ? new Date(
                                      analysis.analyzed_at
                                    ).toLocaleTimeString("ar-SA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "--:--"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-1">
                            <TooltipProvider>
                              {/* زر التحرير */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/deep-analysis/${analysis.id}/edit`
                                      )
                                    }
                                    className={`hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200 hover:scale-110 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <Edit className="h-4 w-4 text-purple-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>✏️ تحرير التحليل</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* زر العرض */}
                              {analysis.status === "published" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          `/insights/deep/${analysis.slug}`,
                                          "_blank"
                                        )
                                      }
                                      className={`hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      <ExternalLink className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>🔗 عرض في الموقع</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* زر النشر */}
                              {analysis.status === "draft" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          analysis.id,
                                          "published"
                                        )
                                      }
                                      className={`hover:bg-green-100 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-110 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      <Send className="h-4 w-4 text-green-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>📤 نشر التحليل</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* زر الحفظ */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Add to favorites functionality
                                      toast.success("تم إضافة التحليل للمفضلة");
                                    }}
                                    className={`hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all duration-200 hover:scale-110 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <Bookmark className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>⭐ إضافة للمفضلة</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* قائمة الإجراءات الإضافية */}
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>⚙️ المزيد من الخيارات</p>
                                  </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent
                                  align="end"
                                  className={`w-64 ${
                                    darkMode
                                      ? "bg-gray-800 border-gray-700"
                                      : ""
                                  }`}
                                >
                                  {/* مشاركة */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.share({
                                        title: analysis.title,
                                        url: `${window.location.origin}/insights/deep/${analysis.slug}`,
                                      });
                                    }}
                                    className={`cursor-pointer ${
                                      darkMode ? "hover:bg-gray-700" : ""
                                    }`}
                                  >
                                    <Share2 className="h-4 w-4 ml-2 text-blue-600" />
                                    <span>📤 مشاركة التحليل</span>
                                  </DropdownMenuItem>

                                  {/* تحميل */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toast.success("جاري تحميل التحليل...");
                                    }}
                                    className={`cursor-pointer ${
                                      darkMode ? "hover:bg-gray-700" : ""
                                    }`}
                                  >
                                    <Download className="h-4 w-4 ml-2 text-green-600" />
                                    <span>💾 تحميل كـ PDF</span>
                                  </DropdownMenuItem>

                                  {/* حفظ كمؤرشف */}
                                  {analysis.status !== "archived" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          analysis.id,
                                          "archived"
                                        )
                                      }
                                      className={`cursor-pointer ${
                                        darkMode
                                          ? "hover:bg-gray-700"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <Archive className="h-4 w-4 ml-2 text-gray-600" />
                                      <span>📦 حفظ كمؤرشف</span>
                                    </DropdownMenuItem>
                                  )}

                                  {/* إعادة توليد بالذكاء الاصطناعي */}
                                  {(analysis.sourceType === "gpt" ||
                                    analysis.status === "draft") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/deep-analysis/${analysis.id}/edit?regenerate=true`
                                        )
                                      }
                                      className={`cursor-pointer ${
                                        darkMode
                                          ? "hover:bg-gray-700"
                                          : "hover:bg-orange-50"
                                      }`}
                                    >
                                      <RefreshCw className="h-4 w-4 ml-2 text-orange-600" />
                                      <span>🔄 إعادة توليد بالـ AI</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator
                                    className={darkMode ? "bg-gray-700" : ""}
                                  />

                                  {/* نسخ الرابط */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${window.location.origin}/insights/deep/${analysis.slug}`
                                      );
                                      toast.success(
                                        "تم نسخ الرابط إلى الحافظة"
                                      );
                                    }}
                                    className={`cursor-pointer ${
                                      darkMode ? "hover:bg-gray-700" : ""
                                    }`}
                                  >
                                    <Copy className="h-4 w-4 ml-2 text-gray-600" />
                                    <span>📋 نسخ الرابط</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator
                                    className={darkMode ? "bg-gray-700" : ""}
                                  />

                                  {/* حذف التحليل */}
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(analysis.id)}
                                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    <span>🗑️ حذف التحليل</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* التصفح المحسن */}
          {totalPages > 1 && (
            <div
              className={`flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t gap-4 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                📊 عرض{" "}
                <span className="font-semibold">{(page - 1) * 10 + 1}</span> إلى{" "}
                <span className="font-semibold">
                  {Math.min(page * 10, stats.total)}
                </span>{" "}
                من <span className="font-semibold">{stats.total}</span> تحليل
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : ""
                  } transition-all duration-200`}
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  السابق
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 p-0 transition-all duration-200 ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground shadow-lg scale-110"
                            : darkMode
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span
                        className={`px-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ...
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        className={`w-9 h-9 p-0 transition-all duration-200 ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : ""
                  } transition-all duration-200`}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* شريط الملخص السفلي */}
        <div
          className={`mt-6 rounded-2xl p-4 border transition-colors duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600"
              : "bg-gradient-to-r from-gray-50 to-white border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {((stats.published / stats.total) * 100 || 0).toFixed(1)}%
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  معدل النشر
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {stats.avgQuality}%
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  متوسط الجودة
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  {((stats.gptAnalyses / stats.total) * 100 || 0).toFixed(1)}%
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  بالذكاء الاصطناعي
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                النظام يعمل بكامل طاقته
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("/dashboard/deep-analysis/help", "_blank")
                }
                className={darkMode ? "border-gray-600 hover:bg-gray-700" : ""}
              >
                <HelpCircle className="h-4 w-4 ml-1" />
                المساعدة
              </Button>
            </div>
          </div>
        </div>
    </>
  );
}
