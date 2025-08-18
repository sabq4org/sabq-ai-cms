"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/date-utils";
import { formatDashboardStat } from "@/lib/format-utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  Component,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

// دالة تنسيق الأرقام (محدثة للأرقام الغربية)
const formatNumber = (num: number): string => {
  return formatDashboardStat(num);
};

// دالة تنسيق التاريخ والوقت (تعيد الآن كائن مع التاريخ والوقت)
const formatDateTimeLocal = (date: string | Date) => {
  const dateTime = formatDateTime(date.toString());
  const timePart = dateTime.split(" ").slice(-1)[0]; // استخراج الوقت
  const datePart = dateTime.replace(` ${timePart}`, ""); // استخراج التاريخ
  return { date: datePart, time: timePart };
};

interface Article {
  id: string;
  title: string;
  status: "published" | "draft" | "archived";
  published_at?: string;
  author?: { name: string };
  author_name?: string;
  category?: { name: string; id: string };
  category_id?: string;
  created_at: string;
  views?: number;
  breaking?: boolean;
  image?: string;
  featured_image?: string;
  reactions?: { like?: number; share?: number };
  slug?: string; // Added slug for article type
  content_type?: string; // Added content_type for article type
}

// ErrorBoundary مخصص باستخدام React Class Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AdminNewsErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ خطأ في صفحة إدارة الأخبار:", error);
    console.error("🔍 تفاصيل الخطأ:", errorInfo);

    // إرسال تقرير الخطأ (اختياري)
    if (typeof window !== "undefined") {
      (window as any).sabqDebug?.addLog?.("admin-news-error", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                حدث خطأ في صفحة إدارة الأخبار
              </h2>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                {this.state.error?.message || "خطأ غير متوقع"}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  المحاولة مرة أخرى
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  إعادة تحميل الصفحة
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminNewsPageContent() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("published");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
    deleted: 0,
    breaking: 0,
  });

  // جلب الأخبار
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    console.log("🚀 [fetchArticles] بدء جلب الأخبار...", {
      filterStatus,
      selectedCategory,
      timestamp: new Date().toISOString(),
    });
    try {
      console.log(`🔍 [fetchArticles] جلب الأخبار مع الفلتر: ${filterStatus}`);

      const params = new URLSearchParams({
        status: filterStatus, // استخدام الفلتر مباشرة بدلاً من تحويله لـ "all"
        limit: "50",
        sort: "published_at",
        order: "desc",
        article_type: "news", // 🔥 فلتر الأخبار فقط - استبعاد المقالات
        include_categories: "true", // 🔄 تضمين معلومات التصنيف مع المقالات
      });

      if (selectedCategory !== "all") {
        params.append("category_id", selectedCategory);
      }

      console.log(`📡 استدعاء API الجديد: /api/news?${params}`);
      const response = await fetch(`/api/news?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });
      console.log(`📊 حالة الاستجابة: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get("content-type")}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // التحقق من نوع المحتوى قبل parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ نوع المحتوى غير صحيح:", contentType);

        // محاولة قراءة النص الخام للتشخيص
        const rawText = await response.text();
        console.error(
          "📄 المحتوى الخام (أول 200 حرف):",
          rawText.substring(0, 200)
        );

        throw new Error(
          `الخادم لا يرسل JSON صحيح. نوع المحتوى: ${contentType}`
        );
      }

      const data = await response.json();
      console.log(`📦 بيانات مُستلمة:`, {
        success: data.success,
        total: data.pagination?.total || data.total,
        articlesCount: data.articles?.length || 0,
        error: data.error || null,
        hasArticles: !!data.articles,
        hasData: !!data.data, // للتشخيص
      });

      // التحقق من نجاح الاستجابة (API الجديد يستخدم data.success)
      if (!data.success) {
        console.error("❌ فشل API في جلب البيانات:", data.error);
        toast.error(`🔧 خطأ في جلب البيانات\n❌ ${data.error || "خطأ غير معروف في الخادم"}`, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        setArticles([]);
        return;
      }

      // API الجديد يستخدم data.articles
      if (data.articles) {
        console.log("📦 معالجة البيانات...", {
          total: data.pagination?.total || data.total,
          articlesReceived: data.articles.length,
          firstArticleTitle: data.articles[0]?.title?.substring(0, 50),
        });

        // تنظيف البيانات وإضافة معالجة آمنة
        const cleanArticles = data.articles
          .map((article: any) => {
            // إضافة معالجة لبيانات التصنيف إذا كانت متاحة
            let enhancedArticle = {
              ...article,
              published_at: article.published_at || article.created_at,
              status: article.status || "draft",
            };

            // معالجة بيانات التصنيف بطريقة أكثر متانة
            if (article.category_id) {
              // إذا كان هناك تصنيف_id ولكن لا توجد معلومات التصنيف الكاملة
              if (!article.category) {
                // محاولة العثور على التصنيف المناسب من مصفوفة التصنيفات المحلية
                const matchedCategory = categories.find(
                  (cat) => cat.id === article.category_id
                );
                if (matchedCategory) {
                  enhancedArticle.category = {
                    id: article.category_id,
                    name: matchedCategory.name,
                  };
                  console.log(
                    `🔄 إضافة معلومات التصنيف للمقال ${article.id}: ${matchedCategory.name}`
                  );
                }
              }
            }

            return enhancedArticle;
          })
          .filter((article: any) => {
            const title = article.title?.toLowerCase() || "";
            const isTestArticle =
              title.includes("test") ||
              title.includes("تجربة") ||
              title.includes("demo") ||
              title.includes("example");

            return !isTestArticle && article.status !== "scheduled";
          });

        // ترتيب الأخبار حسب التاريخ (الأحدث أولاً) مع حماية من undefined
        const sortedArticles = cleanArticles.sort((a: any, b: any) => {
          if (!a || !b) return 0;

          const dateA = new Date(a.published_at || a.created_at || 0).getTime();
          const dateB = new Date(b.published_at || b.created_at || 0).getTime();

          // التحقق من صحة التواريخ
          if (isNaN(dateA) || isNaN(dateB)) {
            console.warn("⚠️ تاريخ غير صالح في المقال:", { a: a.id, b: b.id });
            return 0;
          }

          return dateB - dateA;
        });

        console.log("✅ تم معالجة البيانات بنجاح:", {
          originalCount: data.articles?.length || 0,
          filteredCount: cleanArticles.length,
          finalCount: sortedArticles.length,
          status: filterStatus,
        });

        setArticles(sortedArticles);
        console.log(`🧹 بعد الفلترة:`, {
          originalCount: data.articles?.length || 0,
          filteredCount: cleanArticles.length,
          finalCount: sortedArticles.length,
          status: filterStatus,
        });
        console.log(
          `✅ تم جلب ${sortedArticles.length} خبر بحالة: ${filterStatus}`
        );

        // حساب الإحصائيات من المقالات المُحملة
        calculateStats(sortedArticles);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      console.error("❌ خطأ مفصل في جلب الأخبار:", {
        error: errorMessage,
        filterStatus,
        selectedCategory,
        timestamp: new Date().toISOString(),
      });

      // معلومات إضافية للتشخيص
      if (error instanceof TypeError) {
        console.error("🔍 خطأ في النوع - قد تكون مشكلة في API response");
      } else if (error instanceof SyntaxError) {
        console.error("🔍 خطأ في parsing JSON - قد تكون مشكلة في API format");
      }

      toast.error(`🔧 خطأ في جلب الأخبار\n❌ ${errorMessage}`, {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      setArticles([]); // تأكد من إفراغ المقالات عند الخطأ
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedCategory, categories]);

  // جلب التصنيفات
  const fetchCategories = useCallback(async () => {
    try {
      console.log("🗂️ جلب التصنيفات...");
      const response = await fetch("/api/categories", {
        headers: {
          "Cache-Control": "no-cache", // منع التخزين المؤقت للحصول على أحدث البيانات
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `فشل في جلب التصنيفات: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.categories && Array.isArray(data.categories)) {
        console.log(`✅ تم جلب ${data.categories.length} تصنيف بنجاح`);
        setCategories(data.categories);

        // للتشخيص فقط - طباعة أول 5 تصنيفات
        if (data.categories.length > 0) {
          console.log(
            "🔍 عينة من التصنيفات:",
            data.categories.slice(0, 5).map((cat: any) => ({
              id: cat.id,
              name: cat.name,
            }))
          );
        }

        return data.categories; // إرجاع التصنيفات للاستخدام خارج الوظيفة إذا لزم الأمر
      } else {
        console.warn("⚠️ تم استلام استجابة، لكن لا توجد تصنيفات:", data);
        return [];
      }
    } catch (error) {
      console.error("❌ خطأ في جلب التصنيفات:", error);
      return [];
    }
  }, []);

  // حساب الإحصائيات الثابتة من الأخبار فقط
  const calculateStatsFromAll = async () => {
    try {
      console.log("📊 جلب إحصائيات الأخبار فقط...");

      // استدعاء API مع فلتر الأخبار فقط
      const response = await fetch("/api/admin/news?status=all&limit=1");

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.stats) {
          setStats(data.stats);
          console.log("📊 إحصائيات الأخبار محدثة:", data.stats);
          return;
        }
      }

      // إذا فشل API المخصص، استخدم الطريقة القديمة كـ fallback
      console.log("📊 استخدام Fallback للإحصائيات...");

      const fallbackResponse = await fetch(
        "/api/admin/news?status=all&limit=1000"
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.articles) {
        // تنظيف المقالات من التجريبية والمجدولة (مع حماية من null/undefined)
        const cleanArticles = fallbackData.articles.filter((article: any) => {
          // التحقق من وجود المقال والعنوان
          if (!article || !article.title || typeof article.title !== "string") {
            console.warn("⚠️ مقال بدون عنوان صالح:", article?.id || "unknown");
            return false;
          }

          const title = article.title.toLowerCase();
          const isTestArticle =
            title.includes("test") ||
            title.includes("تجربة") ||
            title.includes("demo") ||
            title.includes("example");
          return !isTestArticle && article.status !== "scheduled";
        });

        const stats = {
          total: cleanArticles.length,
          published: cleanArticles.filter(
            (a: any) => a && a.status === "published"
          ).length,
          draft: cleanArticles.filter((a: any) => a && a.status === "draft")
            .length,
          archived: cleanArticles.filter(
            (a: any) => a && a.status === "archived"
          ).length,
          deleted: cleanArticles.filter((a: any) => a && a.status === "deleted")
            .length,
          breaking: cleanArticles.filter((a: any) => a && a.breaking).length,
        };

        setStats(stats);
        console.log("📊 الإحصائيات المحدثة (fallback):", stats);
      }
    } catch (error) {
      console.error("❌ خطأ في حساب الإحصائيات:", error);
      // تأكد من وجود إحصائيات افتراضية حتى في حالة الخطأ
      setStats(
        (prevStats) =>
          prevStats || {
            total: 0,
            published: 0,
            draft: 0,
            archived: 0,
            deleted: 0,
            breaking: 0,
          }
      );
    }
  };

  // حساب الإحصائيات (للاستخدام المحلي) - مع حماية من null/undefined
  const calculateStats = (articles: Article[]) => {
    // التحقق من صحة المصفوفة
    if (!Array.isArray(articles)) {
      console.warn("⚠️ calculateStats: articles ليست مصفوفة صالحة:", articles);
      return;
    }

    // تصفية المقالات الصالحة فقط
    const validArticles = articles.filter(
      (a) => a && typeof a === "object" && a.status
    );

    const stats = {
      total: validArticles.length,
      published: validArticles.filter((a) => a.status === "published").length,
      draft: validArticles.filter((a) => a.status === "draft").length,
      archived: validArticles.filter((a) => a.status === "archived").length,
      deleted: 0, // لا يوجد حالة deleted في النظام الحالي
      breaking: validArticles.filter((a) => a.breaking).length,
    };
    setStats(stats);
    console.log("📊 إحصائيات محدثة:", stats);
  };

  // تحميل البيانات الأساسية مرة واحدة عند تحميل الصفحة
  // تحميل البيانات الأولية عند تحميل الصفحة
  useEffect(() => {
    console.log("🎯 بدء تحميل البيانات الأولية...", {
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent.substring(0, 50),
    });

    // تنفيذ العمليات بشكل متسلسل لضمان أن التصنيفات تكون جاهزة قبل استرجاع المقالات
    const initializeData = async () => {
      console.log("🔄 [InitializeData] بدء تسلسل تحميل البيانات...");

      try {
        // 1. جلب التصنيفات أولاً
        console.log("🔄 [InitializeData] خطوة 1: جلب التصنيفات...");
        await fetchCategories();

        // 2. جلب المقالات بعد أن أصبحت التصنيفات متاحة
        console.log("🔄 [InitializeData] خطوة 2: جلب المقالات...");
        await fetchArticles();

        // 3. حساب الإحصائيات بعد جلب البيانات
        console.log("🔄 [InitializeData] خطوة 3: حساب الإحصائيات...");
        calculateStatsFromAll();

        console.log("✅ [InitializeData] تم الانتهاء من تحميل جميع البيانات");
      } catch (error) {
        console.error("❌ [InitializeData] خطأ في تحميل البيانات:", error);
      }
    };

    initializeData();
  }, []);

  // تحميل المقالات عند تغيير الفلتر أو التصنيف
  useEffect(() => {
    console.log(
      `🔄 تغيير الفلتر إلى: ${filterStatus}, التصنيف: ${selectedCategory}`
    );

    // التأكد من أن لدينا تصنيفات قبل تحميل المقالات
    if (categories.length === 0) {
      // إذا لم تكن التصنيفات محملة بعد، جلب التصنيفات أولاً ثم المقالات
      const loadDataSequentially = async () => {
        await fetchCategories();
        fetchArticles();
      };
      loadDataSequentially();
    } else {
      // التصنيفات موجودة، يمكن مباشرة تحميل المقالات
      fetchArticles();
    }
  }, [
    filterStatus,
    selectedCategory,
    categories,
    fetchCategories,
    fetchArticles,
  ]);

  // تبديل حالة الخبر العاجل
  const toggleBreakingNews = async (
    articleId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch("/api/admin/toggle-breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          isBreaking: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(
          !currentStatus
            ? "🚨 تم تفعيل الخبر العاجل!\n✅ المقال أصبح خبراً عاجلاً ويظهر بأولوية عالية"
            : "⏸️ تم إلغاء الخبر العاجل!\n✅ تم إلغاء تصنيف المقال كخبر عاجل",
          {
            duration: 6000,
            style: {
              background: '#10B981',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير حالة العاجل
      } else {
        toast.error("🔧 خطأ في تحديث الحالة\n❌ فشل في تحديث حالة الخبر العاجل، يرجى المحاولة مرة أخرى", {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error("خطأ في تبديل الخبر العاجل:", error);
      toast.error("🔧 خطأ في النظام\n❌ حدث خطأ تقني في تحديث حالة الخبر العاجل", {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  };

  // حذف مقال
  const deleteArticle = async (articleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    try {
      // إشعار بداية العملية
      toast.loading("🗑️ جاري حذف المقال...", {
        duration: 2000,
        style: {
          background: '#FFA500',
          color: 'white',
        },
      });

      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("🎉 تم الحذف بنجاح!\n✅ تم حذف المقال نهائياً من النظام", {
          duration: 6000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "فشل في حذف المقال، يرجى التحقق من الصلاحيات";
        toast.error(`❌ فشل في الحذف\n⚠️ ${errorMessage}`, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error("خطأ في حذف الخبر:", error);
      toast.error("🔧 خطأ في النظام\n❌ حدث خطأ تقني أثناء حذف المقال، يرجى المحاولة لاحقاً", {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  };

  // نشر مقال
  const publishArticle = async (articleId: string) => {
    try {
      // إشعار بداية العملية
      toast.loading("🚀 جاري نشر المقال...", {
        duration: 2000,
        style: {
          background: '#3B82F6',
          color: 'white',
        },
      });

      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "published",
          published_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("🎉 تم النشر بنجاح!\n✅ المقال متاح الآن للقراء في الموقع", {
          duration: 6000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "فشل في نشر المقال، يرجى المحاولة مرة أخرى";
        toast.error(`❌ فشل في النشر\n⚠️ ${errorMessage}`, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error("خطأ في نشر الخبر:", error);
      toast.error("🔧 خطأ في النظام\n❌ حدث خطأ تقني أثناء نشر المقال، يرجى المحاولة لاحقاً", {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  };

  // أرشفة مقال
  const archiveArticle = async (articleId: string) => {
    try {
      // إشعار بداية العملية
      toast.loading("📦 جاري أرشفة المقال...", {
        duration: 2000,
        style: {
          background: '#8B5CF6',
          color: 'white',
        },
      });

      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        toast.success("📦 تم الأرشفة بنجاح!\n✅ تم نقل المقال إلى الأرشيف", {
          duration: 6000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "فشل في أرشفة المقال، يرجى المحاولة مرة أخرى";
        toast.error(`❌ فشل في الأرشفة\n⚠️ ${errorMessage}`, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error("خطأ في أرشفة الخبر:", error);
      toast.error("🔧 خطأ في النظام\n❌ حدث خطأ تقني أثناء أرشفة المقال، يرجى المحاولة لاحقاً", {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  };

  // البحث في جميع المقالات
  const performGlobalSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      fetchArticles(); // إذا لم يكن هناك بحث، ارجع للفلتر الحالي
      return;
    }

    try {
      setLoading(true);
      // البحث في جميع الحالات
      const response = await fetch(
        `/api/admin/news?status=all&search=${encodeURIComponent(
          searchTerm
        )}&limit=100`
      );
      const data = await response.json();

      if (data.articles) {
        // تنظيف النتائج من المقالات التجريبية فقط
        const searchResults = data.articles.filter((article: any) => {
          const title = article.title.toLowerCase();
          const isTestArticle =
            title.includes("test") ||
            title.includes("تجربة") ||
            title.includes("demo") ||
            title.includes("example");
          return !isTestArticle && article.status !== "scheduled";
        });

        setArticles(searchResults);
        console.log(`🔍 نتائج البحث: ${searchResults.length} مقال`);
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      toast.error("🔍 خطأ في البحث\n❌ حدث خطأ أثناء البحث في المقالات، يرجى المحاولة مرة أخرى", {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // فلترة المقالات محلياً مع حماية من undefined
  const filteredArticles = articles.filter((article) => {
    // التحقق من وجود المقال وخصائصه الأساسية
    if (!article || !article.id || !article.title) {
      console.warn("⚠️ مقال مُعطل تم تخطيه:", article);
      return false;
    }

    if (!searchTerm.trim()) return true;
    return article.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // logging للتشخيص
  console.log(`🔍 حالة البيانات الحالية:`, {
    articles: articles.length,
    filteredArticles: filteredArticles.length,
    loading,
    searchTerm,
    filterStatus,
    selectedCategory,
  });

  // الحصول على معرف التصنيف بطريقة آمنة
  const getCategoryId = (article: Article): string | null => {
    // 1. من الكائن المضمن
    if (article.category?.id) {
      return article.category.id;
    }

    // 2. من الخاصية المباشرة
    if (article.category_id) {
      return article.category_id;
    }

    // 3. لا يوجد تصنيف
    return null;
  };

  // الحصول على التصنيف الحقيقي
  const getCategoryName = (article: Article) => {
    // 1. التحقق مباشرة من الكائن المضمن في المقال
    if (article.category?.name) {
      return article.category.name;
    }

    // 2. البحث عن التصنيف باستخدام معرف التصنيف إذا كان متاحًا
    const categoryId = getCategoryId(article);
    if (categoryId && categories.length > 0) {
      const cat = categories.find((c) => c.id === categoryId);
      if (cat?.name) {
        return cat.name;
      }
    }

    // 3. تسجيل معلومات التشخيص للمقالات غير المصنفة
    if (article.id && !article.category?.name && !categoryId) {
      console.log(
        `ℹ️ مقال غير مصنف: ${article.id} - ${
          article.title?.substring(0, 30) || "بلا عنوان"
        }...`
      );
    }

    return "غير مصنف";
  };

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <TooltipProvider>
        <div className="space-y-8" style={{ 
          background: 'hsl(var(--bg))', 
          minHeight: '100vh',
          padding: '24px'
        }}>
          {/* رسالة الترحيب */}
          <div className="card card-accent" style={{
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--accent) / 0.2)',
            borderLeftWidth: '4px',
            padding: '24px'
          }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  نظام إدارة الأخبار المتطور
                </h2>
                <p className="text-muted mb-4">
                  إدارة شاملة للمحتوى الإخباري مع أدوات ذكية لتحرير ونشر الأخبار
                </p>
                <div className="flex gap-3">
                  <DesignComponents.StatusIndicator
                    status="success"
                    text={`${formatNumber(stats?.published || 0)} خبر منشور`}
                  />
                  <DesignComponents.StatusIndicator
                    status="info"
                    text={`${formatNumber(filteredArticles.length)} إجمالي`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/news/smart-editor">
                  <button
                    className="btn"
                    style={{
                      background: 'hsl(var(--bg-card))',
                      border: '1px solid hsl(var(--line))',
                      color: 'hsl(var(--fg))'
                    }}
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    المحرر الذكي
                  </button>
                </Link>
                <Link href="/admin/news/unified">
                  <button
                    className="btn btn-primary"
                    style={{
                      background: 'hsl(var(--accent))',
                      color: 'white'
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    خبر جديد
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* إحصائيات الأخبار */}
          <div>
            <DesignComponents.SectionHeader
              title="إحصائيات الأخبار"
              description="نظرة عامة على حالة المحتوى الإخباري"
              action={
                <div className="flex gap-2">
                  <button className="btn btn-sm" style={{ border: '1px solid hsl(var(--line))' }}>
                    <Filter className="w-4 h-4 ml-2" />
                    تصفية
                  </button>
                  <button className="btn btn-sm btn-primary">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير
                  </button>
                </div>
              }
            />

            {/* بطاقات إحصائيات الأخبار */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* بطاقة الأخبار المنشورة */}
              <div className="card" onClick={() => setFilterStatus("published")} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <CheckCircle style={{ width: '24px', height: '24px' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>الأخبار المنشورة</div>
                    <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                      {formatNumber(stats?.published || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ 
                        width: '14px', 
                        height: '14px',
                        color: '#10b981'
                      }} />
                      <span className="text-xs" style={{ color: '#10b981' }}>
                        +12.5%
                      </span>
                      <span className="text-xs text-muted">من الشهر الماضي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بطاقة المسودات */}
              <div className="card" onClick={() => setFilterStatus("draft")} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <FileText style={{ width: '24px', height: '24px' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>المسودات</div>
                    <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                      {formatNumber(stats?.draft || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ 
                        width: '14px', 
                        height: '14px',
                        color: '#f59e0b'
                      }} />
                      <span className="text-xs" style={{ color: '#f59e0b' }}>
                        0%
                      </span>
                      <span className="text-xs text-muted">بدون تغيير</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بطاقة المجدولة */}
              <div className="card" onClick={() => setFilterStatus("scheduled")} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <Clock style={{ width: '24px', height: '24px' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>المجدولة</div>
                    <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                      {formatNumber(stats?.scheduled || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ 
                        width: '14px', 
                        height: '14px',
                        color: '#3b82f6'
                      }} />
                      <span className="text-xs" style={{ color: '#3b82f6' }}>
                        +5%
                      </span>
                      <span className="text-xs text-muted">من الأسبوع الماضي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بطاقة الأرشيف */}
              <div className="card" onClick={() => setFilterStatus("archived")} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <XCircle style={{ width: '24px', height: '24px' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>المؤرشفة</div>
                    <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                      {formatNumber(stats?.archived || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownRight style={{ 
                        width: '14px', 
                        height: '14px',
                        color: '#ef4444'
                      }} />
                      <span className="text-xs" style={{ color: '#ef4444' }}>
                        -2.1%
                      </span>
                      <span className="text-xs text-muted">من الشهر الماضي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بطاقة المحذوفة */}
              <div className="card" onClick={() => setFilterStatus("deleted")} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <Trash2 style={{ width: '24px', height: '24px' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>المحذوفة</div>
                    <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                      {formatNumber(stats?.deleted || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="text-xs text-muted">بدون نشاط حديث</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="البحث في جميع الأخبار..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);

                  // تطبيق debounce للبحث الشامل
                  if (value.trim()) {
                    setTimeout(() => {
                      if (searchTerm === value) {
                        // تأكد أن القيمة لم تتغير
                        performGlobalSearch(value);
                      }
                    }, 500);
                  } else {
                    fetchArticles(); // ارجع للفلتر الحالي عند حذف البحث
                  }
                }}
                style={{
                  paddingRight: '40px',
                  background: 'hsl(var(--bg-card))',
                  border: '1px solid hsl(var(--line))',
                  color: 'hsl(var(--fg))',
                  borderRadius: '8px'
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid hsl(var(--line))',
                borderRadius: '8px',
                background: 'hsl(var(--bg-card))',
                color: 'hsl(var(--fg))'
              }}
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* جدول المقالات */}
          <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid hsl(var(--line))' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {searchTerm.trim() ? (
                    <>
                      <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>
                        نتائج البحث عن:
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300"
                      >
                        "{searchTerm}"
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        في جميع الحالات
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>
                        عرض:
                      </span>
                       <Badge
                        variant="outline"
                        className={
                          filterStatus === "published"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300"
                            : filterStatus === "draft"
                            ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300"
                            : filterStatus === "archived"
                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300"
                              : filterStatus === "scheduled"
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300"
                            : filterStatus === "deleted"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300"
                            : "bg-gray-50 dark:bg-gray-900/20 text-muted border-gray-300"
                        }
                      >
                        {filterStatus === "published"
                          ? "✅ الأخبار المنشورة"
                          : filterStatus === "draft"
                          ? "✏️ الأخبار المسودة"
                            : filterStatus === "scheduled"
                            ? "🕒 الأخبار المجدولة"
                          : filterStatus === "archived"
                          ? "🗂️ الأخبار المؤرشفة"
                          : filterStatus === "deleted"
                          ? "❌ الأخبار المحذوفة"
                          : `📝 ${filterStatus}`}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({filteredArticles.length} خبر)
                      </span>
                    </>
                  )}
                </div>
                {/* إضافة عداد المقالات في الجانب الأيمن */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  إجمالي: {stats.total} خبر
                </div>
              </div>
            </div>
            <div className="p-0 flex-1 flex flex-col">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p className="mt-2 text-muted">
                    جاري التحميل...
                  </p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-fg mb-2">
                      لا توجد أخبار
                    </h3>
                    <p className="text-muted mb-6">
                      {searchTerm.trim()
                        ? `لا توجد نتائج للبحث "${searchTerm}"`
                        : filterStatus === "published"
                        ? "لا توجد أخبار منشورة حالياً"
                        : filterStatus === "draft"
                        ? "لا توجد مسودات"
                        : filterStatus === "archived"
                        ? "لا توجد أخبار مؤرشفة"
                        : "لا توجد أخبار في هذا القسم"}
                    </p>
                    <Link href="/admin/news/unified">
                      <button className="btn btn-primary">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء خبر جديد
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <Table>
                    <TableHeader style={{ background: 'hsl(var(--bg-card))', borderBottom: '1px solid hsl(var(--line))' }}>
                      <TableRow>
                        <TableHead className="text-right w-12 text-muted">
                          #
                        </TableHead>
                        <TableHead className="text-right text-muted">
                          العنوان
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          عاجل
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          الحالة
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          التصنيف
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          المشاهدات
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          تاريخ النشر
                        </TableHead>
                        <TableHead className="text-center text-muted">
                          الإجراءات
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article, index) => {
                        // حماية إضافية للتأكد من سلامة البيانات
                        if (!article || !article.id) {
                          console.warn("⚠️ مقال فارغ في الجدول، تم تخطيه");
                          return null;
                        }

                        const dateTime = formatDateTimeLocal(
                          article.published_at || article.created_at
                        );
                        return (
                          <TableRow
                            key={article.id}
                            style={{ 
                              height: '48px', 
                              borderBottom: '1px solid hsl(var(--line))'
                            }}
                            className="hover:bg-accent/5"
                          >
                            <TableCell className="py-1 text-right font-medium text-fg text-xs">
                              {index + 1}
                            </TableCell>

                            <TableCell className="py-1 text-right">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-fg line-clamp-2">
                                  {article.title || "عنوان غير محدد"}
                                </p>
                                <p className="text-xs text-muted mt-1">
                                  <Users className="w-2.5 h-2.5 inline-block ml-1" />
                                  {article.author?.name ||
                                    article.author_name ||
                                    "غير محدد"}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex">
                                    {/* مفتاح تبديل بنمط iOS */}
                                    <div
                                      onClick={() => toggleBreakingNews(article.id, article.breaking || false)}
                                      style={{
                                        position: 'relative',
                                        width: '51px',
                                        height: '31px',
                                        background: article.breaking ? '#007AFF' : '#E5E5EA',
                                        borderRadius: '15.5px',
                                        cursor: 'pointer',
                                        transition: 'background 0.3s ease',
                                        display: 'inline-block'
                                      }}
                                    >
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '2px',
                                          left: article.breaking ? '22px' : '2px',
                                          width: '27px',
                                          height: '27px',
                                          background: 'white',
                                          borderRadius: '50%',
                                          boxShadow: '0 3px 8px 0 rgba(0, 0, 0, 0.15), 0 3px 1px 0 rgba(0, 0, 0, 0.06)',
                                          transition: 'left 0.3s ease'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {article.breaking
                                      ? "إلغاء العاجل"
                                      : "تفعيل كعاجل"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div
                                className="chip"
                                style={{
                                  background: article.status === "published" 
                                    ? 'hsl(var(--accent) / 0.1)' 
                                    : article.status === "draft"
                                    ? 'hsl(var(--muted) / 0.2)'
                                    : 'hsl(var(--line) / 0.3)',
                                  color: article.status === "published"
                                    ? 'hsl(var(--accent))'
                                    : 'hsl(var(--fg))',
                                  border: `1px solid ${article.status === "published" 
                                    ? 'hsl(var(--accent) / 0.2)' 
                                    : 'hsl(var(--line))'}`
                                }}
                              >
                                {article.status === "published" && "✅ منشورة"}
                                {article.status === "draft" && "✏️ مسودة"}
                                {article.status === "archived" && "🗂️ مؤرشفة"}
                                {!["published", "draft", "archived"].includes(
                                  article.status
                                ) && `📝 ${article.status}`}
                              </div>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div
                                className="chip"
                                style={{
                                  background: 'hsl(var(--accent) / 0.05)',
                                  color: 'hsl(var(--accent))',
                                  border: '1px solid hsl(var(--accent) / 0.15)'
                                }}
                              >
                                {getCategoryName(article)}
                              </div>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs font-medium text-fg">
                                  {formatNumber(article.views || 0)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div className="text-xs">
                                <div className="font-medium text-fg">
                                  {dateTime.date}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">
                                  {dateTime.time}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-1">
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="btn btn-sm"
                                    style={{
                                      background: 'hsl(var(--bg-card))',
                                      border: '1px solid hsl(var(--line))',
                                      padding: '4px 12px'
                                    }}
                                  >
                                    <MoreVertical className="w-3 h-3 ml-1" />
                                    إجراءات
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56"
                                  style={{
                                    background: 'hsl(var(--bg-card))',
                                    border: '1px solid hsl(var(--line))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px hsl(var(--fg) / 0.1), 0 2px 4px -2px hsl(var(--fg) / 0.1)'
                                  }}
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const path =
                                        article.content_type === "OPINION"
                                          ? `/article/${
                                              article.slug || article.id
                                            }`
                                          : `/news/${
                                              article.slug || article.id
                                            }`;
                                      router.push(path);
                                    }}
                                    style={{
                                      padding: '12px 16px',
                                      color: 'hsl(var(--fg))'
                                    }}
                                    className="hover:bg-accent/5"
                                  >
                                    <Eye className="w-4 h-4 ml-3" style={{ color: 'hsl(var(--accent))' }} />
                                    <span className="font-medium">
                                      عرض الخبر
                                    </span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/news/unified?id=${article.id}`
                                      )
                                    }
                                    className="py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4 ml-3 text-yellow-600 dark:text-yellow-400" />
                                    <span className="font-medium">
                                      تعديل الخبر
                                    </span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/news/smart-editor?id=${article.id}`
                                      )
                                    }
                                    className="py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <FileText className="w-4 h-4 ml-3 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                      المحرر الذكي ✨
                                    </span>
                                  </DropdownMenuItem>

                                  {article.status === "draft" && (
                                    <DropdownMenuItem
                                      onClick={() => publishArticle(article.id)}
                                      className="py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                  <PlayCircle className="w-4 h-4 ml-3 text-blue-600 dark:text-blue-400" />
                                      <span className="font-medium text-blue-600 dark:text-blue-400">
                                        نشر الخبر
                                      </span>
                                    </DropdownMenuItem>
                                  )}

                                  {article.status === "published" && (
                                    <DropdownMenuItem
                                      onClick={() => archiveArticle(article.id)}
                                      className="py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                      <PauseCircle className="w-4 h-4 ml-3 text-orange-600 dark:text-orange-400" />
                                      <span className="font-medium text-orange-600 dark:text-orange-400">
                                        أرشفة الخبر
                                      </span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => deleteArticle(article.id)}
                                    className="py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 ml-3" />
                                    <span className="font-medium">
                                      حذف الخبر
                                    </span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}

// تصدير المكون مع ErrorBoundary المخصص للحماية من الأخطاء
export default function AdminNewsPage() {
  return (
    <AdminNewsErrorBoundary>
      <AdminNewsPageContent />
    </AdminNewsErrorBoundary>
  );
}
