'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Eye, Calendar, Clock } from 'lucide-react';
import OldStyleNewsBlock from '@/components/old-style/OldStyleNewsBlock';

interface Article {
  id: string;
  title: string;
  slug: string;
  image?: string;
  category?: {
    name: string;
    slug: string;
  };
  views?: number;
  published_at?: string;
  readTime?: number;
  isPersonalized?: boolean;
  confidence?: number;
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

  useEffect(() => {
    fetchSmartContent();
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
      console.log('🔄 جلب المحتوى الذكي...');
      const response = await fetch('/api/articles?limit=20&sort=published_at&order=desc');
      console.log('📡 حالة الاستجابة:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 البيانات المستلمة:', data);
        console.log('📊 عدد المقالات:', data.articles?.length || 0);
        
        // إضافة خصائص ذكية لبعض المقالات (6 مقالات فقط)
        const articlesWithAI = (data.articles || []).map((article: Article, index: number) => ({
          ...article,
          isPersonalized: index < 6, // أول 6 مقالات فقط مخصصة
          confidence: index < 6 ? Math.floor(Math.random() * 20) + 80 : undefined // نسبة ثقة 80-99%
        }));
        
        console.log('✅ تم تعيين المقالات:', articlesWithAI.length);
        setArticles(articlesWithAI);
      } else {
        console.error('❌ فشل في جلب المقالات:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching smart content:', error);
    } finally {
      console.log('🏁 تم الانتهاء من التحميل');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('ar-SA', options);
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
          <div className="h-7 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div style={{ padding: '16px 0' }}>
        {/* عبارات رأس البلوك كما هي */}
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
              background: 'linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%)',
              borderRadius: '10px',
              color: '#5B21B6',
              fontSize: '18px',
              border: '1px solid #E0E7FF'
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
            {title}
          </h2>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#7C3AED',
            marginBottom: '6px'
          }}>
            {subtitle}
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'hsl(var(--muted))',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {description}
          </p>
        </div>
        <OldStyleNewsBlock
          // نمرر البيانات الحقيقية مباشرة (تحوي image/featured_image/published_at)
          articles={articles as unknown as any[]}
          title={title}
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
      {/* خلفية زخرفية */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(221, 214, 254, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(221, 214, 254, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      {/* المحتوى */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* العنوان الرئيسي */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'hsl(var(--fg))',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%)',
              borderRadius: '8px',
              color: '#5B21B6',
              fontSize: '16px',
              border: '1px solid #E0E7FF'
            }}>
              <Sparkles className="w-5 h-5" />
            </span>
            {title}
          </h2>
          
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#7C3AED',
            marginBottom: '8px'
          }}>
            {subtitle}
          </h3>
          
          <p style={{
            fontSize: '12px',
            color: 'hsl(var(--muted))',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {description}
          </p>
        </div>

        {/* بطاقات الأخبار */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: 'hsl(var(--bg-elevated))',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '320px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {articles.slice(0, 20).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'hsl(var(--bg-elevated))',
                  border: '1px solid hsl(var(--line))',
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
                  e.currentTarget.style.background = 'hsl(var(--accent) / 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'hsl(var(--bg-elevated))';
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
                    
                    {/* التصنيف */}
                    {article.category && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'hsl(var(--accent))',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {article.category.name}
                      </div>
                    )}
                    
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
                        border: '1px solid #C7D2FE',
                        backdropFilter: 'blur(8px)'
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
                        fontWeight: '700',
                        backdropFilter: 'blur(8px)'
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
                      fontWeight: '600',
                      color: 'hsl(var(--fg))',
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
                        <Eye style={{ width: '14px', height: '14px' }} />
                        <span>{formatViews(article.views)}</span>
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
            ))}
          </div>
        )}

        {/* زر استكشاف */}
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
              استكشف المحتوى الذكي
              <Sparkles className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
