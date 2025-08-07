"use client";

import { isEmergencyArticleSupported } from "@/app/emergency-articles";
import Footer from "@/components/Footer";
import ReporterLink from "@/components/ReporterLink";
import ArticleFeaturedImage from "@/components/article/ArticleFeaturedImage";
import OpinionArticleLayout from "@/components/article/OpinionArticleLayout";
import SafeDateDisplay from "@/components/article/SafeDateDisplay";
import DbConnectionError from "@/components/db-connection-error";
import MobileOpinionLayout from "@/components/mobile/MobileOpinionLayout";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ArticleData } from "@/lib/article-api";
import {
  handlePrismaError,
  isPrismaConnectionError,
} from "@/lib/prisma-error-handler";
import "@/styles/mobile-article-layout.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AdBanner from "@/components/ads/AdBanner";
import { SmartInteractionButtons } from "@/components/article/SmartInteractionButtons";
import SocialSharingButtons from "@/components/article/SocialSharingButtons";
import { useViewTracking } from "@/hooks/useViewTracking";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Star,
  Eye,
  Heart,
  Bookmark,
  Share,
  MessageSquare,
} from "lucide-react";
// import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import ArticleAISummary from "@/components/article/ArticleAISummary";
import ArticleStatsBlock from "@/components/article/ArticleStatsBlock";
import CommentsTrigger from "@/components/article/CommentsTrigger";
import CommentsSection from "@/components/article/CommentsSection";
import { ReadingProgressBar } from "@/components/article/ReadingProgressBar";
import SmartPersonalizedContent from "@/components/article/SmartPersonalizedContent";
import ArticleViews from "@/components/ui/ArticleViews";
import { useReporterProfile } from "@/lib/hooks/useReporterProfile";
import "@/styles/image-optimizations.css";
import "@/styles/mobile-article.css";
import "./article-styles.css";

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
    if (
      articleData &&
      articleData.metadata &&
      typeof articleData.metadata === "string"
    ) {
      try {
        articleData.metadata = JSON.parse(articleData.metadata);
      } catch (e) {
        // تجاهل أخطاء تحليل metadata وتعيين قيمة افتراضية
        console.warn("تحذير: فشل في تحليل metadata، استخدام قيمة افتراضية");
        articleData.metadata = {};
      }
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
  const [contentHtml, setContentHtml] = useState("");
  const [showComments, setShowComments] = useState(false);
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
              handlePrismaError(emergencyError, "طوارئ المقال");
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
                isPrismaConnectionError({ message: errorData.details })
              ) {
                console.error(
                  "خطأ في اتصال قاعدة البيانات:",
                  errorData.details
                );
                handlePrismaError({ message: errorData.details }, "جلب المقال");
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
          } else if (isPrismaConnectionError(error)) {
            console.error("خطأ في اتصال قاعدة البيانات:", error.message);
            handlePrismaError(error, "جلب المقال في catch");
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

  // معالجة المحتوى إلى HTML
  useEffect(() => {
    if (!article?.content) {
      setContentHtml("<p>المحتوى غير متوفر حالياً.</p>");
      return;
    }

    // استخدام المحتوى كما هو إذا كان HTML
    if (article.content.includes("<p>") || article.content.includes("<div>")) {
      setContentHtml(article.content);
    } else {
      // تحويل النص العادي إلى HTML بسيط
      const paragraphs = article.content.split("\n\n");
      const html = paragraphs.map((p) => `<p>${p}</p>`).join("");
      setContentHtml(html || "<p>المحتوى غير متوفر بشكل كامل.</p>");
    }
  }, [article?.content]);

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

      // تحديث Open Graph tags
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
      updateMetaTag("og:url", currentUrl);

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
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#6b7280" }}>جاري تحميل المقال...</p>
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

  // إذا كان مقال رأي، استخدم التصميم المخصص
  if (isOpinionArticle) {
    if (isMobile) {
      return <MobileOpinionLayout article={article} />;
    } else {
      return <OpinionArticleLayout article={article} />;
    }
  }

  return (
    <>
      {/* شريط التقدم في القراءة */}
      <ReadingProgressBar />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-0 sm:pt-[64px]">
        {/* منطقة المحتوى الرئيسية */}
        <div className="relative">
          <article
            ref={viewTrackingRef}
            className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8"
          >
            {/* رأس المقال محسن للموبايل */}
            <header className="mb-2 sm:mb-4">
              {/* Desktop Header - تحسين توازن العناصر وإزالة الحدود */}
              <div className="hidden sm:block px-6 lg:px-8 py-6 lg:py-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-0">
                {/* التصنيف - محاذاة لليمين مع تحسين الهامش */}
                {article.category && (
                  <div className="flex justify-end mb-5">
                    <Link
                      href={`/categories/${article.category.slug}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all hover:scale-105"
                    >
                      {article.category.icon && (
                        <span className="text-sm sm:text-base">
                          {article.category.icon}
                        </span>
                      )}
                      <span>{article.category.name}</span>
                    </Link>
                  </div>
                )}

                {/* العنوان - تحسين المسافات والهوامش */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-gray-900 dark:text-white leading-tight text-right tracking-tight">
                  {article.title}
                </h1>

                {/* العنوان الفرعي - تحسين المظهر */}
                {getSubtitle() && (
                  <h2 className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 text-right leading-relaxed">
                    {getSubtitle()}
                  </h2>
                )}

                {/* المعلومات الأساسية - Desktop مع ترتيب من اليسار: إسم المراسل - التاريخ - مدة القراءة - عدد المشاهدات */}
                <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-6 text-left border-0 article-meta-info">
                  {/* 1. إسم المراسل - الأولوية الأولى */}
                  {article.author && (
                    <div className="flex items-center gap-1.5 sm:gap-2 justify-start">
                      <ReporterLink
                        author={article.author as any}
                        size="sm"
                        showIcon={true}
                        showVerification={true}
                        className="truncate max-w-[120px] sm:max-w-none text-xs sm:text-sm text-left"
                      />
                    </div>
                  )}

                  {/* 2. التاريخ والوقت - الأولوية الثانية */}
                  {article.author && (
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2 justify-start text-left">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline text-left">
                      <SafeDateDisplay
                        date={article.published_at || article.created_at || ""}
                        format="full"
                      />
                    </span>
                    <span className="sm:hidden text-left">
                      <SafeDateDisplay
                        date={article.published_at || article.created_at || ""}
                        format="relative"
                      />
                    </span>
                  </div>

                  {/* 3. وقت القراءة - الأولوية الثالثة */}
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 justify-start text-left">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-left">
                      {article.reading_time ||
                        calculateReadingTime(article.content || "")}{" "}
                      د
                    </span>
                  </div>

                  {/* 4. عدد المشاهدات - الأولوية الرابعة */}
                  {article.views !== undefined && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <ArticleViews
                        count={article.views}
                        className="text-xs sm:text-sm text-left"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Header محسن - شفاف تماماً للوضع الليلي */}
              <div className="sm:hidden px-4 py-6 bg-transparent dark:bg-transparent transition-colors duration-300">
                {/* العنوان الرئيسي */}
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-900 dark:text-white mb-3">
                  {article.title}
                </h1>

                {/* العنوان الفرعي */}
                {getSubtitle() && (
                  <h2 className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-normal mb-4">
                    {getSubtitle()}
                  </h2>
                )}

                {/* التصنيف ومعلومات النشر */}
                <div className="flex items-start justify-between gap-3">
                  {/* التصنيف في اليمين */}
                  <div className="flex-shrink-0 order-2">
                    {article.category && (
                      <Link
                        href={`/categories/${article.category.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-sm transition-all"
                      >
                        {article.category.icon && (
                          <span className="text-sm">
                            {article.category.icon}
                          </span>
                        )}
                        <span>{article.category.name}</span>
                      </Link>
                    )}
                  </div>

                  {/* معلومات النشر في اليسار */}
                  <div className="flex flex-col items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 order-1 flex-1 max-w-[160px]">
                    {/* المراسل */}
                    {article.author && (
                      <div className="flex items-center gap-1.5">
                        <span>👤</span>
                        <ReporterLink
                          author={article.author as any}
                          size="sm"
                          showIcon={false}
                          showVerification={true}
                          className="truncate max-w-[120px] text-xs"
                        />
                      </div>
                    )}

                    {/* التاريخ ووقت القراءة والمشاهدات */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span>🗓️</span>
                        <span>
                          <SafeDateDisplay
                            date={
                              article.published_at || article.created_at || ""
                            }
                            format="relative"
                          />
                        </span>
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {article.reading_time ||
                            calculateReadingTime(article.content || "")}{" "}
                          د
                        </span>
                      </div>
                      {article.views !== undefined && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">
                            •
                          </span>
                          <div className="flex items-center gap-1">
                            <span>👁️</span>
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

            {/* إعلان أسفل هيدر المقال */}
            <AdBanner placement="article_detail_header" className="mb-6" />

            {/* صورة المقال - بنفس عرض العنوان تماماً */}
            {article.featured_image &&
              typeof article.featured_image === "string" &&
              article.featured_image.length > 0 &&
              !article.metadata?.emergency_mode && ( // تجنب عرض الصورة في وضع الطوارئ
                <div className="hidden sm:block px-6 lg:px-8 mb-6">
                  <ArticleFeaturedImage
                    imageUrl={article.featured_image}
                    title={article.title}
                    category={article.category}
                  />
                </div>
              )}
          </article>
        </div>

        {/* منطقة المحتوى - نفس عرض الصورة والعنوان تماماً للديسكتوب، عرض كامل للموبايل */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 lg:p-8">
            {/* صورة المقال للموبايل - عرض أوسع مع توسيط */}
            {article.featured_image &&
              typeof article.featured_image === "string" &&
              article.featured_image.length > 0 &&
              !article.metadata?.emergency_mode && ( // تجنب عرض الصورة في وضع الطوارئ
                <div className="sm:hidden w-full mb-6 mt-0 -mx-3 flex justify-center">
                  <ArticleFeaturedImage
                    imageUrl={article.featured_image}
                    title={article.title}
                    category={article.category}
                  />
                </div>
              )}

            {/* الملخص الذكي مع التحويل الصوتي - عرض أوسع للموبايل */}
            <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0">
              <div className="px-3 sm:px-0">
                <ArticleAISummary
                  articleId={article.id}
                  title={article.title || "مقال بدون عنوان"}
                  content={article.content || ""}
                  existingSummary={
                    article.ai_summary ||
                    article.summary ||
                    article.excerpt ||
                    ""
                  }
                  className="shadow-lg"
                />
              </div>
            </div>

            {/* شريط التفاعل الذكي - عرض أوسع للموبايل */}
            <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0">
              <div className="px-3 sm:px-0">
                <SmartInteractionButtons
                  articleId={article.id}
                  initialStats={{
                    likes: article.likes || article.stats?.likes || 0,
                    saves: article.saves || article.stats?.saves || 0,
                    shares: article.shares || article.stats?.shares || 0,
                    comments: article.comments_count || 0,
                  }}
                  onComment={() => {
                    // تم إزالة قسم التعليقات
                    console.log("تم النقر على التعليقات");
                  }}
                />
              </div>
            </div>

            {/* أزرار المشاركة الاجتماعية - عرض أوسع للموبايل */}
            <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0">
              <div className="px-3 sm:px-0">
                <SocialSharingButtons
                  article={{
                    id: article.id,
                    title: article.title,
                  }}
                  className="justify-center sm:justify-end"
                />
              </div>
            </div>

            {/* الكلمات المفتاحية - عرض أوسع للموبايل */}
            {keywords.length > 0 && (
              <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0">
                <div className="px-3 sm:px-0">
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
              </div>
            )}

            {/* زر وضع القراءة - عرض أوسع للموبايل */}
            <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0">
              <div className="px-3 sm:px-0 flex justify-end">
                <button
                  onClick={() => setIsReading(!isReading)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isReading
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } hover:opacity-90`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isReading ? "إيقاف وضع القراءة" : "وضع القراءة"}
                  </span>
                </button>
              </div>
            </div>

            {/* محتوى المقال - عرض أوسع للموبايل */}
            <div className="mb-12 -mx-3 sm:mx-0">
              <div className="px-3 sm:px-0">
                <div
                  className={`prose max-w-none dark:prose-invert arabic-article-content
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-p:leading-relaxed
                    prose-img:rounded-xl prose-img:shadow-xl
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                    prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                    prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-lg
                    ${isReading ? "prose-xl" : "prose-lg"}
                  `}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            </div>

            {/* أزرار المشاركة الاجتماعية */}
            <div className="mt-6 mb-8 px-3 sm:px-0">
              <SocialSharingButtons
                article={{ id: article.id, title: article.title }}
                className="justify-center sm:justify-start"
              />
            </div>

            {/* شريط إحصائيات قابل للطي لإظهار التعليقات */}
            <div className="mt-4 sm:mt-6">
              <button
                type="button"
                dir="rtl"
                aria-expanded={showComments}
                onClick={() => {
                  const next = !showComments;
                  setShowComments(next);
                  if (!next) return;
                  setTimeout(() => {
                    const el = document.getElementById("comments");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="w-full rounded-xl border px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm sm:text-base">
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Eye className="w-4 h-4" /> {new Intl.NumberFormat("ar").format(article.views || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Heart className="w-4 h-4" /> {new Intl.NumberFormat("ar").format(article.likes || article.stats?.likes || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Bookmark className="w-4 h-4" /> {new Intl.NumberFormat("ar").format(article.saves || article.stats?.saves || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Share className="w-4 h-4" /> {new Intl.NumberFormat("ar").format(article.shares || article.stats?.shares || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="font-medium">التعليقات</span>
                    <span className="text-gray-600 dark:text-gray-300">({new Intl.NumberFormat("ar").format(article.comments_count || 0)})</span>
                  </div>
                </div>
              </button>
            </div>

            {/* إصلاح التوجه العربي للمحتوى */}
            <style jsx>{`
              .arabic-article-content p {
                text-align: right !important;
                direction: rtl !important;
              }

              .arabic-article-content * {
                text-align: right !important;
                direction: rtl !important;
              }

              .arabic-article-content h1,
              .arabic-article-content h2,
              .arabic-article-content h3,
              .arabic-article-content h4,
              .arabic-article-content h5,
              .arabic-article-content h6 {
                text-align: right !important;
                direction: rtl !important;
              }

              .arabic-article-content blockquote {
                text-align: right !important;
                direction: rtl !important;
                border-right: 4px solid #3b82f6 !important;
                border-left: none !important;
              }
            `}</style>
          </div>

          {/* قسم التعليقات (Lazy) يظهر عند الضغط على الشريط */}
          {showComments && <CommentsSection articleId={article.id} />}

          {/* المحتوى المخصص بذكاء - نظام التوصيات الشخصي */}
          <div className="mt-6 sm:mt-8">
            <SmartPersonalizedContent
              articleId={article.id}
              categoryId={article.category_id}
              categoryName={article.category?.name}
              tags={article.keywords || []}
              darkMode={darkMode}
              userId={undefined} // يمكن تمرير معرف المستخدم عند التسجيل
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
