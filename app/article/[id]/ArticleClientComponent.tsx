"use client";

import Footer from "@/components/Footer";
import ReporterLink from "@/components/ReporterLink";
import ArticleFeaturedImage from "@/components/article/ArticleFeaturedImage";
import OpinionArticleLayout from "@/components/article/OpinionArticleLayout";
import MobileOpinionLayout from "@/components/mobile/MobileOpinionLayout";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ArticleData } from "@/lib/article-api";
import { formatFullDate, formatRelativeDate } from "@/lib/date-utils";
import "@/styles/mobile-article-layout.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SmartInteractionButtons } from "@/components/article/SmartInteractionButtons";
import { useViewTracking } from "@/hooks/useViewTracking";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Star,
} from "lucide-react";
// import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import ArticleAISummary from "@/components/article/ArticleAISummary";
import ArticleStatsBlock from "@/components/article/ArticleStatsBlock";
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

  // جلب المقال إذا لم يتم تمريره
  useEffect(() => {
    if (!initialArticle) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/articles/${articleId}`);
          if (response.ok) {
            const data = await response.json();
            setArticle(processArticle(data));
          } else {
            console.warn(
              "تحذير: فشل في تحميل المقال، كود الاستجابة:",
              response.status
            );
          }
        } catch (error) {
          console.warn(
            "تحذير: خطأ في شبكة أثناء تحميل المقال:",
            error?.message || error
          );
        } finally {
          setLoading(false);
        }
      };

      fetchArticle();
    }
  }, [initialArticle, articleId]);

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

  // إذا لا يوجد مقال وجاري التحميل
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
            className="max-w-5xl mx-auto py-4 sm:py-6 lg:py-8"
          >
            {/* رأس المقال محسن للموبايل */}
            <header className="mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl relative z-10">
              {/* Desktop Header */}
              <div className="hidden sm:block px-6 lg:px-8 py-6 lg:py-8">
                {/* التصنيف - محاذاة لليمين */}
                {article.category && (
                  <div className="flex justify-end mb-4">
                    <Link
                      href={`/categories/${article.category.slug}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all hover:scale-105"
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

                {/* العنوان */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight text-right">
                  {article.title}
                </h1>

                {/* العنوان الفرعي */}
                {getSubtitle() && (
                  <h2 className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 text-right">
                    {getSubtitle()}
                  </h2>
                )}

                {/* المعلومات الأساسية - Desktop */}
                <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right">
                  {article.author && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ReporterLink
                        author={article.author as any}
                        size="sm"
                        showIcon={true}
                        showVerification={true}
                        className="truncate max-w-[120px] sm:max-w-none text-xs sm:text-sm"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {formatFullDate(
                        article.published_at || article.created_at || ""
                      )}
                    </span>
                    <span className="sm:hidden">
                      {formatRelativeDate(
                        article.published_at || article.created_at || ""
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>
                      {article.reading_time ||
                        calculateReadingTime(article.content || "")}{" "}
                      د
                    </span>
                  </div>
                  {article.views !== undefined && (
                    <ArticleViews
                      count={article.views}
                      className="text-xs sm:text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Mobile Header محسن */}
              <div className="sm:hidden px-2 py-4 mobile-article-header">
                {/* العنوان الرئيسي - عرض أكبر مع هوامش أقل */}
                <div className="px-1 mb-3">
                  <h1 className="text-2xl xs:text-[26px] font-bold leading-tight text-gray-900 dark:text-white mobile-article-title">
                    {article.title}
                  </h1>
                </div>

                {/* العنوان الفرعي - تصميم محسن */}
                {getSubtitle() && (
                  <div className="px-1 mb-4">
                    <h2 className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 font-normal mobile-article-subtitle">
                      {getSubtitle()}
                    </h2>
                  </div>
                )}

                {/* حاوي للتصنيف ومعلومات النشر - تخطيط محسن */}
                <div className="flex items-start justify-between px-1 gap-3 mobile-article-meta">
                  {/* التصنيف في اليمين (RTL friendly) */}
                  <div className="flex-shrink-0 order-2">
                    {article.category && (
                      <Link
                        href={`/categories/${article.category.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-sm transition-all mobile-article-category"
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

                  {/* معلومات النشر في اليسار - محاذاة مع الصورة */}
                  <div className="flex flex-col items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 order-1 flex-1 max-w-[160px] mobile-article-metadata">
                    {/* المراسل في سطر منفصل */}
                    {article.author && (
                      <div className="flex items-center gap-1.5">
                        <ReporterLink
                          author={article.author as any}
                          size="sm"
                          showIcon={true}
                          showVerification={true}
                          className="truncate max-w-[120px] text-xs"
                        />
                      </div>
                    )}

                    {/* التاريخ ووقت القراءة والمشاهدات في سطر واحد */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0 mobile-article-icon" />
                        <span>
                          {formatRelativeDate(
                            article.published_at || article.created_at || ""
                          )}
                        </span>
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0 mobile-article-icon" />
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
                          <ArticleViews
                            count={article.views}
                            className="text-xs"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </article>
        </div>

        {/* منطقة المحتوى */}
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* صورة المقال */}
          {article.featured_image && (
            <div className="mb-6 sm:mb-8">
              <ArticleFeaturedImage
                imageUrl={article.featured_image}
                title={article.title}
                category={article.category}
              />
            </div>
          )}

          {/* الملخص الذكي مع التحويل الصوتي */}
          <div className="mb-6 sm:mb-8">
            <ArticleAISummary
              articleId={article.id}
              title={article.title || "مقال بدون عنوان"}
              content={article.content || ""}
              existingSummary={
                article.ai_summary || article.summary || article.excerpt || ""
              }
              className="shadow-lg"
            />
          </div>

          {/* شريط التفاعل الذكي */}
          <div className="mb-6 sm:mb-8">
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

          {/* زر وضع القراءة */}
          <div className="mb-6 sm:mb-8 flex justify-end">
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

          {/* محتوى المقال */}
          <div className="mb-12">
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

          {/* إحصائيات المقال */}
          <div className="mt-8 sm:mt-12">
            <ArticleStatsBlock
              views={article.views || 0}
              likes={article.likes || article.stats?.likes || 0}
              saves={article.saves || article.stats?.saves || 0}
              shares={article.shares || article.stats?.shares || 0}
              category={
                article.category
                  ? {
                      name: article.category.name,
                      color: article.category.color,
                      icon: article.category.icon,
                    }
                  : undefined
              }
              growthRate={Math.floor(Math.random() * 60)} // نسبة نمو عشوائية للعرض
            />
          </div>

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
        </article>
      </main>

      <Footer />
    </>
  );
}
