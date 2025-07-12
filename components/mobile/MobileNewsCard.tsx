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
      <article className={`flex gap-3 p-3 rounded-xl transition-all ${
        news.is_breaking 
          ? darkMode 
            ? 'bg-red-950/20 border border-red-800' 
            : 'bg-red-50 border border-red-200'
          : darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
      }`}>
        {/* الصورة المصغرة */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
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
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="flex-1 min-w-0">
          {/* التصنيف */}
          {news.category_name && (
            <div className="flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {news.category_name}
              </span>
            </div>
          )}

          {/* العنوان */}
          <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${
            news.is_breaking 
              ? 'text-red-700 dark:text-red-400' 
              : darkMode 
                ? 'text-white' 
                : 'text-gray-900'
          }`}>
            {news.title}
          </h3>

          {/* الملخص - مختصر جداً */}
          {news.summary && (
            <p className={`text-xs line-clamp-1 mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {news.summary}
            </p>
          )}

          {/* معلومات سريعة */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {news.reading_time || 5} د
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {news.views_count || 0}
            </span>
            <span className="mr-auto">
              {new Date(news.published_at || news.created_at).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
} 