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
        {/* الصورة الأساسية محسنة للموبايل */}
        <div className="relative w-full h-64 overflow-hidden">
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

          {/* التدرج المبسط - تدرج أسود شفاف يتلاشى للأعلى */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

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

          {/* المحتوى النصي المبسط - نص أبيض واضح فوق التدرج */}
          <div className="absolute bottom-0 left-0 right-0 p-4 w-full z-10">
            {/* العنوان بخط عريض أبيض */}
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-tight mb-2">
              {article.title}
            </h3>

            {/* تاريخ النشر بلون رمادي فاتح */}
            <p className="text-xs sm:text-sm text-gray-300 mb-1">
              {formatDateTime(displayDate)}
            </p>

            {/* اسم المراسل بخط صغير */}
            {authorName && authorName !== 'كاتب مجهول' && (
              <p className="text-xs text-gray-400">
                {authorName}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}