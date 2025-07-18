'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Bookmark, Share2, Heart, MessageCircle } from 'lucide-react';
import { getArticleLink } from '@/lib/utils';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';

interface EnhancedMobileNewsCardProps {
  news: any;
  darkMode: boolean;
  variant?: 'hero' | 'compact' | 'full-width';
  onBookmark?: (id: string) => void;
  onShare?: (news: any) => void;
}

export default function EnhancedMobileNewsCard({ 
  news, 
  darkMode, 
  variant = 'compact',
  onBookmark,
  onShare 
}: EnhancedMobileNewsCardProps) {
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onShare) onShare(news);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBookmark) onBookmark(news.id);
  };

  // بطاقة Hero للأخبار المميزة
  if (variant === 'hero') {
    return (
      <Link href={getArticleLink(news)} className="block w-full">
        <article className={`relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* الصورة بارتفاع أكبر */}
          <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-700">
            <Image
              src={getValidImageUrl(news.featured_image, news.title, 'article')}
              alt={news.title || 'صورة المقال'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = generatePlaceholderImage(news.title, 'article');
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* التصنيف */}
            {news.category_name && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {news.category_name}
                </span>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="p-5">
            <h2 className={`text-xl font-bold leading-tight mb-3 line-clamp-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {news.title}
            </h2>
            
            {news.excerpt && (
              <p className={`text-sm leading-relaxed line-clamp-2 mb-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {news.excerpt}
              </p>
            )}

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {news.reading_time || 5} دقائق
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {news.views_count > 1000 
                    ? `${(news.views_count / 1000).toFixed(1)}k` 
                    : news.views_count || 0}
                </span>
              </div>
              
              {/* أزرار التفاعل */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
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

  // بطاقة Full Width للقوائم
  if (variant === 'full-width') {
    return (
      <Link href={getArticleLink(news)} className="block w-full">
        <article className={`overflow-hidden transition-all ${
          darkMode 
            ? 'bg-gray-800/50 active:bg-gray-700/50' 
            : 'bg-white active:bg-gray-50'
        }`}>
          <div className="flex items-start p-4 gap-4">
            {/* الصورة - مربعة مع زوايا دائرية */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image
                src={getValidImageUrl(news.featured_image, news.title, 'article')}
                alt={news.title || 'صورة المقال'}
                fill
                className="object-cover"
                sizes="96px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = generatePlaceholderImage(news.title, 'article');
                }}
              />
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              {/* التصنيف والوقت */}
              <div className="flex items-center gap-2 mb-2">
                {news.category_name && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    darkMode 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {news.category_name}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(news.published_at || news.created_at)}
                </span>
              </div>

              {/* العنوان */}
              <h3 className={`font-bold text-base leading-tight line-clamp-2 mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {news.title}
              </h3>

              {/* معلومات سريعة مع تفاعلات */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(news.views_count || 0)}
                  </span>
                  {news.likes_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(news.likes_count)}
                    </span>
                  )}
                  {news.comments_count > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {formatNumber(news.comments_count)}
                    </span>
                  )}
                </div>
                
                {news.author_name && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                    {news.author_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة المضغوطة الافتراضية
  return (
    <Link href={getArticleLink(news)} className="block">
      <article className={`relative overflow-hidden rounded-xl transition-all ${
        darkMode 
          ? 'bg-gray-800 shadow-lg hover:shadow-xl' 
          : 'bg-white shadow-md hover:shadow-lg'
      }`}>
        {/* الصورة مع نسبة 16:9 */}
        <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
          <Image
            src={getValidImageUrl(news.featured_image, news.title, 'article')}
            alt={news.title || 'صورة المقال'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = generatePlaceholderImage(news.title, 'article');
            }}
          />
          
          {/* التصنيف على الصورة */}
          {news.category_name && (
            <div className="absolute bottom-3 right-3">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg backdrop-blur-md ${
                darkMode 
                  ? 'bg-black/50 text-white' 
                  : 'bg-white/90 text-gray-900'
              }`}>
                {news.category_name}
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="p-4">
          <h3 className={`font-bold text-base leading-snug line-clamp-2 mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {news.title}
          </h3>

          {/* معلومات سريعة */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span>{getTimeAgo(news.published_at || news.created_at)}</span>
              <span>•</span>
              <span>{news.reading_time || 5} دقائق</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatNumber(news.views_count || 0)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// دوال مساعدة
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'منذ دقائق';
  if (diffInHours === 1) return 'منذ ساعة';
  if (diffInHours < 24) return `منذ ${diffInHours} ساعات`;
  if (diffInHours < 48) return 'أمس';
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
  if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`;
  
  return date.toLocaleDateString('ar-SA');
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
} 