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
        top: 'var(--header-height, 64px)', // يبدأ بعد الهيدر الرئيسي
        zIndex: 39, // أقل من الهيدر الرئيسي
        background: 'linear-gradient(90deg, rgba(239,68,68,0.06), transparent)',
        borderBottom: '1px solid rgba(239,68,68,0.25)',
        backdropFilter: 'blur(6px)',
        marginBottom: '0', // إزالة أي margin سفلي
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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

        {/* العنوان المختصر */}
        <div style={{
          flex: 1,
          minWidth: 0,
          color: 'hsl(var(--fg, 220 13% 7%))',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {first.title}
        </div>

        {/* منذ */}
        <div style={{
          fontSize: 12,
          color: 'hsl(var(--muted, 220 9% 46%))',
          whiteSpace: 'nowrap',
        }}>
          {getTimeAgoString(first.published_at)}
        </div>

        {/* زر التفاصيل */}
        <Link
          href={href}
          className="btn btn-sm"
          style={{
            background: '#ef4444',
            color: 'white',
            borderColor: 'rgba(239,68,68,0.9)',
          }}
        >
          التفاصيل
        </Link>

        {/* إخفاء الشريط للجلسة */}
        <button
          type="button"
          aria-label="إخفاء الشريط"
          className="btn btn-sm"
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
            padding: '6px 10px',
          }}
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}


