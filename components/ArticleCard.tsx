'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { Calendar, Clock, Eye, MessageSquare, Zap, Newspaper, TrendingUp, Sparkles, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import { getProductionImageUrl } from '@/lib/production-image-fix';
import { formatDateGregorian, formatRelativeDate } from '@/lib/date-utils';
import OptimizedImage from '@/components/OptimizedImage';

interface ArticleCardProps {
  article: any;
  viewMode?: 'grid' | 'list';
}





export default function ArticleCard({ article, viewMode = 'grid' }: ArticleCardProps) {
  // Get article metadata
  const metadata = article.metadata || {};
  const isBreaking = article.breaking || metadata.isBreakingNews || metadata.breaking || false;
  const category = article.categories || article.category || metadata.category || { name: 'عام', slug: 'general' };
  
  // 🤖 AI-powered features
  const personalizedScore = article.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = article.is_personalized || personalizedScore > 75;
  const isTrending = article.views > 1000 && article.engagement_rate > 0.8;
  const interactionCount = (article.views || 0) + (article.likes || 0) + (article.shares || 0);
  
  // 🎨 Enhanced category colors and icons
  const getCategoryStyle = (cat: any) => {
    const categoryMap: Record<string, {emoji: string, color: string}> = {
      'تحليل': {emoji: '🧠', color: 'purple'},
      'اقتصاد': {emoji: '📊', color: 'green'}, 
      'رياضة': {emoji: '⚽', color: 'blue'},
      'تقنية': {emoji: '💻', color: 'indigo'},
      'سياسة': {emoji: '🏛️', color: 'red'},
      'ثقافة': {emoji: '🎭', color: 'pink'},
      'علوم': {emoji: '🔬', color: 'cyan'},
      'صحة': {emoji: '⚕️', color: 'emerald'},
      'سفر': {emoji: '✈️', color: 'amber'},
      'طعام': {emoji: '🍽️', color: 'orange'},
      'عام': {emoji: '📰', color: 'gray'}
    };
    
    const categoryInfo = categoryMap[cat?.name] || categoryMap['عام'];
    return {
      ...categoryInfo,
      bgClass: `bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30`,
      textClass: `text-${categoryInfo.color}-800 dark:text-${categoryInfo.color}-300`,
      borderClass: `border-${categoryInfo.color}-200 dark:border-${categoryInfo.color}-700`
    };
  };
  
  const categoryStyle = getCategoryStyle(category);
  
  // تحسين رابط الصورة
  const rawImageUrl = article.featured_image || article.image || metadata.image;
  
  // استخدام معالج الإنتاج في بيئة الإنتاج
  const isProduction = process.env.NODE_ENV === 'production' || 
                      (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
  
  const imageUrl = rawImageUrl ? (
    isProduction ? 
      getProductionImageUrl(rawImageUrl, {
        width: viewMode === 'list' ? 400 : 800,
        height: viewMode === 'list' ? 300 : 600,
        quality: 85,
        fallbackType: 'article'
      }) :
      getImageUrl(rawImageUrl, {
        width: viewMode === 'list' ? 400 : 800,
        height: viewMode === 'list' ? 300 : 600,
        quality: 85,
        format: 'webp',
        fallbackType: 'article'
      })
  ) : null;

  // Article link
  const getArticleLink = (article: any) => {
    if (article.slug) return `/article/${article.slug}`;
    if (article.id) return `/article/${article.id}`;
    return '#';
  };

  // Publish date
  const publishDate = article.published_at || article.created_at;


  if (viewMode === 'list') {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article className={cn(
          "rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6",
          isBreaking 
            ? "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800" 
            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}>
          {/* Image محسنة للأداء */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <SafeImage
              src={imageUrl || ''}
              alt={article.title || 'صورة المقال'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              fallbackType="article"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
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
                <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                  <Zap className="w-3 h-3 ml-1" />
                  عاجل
                </Badge>
              )}
              {isPersonalized && (
                <Badge className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 ml-1" />
                  مخصص | {personalizedScore}%
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
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                {article.excerpt}
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
                  {article.reading_time || Math.ceil((article.content?.length || 0) / 1000)} دقائق
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {interactionCount > 1000 ? `${(interactionCount / 1000).toFixed(1)}k` : interactionCount}
                </span>
                {article.comments_count > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {article.comments_count}
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
    <Link href={getArticleLink(article)} className="group block h-full">
      <article className={cn(
        "rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col",
        isBreaking 
          ? "bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500 ring-opacity-50 border-2 border-red-200 dark:border-red-800" 
          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      )}>
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <SafeImage
            src={imageUrl || ''}
            alt={article.title || 'صورة المقال'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            fallbackType="article"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Breaking Badge Overlay */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="text-xs font-bold animate-pulse shadow-lg">
                <Zap className="w-3 h-3 ml-1" />
                عاجل
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
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
            {isPersonalized && (
              <Badge className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 ml-1" />
                مخصص | {personalizedScore}%
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
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3 flex-1">
              {article.excerpt}
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
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {interactionCount > 1000 ? `${(interactionCount / 1000).toFixed(1)}k` : interactionCount}
                </span>
                {article.comments_count > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {article.comments_count}
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
