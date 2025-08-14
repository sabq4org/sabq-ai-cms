'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  author_name?: string;
  author_id?: string;
  views_count: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  breaking?: boolean;
  featured?: boolean;
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getValidImageUrl(article.featured_image);

  return (
    <div className={`relative w-full md:w-[calc(100%+32px)] md:-mr-4 md:-ml-4 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${className}`}>
      <Link href={getArticleLink(article)} className="block">
        {/* الحاوية الرئيسية - relative وoverflow hidden */}
        <div className="relative overflow-hidden">
          {/* الصورة بارتفاع ثابت */}
          <div className="relative w-full h-56 md:h-64">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="h-56 w-full object-cover md:h-64"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              loading="lazy"
              fetchPriority="low"
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
          </div>

          {/* طبقة الظل من أسفل لأعلى */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

          {/* وسم "مميز" في الزاوية العلوية اليمنى */}
          <div className="absolute top-3 right-3 z-30 bg-gradient-to-l from-yellow-500 to-amber-600 text-white px-3 py-1.5 text-xs rounded-full shadow-md flex items-center gap-1 font-bold">
            <span className="text-yellow-200">✨</span>
            مميز
          </div>

          {/* شارة عاجل إذا كانت موجودة */}
          {article.breaking && (
            <div className="absolute top-3 left-3 z-30 bg-red-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              عاجل
            </div>
          )}

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
      </Link>
    </div>
  );
}