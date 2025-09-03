"use client";

import dynamic from "next/dynamic";
import EnhancedOpinionLayout from "@/components/article/EnhancedOpinionLayout";
import SmartReadingTracker from "@/components/article/SmartReadingTracker";
import { ReadingProgressBar } from "@/components/article/ReadingProgressBar";
import SafeDateDisplay from "@/components/article/SafeDateDisplay";
import ArticleViews from "@/components/ui/ArticleViews";
import AIQuestions from "@/components/article/AIQuestions";
import { useReporterProfile } from "@/lib/hooks/useReporterProfile";

import { isEmergencyArticleSupported } from "@/app/emergency-articles";
import ReporterLink from "@/components/ReporterLink";
import DbConnectionError from "@/components/db-connection-error";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ArticleData } from "@/lib/article-api";
import {
  isConnectionError,
  logClientError,
} from "@/lib/client-error-handler";
import "@/styles/mobile-article-layout.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import AdBanner from "@/components/ads/AdBanner";
import BasicLikeSave from "@/components/article/BasicLikeSave";
// إزالة المشاركة أعلى التعليقات حسب الطلب
import { useViewTracking } from "@/hooks/useViewTracking";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Eye,
  Star,
  Sparkles,
} from "lucide-react";
// import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';

const ImageSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse ${className}`} />
);

// وظيفة تحديد الخبر الجديد (أقل من 12 ساعة) - غير مستخدمة حالياً
// const isNewsRecent = (publishedAt: string | Date | null): boolean => {
//   if (!publishedAt) return false;
//   
//   const now = new Date();
//   const articleDate = new Date(publishedAt);
//   const hoursAgo = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
//   
//   return hoursAgo <= 12; // جديد إذا كان أقل من 12 ساعة
// };

const ArticleFeaturedImage = dynamic(() => import("@/components/article/ArticleFeaturedImage"), {
  ssr: false,
  loading: () => <ImageSkeleton className="aspect-[16/9]" />,
});

const MobileFeaturedImage = dynamic(() => import("@/components/article/MobileFeaturedImage"), {
  ssr: false,
  loading: () => <ImageSkeleton className="h-[230px]" />,
});

const ArticleAISummary = dynamic(() => import("@/components/article/ArticleAISummary"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 p-4 animate-pulse h-28" />
  ),
});

const SmartAudioButton = dynamic(() => import("@/components/article/SmartAudioButton"), {
  ssr: false,
  loading: () => <div className="w-40 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />,
});

const ArticleStatsBlock = dynamic(() => import("@/components/article/ArticleStatsBlock"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-16 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 animate-pulse" />
  ),
});

const CommentsPanel = dynamic(() => import("@/components/article/CommentsPanel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-24 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 animate-pulse" />
  ),
});

const SmartPersonalizedContent = dynamic(
  () => import("@/components/article/SmartPersonalizedContent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 animate-pulse" />
    ),
  }
);

interface ArticleClientComponentProps {
  initialArticle: ArticleData | null;
  articleId: string;
}

export default function ArticleClientComponent({
  initialArticle,
  articleId,
}: ArticleClientComponentProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // معالجة metadata إذا كانت string
  const processArticle = (articleData: any) => {
    if (!articleData) {
      return null;
    }
    
    // التأكد من وجود metadata قبل المعالجة
    if (
      articleData.metadata &&
      typeof articleData.metadata === "string" &&
      articleData.metadata.trim()
    ) {
      try {
        articleData.metadata = JSON.parse(articleData.metadata);
      } catch (e) {
        // تجاهل أخطاء تحليل metadata وتعيين قيمة افتراضية
        console.warn("تحذير: فشل في تحليل metadata، استخدام قيمة افتراضية");
        articleData.metadata = {};
      }
    } else if (!articleData.metadata) {
      // إضافة metadata فارغة إذا لم تكن موجودة
      articleData.metadata = {};
    }
    return articleData;
  };

  const [article, setArticle] = useState<ArticleData | null>(
    processArticle(initialArticle) || null
  );

  // تحديد ما إذا كان المقال مقال رأي
  const isOpinionArticle =
    article &&
    (article.article_type === "opinion" ||
      article.article_type === "analysis" ||
      article.article_type === "editorial" ||
      article.article_type === "commentary" ||
      article.article_type === "column" ||
      article.category?.slug === "opinion" ||
      article.category?.name?.includes("رأي") ||
      article.category?.name?.includes("تحليل"));
  const [loading, setLoading] = useState(!initialArticle);
  const [isReading, setIsReading] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  // تأكيد البدء من أعلى الصفحة في النسخة الخفيفة للموبايل
  useEffect(() => {
    if (typeof window !== "undefined") {
      // إعادة التمرير للأعلى فور التحميل
      window.scrollTo(0, 0);
      // إعادة ثانية بعد الرسم الأول لضمان عدم بقاء الإزاحة
      requestAnimationFrame(() => window.scrollTo(0, 0));
      setTimeout(() => window.scrollTo(0, 0), 0);
    }
  }, []);

  // استعادة وضع القراءة من localStorage (بدون تطبيق صنف على body/html)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedReadingMode = localStorage.getItem('reading-mode') === 'true';
      if (savedReadingMode) {
        setIsReading(true);
      }
    }
  }, []);
  // توليد محتوى HTML بشكل متزامن لتجنب ومضة الفراغ بعد اختفاء شاشة التحميل
  const contentHtml = useMemo(() => {
    const raw = article?.content || null;
    if (!raw) {
      return "";
    }
    
    // إذا كان المحتوى يحتوي على HTML tags (بما في ذلك الصور)، استخدمه كما هو
    if (raw.includes("<p>") || raw.includes("<div>") || raw.includes("<img>") || raw.includes("<figure>") || raw.includes("<h")) {
      return raw;
    }
    
    // إذا كان نص عادي، قم بتحويله إلى فقرات مع الحفاظ على الصور المحتملة
    const paragraphs = raw.split("\n\n");
    const html = paragraphs.map((p) => {
      // إذا كانت الفقرة تحتوي على صورة، احتفظ بها كما هي
      if (p.includes("<img") || p.includes("![")) {
        return p;
      }
      // وإلا، لفها في تاغ p
      return p.trim() ? `<p>${p}</p>` : '';
    }).filter(Boolean).join("");
    
    return html || "<p>المحتوى غير متوفر حالياً.</p>";
  }, [article?.content]);
  // لم نعد نستخدم الحالة المحلية للتبديل هنا بعد إضافة CommentsPanel
  const audioRef = useRef<HTMLAudioElement>(null);

  // جلب بروفايل المراسل
  const {
    reporter,
    hasProfile,
    loading: reporterLoading,
  } = useReporterProfile(article?.author?.name || "");

  // تتبع المشاهدات
  const {
    elementRef: viewTrackingRef,
    hasViewed,
    isInView,
  } = useViewTracking({
    articleId: articleId,
    threshold: 0.5, // 50% من المقال يجب أن يكون مرئي
    minTime: 5000, // 5 ثواني
    enabled: !!article, // تفعيل فقط عند وجود المقال
  });

  // دالة لعرض أيقونة التحقق
  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case "expert":
        return <Award className="w-3 h-3 text-purple-600" />;
      case "senior":
        return <Star className="w-3 h-3 text-yellow-600" />;
      default:
        return <CheckCircle className="w-3 h-3 text-blue-600" />;
    }
  };

  // جلب المقال إذا لم يتم تمريره - مع حل طارئ محسن لمشكلة الاتصال بقاعدة البيانات
  useEffect(() => {
    // 🚀 PERFORMANCE FIX: تجنب fetch إذا كانت البيانات متوفرة بالفعل
    if (!initialArticle) {
      const fetchArticle = async () => {
        try {
          setLoading(true);

          // التحقق مما إذا كان المقال مدعومًا في وضع الطوارئ
          if (isEmergencyArticleSupported(articleId)) {
            console.log(
              "🚨 EMERGENCY MODE: استخدام بيانات مؤقتة للمقال",
              articleId
            );

            // استخدام مسار الطوارئ المباشر
            try {
              const emergencyResponse = await fetch(
                `/api/articles/${articleId}/emergency`,
                {
                  cache: "no-store",
                }
              );

              if (emergencyResponse.ok) {
                const emergencyData = await emergencyResponse.json();
                if (emergencyData.success) {
                  setArticle(processArticle(emergencyData));
                  setLoading(false);
                  return;
                }
              }
            } catch (emergencyError) {
              console.warn(
                "⚠️ فشل في جلب المقال من مسار الطوارئ:",
                emergencyError
              );
              logClientError(emergencyError, "طوارئ المقال");
              // يتابع للمحاولة العادية في حالة فشل مسار الطوارئ
            }
          }

          // محاولة جلب المقال العادية مع timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

          const response = await fetch(`/api/articles/${articleId}`, {
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setArticle(processArticle(data));
          } else if (response.status === 404) {
            console.warn("تحذير: المقال غير موجود");
            // يمكن إضافة معالجة خاصة للمقالات المفقودة
            router.push("/404");
          } else {
            // محاولة الكشف عن خطأ قاعدة البيانات
            try {
              const errorData = await response.json();

              // فحص متقدم لأخطاء قاعدة البيانات باستخدام الأداة المساعدة
              if (
                errorData?.error &&
                errorData?.details &&
                isConnectionError({ message: errorData.details })
              ) {
                console.error(
                  "خطأ في اتصال قاعدة البيانات:",
                  errorData.details
                );
                logClientError({ message: errorData.details }, "جلب المقال");
                setDbConnectionError(errorData.details);

                // المحاولة بالوضع الطارئ في حالة عدم المحاولة سابقًا
                if (!isEmergencyArticleSupported(articleId)) {
                  console.log("⚠️ محاولة عرض المقال في الوضع العام");
                  // توجيه المستخدم لصفحة الطوارئ العامة
                }
              } else {
                console.warn(
                  "تحذير: فشل في تحميل المقال، كود الاستجابة:",
                  response.status,
                  errorData?.error || ""
                );
              }
            } catch (jsonError) {
              console.warn(
                "تحذير: فشل في تحميل المقال، كود الاستجابة:",
                response.status
              );
            }
          }
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.warn("تحذير: انتهت مهلة تحميل المقال");
          } else if (isConnectionError(error)) {
            console.error("خطأ في اتصال قاعدة البيانات:", error.message);
            logClientError(error, "جلب المقال في catch");
            setDbConnectionError(error.message);
          } else {
            console.warn(
              "تحذير: خطأ في شبكة أثناء تحميل المقال:",
              error?.message || error
            );
          }
        } finally {
          setLoading(false);
        }
      };

      fetchArticle();
    }
  }, [initialArticle, articleId, router]);

  // لم نعد بحاجة لتأثير منفصل لتوليد المحتوى

  // تحديث عنوان التبويب ديناميكياً وتحسين Open Graph meta tags
  useEffect(() => {
    if (article?.title) {
      // تنسيق العنوان ليكون مناسباً لتبويب المتصفح
      const tabTitle = `${article.title} - صحيفة سبق الإلكترونية`;
      document.title = tabTitle;

      // تحديث Open Graph meta tags ديناميكياً للمشاركة الاجتماعية
      const updateMetaTag = (property: string, content: string) => {
        let metaTag = document.querySelector(
          `meta[property="${property}"]`
        ) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.setAttribute("property", property);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", content);
      };

      const updateNameMetaTag = (name: string, content: string) => {
        let metaTag = document.querySelector(
          `meta[name="${name}"]`
        ) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.setAttribute("name", name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", content);
      };

      // تحديث Open Graph tags (تأجيل بسيط لتفادي ومضة الفراغ بعد Skeleton)
      updateMetaTag("og:title", tabTitle);
      updateMetaTag("og:type", "article");
      updateMetaTag("og:site_name", "صحيفة سبق الإلكترونية");
      updateMetaTag("og:locale", "ar_SA");

      // تحديث صورة المقال للمشاركة
      if (article.featured_image) {
        updateMetaTag("og:image", article.featured_image);
        updateMetaTag("og:image:width", "1200");
        updateMetaTag("og:image:height", "630");
        updateMetaTag("og:image:alt", article.title);
      }

      // تحديث URL المقال
      const currentUrl = window.location.href;
      setTimeout(() => updateMetaTag("og:url", currentUrl), 0);

      // تحديث Twitter Card meta tags
      updateNameMetaTag("twitter:card", "summary_large_image");
      updateNameMetaTag("twitter:title", tabTitle);
      if (article.featured_image) {
        updateNameMetaTag("twitter:image", article.featured_image);
      }

      // تحديث meta description للمشاركة
      const description =
        article.excerpt ||
        article.summary ||
        article.description ||
        `اقرأ: ${article.title} - في صحيفة سبق الإلكترونية`;

      const shortDescription = description.substring(0, 160);
      updateNameMetaTag("description", shortDescription);
      updateMetaTag("og:description", shortDescription);
      updateNameMetaTag("twitter:description", shortDescription);

      // تحديث معلومات المقال إضافية
      if (article.author?.name) {
        updateMetaTag("article:author", article.author.name);
      }

      if (article.category?.name) {
        updateMetaTag("article:section", article.category.name);
      }

      if (article.published_at) {
        updateMetaTag(
          "article:published_time",
          new Date(article.published_at).toISOString()
        );
      }

      if (article.keywords && Array.isArray(article.keywords)) {
        updateMetaTag("article:tag", article.keywords.join(", "));
      }
    } else if (loading) {
      // إظهار نص تحميل أثناء جلب البيانات
      document.title = "تحميل الخبر... - صحيفة سبق الإلكترونية";
    }

    // إعادة تعيين العنوان الافتراضي عند مغادرة الصفحة
    return () => {
      if (!article?.title) {
        document.title = "صحيفة سبق الإلكترونية";
      }
    };
  }, [
    article?.title,
    article?.excerpt,
    article?.summary,
    article?.description,
    article?.featured_image,
    article?.author?.name,
    article?.category?.name,
    article?.published_at,
    article?.keywords,
    loading,
  ]);

  // التحقق من وجود خطأ محدد في اتصال قاعدة البيانات
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(
    null
  );

  // إذا لا يوجد مقال وجاري التحميل
  if (dbConnectionError) {
    return (
      <DbConnectionError
        articleId={articleId}
        errorDetail={dbConnectionError}
        showAdminLink={true}
      />
    );
  }

  if (loading || !article) {
    return (
      <div className="min-h-[100svh]">
        <div className="pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] lg:pt-20">
          <div className="max-w-screen-lg lg:max-w-[110ch] mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
            <div className="animate-pulse space-y-4 loading-skeleton">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
              <div className="mt-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-3 mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // نظام تتبع التفاعل الذكي - معطل مؤقتاً لتجنب خطأ AuthProvider
  // const interactionTracking = useUserInteractionTracking(articleId);

  // معالجة الإعجاب
  const handleLike = async () => {
    // interactionTracking.toggleLike();
  };

  // معالجة الحفظ
  const handleSave = async () => {
    // interactionTracking.toggleSave();
  };

  // التحكم في مشغل الصوت
  const toggleAudioPlayer = () => {
    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      setShowAudioPlayer(true);
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // حساب وقت القراءة - مع معالجة شاملة للحالات الخاصة
  const calculateReadingTime = (content: string | null | undefined) => {
    // معالجة الحالات الخاصة
    if (!content) {
      return 1; // قيمة افتراضية (دقيقة واحدة) للمحتوى الفارغ
    }

    // حساب وقت القراءة
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // استخراج العنوان الفرعي من المحتوى إذا لم يكن موجود
  const getSubtitle = () => {
    // أولوية للعنوان الفرعي المحدد صراحة
    if (article.subtitle) return article.subtitle;
    if (article.metadata?.subtitle) return article.metadata.subtitle;
    if (article.description) return article.description;

    // إذا لم يوجد، استخراج من بداية المحتوى
    if (article.content) {
      const firstParagraph = article.content
        .split("\n\n")[0] // أول فقرة
        .replace(/<[^>]*>/g, "") // إزالة HTML tags
        .trim();

      // إذا كانت الفقرة الأولى قصيرة ومناسبة كعنوان فرعي
      if (firstParagraph.length > 20 && firstParagraph.length <= 200) {
        return firstParagraph;
      }
    }

    return null;
  };

  // استخراج الكلمات المفتاحية
  const getKeywords = () => {
    if (article?.keywords && Array.isArray(article.keywords)) {
      return article.keywords;
    }
    if (article?.seo_keywords) {
      if (typeof article.seo_keywords === "string") {
        return article.seo_keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
      }
      if (Array.isArray(article.seo_keywords)) {
        return article.seo_keywords;
      }
    }
    return [];
  };

  const keywords = getKeywords();

  // تحديد ما إذا كان الخبر جديد (آخر 12 ساعة) - غير مستخدم حالياً
  // const isArticleNew = (() => {
  //   const dateStr = (article?.published_at || article?.created_at) as string | undefined;
  //   if (!dateStr) return false;
  //   const date = new Date(dateStr);
  //   const now = new Date();
  //   const diff = Math.abs(now.getTime() - date.getTime());
  //   return diff <= 12 * 60 * 60 * 1000; // 12 ساعة
  // })();

  // إذا كان مقال رأي، استخدم التصميم المحسن الجديد
  if (isOpinionArticle) {
    return <EnhancedOpinionLayout article={article} />;
  }

  return (
    <>
      {/* نظام التتبع الذكي */}
      {/* إبقاءه */}
      <SmartReadingTracker articleId={articleId} />

      {/* شريط التقدم في القراءة */}
      <ReadingProgressBar />

      <main className="min-h-[100svh] pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] lg:pt-20">
        {/* منطقة المحتوى الرئيسية */}
        <div className="relative">
          <article
            ref={viewTrackingRef}
            className="article-content"
            style={{ contentVisibility: "auto" as any, containIntrinsicSize: "900px 1200px" as any }}
          >
            {/* رأس المقال */}
            <header className="mb-1 sm:mb-2">
              {/* Desktop Header - إعادة الترتيب كما كان: شارات ثم العناوين ثم بيانات النشر ثم الصورة */}
              <div className="hidden sm:block">
                <div className="max-w-[110ch] mx-auto px-4 sm:px-6">
                  <div className="text-right">
                    {/* الصورة البارزة أولاً (Hero) */}
                    {article.featured_image && typeof article.featured_image === "string" && article.featured_image.length > 0 && !article.metadata?.emergency_mode && (
                      <div className="mb-5">
                        <ArticleFeaturedImage
                          imageUrl={article.featured_image}
                          title={article.title}
                          alt={article.featured_image_alt || article.title}
                          caption={article.featured_image_caption}
                          category={article.category}
                          className="w-full rounded-2xl shadow-2xl"
                        />
                      </div>
                    )}

                    {/* التصنيف */}
                    {article.category && (
                      <div className="flex items-center justify-end gap-2 mb-4">
                        <Link
                          href={`/categories/${article.category.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-sm transition-all"
                        >
                          {article.category.icon && (
                            <span className="text-sm sm:text-base">{article.category.icon}</span>
                          )}
                          <span>{article.category.name}</span>
                        </Link>
                      </div>
                    )}

                    {/* العنوان الكبير */}
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900 dark:text-white leading-tight tracking-tight">
                      {article.title}
                    </h1>

                    {/* العنوان الصغير */}
                    {getSubtitle() && (
                      <h2 className="article-subtitle text-lg lg:text-xl text-gray-600 dark:text-gray-200 mb-3 leading-relaxed font-normal">
                        {getSubtitle()}
                      </h2>
                    )}

                    {/* اسم المراسل + بيانات النشر */}
                    <div className="article-meta-info flex flex-wrap items-center justify-end gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-right">
                      {article.author && (
                        <div className="inline-flex items-center gap-1.5 sm:gap-2">
                          <ReporterLink
                            author={article.author as any}
                            size="sm"
                            showIcon={true}
                            showVerification={true}
                            className="truncate max-w-[220px] text-xs sm:text-sm"
                          />
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <SafeDateDisplay
                          date={article.published_at || article.created_at || ""}
                          format="full"
                          showTime
                        />
                      </div>
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{article.reading_time || calculateReadingTime(article.content || "")} د</span>
                      </div>
                      {article.views !== undefined && (
                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <Eye className="w-4 h-4" />
                          <ArticleViews count={article.views} className="text-xs sm:text-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Header */}
              <div className="sm:hidden px-4 sm:px-6 py-6 bg-transparent transition-colors duration-300">
                {/* التصنيف */}
                {article.category && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Link
                      href={`/categories/${article.category.slug}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-sm transition-all"
                    >
                      <Hash className="w-3 h-3 flex-shrink-0" />
                      {article.category.icon && (
                        <span className="text-xs">{article.category.icon}</span>
                      )}
                      <span>{article.category.name}</span>
                    </Link>
                  </div>
                )}

                {/* العنوان الرئيسي */}
                <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white mb-1">{/* تكبير من text-xl إلى text-2xl (تكة أكبر) */}
                  {article.title}
                </h1>

                {/* العنوان الفرعي */}
                {getSubtitle() && (
                  <h2 className="article-subtitle text-base leading-relaxed text-gray-600 dark:text-gray-300 font-normal mb-3">{/* إزالة البولد - font-normal بدلاً من font-bold */}
                    {getSubtitle()}
                  </h2>
                )}
                <div className="flex items-start justify-between gap-2">{/* تقليل الفراغ */}
                  <div className="flex flex-col items-start gap-0.5 text-xs text-gray-600 dark:text-gray-300 flex-1">{/* تقليل المسافة بين اسم المراسل والبيانات */}
                    {article.author && (
                      <div className="flex items-center gap-1.5">
                        <span>👤</span>
                        <ReporterLink
                          author={article.author as any}
                          size="sm"
                          showIcon={false}
                          showVerification={true}
                          className="truncate max-w-[140px] text-xs font-medium"
                        />
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">{/* زيادة مسافة بين اسم المراسل وبيانات النشر */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <SafeDateDisplay
                          date={article.published_at || article.created_at || ""}
                          format="relative"
                          showTime
                        />
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {article.reading_time ||
                            calculateReadingTime(article.content || "")} د
                        </span>
                      </div>
                      {article.views !== undefined && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <ArticleViews
                              count={article.views}
                              className="text-xs"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <div className="hidden sm:block">
              <div className="max-w-[110ch] mx-auto px-4 sm:px-6">
                <AdBanner placement="article_detail_header" className="mb-5" />
              </div>
            </div>
          </article>
        </div>
        {/* تخطيط بعمودين تحت الهيرو (ديسكتوب) */}
        <div className="w-full">
          <div className="max-w-[110ch] mx-auto px-4 sm:px-6 py-2">
            <div className="bg-transparent dark:bg-transparent rounded-xl">
              <div className="sm:hidden mb-6" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 260px" as any }}>
                {article.featured_image && typeof article.featured_image === "string" && article.featured_image.length > 0 && !article.metadata?.emergency_mode && (
                  <div className="mb-4">
                    <div className="relative h-[230px] overflow-hidden rounded-2xl">
                      <MobileFeaturedImage
                        imageUrl={article.featured_image}
                        title={article.title}
                        alt={article.featured_image_alt || article.title}
                        caption={article.featured_image_caption}
                        category={article.category}
                        className="h-full"
                      />
                    </div>
                  </div>
                )}
                <ArticleAISummary
                  articleId={article.id}
                  title={article.title || "مقال بدون عنوان"}
                  content={article.content || ""}
                  existingSummary={article.ai_summary || article.summary || article.excerpt || ""}
                  className="shadow-lg article-ai-summary-mobile"
                  showFloatingAudio={true}
                />
              </div>
            </div>

            {/* شبكة عمودين: المحتوى + بانل جانبي (ديسكتوب) */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* العمود الأيسر: النص (8 أعمدة) */}
              <div className="lg:col-span-8">
                {/* موجز الذكاء الاصطناعي */}
                <div className="mb-6 sm:mb-8" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 180px" as any }}>
                  <ArticleAISummary
                    articleId={article.id}
                    title={article.title || "مقال بدون عنوان"}
                    content={article.content || ""}
                    existingSummary={article.ai_summary || article.summary || article.excerpt || ""}
                    className="shadow-lg w-full"
                  />
                  <div className="mt-4 flex justify-end">
                    <SmartAudioButton
                      articleId={article.id}
                      title={article.title || ""}
                      content={article.content || ""}
                      variant="inline"
                    />
                  </div>
                </div>

                {/* الكلمات المفتاحية */}
                {keywords.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {keywords.map((keyword, index) => (
                        <Link
                          key={index}
                          href={`/tags/${encodeURIComponent(keyword)}`}
                          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105 hover:shadow-sm"
                        >
                          <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{keyword}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار التفاعل + وضع القراءة */}
                <div className="mb-6 sm:mb-8" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 64px" as any }}>
                  <BasicLikeSave
                    articleId={article.id}
                    initialLikes={article.likes || article.stats?.likes || 0}
                    initialSaves={article.saves || article.stats?.saves || 0}
                    showReadingModeButton={true}
                    isReading={isReading}
                    onReadingModeToggle={() => {
                      const next = !isReading;
                      setIsReading(next);
                      localStorage.setItem('reading-mode', next ? 'true' : 'false');
                    }}
                  />
                </div>

                {/* محتوى المقال */}
                <div className="mb-12" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 900px" as any }}>
                  <div
                    className={`prose max-w-none dark:prose-invert arabic-article-content ${isReading ? "reading-only" : ""}`}
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>

                {/* الأسئلة */}
                {article?.content && (
                  <div className="mb-8" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 120px" as any }}>
                    <AIQuestions content={typeof article.content === "string" ? article.content : JSON.stringify(article.content)} />
                  </div>
                )}

                {/* التعليقات */}
                <div className="mt-4 sm:mt-6" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 200px" as any }}>
                  <CommentsPanel articleId={article.id} initialCount={article.comments_count || 0} />
                </div>

                {/* إحصائيات المقال */}
                <div className="mt-6" style={{ contentVisibility: "auto" as any, containIntrinsicSize: "100% 120px" as any }}>
                  <ArticleStatsBlock
                    views={article.views || 0}
                    likes={article.likes || 0}
                    saves={article.saves || 0}
                    shares={article.shares || 0}
                    category={article.category ? { name: article.category.name, color: (article.category as any).color, icon: (article.category as any).icon } : undefined}
                  />
                </div>
              </div>

              {/* العمود الأيمن: بانل (4 أعمدة) */}
              <aside className="lg:col-span-4 space-y-6">
                <ArticleAISummary
                  articleId={article.id}
                  title={article.title || ""}
                  content={article.content || ""}
                  existingSummary={article.ai_summary || article.summary || article.excerpt || ""}
                  className="shadow-lg"
                />
                <SmartPersonalizedContent
                  articleId={article.id}
                  categoryId={article.category_id}
                  categoryName={article.category?.name}
                  tags={article.keywords || []}
                  darkMode={darkMode}
                  userId="guest"
                />
                <AdBanner placement="article_side_panel" />
              </aside>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
