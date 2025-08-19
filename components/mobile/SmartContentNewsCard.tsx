"use client";

import { motion } from "framer-motion";
import {
  Bookmark,
  Brain,
  Clock,
  Eye,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface SmartContentNewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    image_caption?: string;
    category_name?: string;
    views?: number;
    reading_time?: number;
    published_at?: string;
    score?: number;
    type?: string;
  };
  darkMode?: boolean;
  variant?: "full" | "compact" | "desktop";
  position?: number;
}

export default function SmartContentNewsCard({
  article,
  darkMode = false,
  variant = "full",
  position = 0,
}: SmartContentNewsCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.origin + `/article/${article.slug}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const getCardBackground = () => {
    const colors = [
      "from-blue-500/10 to-purple-500/10",
      "from-green-500/10 to-teal-500/10",
      "from-orange-500/10 to-pink-500/10",
      "from-purple-500/10 to-indigo-500/10",
      "from-red-500/10 to-yellow-500/10",
    ];
    return colors[position % colors.length];
  };

  const getTypeIcon = () => {
    switch (article.type) {
      case "تحليل":
        return <Brain className="w-4 h-4" />;
      case "رأي":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (variant === "desktop") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: position * 0.1 }}
        className={`smart-content-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCardBackground()} opacity-50`}
        />
        
        <div className="relative p-6">
          {/* Header with AI Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getTypeIcon()}
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                محتوى مخصص بالذكاء الاصطناعي
              </span>
            </div>
            {article.score && (
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(article.score * 100)}% ملاءمة
              </div>
            )}
          </div>

          {/* Content */}
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Image if available */}
          {article.featured_image && !imageError && (
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {article.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_time} دقائق</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookmarked(!isBookmarked);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleShare();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Mobile variant (full/compact)
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: position * 0.1 }}
      className={`smart-content-mobile-card relative overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-2xl shadow-lg mb-4`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getCardBackground()} opacity-30`}
      />

      <div className="relative">
        {/* AI Badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getTypeIcon()}
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                محتوى ذكي مخصص لك
              </span>
            </div>
            {article.score && (
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {Math.round(article.score * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-base font-bold mb-2 line-clamp-2 dark:text-white">
              {article.title}
            </h3>
          </Link>

          {variant === "full" && article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Image for full variant */}
          {variant === "full" && article.featured_image && !imageError && (
            <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
              {article.image_caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white">{article.image_caption}</p>
                </div>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              {article.category_name && (
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {article.category_name}
                </span>
              )}
              {article.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.reading_time}د</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookmarked(!isBookmarked);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleShare();
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
