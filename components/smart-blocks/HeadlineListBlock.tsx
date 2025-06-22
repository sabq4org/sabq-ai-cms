'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Circle, Clock } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  category?: string;
  isBreaking?: boolean;
  readTime?: number;
}

interface HeadlineListBlockProps {
  block: {
    id: string;
    name: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  articles: Article[];
}

export const HeadlineListBlock: React.FC<HeadlineListBlockProps> = ({ block, articles }) => {
  return (
    <div 
      className="w-full rounded-xl p-6"
      style={{ 
        backgroundColor: block.theme.backgroundColor,
        borderColor: block.theme.primaryColor,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {/* عنوان البلوك */}
      <div className="mb-4 flex items-center justify-between">
        <h2 
          className="text-xl font-bold"
          style={{ color: block.theme.textColor }}
        >
          {block.name}
        </h2>
        <div 
          className="h-8 w-1 rounded-full"
          style={{ backgroundColor: block.theme.primaryColor }}
        />
      </div>

      {/* قائمة العناوين */}
      <ul className="space-y-3">
        {articles.map((article, index) => (
          <li key={article.id} className="group">
            <Link 
              href={`/news/${article.slug}`}
              className="flex items-start gap-3 hover:opacity-80 transition-opacity"
            >
              {/* رقم أو نقطة */}
              <div 
                className="flex-shrink-0 mt-1"
                style={{ color: block.theme.primaryColor }}
              >
                {index < 3 ? (
                  <span className="font-bold text-lg">{index + 1}.</span>
                ) : (
                  <Circle className="w-2 h-2 fill-current" />
                )}
              </div>

              {/* المحتوى */}
              <div className="flex-1">
                {/* شارة عاجل */}
                {article.isBreaking && (
                  <span 
                    className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 text-white"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    عاجل
                  </span>
                )}

                {/* العنوان */}
                <h3 
                  className="font-semibold text-base group-hover:underline"
                  style={{ color: block.theme.textColor }}
                >
                  {article.title}
                </h3>

                {/* معلومات إضافية */}
                <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                  {article.category && (
                    <span 
                      className="font-medium"
                      style={{ color: block.theme.primaryColor }}
                    >
                      {article.category}
                    </span>
                  )}
                  
                  <span style={{ color: block.theme.textColor }}>
                    {new Date(article.publishedAt).toLocaleDateString('ar-SA')}
                  </span>

                  {article.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime} دقيقة
                    </span>
                  )}
                </div>
              </div>

              {/* سهم */}
              <ChevronLeft 
                className="w-5 h-5 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: block.theme.primaryColor }}
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* رابط عرض المزيد */}
      <Link 
        href="/news"
        className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:underline"
        style={{ color: block.theme.primaryColor }}
      >
        عرض جميع الأخبار
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}; 