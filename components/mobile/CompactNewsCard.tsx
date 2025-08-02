'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, 
  User, 
  Eye, 
  Share2, 
  Bookmark,
  Heart,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getArticleLink } from '@/lib/utils';
import ArticleViews from '@/components/ui/ArticleViews';

interface CompactNewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    published_at: string;
    views?: number;
    reading_time?: number;
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
  showStats?: boolean;
  compact?: boolean;
  className?: string;
}

export default function CompactNewsCard({
  article,
  darkMode = false,
  showStats = true,
  compact = true,
  className = ''
}: CompactNewsCardProps) {
  
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

  return (
    <div className={`${className} ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    } rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg 
    ${darkMode ? 'hover:shadow-gray-800' : 'hover:shadow-gray-200'}`}>
      
      <Link href={getArticleLink(article)} className="block">
        <div className="relative">
          
          {/* التصنيف Tag */}
          {article.category && (
            <div 
              className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
              style={{ 
                backgroundColor: `${getCategoryColor()}CC`,
                border: `1px solid ${getCategoryColor()}`
              }}
            >
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {article.category.icon && (
                  <span className="text-xs">{article.category.icon}</span>
                )}
                <span>{article.category.name}</span>
              </div>
            </div>
          )}

          {/* الصورة المربعة */}
          <div className="relative w-full aspect-square">
            <Image
              src={getImageUrl()}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            
            {/* Gradient overlay للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* معلومات سريعة في أسفل الصورة */}
            {showStats && (
              <div className="absolute bottom-3 left-3 flex items-center space-x-3 rtl:space-x-reverse text-white text-xs">
                {article.views && (
                  <ArticleViews count={article.views} className="text-white text-xs" />
                )}
                {article.reading_time && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Clock className="w-3 h-3" />
                    <span>{article.reading_time} د</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* المحتوى النصي */}
        <div className="p-4">
          {/* العنوان */}
          <h3 className={`font-bold text-base leading-tight mb-2 line-clamp-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          } hover:${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
            {article.title}
          </h3>

          {/* الوصف المختصر */}
          {article.excerpt && !compact && (
            <p className={`text-sm mb-3 line-clamp-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {article.excerpt}
            </p>
          )}

          {/* معلومات الكاتب والوقت */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* صورة الكاتب */}
              {article.author && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {article.author.avatar ? (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <User className={`w-3 h-3 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                  )}
                  <span className={`text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {article.author.name}
                  </span>
                </div>
              )}
            </div>

            {/* وقت النشر */}
            <div className={`flex items-center space-x-1 rtl:space-x-reverse text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo()}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* شريط التفاعل */}
      {showStats && article.interactions && (
        <div className={`px-4 pb-3 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between pt-3">
            
            {/* إحصائيات التفاعل */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {article.interactions.likes > 0 && (
                <div className={`flex items-center space-x-1 rtl:space-x-reverse text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Heart className="w-3 h-3" />
                  <span>{article.interactions.likes}</span>
                </div>
              )}
              
              {article.interactions.comments > 0 && (
                <div className={`flex items-center space-x-1 rtl:space-x-reverse text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <MessageCircle className="w-3 h-3" />
                  <span>{article.interactions.comments}</span>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <Bookmark className="w-4 h-4" />
              </button>
              
              <button className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 