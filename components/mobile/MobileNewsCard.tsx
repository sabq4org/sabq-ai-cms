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
      <article className={`overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md ${
        news.is_breaking 
          ? darkMode 
            ? 'bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-800' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200'
          : darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
      }`}>
        {/* تصميم عمودي محسّن للموبايل */}
        <div className="flex flex-col">
          {/* الصورة - أفقية بنسبة 16:9 */}
          <div className="relative w-full aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
            <CloudImage
              src={news.featured_image}
              alt={news.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover"
              fallbackType="article"
              priority={false}
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {news.is_breaking && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg backdrop-blur-sm">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              </div>
            )}
            {/* Caption للصورة إذا كان موجود */}
            {news.image_caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white/90">
                  📷 {news.image_caption}
                </p>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="p-4 space-y-2">
            {/* التصنيف والمعلومات الأساسية */}
            <div className="flex items-center gap-2 text-xs">
              {news.category_name && (
                <span className={`font-medium px-2.5 py-0.5 rounded-full ${
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

            {/* العنوان */}
            <h3 className={`font-bold text-base leading-snug line-clamp-2 ${
              news.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {news.title}
            </h3>

            {/* الملخص */}
            {news.summary && (
              <p className={`text-sm line-clamp-2 leading-relaxed ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {news.summary}
              </p>
            )}

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {news.reading_time || 5} دقائق
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {news.views_count > 1000 
                    ? `${(news.views_count / 1000).toFixed(1)}k` 
                    : news.views_count || 0}
                </span>
              </div>
              {news.author_name && (
                <span className="text-gray-600 dark:text-gray-400 font-medium">
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