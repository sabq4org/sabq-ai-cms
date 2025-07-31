'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, Clock, User, Eye, Heart, Share2, 
  Bookmark, MessageCircle, TrendingUp
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { getArticleLink } from '@/lib/utils';

interface FeaturedArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image: string;
  published_at: string;
  views?: number;
  likes?: number;
  shares?: number;
  reading_time?: number;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
}

interface FeaturedNewsBlockProps {
  article: FeaturedArticle | null;
}

const FeaturedNewsBlock: React.FC<FeaturedNewsBlockProps> = ({ article }) => {
  const { darkMode } = useDarkModeContext();

  if (!article) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-amber-500" />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          الخبر المميز
        </h2>
      </div>

      {/* البطاقة المميزة */}
      <Link href={getArticleLink(article)} className="block group">
        <article className={`relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-750' 
            : 'bg-white hover:shadow-3xl'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
            {/* قسم الصورة */}
            <div className="lg:col-span-7 relative h-64 lg:h-full overflow-hidden">
              <CloudImage
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                fallbackType="article"
                priority
              />
              {/* التدرج */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/80" />
              
              {/* الشارات */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {/* شارة مميز */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-sm">خبر مميز</span>
                </div>
                
                {/* شارة رائج إذا كانت المشاهدات عالية */}
                {article.views && article.views > 1000 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-bold text-xs">رائج</span>
                  </div>
                )}
              </div>

              {/* التصنيف */}
              {article.category && (
                <div className="absolute bottom-4 right-4">
                  <span 
                    className="inline-flex items-center gap-1 px-4 py-2 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-md"
                    style={{ 
                      backgroundColor: article.category.color || '#3B82F6',
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderWidth: '1px'
                    }}
                  >
                    {article.category.icon && <span>{article.category.icon}</span>}
                    {article.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* قسم المحتوى */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                {/* العنوان */}
                <h3 className={`text-2xl lg:text-3xl font-bold mb-4 leading-tight transition-colors ${
                  darkMode 
                    ? 'text-white group-hover:text-blue-400' 
                    : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {article.title}
                </h3>

                {/* الموجز */}
                {article.excerpt && (
                  <p className={`text-base lg:text-lg mb-6 line-clamp-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* المعلومات والتفاعل */}
              <div>
                {/* معلومات المقال */}
                <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {article.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{article.author.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateGregorian(article.published_at)}</span>
                  </div>
                  
                  {article.reading_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{article.reading_time} دقائق قراءة</span>
                    </div>
                  )}
                </div>

                {/* إحصائيات التفاعل */}
                <div className={`flex items-center gap-6 pt-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {article.views !== undefined && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {article.views.toLocaleString('ar-SA')} مشاهدة
                      </span>
                    </div>
                  )}
                  
                  {article.likes !== undefined && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {article.likes.toLocaleString('ar-SA')}
                      </span>
                    </div>
                  )}
                  
                  {article.shares !== undefined && (
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {article.shares.toLocaleString('ar-SA')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
};

export default FeaturedNewsBlock;