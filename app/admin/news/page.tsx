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
  CheckCircle,
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
        toast.error(`فشل في جلب الأخبار: ${data.error || "خطأ غير معروف"}`);
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

      toast.error(`حدث خطأ في جلب الأخبار: ${errorMessage}`);
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
            ? "✅ تم تفعيل الخبر العاجل"
            : "⏸️ تم إلغاء الخبر العاجل"
        );
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير حالة العاجل
      } else {
        toast.error("حدث خطأ في تحديث حالة الخبر");
      }
    } catch (error) {
      console.error("خطأ في تبديل الخبر العاجل:", error);
      toast.error("حدث خطأ في تحديث حالة الخبر");
    }
  };

  // حذف مقال
  const deleteArticle = async (articleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("✅ تم حذف الخبر بنجاح");
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        toast.error("فشل حذف الخبر - تحقق من الصلاحيات");
      }
    } catch (error) {
      console.error("خطأ في حذف الخبر:", error);
      toast.error("حدث خطأ في حذف الخبر");
    }
  };

  // نشر مقال
  const publishArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "published",
          published_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("✅ تم نشر الخبر بنجاح");
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "فشل نشر الخبر");
      }
    } catch (error) {
      console.error("خطأ في نشر الخبر:", error);
      toast.error("حدث خطأ في نشر الخبر");
    }
  };

  // أرشفة مقال
  const archiveArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        toast.success("📦 تم أرشفة الخبر بنجاح");
        fetchArticles();
        calculateStatsFromAll(); // تحديث الإحصائيات بعد تغيير الحالة
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "فشل أرشفة الخبر");
      }
    } catch (error) {
      console.error("خطأ في أرشفة الخبر:", error);
      toast.error("حدث خطأ في أرشفة الخبر");
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
      toast.error("حدث خطأ في البحث");
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
      <TooltipProvider>
        <div className="space-y-8">
          {/* رسالة الترحيب */}
          <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  نظام إدارة الأخبار المتطور
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    المحرر الذكي
                  </Button>
                </Link>
                <Link href="/admin/news/unified">
                  <Button
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    خبر جديد
                  </Button>
                </Link>
              </div>
            </div>
          </DesignComponents.StandardCard>

          {/* إحصائيات الأخبار */}
          <div>
            <DesignComponents.SectionHeader
              title="إحصائيات الأخبار"
              description="نظرة عامة على حالة المحتوى الإخباري"
              action={
                <DesignComponents.ActionBar>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 ml-2" />
                    تصفية
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير
                  </Button>
                </DesignComponents.ActionBar>
              }
            />

            {/* بطاقات إحصائيات الأخبار */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* بطاقة الأخبار المنشورة */}
              <DesignComponents.StandardCard
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  filterStatus === "published" ? "ring-2 ring-green-500" : ""
                }`}
                onClick={() => setFilterStatus("published")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      الأخبار المنشورة
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats?.published || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        نشط
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </DesignComponents.StandardCard>

              {/* بطاقة المسودات */}
              <DesignComponents.StandardCard
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  filterStatus === "draft" ? "ring-2 ring-yellow-500" : ""
                }`}
                onClick={() => setFilterStatus("draft")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      المسودات
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats?.draft || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <PauseCircle className="w-3 h-3" />
                        مؤجل
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30">
                    <PauseCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </DesignComponents.StandardCard>

              {/* بطاقة الأرشيف */}
              <DesignComponents.StandardCard
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  filterStatus === "archived" ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => setFilterStatus("archived")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      المؤرشفة
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats?.archived || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
                        <XCircle className="w-3 h-3" />
                        محفوظ
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                    <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </DesignComponents.StandardCard>

              {/* بطاقة المحذوفة */}
              <DesignComponents.StandardCard
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  filterStatus === "deleted" ? "ring-2 ring-red-500" : ""
                }`}
                onClick={() => setFilterStatus("deleted")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      المحذوفة
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats?.deleted || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400">
                        <Trash2 className="w-3 h-3" />
                        محذوف
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </DesignComponents.StandardCard>
            </div>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="البحث في جميع الأخبار (منشورة، مسودة، مؤرشفة، محذوفة)..."
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
                className="pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
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
          <DesignComponents.StandardCard className="min-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {searchTerm.trim() ? (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                            : filterStatus === "deleted"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300"
                            : "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-300"
                        }
                      >
                        {filterStatus === "published"
                          ? "✅ الأخبار المنشورة"
                          : filterStatus === "draft"
                          ? "✏️ الأخبار المسودة"
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
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    جاري التحميل...
                  </p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      لا توجد أخبار
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                      <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء خبر جديد
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        <TableHead className="text-right w-12 text-gray-700 dark:text-gray-300">
                          #
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300">
                          العنوان
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
                          عاجل
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
                          الحالة
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
                          التصنيف
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
                          المشاهدات
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
                          تاريخ النشر
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300">
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
                            className="h-12 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          >
                            <TableCell className="py-1 text-right font-medium text-gray-900 dark:text-white text-xs">
                              {index + 1}
                            </TableCell>

                            <TableCell className="py-1 text-right">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                  {article.title || "عنوان غير محدد"}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                                    <Switch
                                      checked={article.breaking || false}
                                      onCheckedChange={() =>
                                        toggleBreakingNews(
                                          article.id,
                                          article.breaking || false
                                        )
                                      }
                                      className="data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500 scale-75"
                                    />
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
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  article.status === "published"
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                                    : article.status === "draft"
                                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700"
                                    : article.status === "archived"
                                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                                    : article.status === "deleted"
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                                    : "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                                }`}
                              >
                                {article.status === "published" && "✅ منشورة"}
                                {article.status === "draft" && "✏️ مسودة"}
                                {article.status === "archived" && "🗂️ مؤرشفة"}
                                {!["published", "draft", "archived"].includes(
                                  article.status
                                ) && `📝 ${article.status}`}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <Badge
                                variant="outline"
                                className="text-xs border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30"
                              >
                                {getCategoryName(article)}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {formatNumber(article.views || 0)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="py-1 text-center">
                              <div className="text-xs">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {dateTime.date}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">
                                  {dateTime.time}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <MoreVertical className="w-3 h-3 ml-1" />
                                    إجراءات
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
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
                                    className="py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <Eye className="w-4 h-4 ml-3 text-blue-600 dark:text-blue-400" />
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
                                      <PlayCircle className="w-4 h-4 ml-3 text-green-600 dark:text-green-400" />
                                      <span className="font-medium text-green-600 dark:text-green-400">
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
          </DesignComponents.StandardCard>
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
