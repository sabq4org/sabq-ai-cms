'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Zap, 
  Newspaper, 
  Clock,
  Sparkles 
} from 'lucide-react';
import ArticleViews from '@/components/ui/ArticleViews';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  created_at?: string;
  views_count?: number;
  reading_time?: number;
  author_name?: string;
  is_breaking?: boolean;
  is_featured?: boolean;
  category_name?: string;
}

interface CompactCategoryCardMiniProps {
  article: Article;
  darkMode?: boolean;
  className?: string;
}

const getArticleLink = (article: Article) => {
  return `/article/${article.id}`;
};

const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar
    });
  } catch {
    return 'منذ قليل';
  }
};

export default function CompactCategoryCardMini({
  article,
  darkMode = false,
  className = ''
}: CompactCategoryCardMiniProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <Link href={getArticleLink(article)} className="group block">
      <div
        className={`relative h-32 flex flex-row rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
            : "bg-white border-gray-200 hover:border-blue-200"
        } ${className}`}
      >
        {/* الصورة الرئيسية */}
        <div className="relative w-2/5 h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
          {article.featured_image && !imageError ? (
            <>
              {!imageLoaded && (
                <div className={`absolute inset-0 animate-pulse ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-300 border-t-transparent"></div>
                  </div>
                </div>
              )}
              <img
                src={article.featured_image}
                alt={article.title}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="flex-1 p-2 flex flex-col justify-between">
          {/* نوع المحتوى */}
          <div className="mb-1 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  article.is_breaking
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : article.is_featured
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                <span className="text-xs">
                  {article.is_breaking ? "🔥" : article.is_featured ? "⭐" : "📰"}
                </span>
                {article.is_breaking ? "عاجل" : article.is_featured ? "مميز" : "خبر"}
              </span>
            </div>
            
            {/* العبارة التشويقية */}
            <div className={`mt-1 ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
              <p className="text-[10px] font-medium">
                {article.category_name ? `أحدث أخبار ${article.category_name}` : "خبر جديد"}
              </p>
            </div>
          </div>

          {/* العنوان */}
          <h3
            className={`font-bold text-[11px] leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {article.title}
          </h3>

          {/* المعلومات الإضافية */}
          <div className={`flex items-center justify-between text-[10px] ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>{article.reading_time || 5} د</span>
              </div>
            </div>
            <span className="text-[9px]">
              {formatDate(article.published_at || article.created_at || '')}
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}