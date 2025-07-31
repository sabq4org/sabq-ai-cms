'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Eye, User } from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  views?: number;
  category?: {
    id: string;
    name: string;
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

  const getArticleLink = (article: FeaturedArticle) => {
    // استخدام ID فقط - لا روابط عربية
    return `/article/${article.id}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-amber-500" />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          الخبر المميز
        </h2>
      </div>

      {/* الخبر المميز */}
      <Link href={getArticleLink(article)} className="block">
        <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* الصورة */}
            <div className="relative h-64 lg:h-96 overflow-hidden">
              <CloudImage
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                fallbackType="article"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/60" />
              
              {/* شارة مميز */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">مميز</span>
                </div>
              </div>
            </div>

            {/* المحتوى */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              {/* التصنيف */}
              {article.category && (
                <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-3 w-fit">
                  {article.category.name}
                </div>
              )}
              
              {/* العنوان */}
              <h3 className={`text-2xl lg:text-3xl font-bold mb-3 leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {article.title}
              </h3>
              
              {/* الموجز */}
              {article.excerpt && (
                <p className={`text-base lg:text-lg mb-4 line-clamp-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {article.excerpt}
                </p>
              )}
              
              {/* المعلومات */}
              <div className={`flex items-center gap-4 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {article.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDateGregorian(article.published_at)}</span>
                </div>
                
                {article.views && article.views > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.views.toLocaleString('ar-SA')} مشاهدة</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedNewsBlock;