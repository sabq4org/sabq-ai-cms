'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Tag, Zap } from 'lucide-react';
import { getArticleLink } from '@/lib/utils';
import CloudImage from '@/components/ui/CloudImage';

interface MobileNewsCardProps {
  news: any;
  darkMode: boolean;
}

export default function MobileNewsCard({ news, darkMode }: MobileNewsCardProps) {
  return (
    <Link href={getArticleLink(news)} className="block">
      <article className={`overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md ${
        news.is_breaking 
          ? darkMode 
            ? 'bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-800' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200'
          : darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
      }`}>
        {/* تصميم أفقي محسّن - ارتفاع ثابت */}
        <div className="flex h-28">
          {/* الصورة - مربعة مع margin */}
          <div className="relative w-28 h-28 flex-shrink-0 bg-gray-200 dark:bg-gray-700 ml-2">
            <CloudImage
              src={news.featured_image}
              alt={news.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover"
              fallbackType="article"
              priority={false}
              sizes="112px"
            />
            {news.is_breaking && (
              <div className="absolute top-1 right-1">
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                  <Zap className="w-2.5 h-2.5" />
                  عاجل
                </span>
              </div>
            )}
          </div>

          {/* المحتوى - مساحة أكبر للعنوان */}
          <div className="flex-1 p-2.5 pl-1 flex flex-col">
            {/* التصنيف والتاريخ */}
            <div className="flex items-center justify-between text-[10px] mb-1">
              {news.category_name && (
                <span className={`font-medium px-1.5 py-0.5 rounded-full ${
                  darkMode 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {news.category_name}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(news.published_at || news.created_at).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* العنوان - 3 أسطر كحد أقصى */}
            <h3 className={`font-bold text-sm leading-snug line-clamp-3 flex-grow ${
              news.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {news.title}
            </h3>

            {/* معلومات سريعة */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {news.reading_time || 5} د
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                {news.views_count > 1000 
                  ? `${(news.views_count / 1000).toFixed(1)}k` 
                  : news.views_count || 0}
              </span>
              {news.author_name && (
                <span className="mr-auto truncate max-w-[80px]">
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