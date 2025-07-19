'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, 
  User, 
  Eye, 
  MessageCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ThumbnailNewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    published_at: string;
    views?: number;
    reading_time?: number;
    breaking?: boolean;
    featured?: boolean;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
      color?: string;
      icon?: string;
    };
    interactions?: {
      likes: number;
      shares: number;
      comments: number;
    };
  };
  darkMode?: boolean;
  showExcerpt?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ThumbnailNewsCard({
  article,
  darkMode = false,
  showExcerpt = true,
  size = 'medium',
  className = ''
}: ThumbnailNewsCardProps) {
  
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(article.published_at), {
        addSuffix: true,
        locale: ar
      });
    } catch {
      return 'منذ قليل';
    }
  };

  const getCategoryColor = () => {
    return article.category?.color || '#3B82F6';
  };

  const getImageUrl = () => {
    return article.featured_image || '/images/placeholder-featured.jpg';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          image: 'w-16 h-16',
          title: 'text-sm font-semibold',
          excerpt: 'text-xs',
          meta: 'text-xs'
        };
      case 'large':
        return {
          container: 'p-5',
          image: 'w-28 h-28',
          title: 'text-lg font-bold',
          excerpt: 'text-sm',
          meta: 'text-sm'
        };
      default: // medium
        return {
          container: 'p-4',
          image: 'w-20 h-20',
          title: 'text-base font-semibold',
          excerpt: 'text-sm',
          meta: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${className} ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-lg transition-all duration-300 hover:shadow-md 
    ${darkMode ? 'hover:shadow-gray-800' : 'hover:shadow-gray-200'}`}>
      
      <Link href={`/article/${article.slug || article.id}`} className="block">
        <div className={sizeClasses.container}>
          <div className="flex gap-4">
            
            {/* Thumbnail الصورة */}
            <div className={`relative ${sizeClasses.image} flex-shrink-0`}>
              <Image
                src={getImageUrl()}
                alt={article.title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 80px, 112px"
              />
              
              {/* مؤشر الأخبار العاجلة */}
              {article.breaking && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1 rtl:space-x-reverse">
                    <Zap className="w-2.5 h-2.5" />
                    <span>عاجل</span>
                  </div>
                </div>
              )}

              {/* مؤشر المقالات المميزة */}
              {article.featured && !article.breaking && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1 rtl:space-x-reverse">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>مميز</span>
                  </div>
                </div>
              )}
            </div>

            {/* المحتوى النصي */}
            <div className="flex-1 min-w-0">
              
              {/* التصنيف */}
              {article.category && (
                <div className="mb-2">
                  <span 
                    className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getCategoryColor() }}
                  >
                    {article.category.icon && (
                      <span className="text-xs">{article.category.icon}</span>
                    )}
                    <span>{article.category.name}</span>
                  </span>
                </div>
              )}

              {/* العنوان */}
              <h3 className={`${sizeClasses.title} leading-tight mb-2 line-clamp-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              } hover:${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
                {article.title}
              </h3>

              {/* الوصف المختصر */}
              {showExcerpt && article.excerpt && (
                <p className={`${sizeClasses.excerpt} mb-3 line-clamp-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {article.excerpt}
                </p>
              )}

              {/* المعلومات الفرعية */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  
                  {/* الكاتب */}
                  {article.author && (
                    <div className={`flex items-center space-x-1 rtl:space-x-reverse ${sizeClasses.meta} ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <User className="w-3 h-3" />
                      <span>{article.author.name}</span>
                    </div>
                  )}

                  {/* وقت القراءة */}
                  {article.reading_time && (
                    <div className={`flex items-center space-x-1 rtl:space-x-reverse ${sizeClasses.meta} ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{article.reading_time} د</span>
                    </div>
                  )}
                </div>

                {/* الوقت والإحصائيات */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  
                  {/* المشاهدات */}
                  {article.views && article.views > 0 && (
                    <div className={`flex items-center space-x-1 rtl:space-x-reverse ${sizeClasses.meta} ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Eye className="w-3 h-3" />
                      <span>{article.views > 1000 ? `${(article.views/1000).toFixed(1)}k` : article.views}</span>
                    </div>
                  )}

                  {/* التعليقات */}
                  {article.interactions?.comments && article.interactions.comments > 0 && (
                    <div className={`flex items-center space-x-1 rtl:space-x-reverse ${sizeClasses.meta} ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <MessageCircle className="w-3 h-3" />
                      <span>{article.interactions.comments}</span>
                    </div>
                  )}

                  {/* وقت النشر */}
                  <div className={`${sizeClasses.meta} ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {getTimeAgo()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 