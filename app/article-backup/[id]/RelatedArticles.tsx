'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, User } from 'lucide-react';
import { formatDateGregorian, formatRelativeDate } from '@/lib/date-utils';

interface RelatedArticle {
  id: string;
  title: string;
  featured_image?: string;
  reading_time?: number;
  published_at?: string;
  created_at?: string;
  category_name?: string;
  author_name?: string;
  excerpt?: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  onArticleClick?: (articleId: string) => void;
}

export default function RelatedArticles({ articles, onArticleClick }: RelatedArticlesProps) {
  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#grad${colorIndex})"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.9">
          ${title.substring(0, 20)}...
        </text>
      </svg>
    `)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // استخدام النظام الموحد للتاريخ
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // للتواريخ الحديثة (أقل من أسبوع) نستخدم التاريخ النسبي
    if (diffDays < 7) {
      return formatRelativeDate(dateString);
    }
    
    // للتواريخ الأقدم نستخدم التاريخ الكامل بالنظام الموحد
    return formatDateGregorian(dateString);
  };

  if (!articles.length) {
    return null;
  }

  return (
    <section className="mt-16 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          مقالات ذات صلة
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            href={`/article/${article.id}`}
            onClick={() => onArticleClick?.(article.id)}
          >
            <article className="related-article-card group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full border border-gray-100 dark:border-gray-700">
              {/* صورة المقال */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.featured_image || generatePlaceholderImage(article.title)}
                  alt={article.title}
                  className="article-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* طبقة التدرج */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* معلومات التصنيف */}
                {article.category_name && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {article.category_name}
                  </div>
                )}
              </div>
              
              {/* محتوى البطاقة */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 mb-3 leading-tight">
                  {article.title}
                </h3>
                
                {/* المعلومات الوصفية */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.published_at || article.created_at || new Date().toISOString())}</span>
                  </div>
                  
                  {article.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.reading_time} دقائق</span>
                    </div>
                  )}
                  
                  {article.author_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author_name}</span>
                    </div>
                  )}
                </div>

                {/* مؤشر "اقرأ المزيد" */}
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    اقرأ المقال كاملاً
                  </span>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <svg 
                      className="w-4 h-4 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      {/* رابط عرض المزيد */}
      {articles.length >= 4 && (
        <div className="text-center mt-8">
          <Link 
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <BookOpen className="w-5 h-5" />
            استكشف المزيد من المقالات
          </Link>
        </div>
      )}
    </section>
  );
}
