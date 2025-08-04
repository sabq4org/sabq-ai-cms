"use client";

import ReporterLink from "@/components/ReporterLink";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useViewTracking } from "@/hooks/useViewTracking";
import { ArticleData } from "@/lib/article-api";
import { formatFullDate } from "@/lib/date-utils";
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
import { useEffect, useRef, useState } from "react";
import { SmartInteractionButtons } from "./SmartInteractionButtons";
import AuthorLatestArticles from "./AuthorLatestArticles";
import TrendingArticles from "./TrendingArticles";

interface OpinionArticleLayoutProps {
  article: ArticleData;
}

export default function OpinionArticleLayout({
  article,
}: OpinionArticleLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const viewTrackingRef = useRef<HTMLDivElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  // تتبع المشاهدات
  useViewTracking(viewTrackingRef, article.id);

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
                ref={viewTrackingRef}
                className="lg:col-span-8"
              >
            {/* رأس المقال - محسن للمحمول */}
            <header className="mb-8 px-4 sm:px-6 lg:px-8">
              {/* التصنيف والشارات */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode
                      ? "bg-purple-900/20 text-purple-300 border border-purple-700"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  <Quote className="w-4 h-4 mr-2" />
                  {getArticleTypeArabic(article.article_type || "opinion")}
                </span>

                {article.featured && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      darkMode
                        ? "bg-yellow-900/20 text-yellow-300 border border-yellow-700"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    مميز
                  </span>
                )}

                {article.category && (
                  <Link
                    href={`/categories/${article.category.slug}`}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {article.category.icon && (
                      <span className="mr-2">{article.category.icon}</span>
                    )}
                    {article.category.name}
                  </Link>
                )}
              </div>

              {/* العنوان الرئيسي */}
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                } text-right`}
              >
                {article.title}
              </h1>

              {/* العنوان الفرعي */}
              {article.excerpt && (
                <h2
                  className={`text-lg sm:text-xl leading-relaxed mb-8 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } text-right`}
                >
                  {article.excerpt}
                </h2>
              )}

              {/* معلومات الكاتب - المنطقة الأهم */}
              <div
                className={`bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl p-8 border shadow-lg ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } mb-8`}
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
                        {article.author?.reporter?.total_articles || "عدة"}{" "}
                        مقالات
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {article.author?.reporter?.total_views
                          ? `${(
                              article.author.reporter.total_views / 1000
                            ).toFixed(0)}K`
                          : "عدة آلاف"}{" "}
                        قارئ
                      </span>
                    </div>
                  </div>

                  {/* معلومات النشر */}
                  <div
                    className={`text-right ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatFullDate(new Date(article.published_at))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {article.reading_time || 5} دقائق قراءة
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        {article.views?.toLocaleString() || 0} مشاهدة
                      </span>
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
            </header>

            {/* المحتوى الرئيسي */}
            <div className="px-4 sm:px-6 lg:px-8">
              {/* محتوى المقال */}
              <div
                className={cn(
                  "prose prose-lg max-w-none mb-8 text-right",
                  darkMode ? "prose-invert" : ""
                )}
              >
                <div
                  className={cn(
                    "leading-relaxed text-lg",
                    darkMode ? "text-gray-300" : "text-gray-800"
                  )}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

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
                        <Quote className="w-6 h-6 text-blue-500 mb-2" />"{quote}
                        "
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
