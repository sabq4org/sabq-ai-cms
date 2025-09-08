"use client";

import dynamic from "next/dynamic";

// Lazy loading للمكونات الثقيلة
const DeepAnalysisBlock = dynamic(() => import("@/components/DeepAnalysisBlock"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>,
  ssr: false
});

const SmartInsightsWidget = dynamic(() => import("@/components/ai/SmartInsightsWidget"), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl"></div>,
  ssr: false
});

import PageWrapper from "@/components/PageWrapper";
import { SmartSlot } from "@/components/home/SmartSlot";

import UnifiedMobileNewsCard from "@/components/mobile/UnifiedMobileNewsCard";

import AdBanner from "@/components/ads/AdBanner";
import CloudImage from "@/components/ui/CloudImage";
import { useAuth } from "@/hooks/useAuth";
import { formatDateNumeric } from "@/lib/date-utils";
import { SafeDate } from "@/lib/safe-date";
import { getArticleLink } from "@/lib/utils";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";


import SafeHydration from "@/components/SafeHydration";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Clock, User } from "lucide-react";
import LiteStatsBar from "@/components/mobile/LiteStatsBar";

// Safe Dynamic imports with Next.js dynamic and SSR disabled to prevent hydration issues
const EmptyComponent = () => null;

// Wrapped components with Next.js dynamic imports
const TodayOpinionsSection = dynamic(
  () =>
    import("@/components/TodayOpinionsSection").catch((err) => {
      console.warn("فشل تحميل قسم الرأي:", err);
      return { default: EmptyComponent };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const SmartAudioBlock = dynamic(
  () =>
    import("@/components/home/SmartAudioBlock").catch(() => ({
      default: EmptyComponent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const MuqtarabBlock = dynamic(
  () =>
    import("@/components/home/EnhancedMuqtarabBlock").catch(() => ({
      default: EmptyComponent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

// استيراد المكون الجديد الخفيف
import LightFeaturedStrip from "@/components/featured/LightFeaturedStrip";
// import MobileFeaturedNews from "@/components/mobile/MobileFeaturedNews";
// إضافة استيراد ديناميكي للكاروسيل لسطح المكتب
const FeaturedNewsCarousel = dynamic(
  () =>
    import("@/components/FeaturedNewsCarousel").catch(() => ({
      default: EmptyComponent,
    })),
  {
    // السماح بالـ SSR لعرض فوري على الديسكتوب
    ssr: true,
    loading: () => (
      <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const HomeWordCloud = dynamic(
  () =>
    import("@/components/home/HomeWordCloud").catch(() => ({
      default: EmptyComponent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

import { DeepAnalysis } from "@/types/deep-analysis";
import {
  ArrowLeft,
  Beaker,
  BookOpen,
  Briefcase,
  CloudRain,
  Eye,
  Heart,
  MessageSquare,
  Newspaper,
  Palette,
  Plane,
  Settings,
  Tag,
  Trophy,
  X,
} from "lucide-react";

const categoryIcons: { [key: string]: React.ElementType } = {
  تقنية: Beaker,
  اقتصاد: Briefcase,
  رياضة: Trophy,
  ثقافة: Palette,
  سفر: Plane,
  صحة: Heart,
  علوم: Beaker,
  طقس: CloudRain,
  default: Tag,
};

interface PageClientProps {
  initialArticles?: any[];
  initialCategories?: any[];
  initialStats?: {
    activeReaders: number | null;
    dailyArticles: number | null;
    loading: boolean;
  };
  initialDeepAnalyses?: DeepAnalysis[];
  stats?: {
    activeReaders: number | null;
    dailyArticles: number | null;
    loading: boolean;
  };
  initialFeaturedArticles?: any[];
}

function NewspaperHomePage({
  initialArticles = [],
  initialCategories = [],
  initialStats,
  initialDeepAnalyses = [],
  stats,
  initialFeaturedArticles = [],
}: PageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useDarkModeContext();
  // حالة الجهاز - نبدأ بقيمة undefined لتجنب مشاكل hydration
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const isLoggedIn = !!user;

  // فحص نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      try {
        const userAgent = navigator.userAgent || "";
        const isMobileDevice =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            userAgent
          );
        const isSmallScreen = window.innerWidth < 768;
        setIsMobile(isMobileDevice || isSmallScreen);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Error detecting device type:", error);
        }
        setIsMobile(false);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // استخدم false كقيمة افتراضية فقط عند العرض
  const isMobileView = isMobile ?? false;

  // =============================
  // المتغيرات المساعدة لمنع الأخطاء أثناء التشغيل (قابلة للتحديث مستقبلاً)
  // =============================
  // إعدادات البلوكات الديناميكية
  const blocksConfig: Record<string, { enabled: boolean }> = {};
  // إرجاع قائمة البلوكات المرتبة (حاليًا لا يوجد بلوكات مفعّلة)
  const getOrderedBlocks = () => {
    return [] as Array<{ key: string; component: React.ReactNode }>;
  };

  // التصنيفات
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(
    initialCategories.length === 0
  );
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | null
  >(null);
  const [categoryArticles, setCategoryArticles] = useState<any[]>([]);
  const [categoryArticlesLoading, setCategoryArticlesLoading] =
    useState<boolean>(false);
  // متغيرات إضافية مطلوبة
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [articlesLoading, setArticlesLoading] = useState<boolean>(
    initialArticles.length === 0
  );
  const [personalizedLoading, setPersonalizedLoading] =
    useState<boolean>(false);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [showPersonalized, setShowPersonalized] = useState<boolean>(false);
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [personalizedArticles, setPersonalizedArticles] = useState<any[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<any[]>(initialFeaturedArticles);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(initialFeaturedArticles.length === 0);

  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 NewspaperHomePage: تحضير useEffects...");
  }

  // دوال مؤقتة
  const handleInterestClick = useCallback(
    (interestId: string) => {
      try {
        // تحديث اهتمامات المستخدم المحلية
        setUserInterests((prev) => {
          const exists = prev.includes(interestId);
          if (exists) {
            // إزالة الاهتمام إذا كان موجوداً
            return prev.filter((id) => id !== interestId);
          } else {
            // إضافة الاهتمام الجديد
            return [...prev, interestId];
          }
        });

        // إرسال التحديث للخادم إذا كان المستخدم مسجلاً
        if (user?.id) {
          fetch("/api/user/interests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              interestId: interestId,
              action: userInterests.includes(interestId) ? "remove" : "add",
            }),
          }).catch((error) => {
            console.error("خطأ في تحديث الاهتمامات:", error);
          });
        }

        // إعادة جلب المحتوى المخصص عند تغيير الاهتمامات
        setPersonalizedLoading(true);
        setTimeout(() => {
          setPersonalizedLoading(false);
          // يمكن إضافة منطق إعادة جلب المحتوى هنا
        }, 1000);
      } catch (error) {
        console.error("خطأ في معالجة اختيار الاهتمام:", error);
      }
    },
    [user, userInterests]
  );
  const handleTogglePersonalized = () => {
    setShowPersonalized((prev) => !prev);
  };

  // دالة للحصول على ألوان التصنيفات الفاتحة
  const getCategoryColors = (categoryName: string) => {
    const categoryColors: Record<string, string> = {
      تحليل:
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      اقتصاد:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      رياضة:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      تقنية:
        "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
      ثقافة:
        "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
      علوم: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
      صحة: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      سفر: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      طعام: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      رأي: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
      ملخص: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
      عاجل: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      تقرير:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    };

    return (
      categoryColors[categoryName] ||
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
    );
  };

  // مكون بطاقة الأخبار
  const NewsCard = ({ news }: { news: any }) => {
    const [imageLoading, setImageLoading] = useState(true);

    // Category mapping for consistent styling
    const categoryMap: Record<string, string> = {
      // إنجليزية أساسية
      world: "world",
      sports: "sports",
      tech: "tech",
      technology: "tech",
      business: "business",
      economy: "business",
      local: "local",
      news: "local",
      politics: "world",
      travel: "world",
      cars: "tech",
      media: "tech",
      opinion: "opinions",
      // تطابقات عربية
      العالم: "world",
      "أخبار-العالم": "world",
      "أخبار العالم": "world",
      رياضة: "sports",
      الرياضة: "sports",
      رياضي: "sports",
      تقنية: "tech",
      التقنية: "tech",
      تكنولوجيا: "tech",
      التكنولوجيا: "tech",
      اقتصاد: "business",
      الاقتصاد: "business",
      أعمال: "business",
      الأعمال: "business",
      محليات: "local",
      المحليات: "local",
      محلي: "local",
      محطات: "local",
      المحطات: "local",
      حياتنا: "local",
      حياة: "local",
      سياحة: "world",
      السياحة: "world",
      سيارات: "tech",
      السيارات: "tech",
      ميديا: "tech",
      الميديا: "tech",
      عام: "local",
      عامة: "local",
    };

    const categoryName =
      news.category?.name ||
      news.categories?.name ||
      news.category ||
      news.categories ||
      "عام";
    const rawCategorySlug =
      categoryName?.toLowerCase?.() || categoryName || "عام";
    const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

    return (
      <Link href={getArticleLink(news)} className="group block">
        <article
          dir="rtl"
          data-category={mappedCategory}
          className={`h-full rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
            news.breaking || news.is_breaking
              ? darkMode
                ? "bg-red-950/30 border border-red-800/70"
                : "bg-red-50 border border-red-200"
              : darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          {/* صورة المقال */}
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
            <CloudImage
              src={news?.featured_image || news?.image_url || news?.image || news?.thumbnail || news?.cover_image || news?.coverImage || "/images/placeholder-featured.jpg"}
              alt={news?.title || "صورة المقال"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackType="article"
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={85}
              onError={() => console.log('خطأ في تحميل صورة المقال:', news?.id, news?.title)}
            />
            {/* شارة عاجل */}
            {(news.breaking || news.is_breaking) && (
              <div className="absolute top-3 right-3 z-10">
                <span className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  ⚡ عاجل
                </span>
              </div>
            )}
            {/* تأثير تحميل */}
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          </div>
          {/* محتوى البطاقة */}
          <div className="p-4 flex-1 flex flex-col">
            {/* لابل التصنيف */}
            <div className="mb-2">
              <span className="category-pill">{categoryName}</span>
            </div>

            {/* العنوان */}
            <h4 className="font-semibold text-lg mb-3 line-clamp-4 leading-snug flex-1">
              {news.title}
            </h4>

            {/* سطر واحد: التاريخ + المشاهدات */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
              <time
                dateTime={news.published_at || news.created_at}
                className="inline-flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                {formatDateNumeric(news.published_at || news.created_at)}
              </time>
              <span className="mx-1">•</span>
              <span className="inline-flex items-center gap-1">
                👁️{" "}
                {new Intl.NumberFormat("ar", { notation: "compact" }).format(
                  news.views ?? news.views_count ?? 0
                )}
              </span>
              {typeof news.comments_count === "number" &&
                news.comments_count > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {new Intl.NumberFormat("ar", {
                        notation: "compact",
                      }).format(news.comments_count)}
                    </span>
                  </>
                )}
            </div>
          </div>


        </article>
      </Link>
    );
  };
  // =============================
  // جلب التصنيفات عند التحميل
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        if (process.env.NODE_ENV !== "production") {
          console.log("🔄 جلب التصنيفات من العميل...");
        }
        const res = await fetch("/api/categories?is_active=true");
        const json = await res.json();
        // 💡 FIX: The API returns { data: [...] } or just [...]
        const list = Array.isArray(json)
          ? json
          : json.data ?? json.categories ?? [];
        if (process.env.NODE_ENV !== "production") {
          console.log("✅ التصنيفات المُحدثة من العميل:", list.length);
        }
        setCategories(list);
        if (list.length === 0) {
          console.warn("No categories were fetched from the API.");
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("خطأ في جلب التصنيفات:", err);
        }
      } finally {
        setCategoriesLoading(false);
      }
    };

    // جلب التصنيفات فقط إذا لم تكن هناك تصنيفات أولية
    if (initialCategories.length === 0) {
      if (process.env.NODE_ENV !== "production") {
        console.log("⚠️ لا توجد تصنيفات أولية، جاري الجلب من العميل...");
      }
      fetchCategories();
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log("✅ استخدام التصنيفات الأولية:", initialCategories.length);
      }
      setCategoriesLoading(false);
    }
  }, [initialCategories]);

  // =============================
  // جلب المقالات الأحدث (للاستخدام في البلوكات لاحقاً)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const res = await fetch(
          "/api/news?status=published&limit=16&sort=published_at&order=desc",
          { cache: 'force-cache', next: { revalidate: 60 } }
        );
        const json = await res.json();
        // 💡 قبول كلا الصيغتين: { success, articles: [...] } أو { success, data: [...] }
        const list = json.success ? (json.articles ?? json.data ?? []) : [];
        // تعيين المقالات للعرض في بلوك "محتوى مخصص لك"
        setArticles(list);
        if (list.length === 0) {
          console.warn("No articles were fetched from the API.");
        }
      } catch (err) {
        console.error("خطأ في جلب المقالات:", err);
      } finally {
        setArticlesLoading(false);
      }
    };

    // جلب المقالات فقط إذا لم تكن هناك مقالات أولية
    if (initialArticles.length === 0) {
      fetchArticles();
    } else {
      setArticlesLoading(false);
    }
  }, [initialArticles]);

  // =============================
  // جلب التوصيات الذكية
  // جلب الخبر المميز
  useEffect(() => {
    // إذا تم تمرير بيانات أولية، لا حاجة لجلبها فوراً
    if (initialFeaturedArticles.length === 0) {
      (async () => {
        try {
          setFeaturedLoading(true);
          const response = await fetch(`/api/featured-news-carousel`, { cache: 'force-cache', next: { revalidate: 60 } });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.articles && data.articles.length > 0) {
              setFeaturedArticle(data.articles);
            }
          }
        } catch (e) {
          console.error('خطأ في جلب الخبر المميز (Client fallback):', e);
        } finally {
          setFeaturedLoading(false);
        }
      })();
    } else {
      setFeaturedLoading(false);
    }
  }, [initialFeaturedArticles]);

  useEffect(() => {
  }, [articles, user]);

  // =============================
  // دالة عرض الأخبار العادية فقط بدون البطاقات المخصصة
  const renderRegularContent = useCallback(
    (articlesToRender: any[]) => {
      return articlesToRender.map((article) => (
        <NewsCard key={article.id} news={article} />
      ));
    },
    []
  );

  // دالة اختيار التصنيف
  const handleCategoryClick = async (categoryId: number | string) => {
    setSelectedCategory(categoryId);
    setCategoryArticlesLoading(true);
    try {
      if (process.env.NODE_ENV !== "production") {
        console.log(`🔍 جلب مقالات التصنيف ID: ${categoryId}`);
      }
      const res = await fetch(
        `/api/articles?status=published&category_id=${categoryId}&limit=20&sort=created_at&order=desc`
      );
      const json = await res.json();

      if (process.env.NODE_ENV !== "production") {
        console.log(`📊 استجابة API الجديد للتصنيف ${categoryId}:`, json);
      }

      if (json.success) {
        const list = json.data || [];
        if (process.env.NODE_ENV !== "production") {
          console.log(`✅ تم جلب ${list.length} مقال للتصنيف ${categoryId}`);
        }
        setCategoryArticles(list);
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error(`❌ فشل جلب مقالات التصنيف ${categoryId}:`, json.error);
        }
        setCategoryArticles([]);
      }
    } catch (err) {
      console.error("خطأ في جلب مقالات التصنيف:", err);
      setCategoryArticles([]);
    } finally {
      setCategoryArticlesLoading(false);
    }
  };
  return (
    <PageWrapper
      pageName="الصفحة الرئيسية"
      showPerformanceMonitor={process.env.NODE_ENV === "development"}
    >
      {/* إحصائيات النسخة الخفيفة - أسفل الهيدر مباشرة */}
      <div className="w-full">
        <LiteStatsBar />
      </div>
      <div
        className={`homepage-wrapper min-h-screen transition-colors duration-300 mobile-content-after-stats ${
          isMobileView ? "pt-0" : "pt-14 sm:pt-16 lg:pt-20"
        }`}
        style={{
          direction: "rtl",
          marginTop: 0,
          paddingTop: isMobileView ? 0 : undefined,
          backgroundColor: 'transparent'
        }}
      >

        {/* 🔥 الترتيب الجديد المحدث للواجهة الرئيسية */}
        {/* 1. الهيدر ⬆️ - تم تأكيده أنه في المقدمة عبر Layout */}

        {/* 2. الأخبار المميزة (Featured Articles) 🌟 */}
        {!featuredLoading && featuredArticle.length > 0 && (
          <div className={`${isMobileView ? "pt-2 pb-4" : "pt-4 pb-6"}`}>
            <FeaturedNewsCarousel articles={featuredArticle} />
          </div>
        )}

        {/* إعلان أسفل الأخبار المميزة */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdBanner placement="below_featured" />
        </div>

        {/* تم نقل النشرة الصوتية إلى العمود الجانبي بجوار التصنيفات */}
        {/* 5. بلوك التصنيفات (Categories Block) 🏷️ + ترند سبق */}
        <section
          className={`max-w-7xl mx-auto px-4 sm:px-6 ${
            isMobileView ? "mb-6" : "mb-8"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* النسخة المحمولة: النشرة الصوتية أولاً */}
            {isMobileView && (
              <div className="order-1">
                <div
                  className={`h-full rounded-3xl p-4 sm:p-5 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${
                    darkMode
                      ? "bg-blue-900/10 border border-blue-800/30"
                      : "bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200/50"
                  }`}
                  style={{
                    backdropFilter: "blur(10px)",
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(191, 219, 254, 0.3) 100%)",
                  }}
                >
                  <SmartAudioBlock variant="sidebar" />
                </div>
              </div>
            )}
            
            {/* المؤشرات الذكية */}
            <div className={`${isMobileView ? 'order-2' : 'lg:col-span-2'}`}>
              <div
                className={`h-full rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${
                  darkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* استبدال محتوى التصنيفات بـ AI Insights */}
                <div className="relative -m-4 sm:-m-6 lg:-m-8">
                  <SmartInsightsWidget variant={isMobileView ? 'compact' : 'default'} />
                </div>
              </div>
            </div>
            
            {/* إخفاء المحتوى القديم للتصنيفات */}
            {false && (
              <div
                className={`rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${
                  darkMode
                    ? "bg-blue-900/10 border border-blue-800/30"
                    : "bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200/50"
                }`}
              >
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : categories.length > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                      {categories.map((category: any) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className={`group px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-xs transition-all duration-300 transform hover:scale-105 relative ${
                            selectedCategory === category.id
                              ? darkMode
                                ? "bg-blue-600 text-white border border-blue-500 shadow-md"
                                : "bg-blue-500 text-white border border-blue-400 shadow-md"
                              : darkMode
                              ? "bg-blue-800/20 hover:bg-blue-700/30 text-blue-100 hover:text-blue-50 border border-blue-700/30 hover:border-blue-600/50"
                              : "bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                          }`}
                        >
                          {/* شارة "مخصص" للتصنيفات المخصصة */}
                          {isLoggedIn && category.is_personalized && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                          )}
                          <div className="flex items-center gap-1 sm:gap-2">
                            {(() => {
                              const IconComponent =
                                categoryIcons[category.name_ar] ||
                                categoryIcons["default"];
                              return category.icon ? (
                                <span className="text-xs sm:text-sm group-hover:scale-110 transition-transform duration-300">
                                  {category.icon}
                                </span>
                              ) : (
                                <IconComponent className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                              );
                            })()}
                            <span className="whitespace-nowrap">
                              {category.name_ar || category.name}
                            </span>
                            {(category.articles_count > 0) && (
                              <span
                                className={`text-xs ${
                                  selectedCategory === category.id
                                    ? "text-white/90"
                                    : darkMode
                                    ? "text-blue-200 opacity-70"
                                    : "text-gray-500 opacity-70"
                                }`}
                              >
                                ({category.articles_count})
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* عرض المقالات المرتبطة بالتصنيف المختار */}
                    {selectedCategory && (
                      <div
                        className={`mt-8 p-6 rounded-3xl shadow-lg dark:shadow-gray-900/50 ${
                          darkMode
                            ? "bg-gray-800/50"
                            : "bg-white dark:bg-gray-800/70"
                        } backdrop-blur-sm border ${
                          darkMode
                            ? "border-gray-700"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            مقالات{" "}
                            {
                              categories.find((c) => c.id === selectedCategory)
                                ?.name_ar
                            }
                          </h3>
                          <button
                            onClick={() => {
                              setSelectedCategory(null);
                              setCategoryArticles([]);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800"
                            }`}
                          >
                            <X
                              className={`w-5 h-5 ${
                                darkMode
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            />
                          </button>
                        </div>
                        {categoryArticlesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        ) : categoryArticles.length > 0 ? (
                          <>
                            {/* Grid Layout for Cards - محسن للنسخة الخفيفة */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 content-start">
                              {categoryArticles.map((article: any) => (
                                <Link
                                  key={article.id}
                                  href={getArticleLink(article)}
                                  className="group"
                                >
                                  <article
                                    className={`h-full rounded-xl overflow-hidden shadow-md transition-all duration-300 transform hover:scale-[1.02] ${
                                      darkMode
                                        ? "bg-gray-800 border border-gray-700"
                                        : "bg-white border border-gray-100"
                                    }`}
                                  >
                                    {/* صورة المقال */}
                                    <div className="relative h-32 sm:h-36 overflow-hidden">
                                      <CloudImage
                                        src={article?.image || null}
                                        alt={article?.title || "صورة المقال"}
                                        fill
                                        className="w-full h-full object-cover transition-transform duration-500"
                                        fallbackType="article"
                                        priority={false}
                                      />
                                      {/* Category Badge */}
                                      <div className="absolute top-2 right-2">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                            darkMode
                                              ? "bg-blue-900/80 text-blue-200 backdrop-blur-sm"
                                              : "bg-blue-500/90 text-white backdrop-blur-sm"
                                          }`}
                                        >
                                          <Tag className="w-2 h-2" />
                                          {
                                            categories.find(
                                              (c) => c.id === selectedCategory
                                            )?.name_ar
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    {/* محتوى البطاقة */}
                                    <div className="p-3 sm:p-4">
                                      {/* العنوان */}
                                      <h4
                                        className={`font-semibold text-sm sm:text-base mb-2 line-clamp-2 ${
                                          darkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        } transition-colors`}
                                        title={article.title}
                                      >
                                        {article.title}
                                      </h4>
                                      {/* الملخص */}
                                      {article.summary && (
                                        <p
                                          className={`text-xs sm:text-sm mb-3 line-clamp-2 transition-colors duration-300 ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {article.summary}
                                        </p>
                                      )}
                                      {/* التفاصيل السفلية */}
                                      <div
                                        className={`flex items-center justify-between pt-2 border-t ${
                                          darkMode
                                            ? "border-gray-700"
                                            : "border-gray-100"
                                        }`}
                                      >
                                        {/* المعلومات */}
                                        <div className="flex items-center gap-2 text-xs">
                                          <div className={`flex items-center gap-1 ${
                                            darkMode ? "text-gray-400" : "text-gray-500"
                                          }`}>
                                            <Clock className="w-3 h-3" />
                                            <SafeDate
                                              date={
                                                article.published_at ||
                                                article.created_at
                                              }
                                            />
                                          </div>
                                          {article.reading_time && (
                                            <span
                                              className={`flex items-center gap-1 ${
                                                darkMode ? "text-gray-400" : "text-gray-500"
                                              }`}
                                            >
                                              {article.reading_time} د
                                            </span>
                                          )}
                                        </div>
                                        {/* زر القراءة */}
                                        <div className="flex items-center gap-2">
                                          {article.view_count > 0 && (
                                            <span
                                              className={`flex items-center gap-1 ${
                                                darkMode ? "text-gray-400" : "text-gray-500"
                                              }`}
                                            >
                                              <Eye className="w-3 h-3" />
                                              {article.view_count}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </article>
                                </Link>
                              ))}
                            </div>
                            {/* زر عرض جميع المقالات */}
                            <div className="text-center mt-8">
                              <Link
                                href={`/categories/${
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.slug || "general"
                                }`}
                                className={`group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                  darkMode
                                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                              >
                                <span>
                                  عرض جميع مقالات{" "}
                                  {
                                    categories.find(
                                      (c) => c.id === selectedCategory
                                    )?.name_ar
                                  }
                                </span>
                                <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div
                            className={`text-center py-8 ${
                              darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-base font-medium mb-2">لا توجد مقالات في هذا التصنيف</p>
                            <p className="text-sm opacity-70">تفقد التصنيفات الأخرى أو عُد لاحقاً</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`text-center py-8 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <p className="text-sm">لا توجد تصنيفات متاحة حالياً</p>
                  </div>
                )}
              </div>
            )}
            {/* النشرة الصوتية لسطح المكتب فقط */}
            {!isMobileView && (
              <aside className="lg:col-span-1">
                <div
                  className={`h-full rounded-3xl p-4 sm:p-5 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${
                    darkMode
                      ? "bg-blue-900/10 border border-blue-800/30"
                      : "bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200/50"
                  }`}
                  style={{
                    backdropFilter: "blur(10px)",
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(191, 219, 254, 0.3) 100%)",
                  }}
                >
                  <SmartAudioBlock variant="sidebar" />
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* إعلان أسفل بلوك التصنيفات */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdBanner placement="below_custom_block" />
        </div>

        {/* 6. بطاقات الأخبار المخصصة (Featured Cards) 📰 */}
        {/* Main Content */}
        <main
          className={`max-w-7xl mx-auto px-3 sm:px-6 ${
            isMobileView ? "py-2 sm:py-4" : "py-4 sm:py-6"
          }`}
        >
          {/* Enhanced News Section */}
          <section
            className={`${isMobileView ? "mb-8 sm:mb-12" : "mb-10 sm:mb-20"}`}
          >
            <div
              className={`text-center smart-section-header ${
                isMobileView ? "mb-8 pt-4 pb-2" : "mb-12"
              }`}
            >
              {isCheckingAuth ? (
                // عرض حالة تحميل أثناء التحقق من تسجيل الدخول
                <div className="animate-pulse">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="w-96 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
                  <div className="w-full max-w-2xl h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                </div>
              ) : (
                <>
                  {/* رأس القسم مع شرط حالة تسجيل الدخول */}
                  {!isCheckingAuth &&
                    (isLoggedIn ? (
                      // للمستخدم المسجل
                      <>
                        {/* للهواتف الصغيرة جداً: دمج النص التعريفي مع العنوان */}
                        <div className="block sm:hidden">
                          <h2
                            className={`font-bold mb-2 ${
                              darkMode ? "text-white" : "text-gray-800"
                            } text-xl leading-tight`}
                          >
                            آخر الأخبار
                          </h2>
                          <p
                            className={`${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            } text-xs mb-4`}
                          >
                            مقالات مختارة بعناية لتناسب اهتماماتك وتوفر وقتك
                          </p>
                        </div>

                        {/* للشاشات المتوسطة والكبيرة: التصميم الكامل */}
                        <div className="hidden sm:block">
                          <h2
                            className={`font-bold mb-4 ${
                              darkMode ? "text-white" : "text-gray-800"
                            } ${
                              isMobileView
                                ? "text-2xl sm:text-3xl leading-tight"
                                : "text-4xl"
                            }`}
                          >
                            آخر الأخبار
                          </h2>
                          <p
                            className={`max-w-2xl mx-auto ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            } ${
                              isMobileView
                                ? "text-sm sm:text-base mb-6"
                                : "text-xl mb-8"
                            }`}
                          >
                            تابع آخر الأخبار والأحداث المهمة
                          </p>
                        </div>
                      </>
                    ) : (
                      // للزائر غير المسجل
                      <>
                        <div
                          className={`inline-flex items-center gap-3 rounded-full bg-gray-50 border border-gray-200 mb-6 dark:bg-gray-800/40 dark:border-gray-700 ${
                            isMobileView ? "px-4 py-2" : "px-6 py-3"
                          }`}
                        >
                          <Newspaper
                            className={`${
                              isMobileView ? "w-4 h-4" : "w-5 h-5"
                            } text-gray-600 dark:text-gray-300`}
                          />
                          <span
                            className={`font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } ${
                              isMobileView ? "text-xs sm:text-sm" : "text-base"
                            }`}
                          >
                            أحدث المقالات
                          </span>
                        </div>
                        <h2
                          className={`font-bold mb-4 smart-section-title ${
                            darkMode ? "text-white" : "text-gray-800"
                          } ${
                            isMobileView
                              ? "text-2xl sm:text-3xl leading-tight"
                              : "text-4xl"
                          }`}
                        >
                          آخبار الأخبار
                        </h2>
                        <p
                          className={`max-w-2xl mx-auto smart-section-subtext ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          } ${
                            isMobileView
                              ? "text-sm sm:text-base mb-6"
                              : "text-xl mb-8"
                          }`}
                        >
                          {isMobileView
                            ? ""
                            : ""}
                        </p>
                      </>
                    ))}
                </>
              )}
            </div>
            {/* Enhanced News Grid - مع دعم المحتوى المخصص */}
            {articlesLoading || personalizedLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    جاري تحميل المقالات...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* رسالة للمستخدمين غير المسجلين */}
                {!isLoggedIn && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-center ${
                      darkMode
                        ? "bg-gray-800/30 border border-gray-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <h3 className={`text-lg md:text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      تجربة إخبارية أفضل بانتظارك.
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm md:text-base mb-4`}>
                      سجّل عضويتك مجاناً لتصلك المقالات والأخبار التي تناسب ذوقك واهتماماتك الفريدة.
                    </p>
                    <div className="flex items-center justify-center">
                      <Link
                        href="/register"
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] border"
                        style={{
                          backgroundColor: 'var(--theme-primary, #3B82F6)',
                          color: 'white',
                          borderColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.3)'
                        }}
                      >
                        سجّل الآن مجاناً
                      </Link>
                    </div>
                  </div>
                )}

                {/* عرض المقالات - مع البطاقات المخصصة الذكية */}
                {showPersonalized && personalizedArticles.length > 0 ? (
                  // عرض المقالات المخصصة للمستخدمين المسجلين مع البطاقات الذكية
                  isMobileView ? (
                    // عرض الموبايل - قائمة عمودية مع البطاقات الافتراضية
                    <div className="space-y-3">
                      {renderRegularContent(
                        personalizedArticles.slice(0, 15)
                      )}
                    </div>
                  ) : (
                    // عرض الديسكتوب - شبكة مع البطاقات الافتراضية
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                      {renderRegularContent(
                        personalizedArticles.slice(0, 16)
                      )}
                    </div>
                  )
                ) : articles.length > 0 ? (
                  // عرض آخر المقالات للزوار أو المستخدمين بدون تفضيلات - مع البطاقات الافتراضية
                  isMobileView ? (
                    // عرض الموبايل - قائمة عمودية مع البطاقات الافتراضية
                    <div className="space-y-3">
                      {renderRegularContent(articles.slice(0, 15))}
                    </div>
                  ) : (
                    // عرض الديسكتوب - شبكة مع البطاقات الافتراضية
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                      {renderRegularContent(articles.slice(0, 16))}
                    </div>
                  )
                ) : (
                  // لا توجد مقالات
                  <div
                    className={`text-center py-20 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">لا توجد مقالات منشورة حالياً</p>
                    <p className="text-sm">
                      تحقق لاحقاً للحصول على آخر الأخبار والمقالات
                    </p>
                  </div>
                )}

                {/* إعلان أسفل المحتوى */}
                {((showPersonalized && personalizedArticles.length > 0) ||
                  articles.length > 0) && (
                  <div className="flex justify-center mt-8 mb-4">
                    <AdBanner placement="footer_banner" />
                  </div>
                )}

                {/* زر عرض الكل في الأسفل - جديد */}
                {((showPersonalized && personalizedArticles.length > 0) ||
                  articles.length > 0) && (
                  <div className="flex items-center justify-center mt-12">
                    <Link
                      href="/for-you"
                      className="group inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>المزيد من الأخبار</span>
                      <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* 7. النسخة المحمولة: الكلمات المفتاحية ومقترب قبل التحليل العميق */}
        {isMobileView && (
          <>
            {/* بلوك الكلمات المفتاحية للموبايل */}
            <div className="mobile-word-cloud-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-6">
              <HomeWordCloud maxKeywords={15} />
            </div>
            
            {/* بلوك مقترب للموبايل */}
            <section className="relative w-full py-8 mb-8 muqtarab-home-section" style={{
              background: 'transparent',
              borderTop: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
              borderBottom: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
              backdropFilter: 'blur(10px)',
              boxShadow: darkMode 
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
                : 'inset 0 2px 4px rgba(59, 130, 246, 0.05)'
            }}>
              <div className="mobile-muqtarab-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <MuqtarabBlock
                  limit={3}
                  showPagination={false}
                  showFilters={false}
                  viewMode="grid"
                />
              </div>
            </section>
          </>
        )}
        
        {/* النسخة العادية: مقترب للجميع */}
        {!isMobileView && (
          <section className="relative w-full py-12 mb-12 muqtarab-home-section" style={{
            background: 'transparent',
            borderTop: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
            borderBottom: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
            backdropFilter: 'blur(10px)',
            boxShadow: darkMode 
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
              : 'inset 0 2px 4px rgba(59, 130, 246, 0.05)'
          }}>
            <div className="desktop-muqtarab-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <MuqtarabBlock
                limit={6}
                showPagination={true}
                showFilters={true}
                viewMode="grid"
              />
            </div>
          </section>
        )}
        
        {/* الكلمات المفتاحية للديسكتوب */}
        {!isMobileView && (
          <div className="desktop-word-cloud-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8">
            <HomeWordCloud maxKeywords={15} />
          </div>
        )}
        {/* 8. التحليل العميق (Deep Analysis) 🧠 */}
        {/* Deep Analysis Block - بلوك التحليل العميق - يأتي بعد الكلمات المفتاحية ومقترب */}
        <section
          className={`relative w-full bg-white dark:bg-[#0d1b2a] border-y border-gray-100 dark:border-gray-800 ${
            isMobileView ? "py-12 mb-12" : "py-16 mb-16"
          }`}
        >
          {/* إزالة النمط المنقط لإظهار الخلفية #f8f8f7 بوضوح */}

          {/* المحتوى داخل container محدود */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
                🧠 تحليل عميق بالذكاء الاصطناعي
              </h2>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-600 dark:text-blue-100">
                استكشف تحليلات عميقة ومتطورة للموضوعات المهمة مدعومة بالذكاء
                الاصطناعي
              </p>
            </div>
          </div>

          {/* بلوك المحتوى - خلفية ممتدة بالكامل */}
          <div className="relative z-10 w-full">
            <DeepAnalysisBlock
              maxItems={3}
              showTitle={false}
              insights={initialDeepAnalyses as any}
            />
          </div>
        </section>
        {/* 9. قادة الرأي (Opinion Leaders) 👥 */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <TodayOpinionsSection darkMode={darkMode} />
        </main>
        {/* 10. الرحلة المعرفية (Knowledge Journey) 🎓 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SmartSlot position="below_personalized" />
        </div>
        {/* Smart Blocks إضافية */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SmartSlot position="above_footer" />
        </div>
        {/* Smart content - فوق الـ footer */}
      </div>
    </PageWrapper>
  );
}

// Export with client-side wrapper to ensure ThemeProvider is available
export default function PageClient({
  initialArticles = [],
  initialCategories = [],
  initialStats = {
    activeReaders: null,
    dailyArticles: null,
    loading: false,
  },
  initialDeepAnalyses = [],
  initialFeaturedArticles = [],
}: PageClientProps) {
  // 🔍 Debug: فحص البيانات الواردة (تعطيل في الإنتاج)
  if (process.env.NODE_ENV !== "production") {
    console.log("🎯 [DEBUG] PageClient received data:", {
      articlesCount: initialArticles.length,
      firstArticle: initialArticles[0]
        ? {
            title: initialArticles[0].title?.substring(0, 30) + "...",
            hasImage: !!initialArticles[0].image,
            hasImageUrl: !!initialArticles[0].image_url,
            hasFeaturedImage: !!initialArticles[0].featured_image,
            imageValue: initialArticles[0].image?.substring(0, 50) + "...",
          }
        : "No articles",
    });
  }

  const [stats, setStats] = useState(initialStats);

  // استخدام الإحصائيات الأولية
  useEffect(() => {
    if (initialStats && initialStats.loading === false) {
      setStats(initialStats);
    }
  }, []); // إزالة initialStats من dependency array

  return (
    <NewspaperHomePage
      stats={stats}
      initialArticles={initialArticles}
      initialCategories={initialCategories}
      initialDeepAnalyses={initialDeepAnalyses}
      initialFeaturedArticles={initialFeaturedArticles}
    />
  );
}
