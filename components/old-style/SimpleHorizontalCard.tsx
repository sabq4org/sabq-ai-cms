'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import SafeNewsImage from '@/components/ui/SafeNewsImage';

interface Article {
  id: number | string;
  title: string;
  featured_image?: string;
  image?: string;
  image_url?: string;
  published_at: string;
  views?: number;
  slug: string;
  breaking?: boolean;
  is_breaking?: boolean;
}

interface SimpleHorizontalCardProps {
  articles?: Article[];
}

export default function SimpleHorizontalCard({ articles = [] }: SimpleHorizontalCardProps) {
  
  // تحديد إذا كان الخبر جديد (آخر ساعتين)
  const isNewsNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return diffTime <= 2 * 60 * 60 * 1000; // ساعتان
  };

  // تنسيق التاريخ الميلادي
  const formatGregorianDate = (dateString: string) => {
    const date = new Date(dateString);
    try {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
  };

  // تنسيق عدد المشاهدات
  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views > 1000) {
      return Math.floor(views / 1000) + 'k';
    }
    return views.toString();
  };

  // الحصول على رابط الصورة
  const getImageUrl = (article: Article) => {
    const candidate = article.featured_image || article.image || article.image_url || '';
    if (candidate) {
      if (
        candidate.startsWith('http') ||
        candidate.includes('cloudinary.com') ||
        candidate.includes('s3.amazonaws.com') ||
        candidate.startsWith('data:image/')
      ) {
        return candidate;
      }
      return candidate.startsWith('/') ? candidate : `/${candidate.replace(/^\/+/, '')}`;
    }
    return '/images/placeholder-news.svg';
  };

  // رابط المقال
  const getArticleUrl = (article: Article) => {
    if (article.slug) {
      return `/news/${article.slug}`;
    }
    return '#';
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="simple-horizontal-cards">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={getArticleUrl(article)}
          prefetch={false}
          className="simple-horizontal-card"
        >
          {/* الصورة على اليمين */}
          <div className="simple-horizontal-image">
            <SafeNewsImage
              src={getImageUrl(article)}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
              width={120}
              height={80}
            />
          </div>

          {/* المحتوى على اليسار */}
          <div className="simple-horizontal-content">
            {/* السطر الأول: ليبل جديد + التاريخ */}
            <div className="simple-horizontal-meta">
              {isNewsNew(article.published_at) && !(article.breaking || article.is_breaking) && (
                <span className="simple-new-badge">
                  <span className="flame-emoji">🔥</span>
                  جديد
                </span>
              )}
              <span className="simple-date">{formatGregorianDate(article.published_at)}</span>
            </div>

            {/* العنوان */}
            <h3 className="simple-horizontal-title">
              {article.title}
            </h3>

            {/* المشاهدات */}
            {article.views !== undefined && (
              <div className="simple-horizontal-views">
                <Eye className="w-3 h-3" />
                <span>{formatViews(article.views)} مشاهدة</span>
              </div>
            )}
          </div>
        </Link>
      ))}

      <style jsx>{`
        .simple-horizontal-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .simple-horizontal-card {
          display: flex;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
          padding: 12px;
          background: transparent;
          border-radius: 8px;
        }

        .simple-horizontal-card:hover {
          transform: translateX(-4px);
          background: rgba(0, 0, 0, 0.02);
        }

        .dark .simple-horizontal-card:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        /* الصورة */
        .simple-horizontal-image {
          width: 120px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .dark .simple-horizontal-image {
          background: #374151;
        }

        /* المحتوى */
        .simple-horizontal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        /* السطر الأول: ليبل جديد + التاريخ */
        .simple-horizontal-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        /* ليبل جديد */
        .simple-new-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .flame-emoji {
          font-size: 12px;
        }

        /* التاريخ */
        .simple-date {
          color: #6b7280;
          font-size: 12px;
        }

        .dark .simple-date {
          color: #9ca3af;
        }

        /* العنوان */
        .simple-horizontal-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          color: #111827;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .dark .simple-horizontal-title {
          color: #f3f4f6;
        }

        /* المشاهدات */
        .simple-horizontal-views {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-top: auto;
        }

        .dark .simple-horizontal-views {
          color: #9ca3af;
        }

        /* تصميم الموبايل */
        @media (max-width: 640px) {
          .simple-horizontal-card {
            padding: 8px;
            gap: 10px;
          }

          .simple-horizontal-image {
            width: 100px;
            height: 70px;
          }

          .simple-horizontal-title {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
