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
    <div className={`relative w-full overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${className}`}>
      <Link href={getArticleLink(article)} className="block relative">
        {/* الصورة الأساسية محسنة للموبايل */}
        <div className="relative w-full h-[280px] overflow-hidden">
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

          {/* Overlay Gradient - طبقة ضبابية سوداء لتمييز العنوان */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent z-10" />

          {/* وسم "مميز" في الزاوية العلوية اليمنى */}
          <div className="absolute top-3 right-3 z-30 bg-yellow-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
            مميز ✨
          </div>

          {/* شارة عاجل إذا كانت موجودة */}
          {article.breaking && (
            <div className="absolute top-3 left-3 z-30 bg-red-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              عاجل
            </div>
          )}

          {/* العنوان فوق الطبقة الضبابية */}
          <div className="absolute bottom-4 left-4 right-4 z-20 text-white text-lg font-semibold leading-snug">
            {article.title}
          </div>
        </div>
      </Link>
    </div>
  );
}