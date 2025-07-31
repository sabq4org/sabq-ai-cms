'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, User, Star, Sparkles } from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';
import { getArticleLink } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface Article {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  author_name?: string;
  views_count: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  slug: string;
  category?: {
    name: string;
    slug: string;
    color?: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
}

interface FeaturedMobileCardProps {
  article: Article;
  className?: string;
}

export default function FeaturedMobileCard({ article, className = '' }: FeaturedMobileCardProps) {
  const { darkMode } = useDarkModeContext();
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = getValidImageUrl(article.featured_image);
  const displayDate = article.published_at || article.created_at;
  const authorName = article.author?.name || article.author_name || 'كاتب مجهول';
  const categoryName = article.category?.name || article.category_name || '';
  const categoryColor = article.category?.color || '#3b82f6';

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'منذ قليل';
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return date.toLocaleDateString('ar-SA', options);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${className}`}>
      <Link href={getArticleLink(article)} className="block relative">
        {/* الصورة الأساسية مع التصميم المحسن */}
        <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = generatePlaceholderImage(article.title, 'article');
            }}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" />
            </div>
          )}

          {/* التدرج المحسن - ظلال من الأسفل تنتهي تدريجياً إلى ثلث الصورة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" 
               style={{
                 background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, transparent 100%)'
               }} />

          {/* شارة "مميز" في الزاوية العلوية اليمنى */}
          {article.is_featured && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                مميز
              </div>
            </div>
          )}

          {/* شارة عاجل إذا كانت موجودة */}
          {article.is_breaking && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                عاجل
              </div>
            </div>
          )}

          {/* المحتوى النصي المحسن فوق الظلال */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
            {/* التصنيف مع تصميم محسن */}
            {categoryName && (
              <div className="mb-3">
                <span 
                  className="inline-block bg-white/25 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-lg font-semibold border border-white/40 shadow-lg"
                  style={{ 
                    backgroundColor: `${categoryColor}40`,
                    borderColor: `${categoryColor}60`,
                    boxShadow: `0 4px 12px ${categoryColor}20`
                  }}
                >
                  {categoryName}
                </span>
              </div>
            )}

            {/* العنوان المحسن */}
            <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-2 leading-tight mb-4 drop-shadow-2xl"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)'
                }}>
              {article.title}
            </h2>

            {/* معلومات المراسل والتاريخ مع تصميم جميل */}
            <div className="flex items-center justify-between text-white/95 text-sm backdrop-blur-sm bg-black/20 rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-4">
                {/* المراسل */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">{authorName}</span>
                </div>
                
                {/* التاريخ */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <span>{formatDateTime(displayDate)}</span>
                </div>
              </div>

              {/* إحصائيات جميلة */}
              <div className="flex items-center gap-3">
                {article.views_count > 0 && (
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs font-medium">{article.views_count}</span>
                  </div>
                )}
                {article.reading_time && (
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                    <span className="text-xs">⏱️</span>
                    <span className="text-xs font-medium">{article.reading_time} دقيقة</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}