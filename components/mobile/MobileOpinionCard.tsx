'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MessageSquare, Eye, Flame } from 'lucide-react';

interface MobileOpinionCardProps {
  article: {
    id: string;
    title: string;
    author_name: string;
    author_avatar?: string;
    author_club?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'default';
    author_specialization?: string;
    excerpt: string;
    published_at: string;
    reading_time?: number;
    views_count: number;
    comments_count: number;
    is_trending?: boolean;
    author_slug?: string;
  };
  darkMode: boolean;
}

const writerClubColors = {
  'platinum': 'from-gray-400 to-gray-600',
  'gold': 'from-yellow-400 to-yellow-600', 
  'silver': 'from-gray-300 to-gray-500',
  'bronze': 'from-orange-400 to-orange-600',
  'default': 'from-blue-400 to-blue-600'
};

export default function MobileOpinionCard({ article, darkMode }: MobileOpinionCardProps) {
  return (
    <Link href={`/opinion/${article.id}`} className="block">
      <article className={`relative overflow-hidden rounded-2xl transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-orange-900/10 to-red-900/10 border border-orange-800/20' 
          : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/30'
      }`}>
        {/* شريط علوي ملون حسب نادي الكاتب */}
        <div className={`h-1 bg-gradient-to-r ${writerClubColors[article.author_club || 'default']}`} />
        
        <div className="p-4">
          {/* رأس البطاقة - معلومات الكاتب */}
          <div className="flex items-start gap-3 mb-3">
            {/* صورة الكاتب */}
            <div className="relative flex-shrink-0">
              <Image 
                src={article.author_avatar || '/default-avatar.png'} 
                alt={article.author_name}
                width={48}
                height={48}
                className="rounded-full object-cover border-2 border-white dark:border-gray-800"
              />
              {/* نجمة نادي الكاتب */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${
                writerClubColors[article.author_club || 'default']
              } flex items-center justify-center shadow-md`}>
                <Star className="w-2.5 h-2.5 text-white fill-white" />
              </div>
            </div>
            
            {/* معلومات الكاتب */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {article.author_name}
              </h4>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {article.author_specialization}
              </p>
              {/* شارة trending */}
              {article.is_trending && (
                <div className="flex items-center gap-1 mt-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    رأي مميز
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* عنوان المقال */}
          <h3 className={`font-bold text-base mb-2 line-clamp-2 leading-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {article.title}
          </h3>
          
          {/* المقتطف - سطر واحد */}
          <p className={`text-sm line-clamp-1 mb-3 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {article.excerpt}
          </p>
          
          {/* معلومات سفلية */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views_count > 999 ? `${(article.views_count / 1000).toFixed(1)}k` : article.views_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {article.comments_count}
              </span>
            </div>
            
            {/* وقت القراءة */}
            {article.reading_time && (
              <span className={`font-medium ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {article.reading_time} دقائق
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
} 