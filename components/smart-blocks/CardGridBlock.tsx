'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, TrendingUp, ChevronLeft, Newspaper } from 'lucide-react';

interface CardGridBlockProps {
  block: any;
  articles: any[];
}

export function CardGridBlock({ block, articles }: CardGridBlockProps) {
  const displayArticles = articles.slice(0, block.config?.itemsCount || 8);

  // إذا لم تكن هناك مقالات، عرض رسالة
  if (displayArticles.length === 0) {
    return (
      <div className="smart-block-container">
        <div className="smart-block-header">
          <div className="smart-block-header-content">
            <div className="smart-block-title-wrapper">
              <Newspaper className="smart-block-icon" />
              <h2 className="smart-block-title">{block.name || 'أحدث الأخبار'}</h2>
            </div>
            {block.keywords && block.keywords.length > 0 && (
              <div className="smart-block-keywords">
                {block.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="keyword-badge">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="empty-block-message">
          <div className="empty-icon">📰</div>
          <p className="empty-text">لا توجد مقالات مرتبطة بهذه الكلمة المفتاحية حالياً</p>
          <p className="empty-subtext">سيتم تحديث البلوك تلقائياً عند توفر محتوى جديد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-block-container">
      <div className="smart-block-header">
        <div className="smart-block-header-content">
          <div className="smart-block-title-wrapper">
            <Newspaper className="smart-block-icon" />
            <h2 className="smart-block-title">{block.name || 'أحدث الأخبار'}</h2>
          </div>
          {block.keywords && block.keywords.length > 0 && (
            <div className="smart-block-keywords">
              {block.keywords.map((keyword: string, index: number) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link href="/news" className="view-all-link">
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="article-card group"
          >
            <div className="article-card-image">
              {article.image || article.featured_image ? (
                <Image
                  src={article.image || article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10">
                  <TrendingUp className="w-12 h-12 text-orange-400 dark:text-orange-500" />
                </div>
              )}
              {index < 2 && (
                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  جديد
                </span>
              )}
            </div>
            
            <div className="article-card-content">
              <h3 className="article-card-title">
                {article.title}
              </h3>
              
              <div className="article-card-meta">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 