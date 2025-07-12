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
      <article className={`relative overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-md ${
        news.is_breaking 
          ? darkMode 
            ? 'bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-800' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200'
          : darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
      }`}>
        {/* تصميم أفقي مستطيل */}
        <div className="flex">
          {/* الصورة - أكبر ومربعة */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <CloudImage
              src={news.featured_image}
              alt={news.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover"
              fallbackType="article"
              priority={false}
            />
            {news.is_breaking && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            {/* التصنيف */}
            {news.category_name && (
              <div className="flex items-center gap-1 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  darkMode 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {news.category_name}
                </span>
              </div>
            )}

            {/* العنوان */}
            <h3 className={`font-bold text-base mb-2 line-clamp-2 leading-snug ${
              news.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {news.title}
            </h3>

            {/* معلومات سريعة */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {news.reading_time || 5} د
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {news.views_count > 1000 
                  ? `${(news.views_count / 1000).toFixed(1)}k` 
                  : news.views_count || 0}
              </span>
              <span className="mr-auto text-gray-400">
                {new Date(news.published_at || news.created_at).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 