"use client";

import {
  AlertCircle,
  Bookmark,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CloudImage } from "@/components/CloudImage";

interface UnifiedMobileNewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    summary?: string;
    featured_image?: string;
    author?: {
      id: string;
      name: string;
      email: string;
    } | null;
    author_name?: string;
    category?: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      icon: string | null;
    } | null;
    category_name?: string;
    views?: number;
    views_count?: number;
    reading_time?: number;
    published_at?: string;
    created_at: string;
    featured?: boolean;
    is_featured?: boolean;
    breaking?: boolean;
    is_breaking?: boolean;
    likes_count?: number;
    comments_count?: number;
  };
  darkMode?: boolean;
  variant?: "default" | "featured" | "compact" | "smart-block";
  onBookmark?: (id: string) => void;
  onShare?: (article: any) => void;
  onLike?: (id: string) => void;
}

export default function UnifiedMobileNewsCard({
  article,
  darkMode = false,
  variant = "default",
  onBookmark,
  onShare,
  onLike,
}: UnifiedMobileNewsCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const isBreaking = article.breaking || article.is_breaking;
  const isFeatured = article.featured || article.is_featured;
  const views = article.views || article.views_count || 0;
  
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const publishDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - publishDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "الآن";
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    
    return publishDate.toLocaleDateString("ar-SA");
  };

  const getCategoryColor = () => {
    if (article.category?.color) return article.category.color;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    const hash = (article.category_name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(article.id);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(article);
    }
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(article.id);
    }
  };

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <div className={`unified-mobile-card-compact ${darkMode ? "dark" : ""}`}>
        <Link href={`/news/${article.slug}`} className="flex gap-3 p-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold line-clamp-2 mb-1 dark:text-white">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'}}>
              <span>{getRelativeTime(article.published_at || article.created_at)}</span>
              {views > 0 && (
                <>
                  <span>•</span>
                  <span>{views} مشاهدة</span>
                </>
              )}
            </div>
          </div>
          {article.featured_image && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <CloudImage
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                fallbackType="article"
                priority={false}
              />
            </div>
          )}
        </Link>
      </div>
    );
  }

  // Smart block variant
  if (variant === "smart-block") {
    return (
      <div className={`unified-mobile-card-smart ${darkMode ? "dark" : ""} rounded-2xl overflow-hidden shadow-lg mb-4`}>
        <div className="relative">
          {/* Breaking/Featured Badge */}
          {(isBreaking || isFeatured) && (
            <div className="absolute top-3 right-3 z-10">
              {isBreaking ? (
                <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  عاجل
                </div>
              ) : (
                <div className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  مميز
                </div>
              )}
            </div>
          )}

          {/* Image */}
          {article.featured_image && (
            <Link href={`/news/${article.slug}`}>
              <div className="relative h-48 w-full">
                <CloudImage
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  fallbackType="article"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Category Label */}
            {(article.category_name || article.category?.name) && (
              <div className="mb-3">
                <span className="category-pill">
                  {article.category_name || article.category?.name}
                </span>
              </div>
            )}

            {/* Title */}
            <Link href={`/news/${article.slug}`}>
              <h3 className="text-lg font-bold mb-2 line-clamp-2 dark:text-white theme-hover-text transition-colors">
                {article.title}
              </h3>
            </Link>

            {/* Excerpt */}
            {(article.excerpt || article.summary) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {article.excerpt || article.summary}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 text-xs p-2 rounded-lg" style={{backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'}}>
                {(article.author_name || article.author?.name) && (
                  <span className="font-medium">{article.author_name || article.author?.name}</span>
                )}
                <span>{getRelativeTime(article.published_at || article.created_at)}</span>
                {article.reading_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{color: 'var(--theme-primary)'}} />
                    <span>{article.reading_time} دقائق</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{article.likes_count || 0}</span>
                </button>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{article.comments_count || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" style={{color: 'var(--theme-primary)'}} />
                  <span>{views}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmarkClick}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default & Featured variants
  return (
    <div className={`unified-mobile-card ${variant} ${darkMode ? "dark" : ""}`}>
      <div className="relative">
        {/* Breaking/Featured Badge */}
        {(isBreaking || isFeatured) && (
          <div className="absolute top-2 right-2 z-10">
            {isBreaking ? (
              <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                عاجل
              </div>
            ) : (
              <div className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                مميز
              </div>
            )}
          </div>
        )}

        <Link href={`/news/${article.slug}`} className="block">
          <div className={`flex ${variant === "featured" ? "flex-col" : "gap-3"} p-4`}>
            {/* Image */}
            {article.featured_image && (
              <div className={`relative overflow-hidden rounded-lg ${
                variant === "featured" ? "w-full h-48 mb-3" : "w-24 h-24 flex-shrink-0"
              }`}>
                <CloudImage
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  fallbackType="article"
                  priority={false}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              {/* Category Label */}
              {(article.category_name || article.category?.name) && (
                <div className="mb-2">
                  <span 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
                    style={{
                      backgroundColor: getCategoryColor() + "15",
                      color: getCategoryColor(),
                      borderColor: getCategoryColor() + "40",
                    }}
                  >
                    {article.category_name || article.category?.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className={`font-bold mb-1 line-clamp-2 dark:text-white ${
                variant === "featured" ? "text-lg" : "text-base"
              }`}>
                {article.title}
              </h3>

              {/* Excerpt for featured */}
              {variant === "featured" && (article.excerpt || article.summary) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {article.excerpt || article.summary}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'}}>
                {(article.author_name || article.author?.name) && (
                  <>
                    <span>{article.author_name || article.author?.name}</span>
                    <span>•</span>
                  </>
                )}
                <span>{getRelativeTime(article.published_at || article.created_at)}</span>
                {views > 0 && (
                  <>
                    <span>•</span>
                    <span>{views} مشاهدة</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {article.likes_count && <span>{article.likes_count}</span>}
            </button>
            {article.comments_count !== undefined && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span>{article.comments_count}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded transition-colors ${
                isBookmarked
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
