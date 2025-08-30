'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Calendar, Clock } from 'lucide-react';
import ArticleViews from '@/components/ui/ArticleViews';
// Switch to dynamic import to reduce main bundle for desktop users
import dynamic from 'next/dynamic';
const OldStyleNewsBlockLazy = dynamic(() => import('@/components/old-style/OldStyleNewsBlock'), {
  ssr: false,
  loading: () => <div style={{ padding: '16px 0' }} />
});

// Reuse a single date formatter instance to avoid recreating Intl on each render
const AR_DATE = new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

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
  console.log('🚀 SmartContentBlock: تم تحميل الكومبوننت');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // تحديد النصوص الموحدة للجميع (memoized)
  const content = useMemo(() => ({
    title: "أخبار تفهمك أولاً",
    subtitle: "🎯 مقالات مختارة بعناية لتناسب اهتماماتك وتوفر وقتك",
    description: "تتابع أهم ما يهمك من أخبار ومقالات مختارة خصيصاً بناءً على تفضيلاتك"
  }), []);

  // تحويل بيانات المقالات للطراز القديم (memoized)
  const oldStyleArticles = useMemo(() => (
    (articles as any[]).map((a: any) => ({
      ...a,
      is_custom: a.isPersonalized === true,
      published_at: a.published_at || a.publishedAt || a.created_at || a.createdAt,
      reading_time: a.readTime || a.reading_time,
    }))
  ), [articles]);

  // تحسين useEffect للتحميل السريع
  useEffect(() => {
    // لا ننتظر أي شيء، نبدأ التحميل مباشرة
    const controller = new AbortController();
    const loadContent = async () => {
      try {
        await fetchSmartContent(controller.signal);
      } catch (error) {
        console.error('خطأ في التحميل:', error);
        setIsLoading(false);
      }
    };
    
    loadContent();
    return () => controller.abort();
  }, []); // إزالة dependencies غير الضرورية

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      try {
        const width = window.innerWidth;
        const isTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
        setIsMobile(width < 768 || (isTouch && width < 1024));
      } catch {
        setIsMobile(false);
      }
    };
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('resize', onResize, { passive: true } as any);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize as any);
    };
  }, []);

  const fetchSmartContent = async (signal?: AbortSignal) => {
    try {
      console.log('🔍 SmartContentBlock: بداية جلب البيانات...');
      // جلب مباشر بدون استبعاد المميزة أو استخدام Cache API لتفادي التأخير
      const url = `/api/articles?limit=20&sort=published_at&order=desc&status=published&_=${Date.now()}`;

      const response = await fetch(url, {
        signal,
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();

        const articles = (data.articles || []).slice(0, 20);
        console.log('✅ SmartContentBlock: تم جلب البيانات بنجاح:', articles.length, 'مقال');
        const enriched: Article[] = articles.map((article: any) => ({
          ...article,
          isPersonalized: (article.isPersonalized ?? article.metadata?.isPersonalized) ?? false,
          confidence: article.confidence ?? article.metadata?.confidence,
        }));
        console.log('🎯 SmartContentBlock: تم إعداد المقالات:', enriched.length);
        setArticles(enriched);
      } else {
        console.error('❌ فشل في جلب المقالات:', response.status);
        setArticles([]);
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error('❌ Error fetching smart content:', error);
      setArticles([]);
    } finally {
      console.log('🏁 SmartContentBlock: انتهاء التحميل, isLoading =', false);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return AR_DATE.format(new Date(dateString));
    } catch {
      return '';
    }
  };

  // عرض هيكل عظمي خفيف أثناء تحديد حالة العرض (موبايل/ديسكتوب) لتقليل CLS
  if (isMobile === null) {
    return (
      <div style={{ padding: '32px 0' }}>
        <style jsx>{`
          @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              background: 'hsl(var(--bg-elevated))',
              border: '1px solid hsl(var(--line) / 0.6)',
              borderRadius: '12px',
              overflow: 'hidden',
              height: '320px'
            }}>
              <div style={{
                height: '180px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite'
              }} />
              <div style={{ padding: '16px' }}>
                <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // في النسخة الخفيفة (الموبايل): نعرض بطاقات الطراز القديم فقط
  if (isMobile) {
    if (isLoading) {
      return (
        <div style={{ padding: '16px 0' }}>
          <style jsx>{`
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          `}</style>
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

    return (
      <div style={{ padding: '16px 0', marginTop: '28px' }}>
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
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'hsl(var(--accent))',
            marginBottom: '6px'
          }}>
            {content.subtitle}
          </h3>
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
        <OldStyleNewsBlockLazy
          // تمرير is_custom الحقيقي فقط للمقالات المخصصة
          articles={oldStyleArticles as unknown as any[]}
          title={content.title}
          showTitle={false}
          columns={3}
          className="mt-6 mb-4"
        />
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
      {/* CSS للانيميشن + تحسين hover بدون JS لتقليل العمل على الخيط الرئيسي */}
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .smart-card { 
          transition: transform 0.25s ease; 
          will-change: transform; 
          content-visibility: auto; /* لا ترسم العناصر خارج الشاشة حتى تظهر */
          contain-intrinsic-size: 320px; /* حجم تقريبي لمنع القفزات عند الظهور */
        }
        .smart-card:hover { transform: translateY(-4px); }
        /* CSS-only hover for CTA button to avoid JS handlers */
        .smart-cta { transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease; }
        .smart-cta:hover { transform: translateY(-2px); background: linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%); border-color: #C7D2FE; }
      `}</style>
      
      {/* تمت إزالة الخلفيات الزخرفية ذات الضبابية لتقليل الطلاء وإصلاح CLS */}

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
          
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#7C3AED',
            marginBottom: '8px'
          }}>
            {content.subtitle}
          </h3>
          
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {articles.slice(0, 20).map((article, idx) => {
              const isBreaking = Boolean((article as any).breaking || (article as any).is_breaking || (article as any)?.metadata?.breaking);
              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  prefetch={false}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="smart-card" style={{
                    background: isBreaking ? 'hsla(0, 78%, 55%, 0.14)' : 'hsl(var(--bg-elevated))',
                    border: isBreaking ? '1px solid hsl(0 72% 45% / 0.45)' : '1px solid hsl(var(--line))',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* صورة الخبر */}
                    <div style={{
                      position: 'relative',
                      height: '180px',
                      width: '100%',
                      background: 'hsl(var(--bg))',
                      overflow: 'hidden'
                    }}>
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority={idx === 0}
                          loading={idx === 0 ? 'eager' : 'lazy'} 
                          fetchPriority={idx < 3 ? 'high' : 'low'}
                          decoding={idx < 5 ? 'sync' : 'async'}
                          sizes="(min-width: 1920px) 300px, (min-width: 1536px) 320px, (min-width: 1280px) 280px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
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

                      {/* ليبل عاجل أو التصنيف */}
                      {isBreaking ? (
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
                      ) : article.category ? (
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
                      ) : null}

                      {/* ليبل مخصص لك */}
                      {article.isPersonalized && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                          color: '#4C1D95',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid #C7D2FE'
                        }}>
                          <Sparkles style={{ width: '12px', height: '12px' }} />
                          مخصص لك
                        </div>
                      )}

                      {/* نسبة الثقة */}
                      {article.confidence && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          background: '#F5F3FF',
                          border: '2px solid #E0E7FF',
                          color: '#6B21A8',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {article.confidence}%
                        </div>
                      )}
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
                        color: isBreaking ? '#b91c1c' : 'hsl(var(--fg))',
                        marginBottom: '12px',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
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

                        {/* المشاهدات */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ArticleViews count={article.views ?? 0} showLabel={false} size="sm" />
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
                </Link>
              );
            })}
          </div>
        )}

        {/* زر استكشاف المحتوى */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/smart-content" style={{ textDecoration: 'none' }}>
            <button
              className="smart-cta"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)',
                color: '#6B21A8',
                border: '1px solid #E0E7FF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              استكشف المحتوى الذكي
              <Sparkles className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
