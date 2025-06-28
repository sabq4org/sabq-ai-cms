'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye, Calendar, User, ArrowLeft, Coffee, ChevronRight } from 'lucide-react';

interface CardGridBlockProps {
  block: any;
  articles: any[];
}

export function CardGridBlock({ block, articles }: CardGridBlockProps) {
  const displayArticles = articles.slice(0, block.articlesCount || 4);
  
  // دالة لتنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return 'تاريخ غير محدد';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes < 60) {
        return `منذ ${diffMinutes} دقيقة`;
      } else if (diffMinutes < 1440) { // أقل من 24 ساعة
        const hours = Math.floor(diffMinutes / 60);
        return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
      } else {
        return date.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  // إذا لم تكن هناك مقالات، لا نعرض البلوك
  if (displayArticles.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* Header مثل بلوك التصنيفات */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
            <Coffee className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">يوم القهوة العالمي</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">اكتشف عالم القهوة السعودية</p>
          </div>
        </div>
      </div>
      
      {/* Grid Layout - مثل بلوك التصنيفات */}
      <div className="grid grid-cols-1 gap-4">
        {displayArticles.map((article, index) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <div className="p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 hover:scale-[1.02] bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">☕</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white line-clamp-1">
                      {article.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedAt || article.published_at || article.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              
              <div className="space-y-2">
                {/* ملخص المقال */}
                {article.excerpt && (
                  <p className="text-sm hover:text-amber-600 cursor-pointer transition-colors leading-relaxed line-clamp-2 text-gray-600 dark:text-gray-300">
                    {article.excerpt}
                  </p>
                )}
                
                {/* معلومات إضافية */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    {article.author?.name && (
                      <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                        <User className="w-3 h-3" />
                        {article.author.name}
                      </span>
                    )}
                    {article.readTime && (
                      <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        {article.readTime} د
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {((article.views || 0) / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* زر استكشاف جميع المقالات */}
      <button className="w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-300">
        استكشف جميع مقالات القهوة
      </button>
    </div>
  );
} 