'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Eye, 
  Zap, 
  Newspaper, 
  ArrowLeft,
  Clock,
  User,
  Sparkles 
} from 'lucide-react';
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

interface CompactCategoryCardProps {
  article: Article;
  darkMode?: boolean;
  size?: 'small' | 'medium' | 'large';
  showExcerpt?: boolean;
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

export default function CompactCategoryCard({
  article,
  darkMode = false,
  size = 'medium',
  showExcerpt = false,
  className = ''
}: CompactCategoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          image: 'w-16 h-16',
          title: 'text-sm font-semibold line-clamp-2',
          excerpt: 'text-xs line-clamp-1',
          meta: 'text-[10px]',
          gap: 'gap-2'
        };
      case 'large':
        return {
          container: 'p-5',
          image: 'w-24 h-24',
          title: 'text-base font-bold line-clamp-2',
          excerpt: 'text-sm line-clamp-2',
          meta: 'text-xs',
          gap: 'gap-4'
        };
      default: // medium
        return {
          container: 'p-3',
          image: 'w-20 h-20',
          title: 'text-[15px] font-semibold line-clamp-2',
          excerpt: 'text-xs line-clamp-1',
          meta: 'text-[11px]',
          gap: 'gap-3'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Link href={getArticleLink(article)} className="block">
      <article className={`
        ${className}
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
        active:scale-[0.98] overflow-hidden
        ${darkMode ? 'hover:shadow-gray-900/50' : 'hover:shadow-gray-200'}
      `}>
        
        <div className={`${sizeClasses.container} flex ${sizeClasses.gap}`}>
          
          {/* الصورة المصغرة */}
          <div className={`relative ${sizeClasses.image} flex-shrink-0 rounded-lg overflow-hidden ${
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
                      <div className={`animate-spin rounded-full ${
                        size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
                      } border-2 border-gray-300 border-t-transparent`}></div>
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
                <Newspaper className={`${
                  size === 'small' ? 'w-5 h-5' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'
                } ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            )}
            
            {/* شارة عاجل */}
            {article.is_breaking && (
              <div className="absolute -top-1 -right-1 z-10">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                  <Zap className="w-2 h-2" />
                  عاجل
                </span>
              </div>
            )}
            
            {/* شارة مميز */}
            {article.is_featured && !article.is_breaking && (
              <div className="absolute -top-1 -right-1 z-10">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                  <Sparkles className="w-2 h-2" />
                  مميز
                </span>
              </div>
            )}
          </div>

          {/* المحتوى النصي */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            
            {/* العنوان */}
            <h3 className={`${sizeClasses.title} leading-tight ${
              article.is_breaking 
                ? 'text-red-700 dark:text-red-400' 
                : darkMode ? 'text-white' : 'text-gray-900'
            } hover:${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
              {article.title}
            </h3>

            {/* الوصف المختصر (اختياري) */}
            {showExcerpt && article.excerpt && (
              <p className={`${sizeClasses.excerpt} mt-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {article.excerpt}
              </p>
            )}

            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between mt-2">
              {/* معلومات أساسية */}
              <div className={`flex items-center gap-2 ${sizeClasses.meta} ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {/* التاريخ */}
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatDate(article.published_at || article.created_at || '')}
                </span>
                
                {/* المشاهدات */}
                {article.views_count && article.views_count > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" />
                      {article.views_count > 1000 ? 
                        `${(article.views_count/1000).toFixed(1)}k` : 
                        article.views_count.toLocaleString('ar-SA')
                      }
                    </span>
                  </>
                )}
                
                {/* وقت القراءة أو الكاتب */}
                {(article.reading_time || article.author_name) && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    {article.reading_time ? (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {article.reading_time} د
                      </span>
                    ) : article.author_name && (
                      <span className="flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" />
                        {article.author_name}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* سهم القراءة */}
              <div className="flex items-center">
                <ArrowLeft className={`${
                  size === 'small' ? 'w-3 h-3' : 'w-4 h-4'
                } ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}