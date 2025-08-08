"use client";

import ReporterLink from "@/components/ReporterLink";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useViewTracking } from "@/hooks/useViewTracking";
import { ArticleData } from "@/lib/article-api";
import { formatDateNumeric } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  Award,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Quote,
  Share2,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CommentsSection from "@/components/article/CommentsSection";
import { SmartInteractionButtons } from "../article/SmartInteractionButtons";

interface MobileOpinionLayoutProps {
  article: ArticleData;
}

export default function MobileOpinionLayout({
  article,
}: MobileOpinionLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const { elementRef } = useViewTracking({ articleId: article.id });
  const [readingProgress, setReadingProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // تتبع المشاهدات عبر elementRef

  // تتبع تقدم القراءة مع تحسين للموبايل
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);

      const element = viewTrackingRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      const scrolled = Math.max(0, windowHeight - rect.top);
      const progress = Math.min(100, (scrolled / elementHeight) * 100);

      setReadingProgress(progress);

      // إخفاء مؤشر التمرير بعد توقفه
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const getArticleTypeArabic = (type: string) => {
    const types = {
      opinion: "رأي",
      analysis: "تحليل",
      editorial: "افتتاحية",
      commentary: "تعليق",
      column: "عمود",
    };
    return types[type as keyof typeof types] || "رأي";
  };

  // تعيين التصنيف للّون
  const categoryName =
    article?.category?.name || article?.category_name || "عام";
  const rawCategorySlug =
    categoryName?.toLowerCase?.() || article?.category?.slug || "عام";
  const categoryMap: Record<string, string> = {
    world: "world",
    sports: "sports",
    tech: "tech",
    technology: "tech",
    business: "business",
    economy: "business",
    local: "local",
    news: "local",
    opinion: "opinions",
    // عربية
    العالم: "world",
    سياسة: "world",
    الرياضة: "sports",
    رياضة: "sports",
    تقنية: "tech",
    اقتصاد: "business",
    محليات: "local",
    عام: "local",
    عامة: "local",
  };
  const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

  return (
    <>
      {/* شريط تقدم القراءة - محسن للموبايل */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50 transition-opacity duration-300 ${
          isScrolling ? "opacity-100" : "opacity-50"
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } pt-0`}
      >
        <article
          ref={elementRef as any}
          dir="rtl"
          data-category={mappedCategory}
          className="relative"
        >
          {/* رأس المقال المحمول */}
          <header className="px-4 py-6 relative">
            {/* خلفية متدرجة */}
            <div
              className={`absolute inset-0 ${
                darkMode
                  ? "bg-gradient-to-b from-gray-800/80 to-gray-900"
                  : "bg-gradient-to-b from-white/90 to-gray-50"
              }`}
            />

            <div className="relative z-10">
              {/* لابل التصنيف */}
              <div className="mb-3">
                <span className="category-pill">
                  {article.category?.name || categoryName}
                </span>
              </div>

              {/* العنوان */}
              <h1
                className={`text-xl sm:text-2xl font-bold leading-tight mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                } text-right`}
              >
                {article.title}
              </h1>

              {/* العنوان الفرعي */}
              {article.excerpt && (
                <h2
                  className={`text-base leading-relaxed mb-6 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } text-right`}
                >
                  {article.excerpt}
                </h2>
              )}

              {/* سطر ميتاداتا موحد */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } mb-4`}
              >
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDateNumeric(article.published_at as any)}
                </span>
                <span className="mx-1">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {article.reading_time || 5}{" "}
                  دقائق
                </span>
                <span className="mx-1">•</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {new Intl.NumberFormat("ar", { notation: "compact" }).format(
                    article.views || 0
                  )}
                </span>
                {article.featured && (
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                    <Star className="w-3 h-3" /> مميز
                  </span>
                )}
              </div>

              {/* شريط قابل للطي لإظهار التعليقات (موبايل) */}
              <div className="mb-5">
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
                  className={`w-full rounded-xl border px-4 py-3 ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-700"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
                  } transition-colors`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {new Intl.NumberFormat("ar").format(article.views || 0)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {new Intl.NumberFormat("ar").format(article.likes || 0)}
                      </span>
                      {typeof article.shares === "number" && (
                        <span className="inline-flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          {new Intl.NumberFormat("ar").format(article.shares || 0)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">التعليقات</span>
                      <span>({new Intl.NumberFormat("ar").format(article.comments_count || 0)})</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* معلومات الكاتب - تصميم موبايل محسن */}
              <div
                className={`rounded-2xl p-4 backdrop-blur-sm border ${
                  darkMode
                    ? "bg-gray-800/60 border-gray-700/50"
                    : "bg-white/80 border-gray-200/50"
                } shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  {/* صورة الكاتب */}
                  <div className="relative flex-shrink-0">
                    {article.author?.reporter?.avatar_url ? (
                      <div className="relative">
                        <Image
                          src={article.author.reporter.avatar_url}
                          alt={article.author.name}
                          width={50}
                          height={50}
                          className="rounded-full object-cover border-2 border-white dark:border-gray-600"
                        />
                        {/* شارة التحقق */}
                        {article.author.reporter.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                            <Award className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-600 ${
                          darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* معلومات الكاتب */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ReporterLink
                        author={article.author as any}
                        size="md"
                        showIcon={false}
                        showVerification={true}
                        className={`font-bold text-base truncate ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      />
                    </div>

                    {/* منصب الكاتب */}
                    {article.author?.reporter?.title && (
                      <p
                        className={`text-sm font-medium mb-1 truncate ${
                          darkMode ? "text-blue-300" : "text-blue-600"
                        }`}
                      >
                        {article.author.reporter.title}
                      </p>
                    )}

                    {/* معلومات النشر */}
                    <div
                      className={`flex items-center gap-3 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {/* تم نقل التاريخ لسطر الميتاداتا العلوي */}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.reading_time || 5} دقائق
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* خط سفلي بلون التصنيف */}
              <div className="category-underline" aria-hidden />
            </div>
          </header>

          {/* المحتوى الرئيسي */}
          <div className="px-4 pb-8">
            {/* محتوى المقال */}
            <div
              className={cn(
                "prose prose-sm max-w-none mb-6 text-right leading-relaxed",
                darkMode ? "prose-invert" : ""
              )}
            >
              <div
                className={cn(
                  "text-base leading-relaxed",
                  darkMode ? "text-gray-300" : "text-gray-800"
                )}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* اقتباسات مهمة - موبايل */}
            {article.key_quotes?.length > 0 && (
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Quote className="w-4 h-4" />
                  اقتباسات مهمة
                </h3>
                <div className="space-y-3">
                  {article.key_quotes.slice(0, 2).map((quote, index) => (
                    <blockquote
                      key={index}
                      className={cn(
                        "border-r-4 border-blue-500 pr-4 py-3 text-sm italic rounded-lg",
                        darkMode
                          ? "bg-gray-800/50 text-gray-300"
                          : "bg-blue-50 text-gray-700"
                      )}
                    >
                      <Quote className="w-4 h-4 text-blue-500 mb-1" />"{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* شريط التفاعل - موبايل محسن */}
            <div className="mb-6">
              <SmartInteractionButtons
                articleId={article.id}
                initialStats={{
                  likes: article.likes || 0,
                  saves: article.saves || 0,
                  shares: article.shares || 0,
                  comments: article.comments_count || 0,
                }}
                onComment={() => {
                  console.log("تم النقر على التعليقات");
                }}
              />
            </div>

            {/* بطاقة الكاتب المصغرة */}
            <div
              className={`rounded-2xl p-4 mb-6 ${
                darkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h3
                className={`text-base font-bold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                المزيد عن الكاتب
              </h3>
              <div className="flex items-start gap-3">
                {article.author?.reporter?.avatar_url && (
                  <Image
                    src={article.author.reporter.avatar_url}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {article.author?.name}
                  </h4>
                  {article.author?.reporter?.bio && (
                    <p
                      className={`text-sm leading-relaxed mb-2 line-clamp-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {article.author.reporter.bio}
                    </p>
                  )}
                  <Link
                    href={`/reporter/${article.author?.reporter?.slug}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <User className="w-3 h-3" />
                    ملف الكاتب
                  </Link>
                </div>
              </div>
            </div>

            {/* الكلمات المفتاحية - موبايل */}
            {(article.tags?.length > 0 || article.topics?.length > 0) && (
              <div className="mb-6">
                <h3
                  className={`text-base font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  المواضيع ذات الصلة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags?.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        darkMode
                          ? "bg-blue-900/20 text-blue-300 border border-blue-700/50"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.topics?.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        darkMode
                          ? "bg-purple-900/20 text-purple-300 border border-purple-700/50"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* قسم التعليقات يظهر أسفل الشريط عند التفعيل */}
          {showComments && <CommentsSection articleId={article.id} />}

          {/* شريط ثابت في الأسفل للإجراءات السريعة */}
          <div
            className={`fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm border-t ${
              darkMode
                ? "bg-gray-900/90 border-gray-700"
                : "bg-white/90 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <button
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowComments(true);
                  setTimeout(() => {
                    const el = document.getElementById("comments");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* مساحة فارغة في الأسفل لتجنب تداخل الشريط الثابت */}
          <div className="h-20"></div>
        </article>
      </main>
    </>
  );
}
