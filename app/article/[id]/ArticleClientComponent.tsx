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
        console.error("خطأ في تحليل metadata:", e);
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
            console.error("Failed to fetch article:", response.status);
          }
        } catch (error) {
          console.error("Error fetching article:", error);
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
            {/* رأس المقال محسن ومتطور */}
            <header className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-2xl relative z-10 overflow-hidden">
              {/* Desktop Header محسن */}
              <div className="hidden sm:block">
                {/* خلفية تدرجية */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20"></div>
                
                <div className="relative px-8 lg:px-12 py-8 lg:py-12">
                  {/* العنوان والتصنيف */}
                  <div className="text-center space-y-6">
                    {/* العنوان الرئيسي */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                      {article.title}
                    </h1>

                    {/* العنوان الفرعي */}
                    {getSubtitle() && (
                      <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-4xl mx-auto">
                        {getSubtitle()}
                      </h2>
                    )}

                    {/* التصنيف المميز */}
                    {article.category && (
                      <div className="flex justify-center">
                        <Link
                          href={`/categories/${article.category.slug}`}
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          {article.category.icon && (
                            <span className="text-lg">{article.category.icon}</span>
                          )}
                          <span>{article.category.name}</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* معلومات المقال في بطاقة */}
                  <div className="mt-8 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                      {/* المؤلف */}
                      {article.author && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">بقلم:</span>
                          <ReporterLink
                            author={article.author as any}
                            size="md"
                            showIcon={true}
                            showVerification={true}
                            className="font-medium"
                          />
                        </div>
                      )}

                      {/* الفاصل */}
                      <span className="text-gray-300 dark:text-gray-600">•</span>

                      {/* التاريخ */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatFullDate(article.published_at || article.created_at || "")}</span>
                      </div>

                      {/* الفاصل */}
                      <span className="text-gray-300 dark:text-gray-600">•</span>

                      {/* وقت القراءة */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{article.reading_time || calculateReadingTime(article.content || "")} دقيقة قراءة</span>
                      </div>

                      {/* المشاهدات */}
                      {article.views !== undefined && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <ArticleViews count={article.views} className="text-sm" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Header محسن ومتطور */}
              <div className="sm:hidden">
                {/* خلفية تدرجية للموبايل */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20"></div>
                
                <div className="relative px-4 py-6 space-y-4">
                  {/* العنوان الرئيسي */}
                  <div className="text-center">
                    <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white mb-3">
                      {article.title}
                    </h1>
                    
                    {/* العنوان الفرعي */}
                    {getSubtitle() && (
                      <h2 className="text-base leading-relaxed text-gray-600 dark:text-gray-300 font-normal">
                        {getSubtitle()}
                      </h2>
                    )}
                  </div>

                  {/* التصنيف للموبايل */}
                  {article.category && (
                    <div className="flex justify-center">
                      <Link
                        href={`/categories/${article.category.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      >
                        {article.category.icon && (
                          <span className="text-base">{article.category.icon}</span>
                        )}
                        <span>{article.category.name}</span>
                      </Link>
                    </div>
                  )}

                  {/* معلومات المقال للموبايل */}
                  <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                    {/* المؤلف */}
                    {article.author && (
                      <div className="flex items-center justify-center gap-2 mb-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">بقلم:</span>
                        <ReporterLink
                          author={article.author as any}
                          size="sm"
                          showIcon={true}
                          showVerification={true}
                          className="font-medium"
                        />
                      </div>
                    )}

                    {/* التاريخ ووقت القراءة والمشاهدات */}
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatRelativeDate(article.published_at || article.created_at || "")}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.reading_time || calculateReadingTime(article.content || "")} د</span>
                      </div>
                      {article.views !== undefined && (
                        <>
                          <span>•</span>
                          <ArticleViews count={article.views} className="text-xs" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </article>
        </div>

        {/* منطقة المحتوى المحسنة */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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

          {/* محتوى المقال المحسن */}
          <div className="mb-12">
            <div
              className={`prose max-w-none dark:prose-invert arabic-article-content
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
                prose-p:text-gray-800 dark:prose-p:text-gray-200
                prose-p:leading-relaxed prose-p:mb-6
                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                prose-blockquote:border-r-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                prose-blockquote:bg-blue-50/80 dark:prose-blockquote:bg-blue-900/20
                prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-lg prose-blockquote:shadow-sm
                prose-blockquote:not-italic prose-blockquote:font-medium
                prose-ul:space-y-2 prose-ol:space-y-2
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                ${isReading ? "prose-xl" : "prose-lg"}
              `}
              style={{
                fontSize: isReading ? '1.25rem' : '1.125rem',
                lineHeight: isReading ? '1.8' : '1.7',
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>

          {/* ستايلات محسنة للمحتوى العربي */}
          <style jsx>{`
            .arabic-article-content {
              direction: rtl !important;
              text-align: right !important;
              font-family: 'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif !important;
            }

            .arabic-article-content p {
              text-align: right !important;
              direction: rtl !important;
              margin-bottom: 1.5rem !important;
              text-indent: 2rem;
              color: #374151;
            }

            .dark .arabic-article-content p {
              color: #d1d5db;
            }

            .arabic-article-content h1,
            .arabic-article-content h2,
            .arabic-article-content h3,
            .arabic-article-content h4,
            .arabic-article-content h5,
            .arabic-article-content h6 {
              text-align: right !important;
              direction: rtl !important;
              margin: 2rem 0 1rem 0 !important;
              font-weight: 700 !important;
            }

            .arabic-article-content blockquote {
              text-align: right !important;
              direction: rtl !important;
              border-right: 4px solid #3b82f6 !important;
              border-left: none !important;
              margin: 1.5rem 0 !important;
              font-style: normal !important;
              padding: 1rem 1.5rem !important;
              background: rgba(59, 130, 246, 0.05) !important;
              border-radius: 0.5rem !important;
            }

            .arabic-article-content ul,
            .arabic-article-content ol {
              text-align: right !important;
              direction: rtl !important;
              padding-right: 2rem !important;
              padding-left: 0 !important;
            }

            .arabic-article-content li {
              text-align: right !important;
              direction: rtl !important;
              margin-bottom: 0.5rem !important;
            }

            .arabic-article-content img {
              margin: 2rem auto !important;
              border-radius: 1rem !important;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            }

            .arabic-article-content a {
              color: #2563eb !important;
              font-weight: 500 !important;
              transition: all 0.2s ease !important;
            }

            .arabic-article-content a:hover {
              color: #1d4ed8 !important;
              text-decoration: underline !important;
            }

            .dark .arabic-article-content a {
              color: #60a5fa !important;
            }

            .dark .arabic-article-content a:hover {
              color: #93c5fd !important;
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
