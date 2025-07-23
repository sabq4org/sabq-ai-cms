'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Zap } from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';
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

interface CompactArticleCardProps {
  article: Article;
}

export default function CompactArticleCard({ article }: CompactArticleCardProps) {
  const isBreaking = article.is_breaking || article.breaking || article.metadata?.is_breaking || false;
  const viewsCount = article.views_count || article.views || 0;
  const imageUrl = getValidImageUrl(article.featured_image, article.title, 'article');

  return (
    <Link href={getArticleLink(article)}>
      <article className={`group overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md ${
        isBreaking 
          ? 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 dark:bg-gradient-to-br dark:from-red-950/30 dark:to-red-900/20 dark:border-red-800' 
          : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }`}>
        {/* تصميم أفقي محسّن - ارتفاع ثابت */}
        <div className="flex h-32">
          {/* الصورة - مربعة */}
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
            <Image
              src={imageUrl}
              alt={article.title || 'صورة المقال'}
              fill
              className="object-cover"
              sizes="128px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = generatePlaceholderImage(article.title, 'article');
              }}
            />
            {isBreaking && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="flex-1 p-4 flex flex-col">
            {/* التصنيف والتاريخ */}
            <div className="flex items-center justify-between text-xs mb-2">
              {article.category_name && (
                <span className={`font-medium px-2 py-1 rounded-full ${
                  isBreaking
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {article.category_name}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {formatDateShort(article.published_at || article.created_at)}
              </span>
            </div>

            {/* العنوان */}
            <h3 className={`font-bold text-base leading-tight line-clamp-2 flex-grow mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
              isBreaking 
                ? 'text-red-700 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {article.title}
            </h3>

            {/* معلومات سريعة */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.reading_time || 5} دقائق
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {viewsCount > 1000 
                  ? `${(viewsCount / 1000).toFixed(1)}k` 
                  : viewsCount}
              </span>
              {article.author_name && (
                <span className="mr-auto truncate max-w-[150px]">
                  {article.author_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}