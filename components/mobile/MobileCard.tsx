'use client';

import React from 'react';
import { formatDateShort } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Share2, Bookmark, MessageSquare, Star, User } from 'lucide-react';
import { getArticleLink } from '@/lib/utils';

interface MobileCardProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    featured_image?: string;
    category?: {
      name: string;
      slug: string;
      color?: string;
    };
    author?: {
      name: string;
      avatar?: string;
    };
    published_at?: string;
    reading_time?: number;
    views?: number;
    comments_count?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  showImage?: boolean;
  showExcerpt?: boolean;
  darkMode?: boolean;
  onShare?: (article: any) => void;
  onBookmark?: (article: any) => void;
}

export default function MobileCard({ 
  article, 
  variant = 'default',
  showImage = true,
  showExcerpt = true,
  darkMode = false,
  onShare,
  onBookmark
}: MobileCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-article.jpg';
    if (url.startsWith('http')) return url;
    return `https://res.cloudinary.com/your-cloud/image/fetch/w_400,h_200,c_fill,f_auto,q_auto/${encodeURIComponent(url)}`;
  };

  if (variant === 'compact') {
    return (
      <div className="mobile-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden tap-highlight">
        <Link href={getArticleLink(article)} className="block">
          <div className="flex gap-3 p-4">
            {showImage && article.featured_image && (
              <div className="flex-shrink-0">
                <Image
                  src={getImageUrl(article.featured_image)}
                  alt={article.title}
                  width={80}
                  height={80}
                  className="thumbnail object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {article.category && (
                <div className="mb-2">
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: article.category.color + '20' || '#3b82f620',
                      color: article.category.color || '#3b82f6'
                    }}
                  >
                    {String(article.category.name || '')}
                  </span>
                </div>
              )}
              
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-clamp-2 mb-2">
                {String(article.title || '')}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {String(formatDate(article.published_at || '') || '')}
                </span>
                
                {article.reading_time && (
                  <span>{String(article.reading_time)} دقيقة</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
        <Link href={getArticleLink(article)} className="block relative">
          {showImage && article.featured_image && (
            <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden">
              <Image
                src={getImageUrl(article.featured_image)}
                alt={article.title}
                width={400}
                height={256}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              
              {/* التدرج المحسن - ظلال من الأسفل تنتهي تدريجياً إلى ثلث الصورة */}
              <div className="absolute inset-0" 
                   style={{
                     background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, transparent 100%)'
                   }} />

              {/* شارة "مميز" في الزاوية العلوية اليمنى */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5" />
                  مميز
                </div>
              </div>

              {/* المحتوى النصي المحسن فوق الظلال */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                {/* التصنيف مع تصميم محسن */}
                {article.category && (
                  <div className="mb-3">
                    <span 
                      className="inline-block bg-white/25 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-lg font-semibold border border-white/40 shadow-lg"
                      style={{ 
                        backgroundColor: `${article.category.color || '#3b82f6'}40`,
                        borderColor: `${article.category.color || '#3b82f6'}60`,
                        boxShadow: `0 4px 12px ${article.category.color || '#3b82f6'}20`
                      }}
                    >
                      {article.category.name}
                    </span>
                  </div>
                )}

                {/* العنوان المحسن - محسّن للهواتف */}
                <h2 className="text-base md:text-lg font-bold text-white line-clamp-2 leading-tight mb-4 drop-shadow-2xl"
                    style={{
                      textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)'
                    }}>
                  {article.title}
                </h2>

                {/* معلومات المراسل والتاريخ مع تصميم جميل - محسّن للهواتف */}
                <div className="flex items-center justify-between text-white/80 text-xs backdrop-blur-sm bg-black/20 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-4">
                    {/* المراسل */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">{article.author?.name || 'كاتب مجهول'}</span>
                    </div>
                    
                    {/* التاريخ */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                      <span>{formatDate(article.published_at || '')}</span>
                    </div>
                  </div>

                  {/* إحصائيات جميلة */}
                  <div className="flex items-center gap-3">
                    {article.views && (
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs font-medium">{article.views}</span>
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
          )}
        </Link>
        
        {/* أزرار التفاعل */}
        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          {onBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark(article);
              }}
              className="icon-button bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="حفظ المقال"
            >
              <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          {onShare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onShare(article);
              }}
              className="icon-button bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="مشاركة المقال"
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="mobile-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden tap-highlight">
      <Link href={getArticleLink(article)} className="block">
        {showImage && article.featured_image && (
          <div className="relative">
            <Image
              src={getImageUrl(article.featured_image)}
              alt={article.title}
              width={400}
              height={150}
              className="card-image object-cover"
              loading="lazy"
            />
            
            {article.category && (
              <div className="absolute top-2 right-2">
                <span 
                  className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm"
                  style={{ color: article.category.color || '#3b82f6' }}
                >
                  {article.category.name}
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4">
          {!showImage && article.category && (
            <div className="mb-2">
              <span 
                className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: article.category.color + '20' || '#3b82f620',
                  color: article.category.color || '#3b82f6'
                }}
              >
                {article.category.name}
              </span>
            </div>
          )}
          
          <h3 className="text-base font-semibold text-gray-900 dark:text-white text-clamp-2 mb-2">
            {article.title}
          </h3>
          
          {showExcerpt && article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-300 text-clamp-2 mb-3">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(article.published_at || '')}
              </span>
              
              {article.reading_time && (
                <span>{article.reading_time} دقيقة</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {article.views && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}