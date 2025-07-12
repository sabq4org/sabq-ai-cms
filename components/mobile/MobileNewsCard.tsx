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
      <article className={`relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md ${
        news.is_breaking 
          ? darkMode 
            ? 'bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-800' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200'
          : darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
      }`}>
        {/* تصميم أفقي محسّن */}
        <div className="flex h-28">
          {/* الصورة - مربعة ومحاذاة لليمين */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <CloudImage
              src={news.featured_image}
              alt={news.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover"
              fallbackType="article"
              priority={false}
            />
            {news.is_breaking && (
              <div className="absolute top-1 right-1">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white shadow">
                  <Zap className="w-2.5 h-2.5" />
                  عاجل
                </span>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="flex-1 p-3 flex flex-col">
            {/* التصنيف */}
            {news.category_name && (
              <div className="mb-1.5">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${
                  darkMode 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {news.category_name}
                </span>
              </div>
            )}

            {/* العنوان - أصغر وأكثر أناقة */}
            <h3 className={`font-bold text-sm mb-auto line-clamp-3 leading-tight ${
              news.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {news.title}
            </h3>

            {/* الملخص المختصر - إضافة جديدة */}
            {news.summary && (
              <p className={`text-xs line-clamp-2 mb-2 leading-relaxed ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {news.summary}
              </p>
            )}

            {/* معلومات سريعة - في الأسفل */}
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
              <span className="mr-auto">
                {new Date(news.published_at || news.created_at).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 