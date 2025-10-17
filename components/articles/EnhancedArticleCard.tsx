"use client";

import {
  EnhancedCard,
  EnhancedCardContent,
} from "@/components/ui/EnhancedCard";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { Eye, Calendar, User, ArrowLeft, Bookmark, Share2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
  };
  views?: number;
  published_at?: string;
  created_at?: string;
}

interface EnhancedArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured";
  showImage?: boolean;
  showExcerpt?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * مكون بطاقة خبر محسّن
 * 
 * يستخدم نظام التصميم المحسّن مع:
 * - EnhancedCard للبطاقة الأساسية
 * - نظام الألوان الموحد
 * - تأثيرات حركية دقيقة
 * - دعم كامل للوضع الليلي
 */
export default function EnhancedArticleCard({
  article,
  variant = "default",
  showImage = true,
  showExcerpt = true,
  showActions = false,
  className = "",
}: EnhancedArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getExcerpt = () => {
    if (article.excerpt) return article.excerpt;
    if (article.content) {
      const text = article.content.replace(/<[^>]*>/g, "");
      return text.slice(0, 150) + (text.length > 150 ? "..." : "");
    }
    return "";
  };

  // البطاقة المميزة (Featured)
  if (variant === "featured") {
    return (
      <Link href={`/articles/${article.slug}`}>
        <EnhancedCard
          variant="elevated"
          padding="none"
          hoverable
          className={`overflow-hidden ${className}`}
        >
          {showImage && article.image && (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-brand-primary to-brand-accent">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {article.category && (
                <div className="absolute top-4 right-4">
                  <span className="bg-brand-accent text-brand-accentFg text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {article.category.name}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <EnhancedCardContent className="p-6">
            <h2 className="text-2xl font-bold text-brand-fg dark:text-white mb-3 line-clamp-2 hover:text-brand-primary dark:hover:text-brand-accent transition-colors">
              {article.title}
            </h2>
            
            {showExcerpt && (
              <p className="text-brand-fgMuted dark:text-gray-400 mb-4 line-clamp-3">
                {getExcerpt()}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-brand-fgLight dark:text-gray-500">
              <div className="flex items-center gap-4">
                {article.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at || article.created_at)}
                </span>
              </div>
              
              <EnhancedButton variant="ghost" size="sm" className="gap-1">
                اقرأ المزيد
                <ArrowLeft className="w-4 h-4" />
              </EnhancedButton>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </Link>
    );
  }

  // البطاقة المدمجة (Compact)
  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.slug}`}>
        <EnhancedCard
          variant="flat"
          padding="sm"
          hoverable
          className={`${className}`}
        >
          <div className="flex gap-3">
            {showImage && article.image && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-brand-secondary">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-brand-fg dark:text-white mb-1 line-clamp-2 hover:text-brand-primary dark:hover:text-brand-accent transition-colors">
                {article.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-brand-fgLight dark:text-gray-500">
                {article.category && (
                  <span className="text-brand-accent">{article.category.name}</span>
                )}
                <span>•</span>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>
          </div>
        </EnhancedCard>
      </Link>
    );
  }

  // البطاقة الافتراضية (Default)
  return (
    <Link href={`/articles/${article.slug}`}>
      <EnhancedCard
        variant="default"
        padding="none"
        hoverable
        className={`overflow-hidden ${className}`}
      >
        {showImage && article.image && (
          <div className="relative h-48 bg-gradient-to-br from-brand-secondary to-brand-borderLight">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {article.category && (
              <div className="absolute top-3 right-3">
                <span className="bg-brand-accent text-brand-accentFg text-xs font-bold px-3 py-1 rounded-full">
                  {article.category.name}
                </span>
              </div>
            )}
          </div>
        )}
        
        <EnhancedCardContent className="p-4">
          <h3 className="font-bold text-brand-fg dark:text-white mb-2 line-clamp-2 hover:text-brand-primary dark:hover:text-brand-accent transition-colors">
            {article.title}
          </h3>
          
          {showExcerpt && (
            <p className="text-sm text-brand-fgMuted dark:text-gray-400 mb-3 line-clamp-2">
              {getExcerpt()}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-brand-fgLight dark:text-gray-500">
            <div className="flex items-center gap-3">
              {article.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at || article.created_at)}
              </span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-brand-border dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                    : "text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookmarked(!isBookmarked);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "text-brand-accent bg-brand-accent/10"
                    : "text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // Share functionality
                }}
                className="p-2 rounded-lg text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </Link>
  );
}

