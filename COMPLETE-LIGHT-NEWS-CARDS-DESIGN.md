# التصميم الكامل لبطاقات الأخبار - بلوك مختارات بالذكاء (النسخة الخفيفة)

## 📁 الملفات المطلوبة

### 1️⃣ المكون الرئيسي: `components/user/SmartContentBlock.tsx`

```tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Calendar, Clock } from 'lucide-react';
import ArticleViews from '@/components/ui/ArticleViews';
import OldStyleNewsBlock from '@/components/old-style/OldStyleNewsBlock';
import { useAuth } from '@/contexts/EnhancedAuthContextWithSSR';
import { getSafeImageUrl } from '@/lib/image-utils';
import '@/styles/old-style-news.css';

interface Article {
  id: string;
  title: string;
  slug: string;
  image?: string;
  breaking?: boolean;
  is_breaking?: boolean;
  category?: {
    name: string;
    slug: string;
  };
  views?: number;
  published_at?: string;
  readTime?: number;
  isPersonalized?: boolean;
  confidence?: number;
  metadata?: any;
}

interface SmartContentBlockProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function SmartContentBlock({ 
  title = "نسخة مطورة بالذكاء الاصطناعي",
  subtitle = "🎯 محتوى ذكي مخصص لاهتماماتك",
  description = "نقدم لك أفضل المقالات المختارة خصيصاً بناءً على اهتماماتك المحددة"
}: SmartContentBlockProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { isLoggedIn, user } = useAuth();
  const interests = user?.interests || [];
  const hasInterests = interests.length > 0;
  const rootGridRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const trackView = async (articleId: string) => {
    try {
      await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          articleId: String(articleId),
          interactionType: 'view',
          source: 'latest-news-grid'
        })
      });
    } catch {}
  };

  // تحديد النصوص الموحدة للجميع
  const getContentByAuthStatus = () => {
    return {
      title: "✨ مختارات بالذكاء",
      subtitle: "",
      description: "تابع الأخبار التي يرشحها لك محررنا الذكي بناءً على التوجهات والاهتمامات"
    };
  };

  const content = getContentByAuthStatus();

  useEffect(() => {
    const loadContent = async () => {
      try {
        await fetchSmartContent();
      } catch (error) {
        console.error('خطأ في التحميل:', error);
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      try {
        const width = window.innerWidth;
        const isTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
        setIsMobile(width < 768 || (isTouch && width < 1024));
      } catch {
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true } as any);
    return () => window.removeEventListener('resize', handleResize as any);
  }, []);

  const fetchSmartContent = async () => {
    try {
      console.log('⚡ جلب المحتوى الذكي الفائق...');

      const cacheKey = 'smart-content-fast-cache-v3';
      const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Date.now() - parsed.ts < 30 * 1000 && Array.isArray(parsed.articles)) {
            setArticles(parsed.articles);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/news/latest?limit=20', {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const base = (data.articles || data.data || []).slice(0, 20);
        const enriched: Article[] = base.map((article: any) => {
          const rawImage = (
            article.image ||
            article.featured_image ||
            article.image_url ||
            article.social_image ||
            (article.metadata && (article.metadata.image || article.metadata.image_url)) ||
            null
          );
          return {
            ...article,
            image: getSafeImageUrl(rawImage, 'news'),
            isPersonalized: false,
            confidence: undefined,
          } as Article;
        });

        setArticles(enriched);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), articles: enriched }));
        } catch {}
      } else {
        console.error('❌ فشل في جلب المحتوى السريع:', response.status);
        if (!cached) setArticles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching smart content fast:', error);
      try {
        const cached = localStorage.getItem('smart-content-fast-cache-v3');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.articles) setArticles(parsed.articles);
        } else {
          setArticles([]);
        }
      } catch {
        setArticles([]);
      }
    } finally {
      console.log('🏁 تم الانتهاء من التحميل (fast)');
      setIsLoading(false);
    }
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
    const nodes = (rootGridRef.current || document).querySelectorAll('[data-track-view="1"]');
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, [articles]);

  // في النسخة الخفيفة (الموبايل): نعرض بطاقات الطراز القديم فقط
  if (isMobile) {
    if (isLoading) {
      return (
        <div style={{ padding: '16px 0' }}>
          <div style={{
            height: '28px',
            background: '#e0e0e0',
            borderRadius: '6px',
            width: '60%',
            marginBottom: '16px',
            animation: 'loading 1.5s infinite'
          }} />
          <div className="grid grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                height: '120px',
                animation: 'loading 1.5s infinite'
              }} />
            ))}
          </div>
        </div>
      );
    }
    
    const oldStyleArticles = (articles as any[]).map((a: any) => ({
      ...a,
      is_custom: false,
      published_at: a.published_at || a.publishedAt || a.created_at || a.createdAt,
      reading_time: a.readTime || a.reading_time,
    }));

    return (
      <div style={{ padding: '16px 0', marginTop: '28px' }}>
        <div className="px-2 sm:px-4">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
              borderRadius: '10px',
              color: 'hsl(var(--accent))',
              fontSize: '18px',
              border: '1px solid hsl(var(--accent) / 0.25)'
            }}>
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'hsl(var(--fg))',
            marginBottom: '6px'
          }}>
            {content.title}
          </h2>
          {content.subtitle ? (
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'hsl(var(--accent))',
              marginBottom: '6px'
            }}>
              {content.subtitle}
            </h3>
          ) : null}
          <p style={{
            fontSize: '12px',
            color: 'hsl(var(--muted))',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {content.description}
          </p>
        </div>
        <OldStyleNewsBlock
          articles={oldStyleArticles as unknown as any[]}
          title={content.title}
          showTitle={false}
          columns={3}
          className="mt-6 mb-4"
        />
        </div>
      </div>
    );
  }

  // كود النسخة الديسكتوب (غير مطلوب هنا)
  return null;
}
```

### 2️⃣ مكون البطاقات: `components/old-style/OldStyleNewsBlock.tsx`

```tsx
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
              {/* الشريط العلوي: شارات + التاريخ */}
              <div className="old-style-news-top-bar">
                <div className="old-style-news-badges">
                  {/* شارة عاجل - أولوية أعلى */}
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
                </div>
              </div>

              {/* العنوان */}
              <h3 className="old-style-news-card-title">
                {article.title}
              </h3>

              {/* شريط المعلومات السفلي */}
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
```

### 3️⃣ ملف الأنماط الكامل: `styles/old-style-news.css`

```css
/* تصميم الأخبار بالطراز القديم - Old Style News Block */

.old-style-news-block {
  width: 100%;
  margin-bottom: 32px;
}

/* رأس القسم */
.old-style-news-header {
  margin-bottom: 24px;
  position: relative;
}

.old-style-news-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  padding-right: 0;
  position: relative;
}

.old-style-news-title::before {
  display: none;
}

/* إزالة الخط تحت العنوان */
.old-style-title-line {
  display: none;
}

/* شبكة الأخبار */
.old-style-news-grid {
  display: grid;
  gap: 20px;
}

/* بطاقة الخبر - تصميم بسيط بدون إطارات نهائياً */
.old-style-news-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  overflow: visible;
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
  box-shadow: none;
  outline: none;
  position: relative;
}

/* حاوي الصورة - زوايا منحنية قليلاً */
.old-style-news-image-container {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 6px;
}

.old-style-news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  border-radius: 8px;
  background-color: #fff;
}

/* محتوى البطاقة - بدون padding */
.old-style-news-content {
  padding: 0;
  margin-top: 0;
}

/* الشريط العلوي */
.old-style-news-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  margin-top: -206px;
  position: relative;
  z-index: 2;
}

/* لايبل "جديد" الأخضر مع شعلة النار */
.old-style-news-new-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  position: relative;
}

/* عنوان المقال */
.old-style-news-card-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: #111827;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* فرض لون العنوان */
.old-style-news-card a .old-style-news-card-title,
.old-style-news-card:link .old-style-news-card-title,
.old-style-news-card:visited .old-style-news-card-title,
.old-style-news-card:hover .old-style-news-card-title,
.old-style-news-card:active .old-style-news-card-title {
  color: #111827 !important;
}

.dark .old-style-news-card a .old-style-news-card-title,
.dark .old-style-news-card:link .old-style-news-card-title,
.dark .old-style-news-card:visited .old-style-news-card-title,
.dark .old-style-news-card:hover .old-style-news-card-title,
.dark .old-style-news-card:active .old-style-news-card-title {
  color: #f9fafb !important;
}

/* الشريط السفلي */
.old-style-news-bottom-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: auto;
}

.old-style-news-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.old-style-icon {
  width: 14px;
  height: 14px;
  stroke-width: 1.5;
}

/* الحالة الفارغة */
.old-style-empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #9ca3af;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

/* مجموعة الشارات */
.old-style-news-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* شارة عاجل - أحمر */
.old-style-news-breaking-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  animation: pulse 2s ease-in-out infinite alternate;
  position: relative;
}

/* الرموز التعبيرية */
.old-style-lightning-emoji {
  font-size: 12px;
}

/* تحسينات للوضع الليلي */
.dark .old-style-news-date-inline,
.dark .old-style-news-meta-item {
  color: #9ca3af;
}

.dark .old-style-news-card-title { 
  color: #f9fafb; 
}

/* تثبيت لون الروابط */
.old-style-news-card,
.old-style-news-card:link,
.old-style-news-card:visited,
.old-style-news-card:hover,
.old-style-news-card:active {
  color: inherit;
  text-decoration: none;
}

/* تأثير النبضة للأخبار العاجلة */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

/* التجاوب مع الأجهزة المختلفة */
@media (max-width: 1024px) {
  .old-style-news-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .old-style-news-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }
  
  .old-style-news-title {
    font-size: 20px;
  }
  
  .old-style-news-card {
    display: block;
  }
  
  .old-style-news-image-container {
    width: 100%;
    height: 200px;
    margin-bottom: 12px;
  }
  
  .old-style-news-content {
    padding: 0;
  }
  
  .old-style-news-card-title {
    font-size: 15px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 8px;
  }
  
  .old-style-news-bottom-bar {
    margin-top: 8px;
    gap: 12px;
  }
  
  .old-style-news-new-badge {
    font-size: 10px;
    padding: 3px 6px;
  }
}

/* الوضع الليلي */
@media (prefers-color-scheme: dark) {
  .old-style-news-card {
    background: transparent;
    border: none;
    color: #f9fafb;
  }
  
  .old-style-news-title {
    color: #f9fafb;
  }
  
  .old-style-news-card-title {
    color: #f9fafb;
  }
  
  .old-style-news-excerpt {
    color: #d1d5db;
  }
  
  .old-style-news-meta {
    border-top: none;
  }
  
  .old-style-news-meta-item {
    color: #9ca3af;
  }
  
  .old-style-empty-state {
    background: #111827;
    border-color: #374151;
    color: #9ca3af;
  }
}

/* الوضع الليلي - دعم صريح عبر .dark */
.dark .old-style-news-image-container {
  background: #111827;
}
```

### 4️⃣ ملف CSS إضافي للليبل الأخضر: `styles/recent-news-badge.css`

```css
/* تحسينات لليبل "جديد" للأخبار المنشورة في آخر ساعتين */

.recent-news-badge {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
  }
  50% {
    box-shadow: 0 2px 10px rgba(5, 150, 105, 0.5);
  }
}

.dark .recent-news-badge {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  box-shadow: 0 2px 6px rgba(4, 120, 87, 0.4);
}

.dark .recent-news-badge:hover {
  box-shadow: 0 2px 10px rgba(4, 120, 87, 0.6);
}
```

### 5️⃣ الإضافة المطلوبة في `app/layout.tsx`

```tsx
// في قسم الـ imports
import "@/styles/old-style-news.css";
import "@/styles/recent-news-badge.css";
```

## 📋 كيفية استخدام التصميم

### في الصفحة الرئيسية أو أي صفحة أخرى:

```tsx
import SmartContentBlock from '@/components/user/SmartContentBlock';

export default function HomePage() {
  return (
    <div>
      {/* محتوى آخر */}
      
      <SmartContentBlock />
      
      {/* محتوى آخر */}
    </div>
  );
}
```

## 🎨 مواصفات التصميم

### البطاقة الواحدة تحتوي على:
1. **صورة**: نسبة 16:9، زوايا منحنية 8px
2. **شارات**:
   - عاجل: خلفية حمراء (#dc2626) مع ⚡
   - جديد: خلفية خضراء (#10b981) مع 🔥 (آخر ساعتين)
3. **العنوان**: 3 أسطر كحد أقصى، خط عريض 700
4. **البيانات الوصفية**:
   - عدد المشاهدات (مع شعلة إذا > 300)
   - التاريخ بالصيغة الميلادية (dd/MM/yyyy)
   - مدة القراءة (اختياري)

### التجاوب:
- **موبايل** (< 768px): عمود واحد
- **تابلت** (768px - 1024px): عمودين
- **ديسكتوب** (> 1024px): 3 أعمدة أو أكثر

### الألوان:
- **الوضع الفاتح**:
  - خلفية البطاقة: #ffffff
  - حدود: #e5e7eb
  - العنوان: #111827
  - البيانات الوصفية: #9ca3af
  
- **الوضع المظلم**:
  - خلفية البطاقة: شفافة
  - بدون حدود
  - العنوان: #f9fafb
  - البيانات الوصفية: #9ca3af

## 🚀 الميزات

1. **تتبع المشاهدات**: Intersection Observer لتسجيل المشاهدات
2. **تحسين الأداء**: contentVisibility: auto
3. **كاش محلي**: 30 ثانية في localStorage
4. **تحميل الصور**: CloudImage مع fallback
5. **دعم الوضعين**: فاتح ومظلم
6. **رسائل تحميل**: Skeleton loader

## ✅ ملاحظات مهمة

1. يجب التأكد من وجود المكونات المساعدة:
   - `ArticleViews`
   - `CloudImage`
   - دوال معالجة الصور

2. يجب إضافة ملفات CSS في `app/layout.tsx`

3. البيانات تأتي من `/api/news/latest`

4. الليبل الأخضر يظهر للأخبار المنشورة خلال آخر ساعتين فقط

5. الأخبار العاجلة لها الأولوية على الليبل الأخضر
