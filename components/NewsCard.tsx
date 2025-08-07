"use client";

import SafeImage from "@/components/ui/SafeImage";
import { Badge } from "@/components/ui/badge";
import { formatDateNumeric } from "@/lib/date-utils";
import { getImageUrl } from "@/lib/image-utils";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { cn } from "@/lib/utils";
import { Calendar, Eye, Zap } from "lucide-react";
import Link from "next/link";

interface NewsCardProps {
  news: any;
  viewMode?: "grid" | "list";
}

export default function NewsCard({ news, viewMode = "grid" }: NewsCardProps) {
  // Get article metadata
  const metadata = news.metadata || {};
  const isBreaking =
    news.breaking || metadata.isBreakingNews || metadata.breaking || false;
  const category = news.categories ||
    news.category ||
    metadata.category || { name: "عام", slug: "general" };

  // 🤖 AI-powered features
  const personalizedScore =
    news.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = news.is_personalized || personalizedScore > 75;
  const isTrending = news.views > 1000 && news.engagement_rate > 0.8;
  const interactionCount =
    (news.views || 0) + (news.likes || 0) + (news.shares || 0);

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

  // تحسين رابط الصورة - دعم جميع أشكال الصور
  const rawImageUrl =
    news.image_url || news.featured_image || news.image || metadata.image;

  // استخدام معالج الإنتاج في بيئة الإنتاج - استخدام تحديد أكثر موثوقية للإنتاج
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      !window.location.hostname.includes("192.168.") &&
      !window.location.hostname.includes("dev-"));

  const imageUrl = rawImageUrl
    ? isProduction
      ? getProductionImageUrl(rawImageUrl, {
          width: viewMode === "list" ? 400 : 800,
          height: viewMode === "list" ? 300 : 600,
          quality: 85,
          fallbackType: "article",
        })
      : getImageUrl(rawImageUrl, {
          width: viewMode === "list" ? 400 : 800,
          height: viewMode === "list" ? 300 : 600,
          quality: 85,
          format: "webp",
          fallbackType: "article",
        })
    : null;

  // Article link
  const getArticleLink = (news: any) => {
    if (news.slug) return `/article/${news.slug}`;
    if (news.id) return `/article/${news.id}`;
    return "#";
  };

  // Publish date
  const publishDate = news.published_at || news.created_at;

  // تصنيف موحّد لفئات الألوان
  const rawCategorySlug: string = (category?.slug || category?.name || "عام")
    .toString()
    .toLowerCase();
  const categoryMap: Record<string, string> = {
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
  const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

  if (viewMode === "list") {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(news)} className="block">
        <article
          className={cn(
            "relative rounded-3xl shadow-sm transition-all duration-300 p-6 flex gap-6",
            isBreaking
              ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          )}
          dir="rtl"
          data-category={mappedCategory}
        >
          {/* Image محسنة للأداء */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SafeImage
              src={imageUrl || ""}
              alt={news.title || "صورة المقال"}
              fill
              className="object-cover transition-transform duration-500"
              fallbackType="article"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* لابل التصنيف */}
            <div className="mb-2">
              {category && (
                <span className="category-pill">{category.name}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-4 mb-2 flex-1 leading-snug">
              {news.title}
            </h3>

            {/* سطر واحد: التاريخ + المشاهدات */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <time
                dateTime={publishDate}
                className="inline-flex items-center gap-1"
              >
                <Calendar className="w-4 h-4" />
                {formatDateNumeric(publishDate)}
              </time>
              <span className="mx-1">•</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {new Intl.NumberFormat("ar", { notation: "compact" }).format(
                  news.views ?? news.views_count ?? 0
                )}
              </span>
            </div>
          </div>
          <div className="category-underline" aria-hidden />
        </article>
      </Link>
    );
  }

  // Grid View - البطاقة الافتراضية
  return (
    <Link href={getArticleLink(news)} className="block h-full">
      <article
        className={cn(
          "relative rounded-2xl shadow-sm transition-all duration-300 overflow-hidden h-full flex flex-col",
          isBreaking
            ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}
        dir="rtl"
        data-category={mappedCategory}
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <SafeImage
            src={imageUrl || ""}
            alt={news.title || "صورة المقال"}
            fill
            className="object-cover transition-transform duration-500"
            fallbackType="article"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Breaking Badge Overlay */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="destructive"
                className="text-xs font-bold animate-pulse shadow-lg"
              >
                <Zap className="w-3 h-3 ml-1" />
                عاجل
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* لابل التصنيف */}
          <div className="mb-2">
            {category && <span className="category-pill">{category.name}</span>}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-4 mb-3 leading-snug">
            {news.title}
          </h3>

          {/* سطر واحد: التاريخ + المشاهدات */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <time
                dateTime={publishDate}
                className="inline-flex items-center gap-1"
              >
                <Calendar className="w-4 h-4" />
                {formatDateNumeric(publishDate)}
              </time>
              <span className="mx-1">•</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {new Intl.NumberFormat("ar", { notation: "compact" }).format(
                  news.views ?? news.views_count ?? 0
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="category-underline" aria-hidden />
      </article>
    </Link>
  );
}
