"use client";

import SafeDateDisplay from "@/components/article/SafeDateDisplay";
import ArticleViews from "@/components/ui/ArticleViews";
import { Badge } from "@/components/ui/badge";
import SmartImage from "@/components/ui/SmartImage";
import { formatDateGregorian } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface UniversalNewsCardProps {
  article: any; // يقبل أي نوع مقال/خبر
  viewMode?: "grid" | "list" | "compact";
  showExcerpt?: boolean;
  className?: string;
}

/**
 * مكون بطاقة أخبار شامل يحل مشكلة عدم ظهور الصور
 * يدعم جميع أنواع المقالات والأخبار مع استخراج ذكي للصور
 */
export default function UniversalNewsCard({
  article,
  viewMode = "grid",
  showExcerpt = true,
  className = "",
}: UniversalNewsCardProps) {
  if (!article) return null;

  // استخراج البيانات الأساسية
  const metadata = article.metadata || {};
  const isBreaking =
    article.breaking || metadata.isBreakingNews || metadata.breaking || false;
  const category = article.categories ||
    article.category ||
    metadata.category || { name: "عام", slug: "general" };

  // 🤖 AI-powered features
  const personalizedScore =
    article.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = article.is_personalized || personalizedScore > 75;
  const isTrending = article.views > 1000 && article.engagement_rate > 0.8;

  // 🎨 Enhanced category colors and icons
  const getCategoryStyle = (cat: any) => {
    const categoryMap: Record<string, { emoji: string; color: string }> = {
      تحليل: { emoji: "🧠", color: "purple" },
      اقتصاد: { emoji: "📊", color: "green" },
      رياضة: { emoji: "⚽", color: "blue" },
      تقنية: { emoji: "💻", color: "indigo" },
      سياسة: { emoji: "🏛️", color: "red" },
      ثقافة: { emoji: "🎭", color: "pink" },
      علوم: { emoji: "🔬", color: "cyan" },
      صحة: { emoji: "⚕️", color: "emerald" },
      سفر: { emoji: "✈️", color: "amber" },
      طعام: { emoji: "🍽️", color: "orange" },
      عام: { emoji: "📰", color: "gray" },
    };

    const categoryInfo = categoryMap[cat?.name] || categoryMap["عام"];
    return {
      ...categoryInfo,
      bgClass: `bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/20`,
      textClass: `text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-400`,
      borderClass: `border-${categoryInfo.color}-200 dark:border-${categoryInfo.color}-800`,
    };
  };

  const categoryStyle = getCategoryStyle(category);

  // رابط المقال
  const getArticleLink = (article: any) => {
    if (article.slug) return `/article/${article.slug}`;
    if (article.id) return `/article/${article.id}`;
    return "#";
  };

  // تاريخ النشر
  const publishDate = article.published_at || article.created_at;

  // تصنيف موحّد للفئات إلى رموز ألوان للبطاقات المكتبية
  const rawCategorySlug: string = (category?.slug || category?.name || "عام")
    .toString()
    .toLowerCase();
  const colorCategoryMap: Record<string, string> = {
    world: "world",
    sports: "sports",
    sport: "sports",
    tech: "tech",
    technology: "tech",
    business: "business",
    economy: "business",
    local: "local",
    opinions: "opinions",
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
    سياسة: "world",
    السياسة: "world",
    سياحة: "world",
    السياحة: "world",
    سيارات: "tech",
    السيارات: "tech",
    ميديا: "tech",
    الميديا: "tech",
    عام: "local",
    عامة: "local",
  };
  const mappedCategory = colorCategoryMap[rawCategorySlug] || rawCategorySlug;

  // حساب وقت القراءة
  const calculateReadingTime = (content: string | null) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // العرض المضغوط للموبايل
  if (viewMode === "compact") {
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article
          className={cn(
            "flex gap-3 p-3 rounded-xl transition-all duration-300 hover:shadow-md",
            isBreaking
              ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            className
          )}
        >
          {/* الصورة - استخدام SmartImage المحسن */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SmartImage
              src=""
              article={article}
              alt={article.title || "صورة المقال"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              fallbackType="article"
              sizes="80px"
            />
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* التصنيف والشارات */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full border",
                    categoryStyle.bgClass,
                    categoryStyle.textClass,
                    categoryStyle.borderClass
                  )}
                >
                  {categoryStyle.emoji} {category.name}
                </Badge>
              )}

              {isBreaking && (
                <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  عاجل
                </Badge>
              )}
            </div>

            {/* العنوان */}
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>

            {/* المعلومات الأساسية */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <SafeDateDisplay date={publishDate || ""} format="relative" />
              </div>

              {article.views !== undefined && (
                <>
                  <span>•</span>
                  <ArticleViews count={article.views} className="text-xs" />
                </>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // العرض العادي والقائمة
  if (viewMode === "list") {
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article
          className={cn(
            "rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6",
            isBreaking
              ? "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800"
              : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            className
          )}
        >
          {/* الصورة */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SmartImage
              src=""
              article={article}
              alt={article.title || "صورة المقال"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              fallbackType="article"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 192px"
            />
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* التصنيف والشارات */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border",
                    categoryStyle.bgClass,
                    categoryStyle.textClass,
                    categoryStyle.borderClass
                  )}
                >
                  {categoryStyle.emoji} {category.name}
                </Badge>
              )}

              {isBreaking && (
                <Badge className="bg-red-600 text-white text-sm px-3 py-1 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  عاجل
                </Badge>
              )}

              {isPersonalized && (
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  مخصص لك
                </Badge>
              )}

              {isTrending && (
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs px-2 py-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  ترندينغ
                </Badge>
              )}
            </div>

            {/* العنوان */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h2>

            {/* المقتطف */}
            {showExcerpt && (article.excerpt || article.summary) && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                {article.excerpt || article.summary}
              </p>
            )}

            {/* المعلومات الأساسية */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateGregorian(publishDate)}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.reading_time ||
                  calculateReadingTime(article.content || "")}{" "}
                د
              </div>

              {article.views !== undefined && (
                <ArticleViews count={article.views} className="text-sm" />
              )}

              {article.comments_count !== undefined && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  {article.comments_count}
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // العرض الشبكي (Grid) - الافتراضي
  return (
    <Link href={getArticleLink(article)} className="group block h-full">
      <article
        className={cn(
          "rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col",
          isBreaking
            ? "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          className
        )}
      >
        {/* الصورة */}
        <div className="relative h-48 sm:h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <SmartImage
            src=""
            article={article}
            alt={article.title || "صورة المقال"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            fallbackType="article"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* شارات على الصورة */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isBreaking && (
              <Badge className="bg-red-600 text-white text-xs px-2 py-1 animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                عاجل
              </Badge>
            )}
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-6 flex-1 flex flex-col">
          {/* التصنيف والشارات */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {category && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border",
                  categoryStyle.bgClass,
                  categoryStyle.textClass,
                  categoryStyle.borderClass
                )}
              >
                {categoryStyle.emoji} {category.name}
              </Badge>
            )}

            {isPersonalized && (
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                مخصص
              </Badge>
            )}

            {isTrending && (
              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs px-2 py-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                ترندينغ
              </Badge>
            )}
          </div>

          {/* العنوان */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
            {article.title}
          </h2>

          {/* المقتطف */}
          {showExcerpt && (article.excerpt || article.summary) && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
              {article.excerpt || article.summary}
            </p>
          )}

          {/* المعلومات الأساسية */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <SafeDateDisplay date={publishDate || ""} format="relative" />
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.reading_time ||
                  calculateReadingTime(article.content || "")}{" "}
                د
              </div>
            </div>

            {article.views !== undefined && (
              <ArticleViews count={article.views} className="text-sm" />
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
