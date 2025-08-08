"use client";

import ReporterLink from "@/components/ReporterLink";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useViewTracking } from "@/hooks/useViewTracking";
import { ArticleData } from "@/lib/article-api";
import { formatDateNumeric, formatFullDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Quote,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLatestArticles from "./AuthorLatestArticles";
import { SmartInteractionButtons } from "./SmartInteractionButtons";
import TrendingArticles from "./TrendingArticles";

interface OpinionArticleLayoutProps {
  article: ArticleData;
}

export default function OpinionArticleLayout({
  article,
}: OpinionArticleLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const { elementRef } = useViewTracking({ articleId: article.id });
  const [readingProgress, setReadingProgress] = useState(0);

  // تتبع المشاهدات عبر elementRef القادم من الهوك

  // تتبع تقدم القراءة
  useEffect(() => {
    const handleScroll = () => {
      const element = viewTrackingRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      const scrolled = Math.max(0, windowHeight - rect.top);
      const progress = Math.min(100, (scrolled / elementHeight) * 100);

      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getArticleTypeArabic = (type: string) => {
    const types = {
      opinion: "مقال رأي",
      analysis: "تحليل",
      editorial: "افتتاحية",
      commentary: "تعليق",
      column: "عمود",
    };
    return types[type as keyof typeof types] || "مقال رأي";
  };

  // تعيين التصنيف للهوية اللونية
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
    politics: "world",
    travel: "world",
    cars: "tech",
    media: "tech",
    opinion: "opinions",
    // عربية
    العالم: "world",
    سياسة: "world",
    الرياضة: "sports",
    رياضة: "sports",
    تقنية: "tech",
    تكنولوجيا: "tech",
    اقتصاد: "business",
    أعمال: "business",
    محليات: "local",
    عام: "local",
    عامة: "local",
  };
  const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

  return (
    <>
      {/* شريط تقدم القراءة */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } pt-0 sm:pt-[64px]`}
      >
        <div className="relative">
          <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* المحتوى الرئيسي */}
              <article
                ref={elementRef as any}
                dir="rtl"
                data-category={mappedCategory}
                className="lg:col-span-8 relative"
              >
                {/* رأس المقال */}
                <header className="mb-8 px-4 sm:px-6 lg:px-8">
                  {/* لابل التصنيف */}
                  <div className="mb-3">
                    <span className="category-pill">
                      {article.category?.name || categoryName}
                    </span>
                  </div>

                  {/* العنوان الرئيسي */}
                  <h1
                    className={`text-3xl lg:text-4xl font-extrabold leading-snug mb-3 ${
                      darkMode ? "text-white" : "text-gray-900"
                    } text-right`}
                  >
                    {article.title}
                  </h1>

                  {/* سطر ميتاداتا موحّد: اسم المراسل • التاريخ • مدة القراءة • عدد المشاهدة */}
                  <div
                    className={`flex items-center gap-3 text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {article.author && (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <ReporterLink
                            author={article.author as any}
                            size="sm"
                            showIcon={false}
                            showVerification={true}
                            className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          />
                        </span>
                        <span className="mx-1">•</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateNumeric(article.published_at as any)}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.reading_time || 5} دقائق
                    </span>
                    <span className="mx-1">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {new Intl.NumberFormat("ar", {
                        notation: "compact",
                      }).format(article.views || 0)}
                    </span>
                    {article.featured && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                        <Star className="w-3 h-3" /> مميز
                      </span>
                    )}
                  </div>

                  {/* العنوان الفرعي */}
                  {article.excerpt && (
                    <p
                      className={`mt-4 text-lg leading-relaxed ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {article.excerpt}
                    </p>
                  )}

                  {/* معلومات الكاتب */}
                  <div
                    className={`rounded-2xl p-6 border mt-6 ${
                      darkMode
                        ? "bg-gray-800/40 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Desktop Author Section */}
                    <div className="hidden sm:flex items-center gap-6">
                      {/* صورة الكاتب */}
                      <div className="flex-shrink-0">
                        {article.author?.reporter?.avatar_url ? (
                          <div className="relative">
                            <Image
                              src={article.author.reporter.avatar_url}
                              alt={article.author.name}
                              width={100}
                              height={100}
                              className="rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30"
                            />
                            {/* شارة التحقق */}
                            {article.author.reporter.is_verified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                <Award className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30 ${
                              darkMode
                                ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                            }`}
                          >
                            <User className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      {/* معلومات الكاتب */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ReporterLink
                            author={article.author as any}
                            size="lg"
                            showIcon={false}
                            showVerification={true}
                            className={`text-xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          />
                        </div>

                        {/* منصب الكاتب */}
                        {article.author?.reporter?.title && (
                          <p
                            className={`text-lg font-medium mb-2 ${
                              darkMode ? "text-blue-300" : "text-blue-600"
                            }`}
                          >
                            {article.author.reporter.title}
                          </p>
                        )}

                        {/* وصف مختصر */}
                        {article.author?.reporter?.bio && (
                          <p
                            className={`text-sm leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {article.author.reporter.bio}
                          </p>
                        )}

                        {/* إحصائيات الكاتب */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span
                            className={`flex items-center gap-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                            {article.author?.reporter?.total_articles ||
                              "عدة"}{" "}
                            مقالات
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            {new Intl.NumberFormat("ar", {
                              notation: "compact",
                            }).format(
                              article.author?.reporter?.total_views || 0
                            )}
                          </span>
                        </div>
                      </div>

                      {/* معلومات النشر */}
                      <div
                        className={`text-right ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDateNumeric(article.published_at as any)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />{" "}
                            {article.reading_time || 5} دقائق
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {new Intl.NumberFormat("ar", {
                              notation: "compact",
                            }).format(article.views || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Author Section */}
                    <div className="sm:hidden">
                      {/* صورة الكاتب والاسم */}
                      <div className="flex items-center gap-4 mb-4">
                        {article.author?.reporter?.avatar_url ? (
                          <div className="relative">
                            <Image
                              src={article.author.reporter.avatar_url}
                              alt={article.author.name}
                              width={60}
                              height={60}
                              className="rounded-full object-cover border-3 border-white dark:border-gray-600 shadow-md"
                            />
                            {article.author.reporter.is_verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                <Award className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-15 h-15 rounded-full flex items-center justify-center border-3 border-white dark:border-gray-600 shadow-md ${
                              darkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            <User className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1">
                          <ReporterLink
                            author={article.author as any}
                            size="md"
                            showIcon={false}
                            showVerification={true}
                            className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          />
                          {article.author?.reporter?.title && (
                            <p
                              className={`text-sm font-medium ${
                                darkMode ? "text-blue-300" : "text-blue-600"
                              }`}
                            >
                              {article.author.reporter.title}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* معلومات النشر - موبايل */}
                      <div
                        className={`flex items-center justify-between text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatFullDate(new Date(article.published_at))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{article.reading_time || 5} دقائق</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* خط سفلي بلون التصنيف */}
                  <div className="category-underline" aria-hidden />
                </header>

                {/* المحتوى الرئيسي */}
                <div className="px-4 sm:px-6 lg:px-8">
                  {/* محتوى المقال */}
                  <div
                    className={cn(
                      "prose prose-lg max-w-3xl mx-auto mb-8 text-right",
                      darkMode ? "prose-invert" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "leading-relaxed text-lg arabic-content",
                        darkMode ? "text-gray-300" : "text-gray-800"
                      )}
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>

                  {/* إصلاح التوجه العربي للمحتوى */}
                  <style jsx>{`
                    .arabic-content p {
                      text-align: right !important;
                      direction: rtl !important;
                    }

                    .arabic-content * {
                      text-align: right !important;
                      direction: rtl !important;
                    }

                    .arabic-content h1,
                    .arabic-content h2,
                    .arabic-content h3,
                    .arabic-content h4,
                    .arabic-content h5,
                    .arabic-content h6 {
                      text-align: right !important;
                      direction: rtl !important;
                    }
                  `}</style>

                  {/* اقتباسات مهمة (إذا كانت متوفرة) */}
                  {article.key_quotes?.length > 0 && (
                    <div className="mb-8">
                      <h3
                        className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <Quote className="w-5 h-5" />
                        اقتباسات مهمة
                      </h3>
                      <div className="space-y-4">
                        {article.key_quotes.map((quote, index) => (
                          <blockquote
                            key={index}
                            className={cn(
                              "border-r-4 border-blue-500 pr-6 py-4 italic text-lg rounded-lg",
                              darkMode
                                ? "bg-gray-800/50 text-gray-300"
                                : "bg-blue-50 text-gray-700"
                            )}
                          >
                            <Quote className="w-6 h-6 text-blue-500 mb-2" />"
                            {quote}"
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* شريط التفاعل */}
                  <div className="mb-8">
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

                  {/* معلومات إضافية عن الكاتب */}
                  <div
                    className={`rounded-xl p-6 mb-8 ${
                      darkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold mb-4 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      عن الكاتب
                    </h3>
                    <div className="flex items-start gap-4">
                      {article.author?.reporter?.avatar_url && (
                        <Image
                          src={article.author.reporter.avatar_url}
                          alt={article.author.name}
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4
                          className={`font-bold mb-2 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {article.author?.name}
                        </h4>
                        {article.author?.reporter?.bio && (
                          <p
                            className={`text-sm leading-relaxed mb-3 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {article.author.reporter.bio}
                          </p>
                        )}
                        <Link
                          href={`/reporter/${article.author?.reporter?.slug}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <User className="w-4 h-4" />
                          عرض ملف الكاتب الكامل
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* الكلمات المفتاحية */}
                  {(article.tags?.length > 0 || article.topics?.length > 0) && (
                    <div className="mb-8">
                      <h3
                        className={`text-lg font-bold mb-4 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        الكلمات المفتاحية والمواضيع
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              darkMode
                                ? "bg-blue-900/20 text-blue-300 border border-blue-700"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                        {article.topics?.map((topic, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              darkMode
                                ? "bg-purple-900/20 text-purple-300 border border-purple-700"
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
              </article>

              {/* القائمة الجانبية - مخفية في الموبايل */}
              <aside className="hidden lg:block lg:col-span-4">
                <div className="space-y-6">
                  {/* آخر مقالات الكاتب */}
                  {article.author?.id && (
                    <AuthorLatestArticles
                      authorId={article.author.id}
                      authorName={article.author.name}
                      currentArticleId={article.id}
                      limit={5}
                    />
                  )}

                  {/* أكثر المقالات قراءة */}
                  <TrendingArticles
                    currentArticleId={article.id}
                    limit={5}
                    timeframe="week"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
