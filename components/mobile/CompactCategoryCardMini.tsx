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
    <Link href={getArticleLink(article)} className="block">
      <article className={`
        ${className}
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98] overflow-hidden
        ${darkMode ? 'hover:shadow-gray-900/50' : 'hover:shadow-gray-200'}
      `}>
        
        <div className="flex items-start p-3 gap-3">
          
          {/* الصورة المصغرة - حجم صغير جداً */}
          <div className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {article.featured_image && !imageError ? (
              <>
                {/* شيمر أثناء التحميل */}
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
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            
            {/* شارة عاجل */}
            {article.is_breaking && (
              <div className="absolute -top-1 -right-1 z-10">
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full shadow-sm">
                  <Zap className="w-2 h-2" />
                </span>
              </div>
            )}
            
            {/* شارة مميز */}
            {article.is_featured && !article.is_breaking && (
              <div className="absolute -top-1 -right-1 z-10">
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-full shadow-sm">
                  <Sparkles className="w-2 h-2" />
                </span>
              </div>
            )}
          </div>

          {/* المحتوى النصي - مضغوط */}
          <div className="flex-1 min-w-0">
            
            {/* العنوان - سطرين كحد أقصى */}
            <h3 className={`text-sm font-semibold leading-tight line-clamp-2 mb-1 ${
              article.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode ? 'text-white' : 'text-gray-900'
            } hover:${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
              {article.title}
            </h3>

            {/* معلومات مضغوطة في سطر واحد */}
            <div className={`flex items-center gap-1.5 text-[10px] ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {/* التاريخ */}
              <span className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(article.published_at || article.created_at || '')}
              </span>
              
              {article.reading_time && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {article.reading_time} د
                  </span>
                </>
              )}
              
              {article.views_count && article.views_count > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <ArticleViews count={article.views_count} className="text-xs" />
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}