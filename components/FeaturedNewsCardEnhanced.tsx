/**
 * مكون بطاقة الأخبار المميزة المحسن
 * Enhanced Featured News Card Component
 *
 * إصلاحات:
 * - منع قص العنوان في السطر الثالث
 * - تحسين موضع نبذة الخبر ("تكة واحدة")
 * - تحسين التجاوب والمظهر العام
 */

"use client";

import CloudImage from "@/components/ui/CloudImage";
import { formatRelativeDate } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import { Calendar, Clock, Eye, MessageSquare, Star, Zap } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface FeaturedNewsCardProps {
  article: {
    id: string | number;
    title: string;
    excerpt?: string;
    summary?: string;
    featured_image?: string;
    image_url?: string;
    image?: string;
    category?: {
      name: string;
      color?: string;
      icon?: string;
    };
    author?: {
      name: string;
      avatar?: string;
    };
    published_at?: string;
    created_at: string;
    views?: number;
    reading_time?: number;
    comments_count?: number;
    breaking?: boolean;
    featured?: boolean;
  };
  variant?: "hero" | "featured" | "compact";
  darkMode?: boolean;
  className?: string;
}

const FeaturedNewsCard = memo(
  ({
    article,
    variant = "featured",
    darkMode = false,
    className = "",
  }: FeaturedNewsCardProps) => {
    const imageUrl =
      article.featured_image || article.image_url || article.image || "";
    const excerpt = article.excerpt || article.summary || "";
    const categoryColor = article.category?.color || "#3b82f6";

    // تنسيق العرض حسب النوع
    if (variant === "hero") {
      return (
        <Link
          href={getArticleLink(article)}
          className={`block w-full ${className}`}
        >
          <article className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
            {/* الصورة الخلفية */}
            <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
              <CloudImage
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="100vw"
                priority
              />

              {/* تدرج للنص */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* الشارات */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {article.breaking && (
                  <span className="hero-badge breaking-badge">
                    <Zap className="w-4 h-4" />
                    عاجل
                  </span>
                )}
                {article.featured && (
                  <span className="hero-badge featured-badge">
                    <Star className="w-4 h-4" />
                    مميز
                  </span>
                )}
              </div>

              {/* المحتوى */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                {/* التصنيف */}
                {article.category && (
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
                      style={{ backgroundColor: categoryColor + "CC" }}
                    >
                      {article.category.icon && (
                        <span>{article.category.icon}</span>
                      )}
                      {article.category.name}
                    </span>
                  </div>
                )}

                {/* العنوان مع إصلاح القص */}
                <h1 className="hero-news-title featured-news-title line-clamp-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {article.title}
                </h1>

                {/* النبذة مع التحسين */}
                {excerpt && (
                  <p className="news-excerpt text-gray-200 text-base lg:text-lg line-clamp-2 mb-4 leading-relaxed">
                    {excerpt}
                  </p>
                )}

                {/* المعلومات السفلية */}
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatRelativeDate(
                      article.published_at || article.created_at
                    )}
                  </span>
                  {article.reading_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.reading_time} د
                    </span>
                  )}
                  {article.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        </Link>
      );
    }

    if (variant === "compact") {
      return (
        <Link
          href={getArticleLink(article)}
          className={`block w-full ${className}`}
        >
          <article
            className={`
          group flex gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-lg
          ${
            article.breaking
              ? darkMode
                ? "bg-red-950/30 border-2 border-red-800/50"
                : "bg-red-50 border-2 border-red-200"
              : darkMode
              ? "bg-gray-800/50 hover:bg-gray-800/70"
              : "bg-white hover:bg-gray-50"
          }
        `}
          >
            {/* صورة مصغرة */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <CloudImage
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              {/* الشارات */}
              <div className="flex items-center gap-2 mb-2">
                {article.breaking && (
                  <span className="compact-badge breaking-badge">
                    <Zap className="w-3 h-3" />
                    عاجل
                  </span>
                )}
                {article.category && (
                  <span
                    className="compact-badge category-badge"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {article.category.icon && (
                      <span className="text-xs">{article.category.icon}</span>
                    )}
                    {article.category.name}
                  </span>
                )}
              </div>

              {/* العنوان مع إصلاح القص */}
              <h3
                className={`
              featured-news-title line-clamp-3 font-bold text-sm leading-tight mb-2
              ${darkMode ? "text-white" : "text-gray-900"}
            `}
              >
                {article.title}
              </h3>

              {/* المعلومات */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {formatRelativeDate(
                    article.published_at || article.created_at
                  )}
                </span>
                {article.reading_time && (
                  <>
                    <span>•</span>
                    <span>{article.reading_time} د</span>
                  </>
                )}
                {article.views && (
                  <>
                    <span>•</span>
                    <span>{article.views.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </article>
        </Link>
      );
    }

    // البطاقة المميزة الافتراضية
    return (
      <Link
        href={getArticleLink(article)}
        className={`block w-full ${className}`}
      >
        <article
          className={`
        group featured-news-card overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        ${
          article.breaking
            ? darkMode
              ? "bg-red-950/30 border-2 border-red-800/50"
              : "bg-red-50 border-2 border-red-200"
            : darkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200 shadow-lg"
        }
      `}
        >
          {/* الصورة */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
            <CloudImage
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            {/* تدرج خفيف */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:from-black/20" />

            {/* الشارات */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {article.breaking && (
                <span className="featured-badge breaking-badge">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              )}
              {article.featured && (
                <span className="featured-badge star-badge">
                  <Star className="w-3 h-3" />
                  مميز
                </span>
              )}
            </div>

            {/* التصنيف */}
            {article.category && (
              <div className="absolute bottom-3 right-3">
                <span
                  className="category-overlay-badge"
                  style={{ backgroundColor: categoryColor + "EE" }}
                >
                  {article.category.icon && (
                    <span>{article.category.icon}</span>
                  )}
                  {article.category.name}
                </span>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="p-5 space-y-3">
            {/* العنوان مع الإصلاح */}
            <h2
              className={`
            featured-news-title line-clamp-3 text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors
            ${
              darkMode
                ? "text-white dark:group-hover:text-blue-400"
                : "text-gray-900"
            }
          `}
            >
              {article.title}
            </h2>

            {/* النبذة مع التحسين */}
            {excerpt && (
              <p
                className={`
              news-excerpt text-sm leading-relaxed line-clamp-2
              ${darkMode ? "text-gray-300" : "text-gray-600"}
            `}
              >
                {excerpt}
              </p>
            )}

            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {formatRelativeDate(
                    article.published_at || article.created_at
                  )}
                </span>
                {article.reading_time && (
                  <span
                    className={`flex items-center gap-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {article.reading_time} دقائق
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {article.views && (
                  <span
                    className={`flex items-center gap-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                )}
                {article.comments_count && article.comments_count > 0 && (
                  <span
                    className={`flex items-center gap-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    {article.comments_count}
                  </span>
                )}
              </div>
            </div>

            {/* معلومات الكاتب (اختيارية) */}
            {article.author && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                {article.author.avatar && (
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <CloudImage
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                )}
                <span
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {article.author.name}
                </span>
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }
);

FeaturedNewsCard.displayName = "FeaturedNewsCard";

export default FeaturedNewsCard;

// تصدير أنواع مختلفة من البطاقة
export const HeroNewsCard = memo(
  (props: Omit<FeaturedNewsCardProps, "variant">) => (
    <FeaturedNewsCard {...props} variant="hero" />
  )
);

export const CompactNewsCard = memo(
  (props: Omit<FeaturedNewsCardProps, "variant">) => (
    <FeaturedNewsCard {...props} variant="compact" />
  )
);

HeroNewsCard.displayName = "HeroNewsCard";
CompactNewsCard.displayName = "CompactNewsCard";
