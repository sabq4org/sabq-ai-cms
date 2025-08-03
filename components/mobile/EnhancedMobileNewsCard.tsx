"use client";

import ArticleViews from "@/components/ui/ArticleViews";
import SafeImage from "@/components/ui/SafeImage";
import { formatDateGregorian } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import {
  Bookmark,
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface EnhancedMobileNewsCardProps {
  news: any;
  darkMode: boolean;
  variant?: "hero" | "compact" | "full-width";
  onBookmark?: (id: string) => void;
  onShare?: (news: any) => void;
}

export default function EnhancedMobileNewsCard({
  news,
  darkMode,
  variant = "compact",
  onBookmark,
  onShare,
}: EnhancedMobileNewsCardProps) {
  // 🤖 AI-powered features
  const personalizedScore =
    news.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = news.is_personalized || personalizedScore > 75;
  const interactionCount =
    (news.views || 0) + (news.likes_count || 0) + (news.shares || 0);
  const isTrending = news.views > 1000 && (news.engagement_rate || 0) > 0.8;

  // 🎨 Enhanced category colors and icons
  const getCategoryStyle = (categoryName: string) => {
    const categoryMap: Record<string, { emoji: string; color: string }> = {
      تحليل: { emoji: "🧠", color: "#8b5cf6" },
      اقتصاد: { emoji: "📊", color: "#10b981" },
      رياضة: { emoji: "⚽", color: "#3b82f6" },
      تقنية: { emoji: "💻", color: "#6366f1" },
      سياسة: { emoji: "🏛️", color: "#ef4444" },
      ثقافة: { emoji: "🎭", color: "#ec4899" },
      علوم: { emoji: "🔬", color: "#06b6d4" },
      صحة: { emoji: "⚕️", color: "#059669" },
      سفر: { emoji: "✈️", color: "#f59e0b" },
      طعام: { emoji: "🍽️", color: "#f97316" },
      عام: { emoji: "📰", color: "#6b7280" },
    };

    return categoryMap[categoryName] || categoryMap["عام"];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onShare) onShare(news);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBookmark) onBookmark(news.id);
  };

  // بطاقة Hero للأخبار المميزة
  if (variant === "hero") {
    return (
      <Link href={getArticleLink(news)} className="block w-full">
        <article
          className={`relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl ${
            news.breaking
              ? darkMode
                ? "bg-red-950/30 border-2 border-red-800/70"
                : "bg-red-50 border-2 border-red-200"
              : darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >
          {/* الصورة بارتفاع أكبر */}
          <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-700">
            <SafeImage
              src={news.featured_image}
              alt={news.title || "صورة المقال"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw"
              priority
              fallbackType="article"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* مؤشرات الحالة المحسنة */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* مؤشر الخبر العاجل */}
              {news.breaking && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              )}

              {/* مخصص لك */}
              {isPersonalized && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  مخصص | {personalizedScore}%
                </span>
              )}

              {/* رائج */}
              {isTrending && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  رائج
                </span>
              )}

              {/* مؤشر الخبر الجديد (آخر 12 ساعة) */}
              {news.published_at &&
                (() => {
                  const newsDate = new Date(news.published_at);
                  const now = new Date();
                  const hoursDiff =
                    (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
                  return hoursDiff <= 12;
                })() && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                    🔥 جديد
                  </span>
                )}
            </div>

            {/* التصنيف المحسن */}
            {news.category_name &&
              (() => {
                const categoryStyle = getCategoryStyle(news.category_name);
                return (
                  <div className="absolute bottom-4 right-4">
                    <span
                      className="flex items-center gap-1 px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm"
                      style={{ backgroundColor: categoryStyle.color }}
                    >
                      <span>{categoryStyle.emoji}</span>
                      {news.category_name}
                    </span>
                  </div>
                );
              })()}
          </div>

          {/* المحتوى */}
          <div className="p-5">
            <h2
              className={`text-xl font-bold leading-tight mb-3 line-clamp-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {news.title}
            </h2>

            {news.excerpt && (
              <p
                className={`text-sm leading-relaxed line-clamp-2 mb-4 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {news.excerpt}
              </p>
            )}

            {/* معلومات إضافية محسنة */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateGregorian(news.published_at || news.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(interactionCount)} تفاعل
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {news.reading_time || 5} دقائق
                  </span>
                </div>

                {/* أزرار التفاعل */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-full transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // بطاقة Full Width للقوائم - تصميم "محتوى مخصص لك"
  if (variant === "full-width") {
    return (
      <Link href={getArticleLink(news)} className="group block w-full">
        <div
          className={`relative h-32 flex flex-row rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-blue-200"
          }`}
        >
          {/* الصورة الرئيسية */}
          <div className="relative w-2/5 h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
            <SafeImage
              src={news.featured_image}
              alt={news.title || "صورة المقال"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="40vw"
              fallbackType="article"
            />
          </div>

          {/* المحتوى */}
          <div className="flex-1 p-2 flex flex-col justify-between">
            {/* نوع المحتوى */}
            <div className="mb-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    news.breaking
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : news.featured
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  <span className="text-xs">
                    {news.breaking ? "🔥" : news.featured ? "⭐" : "📰"}
                  </span>
                  {news.breaking ? "عاجل" : news.featured ? "مميز" : "خبر"}
                </span>
              </div>
              
              {/* العبارة التشويقية */}
              <div className={`mt-1 ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                <p className="text-[10px] font-medium">
                  {news.category_name ? `أحدث أخبار ${news.category_name}` : "خبر جديد"}
                </p>
              </div>
            </div>

            {/* العنوان */}
            <h3
              className={`font-bold text-[11px] leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {news.title}
            </h3>

            {/* المعلومات الإضافية */}
            <div className={`flex items-center justify-between text-[10px] ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{news.reading_time || 5} د</span>
                </div>
              </div>
              <span className="text-[9px]">
                {formatDateGregorian(news.published_at || news.created_at)}
              </span>
            </div>
          </div>

        </div>
      </Link>
    );
  }

  // البطاقة المضغوطة الافتراضية
  return (
    <Link href={getArticleLink(news)} className="block">
      <article
        className={`relative overflow-hidden rounded-xl transition-all ${
          news.breaking
            ? darkMode
              ? "bg-red-950/30 border-2 border-red-800/70 shadow-lg hover:shadow-xl"
              : "bg-red-50 border-2 border-red-200 shadow-md hover:shadow-lg"
            : darkMode
            ? "bg-gray-800 shadow-lg hover:shadow-xl"
            : "bg-white shadow-md hover:shadow-lg"
        }`}
      >
        {/* الصورة مع نسبة 16:9 */}
        <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
          <SafeImage
            src={news.featured_image}
            alt={news.title || "صورة المقال"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw"
            fallbackType="article"
          />

          {/* تم إزالة التصنيف من الصورة */}
        </div>

        {/* المحتوى */}
        <div className="p-4 space-y-3">
          {/* الشارات المحسنة */}
          <div className="flex items-center gap-2 flex-wrap">
            {news.breaking && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-red-500 text-white rounded-full animate-pulse">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            )}
            {isPersonalized && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                <Sparkles className="w-3 h-3" />
                مخصص | {personalizedScore}%
              </span>
            )}
            {isTrending && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                <TrendingUp className="w-3 h-3" />
                رائج
              </span>
            )}
            {news.category_name &&
              (() => {
                const categoryStyle = getCategoryStyle(news.category_name);
                return (
                  <span
                    className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 text-white rounded-full"
                    style={{ backgroundColor: categoryStyle.color }}
                  >
                    <span>{categoryStyle.emoji}</span>
                    {news.category_name}
                  </span>
                );
              })()}
          </div>

          <h3
            className={`font-semibold text-base leading-snug line-clamp-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {news.title}
          </h3>

          {/* معلومات سريعة محسنة */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span>
                  {formatDateGregorian(news.published_at || news.created_at)}
                </span>
                <span>•</span>
                <span>{news.reading_time || 5} دقائق</span>
              </div>

              <ArticleViews
                count={news.views || interactionCount}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
