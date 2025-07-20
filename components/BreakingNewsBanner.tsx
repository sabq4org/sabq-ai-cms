'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Flame, X, Clock } from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';

interface BreakingNewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  lead?: string;
  featuredImage?: string;
  publishedAt: string;
  category?: string;
  readTime?: number;
}

interface BreakingNewsBannerProps {
  article: BreakingNewsArticle | null;
  onDismiss?: () => void;
}

export default function BreakingNewsBanner({ article, onDismiss }: BreakingNewsBannerProps) {
  console.log('🔥 BreakingNewsBanner: تم تحميل مكون الأخبار العاجلة:', article);
  
  if (!article) {
    console.log('⚠️ BreakingNewsBanner: لا يوجد خبر عاجل للعرض');
    return null;
  }

  const articleUrl = `/articles/${article.slug}`;
  const summary = article.summary || article.lead || '';

  console.log('📰 BreakingNewsBanner: عرض خبر عاجل:', article.title);

  return (
    <div className="w-full bg-red-50 border-b border-red-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-4 bg-white border border-red-300 rounded-lg p-4 shadow-sm">
          {/* أيقونة الخبر العاجل */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>

          {/* الصورة المصغرة */}
          {article.featuredImage && (
            <div className="flex-shrink-0 hidden sm:block">
              <Link href={articleUrl}>
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          )}

          {/* محتوى الخبر */}
          <div className="flex-1 min-w-0">
            {/* شارة الخبر العاجل */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                خبر عاجل
              </span>
              {article.category && (
                <span className="text-red-600 text-sm font-medium">
                  {article.category}
                </span>
              )}
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateShort(article.publishedAt)}
              </span>
            </div>

            {/* العنوان */}
            <Link href={articleUrl}>
              <h2 className="text-red-600 font-bold text-lg sm:text-xl leading-tight mb-2 hover:text-red-700 transition-colors line-clamp-2">
                {article.title}
              </h2>
            </Link>

            {/* النبذة */}
            {summary && (
              <p className="text-gray-700 text-sm sm:text-base line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}

            {/* معلومات إضافية */}
            <div className="flex items-center gap-4 mt-3">
              {article.readTime && (
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime} دقائق قراءة
                </span>
              )}
              <Link 
                href={articleUrl}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                قراءة التفاصيل ←
              </Link>
            </div>
          </div>

          {/* زر الإغلاق (اختياري) */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="إخفاء الخبر العاجل"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
