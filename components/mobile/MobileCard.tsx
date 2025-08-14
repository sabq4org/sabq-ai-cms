'use client';

import React from 'react';
import { formatDateShort } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Share2, Bookmark, MessageSquare, Star, User } from 'lucide-react';
import ArticleViews from '@/components/ui/ArticleViews';
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
        <Link href={getArticleLink(article)} className="block">
          {showImage && article.featured_image && (
            <div className="relative overflow-hidden">
              {/* الصورة بارتفاع ثابت */}
              <div className="relative w-full h-56 md:h-64">
                <Image
                  src={getImageUrl(article.featured_image)}
                  alt={article.title}
                  fill
                  className="h-56 w-full object-cover md:h-64"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  loading="lazy"
                  fetchPriority="low"
                />
              </div>
              
              {/* طبقة الظل من أسفل لأعلى */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              {/* شارة "مميز" في الزاوية العلوية اليمنى */}
              <div className="absolute top-4 right-4 z-30">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5" />
                  مميز
                </div>
              </div>

              {/* محتوى أسفل الصورة - العنوان داخل الصورة */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                {/* وسم التصنيف إن وجد */}
                {article.category && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-white/85">
                    <span>{article.category.name}</span>
                  </div>
                )}

                {/* العنوان */}
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
                  {article.title}
                </h3>
              </div>
            </div>
          )}
        </Link>
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
                <ArticleViews count={article.views} className="text-xs text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}