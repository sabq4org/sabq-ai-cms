"use client";

import ArticleViews from "@/components/ui/ArticleViews";
import SafeImage from "@/components/ui/SafeImage";
import { formatDateGregorian } from "@/lib/date-utils";
import { formatCommentsCount } from "@/lib/format-utils";
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
  variant?: "hero" | "compact" | "full-width" | "smart-block";
  onBookmark?: (id: string) => void;
  onShare?: (news: any) => void;
  className?: string;
}

export default function EnhancedMobileNewsCard({
  news,
  darkMode,
  variant = "compact",
  onBookmark,
  onShare,
  className = "",
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
              src={news.featured_image || news.image_url || news.image}
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

  // بطاقة Full Width للقوائم
  if (variant === "full-width") {
    return (
      <Link href={getArticleLink(news)} className="block w-full">
        <article
          className={`overflow-hidden transition-all ${
            news.breaking
              ? darkMode
                ? "bg-red-950/30 border-2 border-red-800/70 active:bg-red-950/40"
                : "bg-red-50 border-2 border-red-200 active:bg-red-100"
              : darkMode
              ? "bg-gray-800/50 active:bg-gray-700/50"
              : "bg-white active:bg-gray-50"
          }`}
        >
          <div className="flex items-start p-4 gap-4">
            {/* الصورة - مربعة مع زوايا دائرية */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
              <SafeImage
                src={news.featured_image || news.image_url || news.image}
                alt={news.title || "صورة المقال"}
                fill
                className="object-cover"
                sizes="96px"
                fallbackType="article"
              />
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              {/* الشارات والمؤشرات المحسنة */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* مؤشر الخبر العاجل */}
                {news.breaking && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-red-500 text-white rounded-full animate-pulse">
                    <Zap className="w-3 h-3" />
                    عاجل
                  </span>
                )}

                {/* مخصص لك */}
                {isPersonalized && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    <Sparkles className="w-3 h-3" />
                    مخصص | {personalizedScore}%
                  </span>
                )}

                {/* رائج */}
                {isTrending && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    رائج
                  </span>
                )}

                {/* التصنيف المحسن */}
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

                {/* مؤشر الخبر الجديد (آخر 12 ساعة) */}
                {news.published_at &&
                  (() => {
                    const newsDate = new Date(news.published_at);
                    const now = new Date();
                    const hoursDiff =
                      (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
                    return hoursDiff <= 12;
                  })() && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-green-500 text-white rounded-full animate-pulse">
                      🔥 جديد
                    </span>
                  )}

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateGregorian(news.published_at || news.created_at)}
                </span>
              </div>

              {/* العنوان */}
              <h3
                className={`font-semibold text-base leading-tight line-clamp-3 mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {news.title}
              </h3>

              {/* معلومات سريعة محسنة */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <ArticleViews
                      count={news.views || interactionCount}
                      className="text-xs"
                    />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.reading_time || 5} دقائق
                    </span>
                    {news.comments_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatCommentsCount(news.comments_count)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // بطاقة smart-block - الأفضل للأخبار المميزة
  if (variant === "smart-block") {
    return (
      <Link href={getArticleLink(news)} className={`block w-full ${className}`}>
        <article
          className={`
          relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg group
          ${
            news.breaking
              ? darkMode
                ? "bg-red-950/30 backdrop-blur-sm border-2 border-red-800/70 hover:bg-red-950/40"
                : "bg-red-50/90 backdrop-blur-sm border-2 border-red-200 hover:bg-red-50"
              : darkMode
              ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800"
              : "bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50"
          }
        `}
        >
          {/* الصورة الرئيسية - تظهر دائمًا إذا كانت متوفرة */}
          <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <SafeImage
              src={news.featured_image || news.image_url || news.image}
              alt={news.title || "صورة المقال"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              fallbackType="article"
            />
            {/* تدرج للخلفية */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* مؤشرات الحالة المحسنة */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {news.breaking && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              )}
              
              {isPersonalized && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  مخصص
                </span>
              )}
              
              {isTrending && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  رائج
                </span>
              )}
            </div>
            
            {/* التصنيف المحسن */}
            {news.category_name &&
              (() => {
                const categoryStyle = getCategoryStyle(news.category_name);
                return (
                  <div className="absolute bottom-3 right-3 z-10">
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
          <div className="p-5 space-y-3">
            {/* العنوان مع إصلاح القص */}
            <h3
              className={`
              featured-news-title text-lg font-bold leading-tight line-clamp-3 group-hover:text-blue-600
              transition-colors duration-200
              ${
                darkMode
                  ? "text-white dark:group-hover:text-blue-400"
                  : "text-gray-900"
              }
            `}
            >
              {news.title}
            </h3>

            {/* معلومات المقال المحسنة */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {/* وقت القراءة */}
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {news.reading_time || 5} دقائق
                </span>

                {/* المشاهدات المحسنة */}
                <ArticleViews count={news.views || interactionCount} className="text-xs" />
              </div>

              {/* التاريخ الميلادي */}
              <span
                className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {formatDateGregorian(news.published_at || news.created_at)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة المضغوطة الافتراضية
  return (
    <Link href={getArticleLink(news)} className={`block ${className}`}>
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
        {/* الصورة مع نسبة 16:9 - تظهر دائمًا إذا كانت متوفرة بغض النظر عن نوع المقال */}
        <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
          <SafeImage
            src={news.featured_image || news.image_url || news.image}
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
