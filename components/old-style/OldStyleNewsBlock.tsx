'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { processArticleImage } from '@/lib/image-utils';
import ArticleViews from '@/components/ui/ArticleViews';

interface Article {
  id: number | string;
  title: string;
  excerpt?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  categories?: {
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
  breaking?: boolean;
  is_breaking?: boolean;
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
  // تتبع ظهور البطاقات وإرسال مشاهدة واحدة لكل عنصر
  const viewedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const trackView = async (articleId: string) => {
    try {
      await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          articleId: String(articleId),
          interactionType: 'view',
          source: 'lite-latest-news'
        })
      });
    } catch {}
  };

  useEffect(() => {
    if (!articles || articles.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const id = el.getAttribute('data-article-id');
          if (id && !viewedRef.current.has(id)) {
            viewedRef.current.add(id);
            trackView(id);
            observer.unobserve(el);
          }
        }
      });
    }, { threshold: 0.5 });
    observerRef.current = observer;
    const nodes = (gridRef.current || document).querySelectorAll('[data-track-view="1"]');
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, [articles]);
  
  // تحديد إذا كان الخبر جديد (آخر ساعتين فقط)
  const isNewsNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return diffTime <= 2 * 60 * 60 * 1000; // ساعتان
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

  // معالجة الصورة بنظام محسن
  const getImageUrl = (article: Article) => {
    const rawImageUrl = article.featured_image || article.image || article.image_url;
    return processArticleImage(rawImageUrl, article.title || "مقال", 'article');
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
        ref={gridRef}
      >
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={getArticleUrl(article)}
            prefetch={false}
            className="old-style-news-card"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 220px' as any }}
            data-track-view="1"
            data-article-id={String(article.id)}
          >
            {/* صورة المقال */}
            <div className="old-style-news-image-container" style={{ position: 'relative' }}>
              <CloudImage
                src={getImageUrl(article)}
                alt={article.title}
                className="old-style-news-image"
                priority={index < columns}
                fill
                fallbackType="article"
                fit="cover"
                objectPosition="center"
                bgColor="#f3f4f6"
              />
            </div>

            {/* محتوى المقال */}
            <div className="old-style-news-content">
              {/* الشريط العلوي: شارات + التاريخ بجانب الشارات وعلى يمين البطاقة */}
              <div className="old-style-news-top-bar">
                <div className="old-style-news-badges">
                  {/* شارة عاجل - أولوية أعلى من باقي الشارات */}
                  {(article.breaking || article.is_breaking) && (
                    <div className="old-style-news-breaking-badge">
                      <span className="old-style-lightning-emoji" aria-hidden>⚡</span>
                      <span>عاجل</span>
                    </div>
                  )}
                  {/* ليبل جديد - أخضر مع شعلة */}
                  {isNewsNew(article.published_at) && !(article.breaking || article.is_breaking) && (
                    <div className="old-style-news-new-badge">
                      <span className="text-xs">🔥</span>
                      <span>جديد</span>
                    </div>
                  )}
                  {/* تم إزالة تاريخ أعلى البطاقة لمنع التكرار */}
                </div>
              </div>

              {/* العنوان */}
              <h3 className="old-style-news-card-title">
                {article.title}
              </h3>

              {/* شريط المعلومات السفلي: المشاهدات + التاريخ + مدة القراءة */}
              <div className="old-style-news-bottom-bar">
                <div className="old-style-news-meta-item">
                  <ArticleViews 
                    count={(article as any).views ?? (article as any).views_count ?? (article as any).view_count ?? 0} 
                    showLabel={true} 
                    size="xs" 
                  />
                  <span style={{ margin: '0 6px', opacity: 0.6 }}>•</span>
                  <span>{formatGregorianDate(article.published_at)}</span>
                </div>
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
