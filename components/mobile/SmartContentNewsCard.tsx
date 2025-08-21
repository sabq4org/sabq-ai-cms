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
import SmartImage from "@/components/ui/SmartImage";
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



  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.origin + `/news/${article.slug}`,
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
        className={`smart-content-card group relative overflow-hidden rounded-2xl transition-all duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCardBackground()} opacity-50`}
        />
        
        {/* Image First - Unified Design */}
        <Link href={`/news/${article.slug}`}>
          <div className="relative h-[180px] rounded-t-2xl overflow-hidden">
              <SmartImage
                src=""
                article={article}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackType="article"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Category Label on Image */}
              {article.category_name && (
                <div 
                  className="absolute top-3 right-3"
                  style={{
                    background: 'hsl(var(--accent))',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {article.category_name}
                </div>
              )}
              
              {/* AI Label on Left */}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold text-white inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="w-3 h-3" />
                  مخصص{article.score ? ` | ${Math.round(article.score * 100)}%` : ''}
                </span>
            </div>
          </div>
        </Link>
        
        <div className="relative p-6">
          {/* Moved AI Label to Image */}

          {/* Content */}
          <Link href={`/news/${article.slug}`}>
            <h3 className="text-base font-bold mb-2 line-clamp-3 dark:text-white theme-hover-text transition-colors">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Footer - بدون أزرار التفاعل */}
          <div className="flex items-center gap-4 text-sm mt-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'}}>
            {article.reading_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" style={{color: 'var(--theme-primary)'}} />
                <span>{article.reading_time} دقائق</span>
              </div>
            )}
            {article.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" style={{color: 'var(--theme-primary)'}} />
                <span>{article.views}</span>
              </div>
            )}
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
      } rounded-2xl mb-4`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getCardBackground()} opacity-30`}
      />

      <div className="relative">
        {/* Image First - Unified Design */}
        <Link href={`/news/${article.slug}`}>
          <div className="relative h-[180px] w-full">
              <SmartImage
                src=""
                article={article}
                alt={article.title}
                fill
                className="object-cover"
                fallbackType="article"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Category Label on Image */}
              {article.category_name && (
                <div 
                  className="absolute top-3 right-3"
                  style={{
                    background: 'hsl(var(--accent))',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {article.category_name}
                </div>
              )}
              
              {/* AI Label on Left */}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold text-white inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="w-3 h-3" />
                  مخصص{article.score ? ` | ${Math.round(article.score * 100)}%` : ''}
                </span>
              </div>
              
              {article.image_caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white font-medium">{article.image_caption}</p>
                </div>
              )}
          </div>
        </Link>

        {/* Content */}
        <div className="px-4 pt-4 pb-4">
          {/* Moved AI Label to Image */}

          <Link href={`/news/${article.slug}`}>
            <h3 className="text-base font-bold mb-2 line-clamp-3 dark:text-white theme-hover-text transition-colors">
              {article.title}
            </h3>
          </Link>

          {variant === "full" && article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'}}>
            <div className="flex items-center gap-3 text-xs">
              {article.category_name && (
                <span className="font-medium" style={{color: 'var(--theme-primary)'}}>
                  {article.category_name}
                </span>
              )}
              {article.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" style={{color: 'var(--theme-primary)'}} />
                  <span>{article.reading_time}د</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" style={{color: 'var(--theme-primary)'}} />
                  <span>{article.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

