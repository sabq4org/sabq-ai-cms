'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, TrendingUp, Calendar } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  image?: string;
  readTime?: number;
  views?: number;
  published_at?: string;
  slug: string;
}

interface FeaturedNewsBlockProps {
  articles?: Article[];
  title?: string;
  icon?: string;
  description?: string;
}

export default function FeaturedNewsBlock({ 
  articles = [], 
  title = "🔥 الأكثر قراءة اليوم",
  icon = "🔥",
  description = "اكتشف أهم الأخبار والمقالات التي حازت على اهتمام القراء"
}: FeaturedNewsBlockProps) {
  const [isLoading, setIsLoading] = useState(!articles.length);
  const [newsArticles, setNewsArticles] = useState<Article[]>(articles);

  useEffect(() => {
    if (!articles.length) {
      // جلب الأخبار المميزة
      fetchFeaturedNews();
    }
  }, [articles]);

  const fetchFeaturedNews = async () => {
    try {
      const response = await fetch('/api/news?featured=true&limit=6&sort=views&order=desc');
      if (response.ok) {
        const data = await response.json();
        setNewsArticles(data.news || []);
      }
    } catch (error) {
      console.error('Error fetching featured news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    }
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

  return (
    <div style={{
      background: 'hsl(var(--bg))',
      border: '1px solid hsl(var(--line))',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      {/* رأس البلوك */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          color: 'hsl(var(--fg))', 
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px' }}>{icon}</span>
          {title}
        </h2>
        <p style={{ 
          color: 'hsl(var(--muted))', 
          fontSize: '14px',
          margin: 0
        }}>
          {description}
        </p>
      </div>

      {/* قائمة الأخبار */}
      {isLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              background: 'hsl(var(--bg))',
              borderRadius: '12px',
              padding: '16px',
              height: '120px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {newsArticles.slice(0, 6).map((article, index) => (
            <Link 
              key={article.id} 
              href={`/news/${article.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'hsl(var(--bg))',
                border: '1px solid hsl(var(--line))',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'hsl(var(--accent))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'hsl(var(--line))';
              }}>
                {/* رقم الترتيب */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  width: '28px',
                  height: '28px',
                  background: index < 3 ? 'hsl(var(--accent))' : 'hsl(var(--muted) / 0.2)',
                  color: index < 3 ? 'white' : 'hsl(var(--muted))',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>

                {/* محتوى الخبر */}
                <div style={{ flex: 1 }}>
                  {/* التصنيف */}
                  {article.category && (
                    <div style={{
                      fontSize: '12px',
                      color: 'hsl(var(--accent))',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      {article.category.name}
                    </div>
                  )}

                  {/* العنوان */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'hsl(var(--fg))',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h3>

                  {/* المقتطف */}
                  {article.excerpt && (
                    <p style={{
                      fontSize: '13px',
                      color: 'hsl(var(--muted))',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {/* معلومات إضافية */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'hsl(var(--muted))',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid hsl(var(--line))'
                }}>
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

                  {/* التاريخ */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: 'auto' }}>
                    <Calendar style={{ width: '14px', height: '14px' }} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* زر عرض المزيد */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/news?sort=views" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '10px 24px',
            background: 'hsl(var(--accent))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            عرض المزيد
            <TrendingUp style={{ width: '16px', height: '16px' }} />
          </button>
        </Link>
      </div>
    </div>
  );
}
