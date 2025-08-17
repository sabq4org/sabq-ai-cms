"use client";


import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { ArticleData } from "@/lib/article-api";
import { formatFullDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Award,
  Bookmark,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface EnhancedOpinionLayoutProps {
  article: ArticleData;
}

export default function EnhancedOpinionLayout({
  article,
}: EnhancedOpinionLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  // حساب تقدم القراءة
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
      setIsFloatingVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // حساب وقت القراءة
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(" ").length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime =
    article.reading_time || calculateReadingTime(article.content || "");
  const publishedDate = article.published_at || article.created_at || "";

  return (
    <>
      <div
        className={cn(
          "min-h-[100svh] transition-colors duration-300",
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
        )}
      >
        {/* شريط التقدم في القراءة */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* التنقل العائم */}
        {isFloatingVisible && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={cn(
                "w-12 h-12 rounded-full backdrop-blur-sm border shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
                darkMode
                  ? "bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80"
                  : "bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50/80"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        )}

        <main className="container mx-auto px-4 pt-16 sm:pt-20 lg:pt-24 pb-8 max-w-4xl">
          {/* رأس المقال المحسن */}
          <header
            className={cn(
              "rounded-2xl backdrop-blur-sm border mb-8 overflow-hidden",
              darkMode
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white/70 border-white/20 shadow-xl"
            )}
          >
            {/* صورة المقال المميزة */}
            {article.featured_image && (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* شارات المقال */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500 text-white backdrop-blur-sm">
                    مقال رأي
                  </span>
                  {article.metadata?.featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white backdrop-blur-sm">
                      مميز
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* فئة المقال */}
              {article.category && (
                <div className="mb-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                      darkMode
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    {article.category.name}
                  </span>
                </div>
              )}

              {/* عنوان المقال */}
              <h1
                className={cn(
                  "text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                {article.title}
              </h1>

              {/* العنوان الفرعي */}
              {(article.subtitle || article.excerpt) && (
                <p
                  className={cn(
                    "text-lg md:text-xl leading-relaxed mb-6 font-medium",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}
                >
                  {article.subtitle || article.excerpt}
                </p>
              )}

              {/* معلومات المقال */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* تاريخ النشر */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {publishedDate ? formatFullDate(publishedDate) : "غير محدد"}
                  </span>
                </div>

                {/* وقت القراءة */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {readingTime} دقائق قراءة
                  </span>
                </div>

                {/* عدد المشاهدات */}
                {article.views && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {new Intl.NumberFormat("ar-SA").format(article.views)}{" "}
                      مشاهدة
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-3">
              {/* معلومات الكاتب */}
              {article.author && (
                <div
                  className={cn(
                    "rounded-xl p-6 mb-8 backdrop-blur-sm border",
                    darkMode
                      ? "bg-gray-800/50 border-gray-700/50"
                      : "bg-white/70 border-white/20 shadow-lg"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* صورة الكاتب */}
                    <div className="relative">
                      {article.author.avatar ? (
                        <div className="relative">
                          <Image
                            src={article.author.avatar}
                            alt={article.author.name}
                            width={64}
                            height={64}
                            className="rounded-full object-cover border-3 border-white dark:border-gray-700"
                          />
                          {article.author.reporter?.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center border-2",
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-gray-400"
                              : "bg-gray-200 border-gray-300 text-gray-600"
                          )}
                        >
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* معلومات الكاتب */}
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold text-lg",
                          darkMode ? "text-white" : "text-gray-900"
                        )}
                      >
                        {article.author.name}
                      </h3>
                      {article.author.reporter?.full_name && (
                        <p
                          className={cn(
                            "text-sm",
                            darkMode ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          {article.author.reporter.full_name}
                        </p>
                      )}

                      {/* شارة التحقق */}
                      {article.author.reporter?.is_verified && (
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-blue-500 font-medium">
                            كاتب معتمد
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى المقال */}
              <article
                className={cn(
                  "rounded-xl p-6 md:p-8 backdrop-blur-sm border",
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/70 border-white/20 shadow-lg"
                )}
              >
                <div
                  className={cn(
                    "prose prose-lg max-w-none",
                    darkMode
                      ? "prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-blockquote:text-gray-300 prose-blockquote:border-blue-500"
                      : "prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-blockquote:border-blue-500"
                  )}
                >
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof article.content === "string"
                          ? article.content
                          : "<p>المحتوى غير متوفر.</p>",
                    }}
                  />
                </div>
              </article>

              {/* أزرار التفاعل */}
              <div
                className={cn(
                  "rounded-xl p-6 mt-8 backdrop-blur-sm border",
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/70 border-white/20 shadow-lg"
                )}
              >
                <div className="flex items-center justify-center gap-6">
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                      darkMode
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-red-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
                    )}
                  >
                    <Heart className="w-5 h-5" />
                    <span>{article.likes || 0}</span>
                  </button>

                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                      darkMode
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-blue-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-blue-500"
                    )}
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>{article.saves || 0}</span>
                  </button>

                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                      darkMode
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-green-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-green-500"
                    )}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{article.shares || 0}</span>
                  </button>

                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                      darkMode
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-purple-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-purple-500"
                    )}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{article.comments_count || 0}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="lg:col-span-1 space-y-6">
              {/* معلومات سريعة */}
              <div
                className={cn(
                  "rounded-xl p-4 backdrop-blur-sm border",
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/70 border-white/20 shadow-lg"
                )}
              >
                <h3
                  className={cn(
                    "font-semibold mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  معلومات المقال
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      الفئة:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {article.category?.name || "عام"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      وقت القراءة:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {readingTime} دقائق
                    </span>
                  </div>

                  {article.views && (
                    <div className="flex justify-between">
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        المشاهدات:
                      </span>
                      <span
                        className={darkMode ? "text-white" : "text-gray-900"}
                      >
                        {new Intl.NumberFormat("ar-SA").format(article.views)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* الكلمات المفتاحية */}
              {article.keywords &&
                Array.isArray(article.keywords) &&
                article.keywords.length > 0 && (
                  <div
                    className={cn(
                      "rounded-xl p-4 backdrop-blur-sm border",
                      darkMode
                        ? "bg-gray-800/50 border-gray-700/50"
                        : "bg-white/70 border-white/20 shadow-lg"
                    )}
                  >
                    <h3
                      className={cn(
                        "font-semibold mb-4",
                        darkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      الكلمات المفتاحية
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(article.keywords) &&
                        article.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              darkMode
                                ? "bg-gray-700/50 text-gray-300 border border-gray-600"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            )}
                          >
                            #
                            {typeof keyword === "string"
                              ? keyword
                              : String(keyword)}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </main>

        {/* أنماط إضافية للمحتوى العربي */}
        <style jsx global>{`
          .article-content {
            direction: rtl;
            text-align: right;
          }

          .article-content p {
            text-align: right !important;
            direction: rtl !important;
            margin-bottom: 1.5rem;
            line-height: 1.8;
          }

          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4,
          .article-content h5,
          .article-content h6 {
            text-align: right !important;
            direction: rtl !important;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }

          .article-content blockquote {
            text-align: right !important;
            direction: rtl !important;
            border-right: 4px solid rgb(59, 130, 246) !important;
            border-left: none !important;
            padding-right: 1rem !important;
            padding-left: 0 !important;
            margin: 2rem 0;
            font-style: italic;
          }

          .article-content ul,
          .article-content ol {
            text-align: right !important;
            direction: rtl !important;
          }
        `}</style>
      </div>
    </>
  );
}
