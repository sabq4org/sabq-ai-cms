'use client';

import React from 'react';
import OldStyleNewsWrapper from '@/components/old-style/OldStyleNewsWrapper';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* الهيدر البسيط */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            سبق الذكية - النسخة الخفيفة مع التصميم القديم
          </h1>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        
        {/* قسم الأخبار الرئيسية */}
        <section className="mb-12">
          <OldStyleNewsWrapper
            endpoint="/api/news?featured=true"
            title="🔥 الأخبار المميزة"
            columns={3}
            showExcerpt={true}
            limit={6}
          />
        </section>

        {/* قسم آخر الأخبار */}
        <section className="mb-12">
          <OldStyleNewsWrapper
            endpoint="/api/news?sort=created_at&order=desc"
            title="📰 آخر الأخبار"
            columns={3}
            showExcerpt={false}
            limit={9}
          />
        </section>

        {/* قسم الأخبار الأكثر قراءة */}
        <section className="mb-12">
          <OldStyleNewsWrapper
            endpoint="/api/news?sort=views&order=desc"
            title="👁️ الأكثر قراءة"
            columns={2}
            showExcerpt={true}
            limit={4}
          />
        </section>

      </div>

      {/* الفوتر البسيط */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p>&copy; 2025 سبق الذكية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      <style jsx global>{`
        /* تضمين أنماط التصميم القديم */
        .old-style-news-block {
          width: 100%;
          margin-bottom: 32px;
        }

        .old-style-news-header {
          margin-bottom: 24px;
          position: relative;
        }

        .old-style-news-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          padding-right: 12px;
          position: relative;
        }

        .old-style-news-title::before {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .old-style-title-line {
          height: 2px;
          background: linear-gradient(90deg, #3b82f6 0%, transparent 100%);
          width: 100%;
          margin-top: 8px;
        }

        .old-style-news-grid {
          display: grid;
          gap: 20px;
        }

        .old-style-news-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: block;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .old-style-news-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .old-style-news-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .old-style-news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .old-style-news-card:hover .old-style-news-image {
          transform: scale(1.05);
        }

        .old-style-news-category-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        .old-style-news-content {
          padding: 16px;
        }

        .old-style-news-card-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          color: #1f2937;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .old-style-news-card:hover .old-style-news-card-title {
          color: #3b82f6;
        }

        .old-style-news-excerpt {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .old-style-news-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
          margin-top: auto;
        }

        .old-style-news-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
        }

        .old-style-icon {
          width: 14px;
          height: 14px;
          stroke-width: 1.5;
        }

        .old-style-empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #9ca3af;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
        }

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
            display: flex;
            flex-direction: row;
            align-items: stretch;
          }
          
          .old-style-news-image-container {
            width: 120px;
            height: 120px;
            flex-shrink: 0;
          }
          
          .old-style-news-content {
            flex: 1;
            padding: 12px;
            display: flex;
            flex-direction: column;
          }
          
          .old-style-news-card-title {
            font-size: 15px;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            margin-bottom: 8px;
          }
          
          .old-style-news-meta {
            margin-top: auto;
            border-top: none;
            padding-top: 0;
            gap: 12px;
          }
          
          .old-style-news-category-badge {
            top: 8px;
            right: 8px;
            font-size: 10px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </main>
  );
}
