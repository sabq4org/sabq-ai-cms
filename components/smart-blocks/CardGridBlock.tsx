'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  views?: number;
  readTime?: number;
}

interface CardGridBlockProps {
  block: {
    id: string;
    name: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    };
    articlesCount?: number;
  };
  articles: Article[];
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({ block, articles }) => {
  // تحديد عدد الأعمدة بناءً على عدد المقالات
  const getGridCols = () => {
    const count = articles.length;
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className="w-full">
      {/* عنوان البلوك */}
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold"
          style={{ color: block.theme.textColor }}
        >
          {block.name}
        </h2>
        <div 
          className="h-1 w-20 mt-2 rounded-full"
          style={{ backgroundColor: block.theme.primaryColor }}
        />
      </div>

      {/* شبكة البطاقات */}
      <div className={`grid ${getGridCols()} gap-4 lg:gap-6`}>
        {articles.map((article) => (
          <Link 
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block"
          >
            <div 
              className="h-full rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ 
                backgroundColor: block.theme.backgroundColor,
                borderColor: block.theme.primaryColor,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              {/* صورة المقال */}
              {article.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* شارة التصنيف */}
                  {article.category && (
                    <div 
                      className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
                      style={{ 
                        backgroundColor: block.theme.primaryColor,
                        color: '#ffffff'
                      }}
                    >
                      {article.category}
                    </div>
                  )}
                </div>
              )}

              {/* محتوى البطاقة */}
              <div className="p-4">
                <h3 
                  className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors"
                  style={{ color: block.theme.textColor }}
                >
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p 
                    className="text-sm mb-3 line-clamp-2 opacity-80"
                    style={{ color: block.theme.textColor }}
                  >
                    {article.excerpt}
                  </p>
                )}

                {/* معلومات إضافية */}
                <div className="flex items-center justify-between text-xs opacity-60">
                  <div className="flex items-center gap-3">
                    {/* الكاتب */}
                    {article.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.author.name}</span>
                      </div>
                    )}

                    {/* التاريخ */}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  {/* المشاهدات */}
                  {article.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views.toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 