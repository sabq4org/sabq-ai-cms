'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye, AlertCircle, ChevronLeft, ListOrdered } from 'lucide-react';

interface HeadlineListBlockProps {
  block: any;
  articles: any[];
}

export function HeadlineListBlock({ block, articles }: HeadlineListBlockProps) {
  const displayArticles = articles.slice(0, block.config?.itemsCount || 10);

  // إذا لم تكن هناك مقالات، عرض رسالة
  if (displayArticles.length === 0) {
    return (
      <div className="smart-block-container">
        <div className="smart-block-header">
          <div className="smart-block-header-content">
            <div className="smart-block-title-wrapper">
              <ListOrdered className="smart-block-icon" />
              <h2 className="smart-block-title">{block.name || 'أهم العناوين'}</h2>
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
          <div className="empty-icon">📋</div>
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
            <ListOrdered className="smart-block-icon" />
            <h2 className="smart-block-title">{block.name || 'أهم العناوين'}</h2>
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

      <div className="headline-list">
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="headline-item group"
          >
            <div className="headline-number">
              {index < 3 ? (
                <span className="number-circle">{index + 1}</span>
              ) : (
                <span className="number-text">{index + 1}</span>
              )}
            </div>
            
            <div className="headline-content">
              <h3 className="headline-title">
                {article.breaking && (
                  <span className="breaking-badge">
                    <AlertCircle className="w-3 h-3" />
                    عاجل
                  </span>
                )}
                {article.title}
              </h3>
              
              <div className="headline-meta">
                <span className="meta-item">
                  <Clock className="w-3 h-3" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}
                </span>
                <span className="meta-item">
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