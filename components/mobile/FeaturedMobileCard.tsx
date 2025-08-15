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
    <div className={`relative rounded-lg overflow-hidden group ${className}`}>
      <Link href={getArticleLink(article)} className="block">
        {/* الحاوية الرئيسية */}
        <div className="relative overflow-hidden">
          {/* الصورة بارتفاع ثابت ومتدرج حسب المقاس */}
          <div className="relative w-full h-48 sm:h-56 lg:h-64">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* شعار مميز اختياري يمكن إظهاره لاحقاً */}

          {/* شارة عاجل إذا كانت موجودة */}
          {article.breaking && (
            <div className="absolute top-3 left-3 z-30 bg-red-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              عاجل
            </div>
          )}

          {/* العنوان للموبايل فقط */}
          <div className="md:hidden absolute bottom-3 left-4 right-4 z-10">
            <h3 className="text-white text-sm sm:text-base lg:text-lg font-bold leading-snug drop-shadow-md line-clamp-2">
              {article.title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
}