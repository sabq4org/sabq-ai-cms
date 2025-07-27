'use client';

import { ArticleData } from '@/lib/article-api';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// تحميل ديناميكي للمكون لتجنب مشاكل SSR
const ArticleClientComponent = dynamic(() => import('./ArticleClientComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      padding: '3rem', 
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{color: '#6b7280'}}>جاري تحميل المقال...</p>
      </div>
    </div>
  )
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        
        // جلب المقال
        const response = await fetch(`/api/articles/${resolved.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setArticle(data);
          } else {
            setError('المقال غير متوفر');
          }
        } else {
          setError('خطأ في تحميل المقال');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('حدث خطأ في تحميل المقال');
      } finally {
        setLoading(false);
      }
    };

    loadParams();
  }, [params]);

  if (loading) {
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{color: '#6b7280'}}>جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article || !resolvedParams) {
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center', 
        background: '#f8f9fa', 
        borderRadius: '12px', 
        margin: '4rem auto', 
        maxWidth: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{color: '#1f2937', marginBottom: '1rem'}}>المقال غير متوفر</h1>
        <p style={{color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.8}}>
          {error || 'عذراً، لم نتمكن من العثور على المقال المطلوب.'}
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          العودة للرئيسية
        </a>
      </div>
    );
  }
  
  return (
    <div>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <ArticleClientComponent 
        initialArticle={article} 
        articleId={resolvedParams.id} 
      />
    </div>
  );
}
