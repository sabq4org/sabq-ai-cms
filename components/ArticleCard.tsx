'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, User, Sparkles, Zap, Heart, Calendar, ArrowLeft, Newspaper } from 'lucide-react';
import { formatDateOnly } from '@/lib/date-utils';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';
import { getArticleLink } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  author_name?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  views_count?: number;
  views?: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  breaking?: boolean;
  is_featured?: boolean;
  featured?: boolean;
  metadata?: {
    is_breaking?: boolean;
    is_featured?: boolean;
    [key: string]: any;
  };
}

interface ArticleCardProps {
  article: Article;
  viewMode?: 'grid' | 'list';
}

// دالة تنسيق التاريخ
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'اليوم';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
  
  return date.toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export default function ArticleCard({ article, viewMode = 'grid' }: ArticleCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // استخدام الحقول الصحيحة مع fallback
  const isBreaking = article.is_breaking || article.breaking || article.metadata?.is_breaking || false;
  const isFeatured = article.is_featured || article.featured || article.metadata?.is_featured || false;
  const viewsCount = article.views_count || article.views || 0;
  const summary = article.summary || article.excerpt;
  const authorName = article.author_name || article.author?.name || 'غير محدد';
  const categoryName = article.category_name || article.category?.name || 'عام';

  const imageUrl = getValidImageUrl(article.featured_image, article.title, 'article');

  if (viewMode === 'list') {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6 ${
          isBreaking 
            ? 'border-2 border-red-200 dark:border-red-800'
            : 'border border-gray-100 dark:border-gray-700'
        }`}>
          {/* Image */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            {article.featured_image ? (
              <Image
                src={imageUrl}
                alt={article.title || 'صورة المقال'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="200px"
                priority={false}
                unoptimized={article.featured_image.includes('cloudinary.com')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <Newspaper className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            {isBreaking && (
              <div className="absolute top-2 right-2">
                <span className="urgent-badge inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              </div>
            )}
            {isFeatured && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Sparkles className="w-3 h-3" />
                  مميز
                </span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className={`text-[17px] font-bold leading-[1.4] mb-2 ${
              isBreaking 
                ? 'text-red-700 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
            } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2`}>
              {article.title}
            </h3>
            
            {summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at || article.created_at)}
                </span>
                {article.reading_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.reading_time} دقيقة
                  </span>
                )}
                {authorName && authorName !== 'غير محدد' && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {authorName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  {viewsCount > 0 ? viewsCount.toLocaleString('ar-SA') : 'جديد'}
                </span>
                {likesCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Heart className="w-4 h-4" />
                    {likesCount.toLocaleString('ar-SA')}
                  </span>
                )}
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid View - مطابق تماماً لتصميم صفحة التصنيف
  return (
    <Link href={getArticleLink(article)} className="group block">
      <article className={`article-card h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 ${
        isBreaking 
          ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
      }`}>
        {/* صورة المقال */}
        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {article.featured_image ? (
            <Image
              src={imageUrl}
              alt={article.title || 'صورة المقال'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
              unoptimized={article.featured_image.includes('cloudinary.com')}
              onError={(e) => {
                console.error('خطأ في تحميل الصورة:', article.featured_image);
                const target = e.currentTarget as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRTVFN0VCO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNEMUQ1REI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNncmFkMSkiLz4KICA8cGF0aCBkPSJNMzAwIDIwMCBMNTAwIDIwMCBMNTAwIDQwMCBMMzAwIDQwMCBaIiBmaWxsPSIjOUNBM0FGIiBvcGFjaXR5PSIwLjUiLz4KICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjUwIiBmaWxsPSIjOUNBM0FGIiBvcGFjaXR5PSIwLjUiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjQ1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjgiPgogICAgINi12YjYsdipINin2YTZhNmC2KfZhAogIDwvdGV4dD4KPC9zdmc+';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}
          
          {/* معلومات أسفل الصورة */}
          <div className="absolute bottom-3 right-3 left-3 flex gap-2">
            {/* وقت القراءة */}
            {article.reading_time && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {article.reading_time} دقيقة
              </span>
            )}
            {/* اسم الكاتب */}
            {authorName && authorName !== 'غير محدد' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                <User className="w-3 h-3" />
                {authorName}
              </span>
            )}
          </div>
          
          {/* شارة عاجل */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <span className="urgent-badge inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white backdrop-blur-sm">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            </div>
          )}
          
          {/* شارة مميز */}
          {isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                مميز
              </span>
            </div>
          )}
        </div>
        
        {/* محتوى البطاقة */}
        <div className="p-5">
          {/* العنوان */}
          <h4 className={`font-bold text-[15px] leading-[1.4] mb-3 line-clamp-3 ${
            isBreaking 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-gray-900 dark:text-white'
          } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
            {article.title}
          </h4>
          
          {/* الملخص */}
          {summary && (
            <p className="text-[13px] leading-relaxed mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
              {summary}
            </p>
          )}
          
          {/* التفاصيل السفلية */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* المعلومات */}
            <div className="flex flex-col gap-1">
              {/* التاريخ */}
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at || article.created_at)}
              </div>
              {/* المشاهدات */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Eye className="w-3 h-3" />
                  {viewsCount > 0 ? viewsCount.toLocaleString('ar-SA') : 'جديد'}
                </span>
                {likesCount > 0 && (
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Heart className="w-3 h-3" />
                    {likesCount.toLocaleString('ar-SA')}
                  </span>
                )}
              </div>
            </div>
            {/* زر القراءة */}
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}