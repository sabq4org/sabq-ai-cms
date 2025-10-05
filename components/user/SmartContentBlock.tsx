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

  // تحسين useEffect للتحميل السريع
  useEffect(() => {
    // لا ننتظر أي شيء، نبدأ التحميل مباشرة
    const loadContent = async () => {
      try {
        await fetchSmartContent();
      } catch (error) {
        console.error('خطأ في التحميل:', error);
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, []); // إزالة dependencies غير الضرورية

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

      // كاش محلي محسّن - 30 ثانية فقط لإظهار الأخبار الجديدة بسرعة
      const cacheKey = 'smart-content-fast-cache-v4'; // تحديث رقم الإصدار لإجبار إعادة التحميل
      const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Date.now() - parsed.ts < 30 * 1000 && Array.isArray(parsed.articles)) {
            setArticles(parsed.articles);
            setIsLoading(false);
            // لا نجلب مرة أخرى إذا كان الكاش جديد
            return;
          }
        } catch {}
      }

      // تقليل timeout إلى 5 ثواني للاستجابة السريعة
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثوانٍ

      // توحيد المصدر مع النسخة الكاملة/الخفيفة لضمان نفس القائمة
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
        // حفظ في الكاش المحلي
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), articles: enriched }));
        } catch {}
      } else {
        console.error('❌ فشل في جلب المحتوى السريع:', response.status);
        if (!cached) setArticles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching smart content fast:', error);
      // إبقاء الكاش المحلي إن وجد، وإلا ففارغ
      try {
        const cached = localStorage.getItem('smart-content-fast-cache-v4');
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    };
    return date.toLocaleDateString('ar-SA-u-ca-gregory', options);
  };

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // في النسخة الخفيفة (الموبايل): نعرض بطاقات الطراز القديم فقط
  if (isMobile) {
    if (isLoading) {
      return (
        <div style={{ padding: '16px 0' }}>
          {/* Skeleton مبسط للموبايل */}
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
    // تمرير البيانات للبطاقات العادية
    const oldStyleArticles = (articles as any[]).map((a: any) => ({
      ...a,
      is_custom: false, // إزالة اللابل المخصص
      published_at: a.published_at || a.publishedAt || a.created_at || a.createdAt,
      reading_time: a.readTime || a.reading_time,
    }));

    return (
      <div style={{ padding: '16px 0', marginTop: '28px' }}>
        <div className="px-2 sm:px-4">
        {/* عبارات رأس البلوك الديناميكية */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* أيقونة البلوك في الأعلى في المنتصف */}
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

  return (
    <div style={{
      padding: '32px 0',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* CSS للانيميشن */}
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {/* خلفية زخرفية */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.10) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(42px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.10) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(42px)',
        pointerEvents: 'none'
      }} />

      {/* المحتوى */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* العنوان الرئيسي الديناميكي */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
              background: 'linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%)',
              borderRadius: '10px',
              color: '#5B21B6',
              fontSize: '16px',
              border: '1px solid #E0E7FF'
            }}>
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'hsl(var(--fg))',
            marginBottom: '12px'
          }}>
            {content.title}
          </h2>
          
          {content.subtitle ? (
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#7C3AED',
              marginBottom: '8px'
            }}>
              {content.subtitle}
            </h3>
          ) : null}
          
          <p style={{
            fontSize: '12px',
            color: 'hsl(var(--muted))',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {content.description}
          </p>
        </div>

        {/* بطاقات الأخبار */}
        {isLoading ? (
          <div ref={rootGridRef} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                background: 'hsl(var(--bg-elevated))',
                border: '1px solid hsl(var(--line) / 0.6)',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '320px',
              }}>
                {/* Skeleton أبسط وأسرع */}
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'loading 1.5s infinite'
                }} />
                <div style={{ padding: '16px' }}>
                  <div style={{
                    height: '16px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }} />
                  <div style={{
                    height: '16px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    width: '70%'
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {articles.slice(0, 20).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {(() => {
                  const isBreaking = Boolean((article as any).breaking || (article as any).is_breaking || (article as any)?.metadata?.breaking);
                  const baseBg = '#ffffff';
                  const hoverBg = '#f9fafb';
                  const baseBorder = '1px solid #e5e7eb';
                  return (
                    <div data-track-view="1" data-article-id={String((article as any).id)} style={{
                      background: baseBg,
                      border: baseBorder,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.background = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = baseBg;
                    }}>
                  {/* صورة الخبر */}
                  <div style={{
                    position: 'relative',
                    height: '180px',
                    width: '100%',
                    background: '#f3f4f6',
                    overflow: 'hidden'
                  }}>
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center', background: '#f3f4f6' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                        color: '#7C3AED'
                      }}>
                        <Sparkles className="w-12 h-12" />
                      </div>
                    )}
                    {/* ليبل عاجل يحل محل التصنيف عند العاجل */}
                    {(() => {
                      const isBreaking = Boolean((article as any).breaking || (article as any).is_breaking || (article as any)?.metadata?.breaking);
                      if (isBreaking) {
                        return (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#dc2626',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ fontSize: '12px' }}>⚡</span>
                            عاجل
                          </div>
                        );
                      }
                      if (article.category) {
                        return (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'hsl(var(--accent))',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {article.category.name}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    
                  </div>

                  {/* محتوى البطاقة */}
                  <div style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}>
                    {/* عنوان الخبر */}
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: ((article as any).breaking || (article as any).is_breaking || (article as any)?.metadata?.breaking) ? '#b91c1c' : 'hsl(var(--fg))',
                      marginBottom: '12px',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {article.title}
                    </h3>

                    {/* معلومات إضافية */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'hsl(var(--muted))',
                      marginTop: 'auto'
                    }}>
                      {/* التاريخ */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        <span>{formatDate(article.published_at)}</span>
                      </div>

                      {/* المشاهدات (موحّدة مع شعلة >300) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArticleViews count={(article as any).views ?? (article as any).views_count ?? 0} showLabel={true} size="sm" />
                      </div>

                      {/* وقت القراءة */}
                      {article.readTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          <span>{article.readTime} د</span>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  );
                })()}
              </Link>
            ))}
          </div>
        )}

        {/* زر استكشاف المحتوى */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/smart-content" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)',
              color: '#6B21A8',
              border: '1px solid #E0E7FF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%)';
              e.currentTarget.style.borderColor = '#C7D2FE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)';
              e.currentTarget.style.borderColor = '#E0E7FF';
            }}>
              عرض المزيد من الأخبار
              <Sparkles className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
