'use client';

import React, { useEffect, useState } from 'react';
import OldStyleNewsBlock from './OldStyleNewsBlock';

interface NewsWrapperProps {
  endpoint?: string;
  title?: string;
  columns?: number;
  showExcerpt?: boolean;
  limit?: number;
  className?: string;
}

export default function OldStyleNewsWrapper({
  endpoint = '/api/news?limit=6',
  title = "آخر الأخبار",
  columns = 3,
  showExcerpt = false,
  limit = 6,
  className = ""
}: NewsWrapperProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${endpoint}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التأكد من وجود البيانات
        if (data && data.articles && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else if (data && Array.isArray(data)) {
          setArticles(data);
        } else {
          console.warn('البيانات المستلمة ليست في التنسيق المتوقع:', data);
          setArticles([]);
        }
        
      } catch (error) {
        console.error('خطأ في تحميل الأخبار:', error);
        setError(error instanceof Error ? error.message : 'حدث خطأ غير معروف');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [endpoint, limit]);

  if (loading) {
    return (
      <div className={`old-style-news-block ${className}`}>
        <div className="old-style-news-header">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="old-style-title-line"></div>
        </div>
        <div 
          className="old-style-news-grid"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '20px'
          }}
        >
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="old-style-news-card">
              <div className="old-style-news-image-container bg-gray-200 animate-pulse"></div>
              <div className="old-style-news-content">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`old-style-news-block ${className}`}>
        <div className="old-style-news-header">
          <h2 className="old-style-news-title">{title}</h2>
          <div className="old-style-title-line"></div>
        </div>
        <div className="old-style-empty-state">
          <p className="text-red-600">خطأ في تحميل الأخبار: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <OldStyleNewsBlock
      articles={articles}
      title={title}
      columns={columns}
      showExcerpt={showExcerpt}
      className={className}
    />
  );
}
