"use client";

import SafeImage from "@/components/ui/SafeImage";
import { Badge } from "@/components/ui/badge";
import { formatDateNumeric } from "@/lib/date-utils";
import { getImageUrl } from "@/lib/image-utils";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { linkTo } from "@/lib/url-builder";
import { cn } from "@/lib/utils";
import { Calendar, Eye, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";

interface ArticleCardProps {
  article: any;
  viewMode?: "grid" | "list";
}

export default function ArticleCard({
  article,
  viewMode = "grid",
}: ArticleCardProps) {
  // Get article metadata
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
  const interactionCount =
    (article.views || 0) + (article.likes || 0) + (article.shares || 0);

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
    article.image_url ||
    article.featured_image ||
    article.image ||
    metadata.image;

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
  const getArticleLink = (article: any) => {
    // Ensure contentType is correctly determined with a fallback
    const contentType =
      article.content_type ||
      (["opinion", "analysis", "interview"].includes(
        article.article_type?.toLowerCase()
      )
        ? "OPINION"
        : "NEWS");
    return linkTo({ slug: article.slug, contentType });
  };

  // Publish date
  const publishDate = article.published_at || article.created_at;

  // تصنيف موحّد للفئات إلى رموز ألوان
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
  // تطبيق التصميم الجديد على جميع البطاقات
  const showNewsCategory = true;

  if (viewMode === "list") {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(article)} className="block">
        <article
          className={cn(
            "relative rounded-3xl shadow-lg p-6 flex gap-6",
            isBreaking
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 border"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border"
          )}
          dir="rtl"
          data-category={mappedCategory}
        >
          {/* Image محسنة للأداء */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SafeImage
              src={imageUrl || ""}
              alt={article.title || "صورة المقال"}
              fill
              className="object-cover"
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

            {/* الشارات - مخفية في التصميم الجديد */}

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-4 mb-2 flex-1">
              {article.title}
            </h3>

            {/* Excerpt - مخفي في التصميم الجديد */}

            {/* سطر واحد: التاريخ + المشاهدات + التعليقات */}
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
                  article.views ?? article.views_count ?? 0
                )}
              </span>
              {typeof article.comments_count === "number" && (
                <>
                  <span className="mx-1">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {new Intl.NumberFormat("ar", {
                      notation: "compact",
                    }).format(article.comments_count || 0)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="category-underline" aria-hidden />
        </article>
      </Link>
    );
  }

  // Grid View - البطاقة الافتراضية
  return (
    <Link href={getArticleLink(article)} className="block h-full">
      <article
        className={cn(
          "relative rounded-2xl shadow-md overflow-hidden h-full flex flex-col",
          isBreaking
            ? "bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500 ring-opacity-50 border-red-200 dark:border-red-800 border"
            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border"
        )}
        dir="rtl"
        data-category={mappedCategory}
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <SafeImage
            src={imageUrl || ""}
            alt={article.title || "صورة المقال"}
            fill
            className="object-cover"
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

          {/* الشارات الأخرى - مخفية في التصميم الجديد */}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-4 mb-3 leading-snug">
            {article.title}
          </h3>

          {/* Excerpt - مخفي في التصميم الجديد */}

          {/* سطر واحد: التاريخ + المشاهدات + التعليقات */}
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
                  article.views ?? article.views_count ?? 0
                )}
              </span>
              {typeof article.comments_count === "number" && (
                <>
                  <span className="mx-1">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {new Intl.NumberFormat("ar", {
                      notation: "compact",
                    }).format(article.comments_count || 0)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="category-underline" aria-hidden />
      </article>
    </Link>
  );
}
