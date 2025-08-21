'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock, Sliders } from 'lucide-react';

interface Article {
  id: number | string;
  title: string;
  excerpt?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  featured_image?: string;
  image?: string;
  image_url?: string;
  published_at: string;
  views?: number;
  reading_time?: number;
  slug: string;
  is_custom?: boolean;
}

interface OldStyleNewsBlockProps {
  articles?: Article[];
  title?: string;
  showTitle?: boolean;
  columns?: number;
  showExcerpt?: boolean;
  className?: string;
}

export default function OldStyleNewsBlock({
  articles = [],
  title = "آخر الأخبار",
  showTitle = true,
  columns = 3,
  showExcerpt = false,
  className = ""
}: OldStyleNewsBlockProps) {
  
  // تحديد إذا كان الخبر جديد (أقل من 24 ساعة)
  const isNewsNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours <= 24;
  };

  // تنسيق التاريخ الميلادي (dd/MM/yyyy)
  const formatGregorianDate = (dateString: string) => {
    const date = new Date(dateString);
    try {
      // استخدام التقويم الميلادي بشكل صريح
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      // fallback
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
  };

  // تنسيق الصورة
  const getImageUrl = (article: Article) => {
    const candidate = article.featured_image || article.image || article.image_url || '';
    if (candidate) {
      if (
        candidate.startsWith('http') ||
        candidate.includes('cloudinary.com') ||
        candidate.includes('s3.amazonaws.com')
      ) {
        return candidate;
      }
      return candidate.startsWith('/') ? candidate : `/images/${candidate}`;
    }
    return '/images/placeholder-news.svg';
  };

  // رابط المقال
  const getArticleUrl = (article: Article) => {
    if (article.slug) {
      return `/news/${article.slug}`;
    }
    return `/news/${article.id}`;
  };

  // تنسيق المشاهدات
  const formatViews = (views: number = 0) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (!articles || articles.length === 0) {
    return (
      <div className={`old-style-news-block ${className}`}>
        {showTitle && (
          <div className="old-style-news-header">
            <h2 className="old-style-news-title">{title}</h2>
            <div className="old-style-title-line"></div>
          </div>
        )}
        <div className="old-style-empty-state">
          <p>لا توجد أخبار متاحة حاليًا</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`old-style-news-block ${className}`}>
      {showTitle && (
        <div className="old-style-news-header">
          <h2 className="old-style-news-title">{title}</h2>
          <div className="old-style-title-line"></div>
        </div>
      )}
      
      <div 
        className="old-style-news-grid"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '20px'
        }}
      >
        {articles.map((article) => (
          <Link
            key={article.id}
            href={getArticleUrl(article)}
            className="old-style-news-card"
          >
            {/* صورة المقال */}
            <div className="old-style-news-image-container">
              <Image
                src={getImageUrl(article)}
                alt={article.title}
                width={300}
                height={200}
                className="old-style-news-image"
                loading="lazy"
              />
            </div>

            {/* محتوى المقال */}
            <div className="old-style-news-content">
              {/* الشريط العلوي: شارات + التاريخ بجانب الشارات وعلى يمين البطاقة */}
              <div className="old-style-news-top-bar">
                <div className="old-style-news-badges">
                  {isNewsNew(article.published_at) && (
                    <div className="old-style-news-new-badge">
                      <span className="old-style-fire-emoji" aria-hidden>🔥</span>
                      <span>جديد</span>
                    </div>
                  )}
                  {article.is_custom && (
                    <div className="old-style-news-custom-badge">
                      <Sliders className="old-style-icon" />
                      <span>مخصص</span>
                    </div>
                  )}
                  {/* التاريخ يظهر دائمًا بجانب الشارات، وبحجم موحّد */}
                  <span className="old-style-news-date-inline">{formatGregorianDate(article.published_at)}</span>
                </div>
              </div>

              {/* العنوان */}
              <h3 className="old-style-news-card-title">
                {article.title}
              </h3>

              {/* شريط المعلومات السفلي: المشاهدات ومدة القراءة */}
              <div className="old-style-news-bottom-bar">
                {article.views && (
                  <div className="old-style-news-meta-item">
                    <Eye className="old-style-icon" />
                    <span>{formatViews(article.views)} مشاهدة</span>
                    {article.views > 300 && <span className="ml-1">🔥</span>}
                  </div>
                )}
                
                {article.reading_time && (
                  <div className="old-style-news-meta-item">
                    <Clock className="old-style-icon" />
                    <span>{article.reading_time} د قراءة</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
