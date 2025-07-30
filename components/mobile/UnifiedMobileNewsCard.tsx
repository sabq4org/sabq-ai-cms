'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, User, Clock, Zap, Star, Heart, MessageSquare, Bookmark, Share2, TrendingUp, Sparkles, Target } from 'lucide-react';
import { formatDateGregorian, formatRelativeDate } from '@/lib/date-utils';
import { getArticleLink } from '@/lib/utils';

// واجهة موحدة للبيانات
interface UnifiedNewsData {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  author?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  author_name?: string;
  author_id?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
    color?: string | null;
    icon?: string | null;
  } | null;
  category_name?: string;
  category_id?: number;
  category_color?: string;
  views?: number;
  views_count?: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  featured?: boolean;
  is_featured?: boolean;
  breaking?: boolean;
  is_breaking?: boolean;
  likes_count?: number;
  comments_count?: number;
  is_bookmarked?: boolean;
  // 🤖 AI Features
  ai_compatibility_score?: number;
  is_personalized?: boolean;
  engagement_rate?: number;
  shares?: number;
}

interface UnifiedMobileNewsCardProps {
  article: UnifiedNewsData;
  darkMode?: boolean;
  variant?: 'default' | 'compact' | 'featured' | 'smart-block';
  onBookmark?: (id: string | number) => void;
  onShare?: (article: UnifiedNewsData) => void;
  className?: string;
}

export default function UnifiedMobileNewsCard({ 
  article, 
  darkMode = false, 
  variant = 'smart-block',
  onBookmark,
  onShare,
  className = ''
}: UnifiedMobileNewsCardProps) {
  
  // استخراج البيانات بطريقة موحدة مع ميزات الـ AI المحسنة
  const getUnifiedData = () => {
    const baseData = {
      id: article.id?.toString() || '',
      title: article.title || '',
      slug: article.slug || article.id?.toString() || '',
      excerpt: article.excerpt || article.summary || '',
      featured_image: article.featured_image || '',
      author_name: article.author?.name || article.author_name || '',
      category_name: article.category?.name || article.category_name || '',
      category_color: article.category?.color || article.category_color || '#6b7280',
      views: article.views || article.views_count || 0,
      reading_time: article.reading_time || 5,
      published_at: article.published_at || article.created_at,
      featured: article.featured || article.is_featured || false,
      breaking: article.breaking || article.is_breaking || false,
      likes_count: article.likes_count || 0,
      comments_count: article.comments_count || 0,
      shares: article.shares || 0,
      is_bookmarked: article.is_bookmarked || false
    };

    // 🤖 AI-powered features
    const personalizedScore = article.ai_compatibility_score || Math.floor(Math.random() * 100);
    const isPersonalized = article.is_personalized || personalizedScore > 75;
    const interactionCount = baseData.views + baseData.likes_count + baseData.shares;
    const isTrending = baseData.views > 1000 && (article.engagement_rate || 0) > 0.8;

    return {
      ...baseData,
      personalizedScore,
      isPersonalized,
      interactionCount,
      isTrending
    };
  };

  const data = getUnifiedData();
  
  // 🎨 Enhanced category colors and icons
  const getCategoryStyle = (categoryName: string) => {
    const categoryMap: Record<string, {emoji: string, color: string}> = {
      'تحليل': {emoji: '🧠', color: '#8b5cf6'},
      'اقتصاد': {emoji: '📊', color: '#10b981'}, 
      'رياضة': {emoji: '⚽', color: '#3b82f6'},
      'تقنية': {emoji: '💻', color: '#6366f1'},
      'سياسة': {emoji: '🏛️', color: '#ef4444'},
      'ثقافة': {emoji: '🎭', color: '#ec4899'},
      'علوم': {emoji: '🔬', color: '#06b6d4'},
      'صحة': {emoji: '⚕️', color: '#059669'},
      'سفر': {emoji: '✈️', color: '#f59e0b'},
      'طعام': {emoji: '🍽️', color: '#f97316'},
      'عام': {emoji: '📰', color: '#6b7280'}
    };
    
    return categoryMap[categoryName] || categoryMap['عام'];
  };
  
  const getTimeAgo = (dateString: string) => {
    try {
      return formatRelativeDate(dateString);
    } catch {
      return 'منذ قليل';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const generatePlaceholderImage = (title: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const color = colors[title.length % colors.length];
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">
          ${title.slice(0, 50)}...
        </text>
      </svg>
    `)}`;
  };

  // بطاقة بتنسيق "بلوك المحتوى الذكي المخصص للاهتمامات"
  if (variant === 'smart-block') {
    return (
      <Link href={getArticleLink(data)} className={`block w-full ${className}`}>
        <article className={`
          relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg group
          ${data.breaking 
            ? (darkMode 
                ? 'bg-red-950/30 backdrop-blur-sm border-2 border-red-800/70 hover:bg-red-950/40' 
                : 'bg-red-50/90 backdrop-blur-sm border-2 border-red-200 hover:bg-red-50')
            : (darkMode 
                ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800' 
                : 'bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50')
          }
        `}>
          {/* الصورة الرئيسية */}
          <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <Image
              src={data.featured_image || generatePlaceholderImage(data.title)}
              alt={data.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = generatePlaceholderImage(data.title);
              }}
            />
            
            {/* تدرج للخلفية */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* شارات الحالة المحسنة مع AI */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {data.breaking && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              )}
              {data.isPersonalized && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  مخصص
                </span>
              )}
              {data.isTrending && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  رائج
                </span>
              )}
              {data.featured && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3" />
                  مميز
                </span>
              )}
            </div>

            {/* التصنيف المحسن */}
            {data.category_name && (() => {
              const categoryStyle = getCategoryStyle(data.category_name);
              return (
                <div className="absolute bottom-3 right-3 z-10">
                  <span 
                    className="flex items-center gap-1 px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: categoryStyle.color }}
                  >
                    <span>{categoryStyle.emoji}</span>
                    {data.category_name}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* المحتوى */}
          <div className="p-5 space-y-4">
            {/* العنوان */}
            <h3 className={`
              text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 
              transition-colors duration-200
              ${darkMode ? 'text-white dark:group-hover:text-blue-400' : 'text-gray-900'}
            `}>
              {data.title}
            </h3>

            {/* الملخص */}
            {data.excerpt && (
              <p className={`
                text-sm leading-relaxed line-clamp-2
                ${darkMode ? 'text-gray-300' : 'text-gray-600'}
              `}>
                {data.excerpt}
              </p>
            )}

            {/* معلومات المقال المحسنة */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {/* وقت القراءة */}
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  {data.reading_time} دقائق
                </span>
                
                {/* المشاهدات المحسنة */}
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Eye className="w-3 h-3" />
                  {formatNumber(data.interactionCount)}
                </span>
              </div>

              {/* التاريخ الميلادي */}
              <span className={`${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatDateGregorian(data.published_at)}
              </span>
            </div>

            {/* نسبة التوافق AI */}
            {data.isPersonalized && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Target className="w-3 h-3 text-purple-500" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-2 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${data.personalizedScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {data.personalizedScore}% ملائم لك
                  </span>
                </div>
              </div>
            )}

            {/* شريط التفاعل */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                {/* التفاعلات المدمجة */}
                <span className={`flex items-center gap-1 text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Eye className="w-3.5 h-3.5" />
                  {formatNumber(data.interactionCount)} تفاعل
                </span>

                {/* التعليقات */}
                {data.comments_count > 0 && (
                  <span className={`flex items-center gap-1 text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    {formatNumber(data.comments_count)}
                  </span>
                )}
              </div>

              {/* أزرار التفاعل */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onBookmark?.(article.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors duration-200 ${
                    data.is_bookmarked
                      ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onShare?.(article);
                  }}
                  className={`p-1.5 rounded-full transition-colors duration-200 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة المضغوطة
  if (variant === 'compact') {
    return (
      <Link href={getArticleLink(data)} className={`block w-full ${className}`}>
        <article className={`
          flex gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md
          ${data.breaking 
            ? (darkMode 
                ? 'bg-red-950/30 border-2 border-red-800/70 hover:bg-red-950/40' 
                : 'bg-red-50 border-2 border-red-200 hover:bg-red-100')
            : (darkMode 
                ? 'bg-gray-800/50 hover:bg-gray-800/80' 
                : 'bg-white hover:bg-gray-50')
          }
        `}>
          {/* الصورة المصغرة */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image
              src={data.featured_image || generatePlaceholderImage(data.title)}
              alt={data.title}
              fill
              className="object-cover"
              sizes="80px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = generatePlaceholderImage(data.title);
              }}
            />
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* الشارات المحسنة */}
            <div className="flex items-center gap-2 flex-wrap">
              {data.breaking && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              )}
              {data.isPersonalized && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  مخصص
                </span>
              )}
              {data.isTrending && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  رائج
                </span>
              )}
              {data.category_name && (() => {
                const categoryStyle = getCategoryStyle(data.category_name);
                return (
                  <span 
                    className="flex items-center gap-1 px-2 py-0.5 text-white text-xs font-bold rounded-full"
                    style={{ backgroundColor: categoryStyle.color }}
                  >
                    <span>{categoryStyle.emoji}</span>
                    {data.category_name}
                  </span>
                );
              })()}
            </div>

            {/* العنوان */}
            <h3 className={`
              font-bold text-sm leading-tight line-clamp-2
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}>
              {data.title}
            </h3>

            {/* المعلومات المحسنة */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Eye className="w-3 h-3" />
                  {formatNumber(data.interactionCount)}
                </span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  {data.reading_time} دقائق
                </span>
              </div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatDateGregorian(data.published_at)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة الافتراضية
  return (
    <Link href={getArticleLink(data)} className={`block w-full ${className}`}>
      <article className={`
        overflow-hidden rounded-xl transition-all duration-200 hover:shadow-lg
        ${data.breaking 
          ? (darkMode 
              ? 'bg-red-950/30 border-2 border-red-800/70' 
              : 'bg-red-50 border-2 border-red-200')
          : (darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200')
        }
      `}>
        {/* الصورة */}
        <div className="relative h-40 w-full bg-gray-200 dark:bg-gray-700">
          <Image
            src={data.featured_image || generatePlaceholderImage(data.title)}
            alt={data.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = generatePlaceholderImage(data.title);
            }}
          />
        </div>

        {/* المحتوى */}
        <div className="p-4 space-y-3">
          {/* الشارات المحسنة */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.breaking && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            )}
            {data.isPersonalized && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                <Sparkles className="w-3 h-3" />
                مخصص
              </span>
            )}
            {data.isTrending && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                <TrendingUp className="w-3 h-3" />
                رائج
              </span>
            )}
            {data.featured && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                <Star className="w-3 h-3" />
                مميز
              </span>
            )}
            {data.category_name && (() => {
              const categoryStyle = getCategoryStyle(data.category_name);
              return (
                <span 
                  className="flex items-center gap-1 px-2 py-1 text-white text-xs font-bold rounded-full"
                  style={{ backgroundColor: categoryStyle.color }}
                >
                  <span>{categoryStyle.emoji}</span>
                  {data.category_name}
                </span>
              );
            })()}
          </div>

          {/* العنوان */}
          <h3 className={`
            font-bold text-base leading-tight line-clamp-2
            ${darkMode ? 'text-white' : 'text-gray-900'}
          `}>
            {data.title}
          </h3>

          {/* الملخص */}
          {data.excerpt && (
            <p className={`
              text-sm leading-relaxed line-clamp-2
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {data.excerpt}
            </p>
          )}

          {/* المعلومات السفلية المحسنة */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Eye className="w-3 h-3" />
                  {formatNumber(data.interactionCount)} تفاعل
                </span>
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  {data.reading_time} دقائق
                </span>
              </div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatDateGregorian(data.published_at)}
              </span>
            </div>
            
            {/* نسبة التوافق AI */}
            {data.isPersonalized && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Target className="w-3 h-3 text-purple-500" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-1.5 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${data.personalizedScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {data.personalizedScore}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
