/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface ArticleItem {
  id: number | string;
  title: string;
  slug?: string;
  featured_image?: string | null;
  image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  published_at?: string;
  views?: number;
  categories?: { id: number; name: string; slug?: string; color?: string } | null;
}

interface NewsServerMarkupProps {
  endpoint?: string;
  title?: string;
  columns?: number;
  showExcerpt?: boolean;
  limit?: number;
  className?: string;
  revalidateSeconds?: number;
}

// Server-only, renders minimal markup without hydration for ultra-fast paint
export default async function OldStyleNewsServerMarkup({
  endpoint = '/api/news?limit=6',
  title = 'آخر الأخبار',
  columns = 3,
  showExcerpt = false,
  limit = 6,
  className = '',
  revalidateSeconds = 300,
}: NewsServerMarkupProps) {
  const url = endpoint.includes('limit=') ? endpoint : `${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${limit}`;

  const sanitizeImage = (raw?: string | null) => {
    if (!raw || typeof raw !== 'string') return '/images/news-placeholder-lite.svg';
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '/images/news-placeholder-lite.svg';
    if (trimmed.startsWith('data:image/')) return '/images/news-placeholder-lite.svg';
    const isProd = process.env.NODE_ENV === 'production';
    const fixed = trimmed.startsWith('http://') ? (isProd ? trimmed.replace(/^http:\/\//, 'https://') : trimmed) : trimmed;
    if (fixed.includes('res.cloudinary.com') && fixed.includes('/upload/')) {
      try {
        const [prefix, rest] = fixed.split('/upload/');
        if (/^(c_|w_|h_|f_|q_)/.test(rest)) return `${prefix}/upload/${rest}`;
        const t = 'c_fill,w_400,h_225,q_auto,f_auto';
        return `${prefix}/upload/${t}/${rest}`;
      } catch { /* ignore */ }
    }
    return fixed.startsWith('http') || fixed.startsWith('/') ? fixed : `/${fixed.replace(/^\/+/, '')}`;
  };

  let articles: ArticleItem[] = [];
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000); // Increased timeout
    const res = await fetch(url, { 
      next: { revalidate: revalidateSeconds }, 
      cache: 'force-cache', 
      signal: controller.signal 
    });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      const list: ArticleItem[] = Array.isArray(data) ? data : Array.isArray((data as any)?.articles) ? (data as any).articles : [];
      articles = (list || []).slice(0, Math.max(1, limit)).map((a) => ({
        ...a,
        featured_image: sanitizeImage(a.featured_image || a.image || a.image_url || a.thumbnail),
      }));
    }
  } catch {
    // ignore
  }

  return (
    <div className={`old-style-news-block ${className}`}>
      <div className="old-style-news-header">
        <h2 className="old-style-news-title">{title}</h2>
        <div className="old-style-title-line"></div>
      </div>
      <div className="old-style-news-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '20px' }}>
        {articles.length === 0
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="old-style-news-card" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '300px 220px' as any }}>
                <div className="old-style-news-image-container bg-gray-200 animate-pulse"></div>
                <div className="old-style-news-content">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))
          : articles.map((article) => {
              const href = article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
              return (
                <a
                  key={article.id}
                  href={href}
                  className="old-style-news-card"
                  style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '300px 220px' as any }}
                >
                  <div className="old-style-news-image-container">
                    <img
                      src={article.featured_image || '/images/news-placeholder-lite.svg'}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="old-style-news-content">
                    <h3 className="old-style-news-card-title">{article.title}</h3>
                    {/* يمكن إضافة شريط سفلي بسيط بدون أي JS */}
                  </div>
                </a>
              );
            })}
      </div>
    </div>
  );
}
