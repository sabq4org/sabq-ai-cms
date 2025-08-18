'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BreakingArticle = {
  id: string;
  slug?: string | null;
  title: string;
  published_at?: string | null;
};

const HIDE_KEY = 'sabq-hide-breaking-bar-until';

function getTimeAgoString(dateIso?: string | null): string {
  try {
    if (!dateIso) return '';
    const then = new Date(dateIso).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - then);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `قبل ${days} يوم`;
  } catch {
    return '';
  }
}

export default function BreakingBar() {
  const pathname = usePathname();

  // أخفِ الشريط في مسارات الإدارة ولوحات التحكم
  const isAdmin = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  }, [pathname]);

  const [articles, setArticles] = useState<BreakingArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);

  // احترام تفضيل المستخدم لإخفاء الشريط مؤقتاً
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const until = Number(sessionStorage.getItem(HIDE_KEY) || 0);
      if (until && Date.now() < until) {
        setHidden(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAdmin || hidden) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams({
          breaking: 'true',
          limit: '3',
          sort: 'published_at',
          order: 'desc',
          article_type: 'news',
          include_categories: 'false',
        });
        const res = await fetch(`/api/news?${params.toString()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled && data?.articles?.length) {
          const list: BreakingArticle[] = data.articles.map((a: any) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            published_at: a.published_at,
          }));
          setArticles(list);
        } else if (!cancelled) {
          setArticles([]);
        }
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, hidden]);

  if (isAdmin || hidden || loading || articles.length === 0) return null;

  const first = articles[0];
  const href = first.slug ? `/news/${first.slug}` : `/news/${first.id}`;

  return (
    <div
      role="region"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 'var(--header-height, var(--mobile-header-height, 56px))', // متكيف للموبايل
        zIndex: 39, // أقل من الهيدر الرئيسي
        background: 'linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))',
        borderBottom: '1px solid rgba(239,68,68,0.3)',
        backdropFilter: 'blur(8px)',
        marginBottom: '0',
      }}
      className="breaking-bar-container"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6px 12px', // تقليل padding للموبايل
          display: 'flex',
          alignItems: 'center',
          gap: '8px', // تقليل gap للموبايل
          minHeight: '40px', // حد أدنى للارتفاع
        }}
      >
        {/* شارة عاجل */}
        <div
          className="chip"
          style={{
            background: 'rgba(239,68,68,0.12)',
            color: '#b91c1c',
            border: '1px solid rgba(239,68,68,0.35)',
            fontWeight: 700,
          }}
        >
          عاجل
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 0 4px rgba(239,68,68,0.12)',
              marginInlineStart: 6,
            }}
          />
        </div>

        {/* العنوان المختصر - محسن للموبايل */}
        <div 
          className="breaking-title"
          style={{
            flex: 1,
            minWidth: 0,
            color: 'hsl(var(--fg, 220 13% 7%))',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {first.title}
        </div>

        {/* منذ - responsive */}
        <div 
          className="breaking-time"
          style={{
            fontSize: '12px',
            color: 'hsl(var(--muted, 220 9% 46%))',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {getTimeAgoString(first.published_at)}
        </div>

        {/* زر التفاصيل - محسن للموبايل */}
        <Link
          href={href}
          className="btn btn-sm breaking-details-btn"
          style={{
            background: '#ef4444',
            color: 'white',
            borderColor: 'rgba(239,68,68,0.9)',
            padding: '4px 8px',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          التفاصيل
        </Link>

        {/* إخفاء الشريط للجلسة */}
        <button
          type="button"
          aria-label="إخفاء الشريط"
          className="btn btn-sm breaking-close-btn"
          onClick={() => {
            try {
              if (typeof window !== 'undefined') {
                // أخفِ لمدة ساعة
                sessionStorage.setItem(HIDE_KEY, String(Date.now() + 60 * 60 * 1000));
              }
            } catch {}
            setHidden(true);
          }}
          style={{
            background: 'transparent',
            border: '1px solid hsl(var(--line, 220 14% 88%))',
            color: 'hsl(var(--muted, 220 9% 46%))',
            padding: '4px 8px',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
      
      {/* CSS محسن للموبايل */}
      <style jsx>{`
        .breaking-bar-container {
          transition: all 0.3s ease;
        }
        
        /* تحسينات للموبايل */
        @media (max-width: 768px) {
          .breaking-bar-container {
            position: sticky !important;
            top: var(--mobile-header-height, 56px) !important;
          }
          
          .breaking-title {
            font-size: 13px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            white-space: normal !important;
            line-height: 1.2 !important;
          }
          
          .breaking-time {
            font-size: 10px !important;
          }
        }
        
        /* تحسينات للشاشات الصغيرة جداً */
        @media (max-width: 480px) {
          .breaking-bar-container > div {
            padding: 4px 8px !important;
            gap: 6px !important;
          }
          
          .breaking-title {
            font-size: 12px !important;
            -webkit-line-clamp: 1 !important;
          }
          
          .breaking-time {
            display: none !important; /* إخفاء الوقت في الشاشات الصغيرة */
          }
        }
        
        /* تحسينات للشاشات الصغيرة جداً */
        @media (max-width: 360px) {
          .breaking-bar-container > div {
            padding: 3px 6px !important;
            gap: 4px !important;
          }
          
          .breaking-title {
            font-size: 11px !important;
          }
          
          .breaking-details-btn,
          .breaking-close-btn {
            padding: 3px 6px !important;
            font-size: 10px !important;
          }
          
          .breaking-close-btn {
            width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
        
        /* تحسين الشارة للموبايل */
        @media (max-width: 480px) {
          .chip {
            font-size: 10px !important;
            padding: 2px 6px !important;
          }
        }
      `}</style>
    </div>
  );
}


