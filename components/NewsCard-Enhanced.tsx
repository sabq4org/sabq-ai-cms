"use client";

import ArticleViews from "@/components/ui/ArticleViews";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/ui/SafeImage";
import { formatDateGregorian } from "@/lib/date-utils";
import { processArticleImage } from "@/lib/image-utils";
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

  // معالجة رابط الصورة بنظام محسن
  const imageUrl = processArticleImage(
    rawImageUrl,
    news.title || "مقال",
    'article'
  );

  // Article link
  const getArticleLink = (news: any) => {
    if (news.slug) return `/news/${news.slug}`;
    if (news.id) return `/news/${news.id}`;
    return "#";
  };

  // مكون شعلة اللهب للأخبار الشائعة
  const FlameIcon = () => (
    <div 
      className="inline-block w-3 h-3.5 relative ml-1"
      style={{
        filter: 'drop-shadow(0 0 3px rgba(255, 69, 0, 0.4))'
      }}
    >
      <div 
        className="absolute w-2 h-3 rounded-full"
        style={{
          left: '2px',
          top: '1px',
          background: 'radial-gradient(circle at 50% 100%, #ff4500 0%, #ff6b00 30%, #ffaa00 60%, #ffdd00 80%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: 'flameFlicker 1.5s ease-in-out infinite alternate',
          transformOrigin: '50% 100%'
        }}
      />
      <div 
        className="absolute w-1.5 h-2 rounded-full"
        style={{
          left: '3px',
          top: '3px',
          background: 'radial-gradient(circle at 50% 100%, #ff6b00 0%, #ffaa00 40%, #ffdd00 70%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: 'flameFlicker 1.2s ease-in-out infinite alternate-reverse',
          transformOrigin: '50% 100%'
        }}
      />
      <style jsx>{`
        @keyframes flameFlicker {
          0% {
            transform: scale(1) rotate(-1deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.1) rotate(1deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.95) rotate(-0.5deg);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );

  // Publish date
  const publishDate = news.published_at || news.created_at;

  if (viewMode === "list") {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(news)} className="group block">
        <article
          className={cn(
            "rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6",
            isBreaking
              ? "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800"
              : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          )}
        >
          {/* Image محسنة للأداء */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SafeImage
              src={imageUrl || ""}
              alt={news.title || "صورة المقال"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              fallbackType="article"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 rounded-xl transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 px-3 py-2">
            {/* Enhanced Category & AI Badges */}
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
                  <span className="ml-1">{categoryStyle.emoji}</span>
                  {category.name}
                </Badge>
              )}
              {isBreaking && (
                <Badge
                  variant="destructive"
                  className="text-xs font-bold animate-pulse"
                >
                  <Zap className="w-3 h-3 ml-1" />
                  عاجل
                </Badge>
              )}

              {isTrending && (
                <Badge className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <TrendingUp className="w-3 h-3 ml-1" />
                  رائج
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {news.title}
            </h3>

            {/* Excerpt */}
            {news.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                {news.excerpt}
              </p>
            )}

            {/* Enhanced Meta Info with AI insights */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateGregorian(publishDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {news.reading_time ||
                    Math.ceil((news.content?.length || 0) / 1000)}{" "}
                  دقائق
                </span>
                <div className="flex items-center">
                  <ArticleViews count={news.views || news.views_count || 0} />
                  {(news.views || news.views_count || 0) > 300 && (
                    <FlameIcon />
                  )}
                </div>
                {news.comments_count > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {news.comments_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid View - البطاقة الافتراضية
  return (
    <Link href={getArticleLink(news)} className="group block h-full">
      <article
        className={cn(
          "rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col",
          isBreaking
            ? "bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500 ring-opacity-50 border-2 border-red-200 dark:border-red-800"
            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <SafeImage
            src={imageUrl || ""}
            alt={news.title || "صورة المقال"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
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
        <div className="p-4 flex-1 flex flex-col rounded-xl transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
          {/* Enhanced Category & AI Badges */}
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
                <span className="ml-1">{categoryStyle.emoji}</span>
                {category.name}
              </Badge>
            )}

            {isTrending && (
              <Badge className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <TrendingUp className="w-3 h-3 ml-1" />
                رائج
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>

          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3 flex-1">
              {news.excerpt}
            </p>
          )}

          {/* Enhanced Meta Info with AI insights */}
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateGregorian(publishDate)}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <ArticleViews count={news.views || news.views_count || 0} />
                  {(news.views || news.views_count || 0) > 300 && (
                    <FlameIcon />
                  )}
                </div>
                {news.comments_count > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {news.comments_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
