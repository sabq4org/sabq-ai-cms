'use client';

import React from 'react';
import MobileLiteLayout from '@/components/mobile/MobileLiteLayout';
import EnhancedMobileCard from '@/components/mobile/EnhancedMobileCard';
import EnhancedDarkModeToggle from '@/components/mobile/EnhancedDarkModeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * صفحة مثال للنسخة الخفيفة المحسنة
 * تعرض جميع التحسينات الجديدة للوضع الليلي
 */
export default function EnhancedMobileDemoPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sampleNews = [
    {
      id: '1',
      title: 'تطوير تقنيات الذكاء الاصطناعي في المملكة العربية السعودية',
      subtitle: 'مبادرات حكومية جديدة لدعم التقنية',
      description: 'تشهد المملكة العربية السعودية تطوراً ملحوظاً في مجال الذكاء الاصطناعي من خلال مبادرات رؤية 2030',
      image: '/api/placeholder/400/200',
      date: '2025-01-24T10:00:00Z',
      views: 15420,
      likes: 234,
      comments: 67,
      readTime: 5,
      category: {
        name: 'تقنية',
        color: '#3b82f6'
      }
    },
    {
      id: '2',
      title: 'قمة المناخ الجديدة تبحث حلول التغير المناخي',
      subtitle: 'مشاركة عالمية واسعة للدول النامية',
      description: 'تجتمع دول العالم لمناقشة أحدث الحلول التقنية لمواجهة تحديات التغير المناخي',
      image: '/api/placeholder/400/200',
      date: '2025-01-24T08:30:00Z',
      views: 8750,
      likes: 156,
      comments: 43,
      readTime: 3,
      category: {
        name: 'بيئة',
        color: '#22c55e'
      }
    },
    {
      id: '3',
      title: 'تحليل عميق: مستقبل الاقتصاد الرقمي',
      subtitle: 'دراسة شاملة للتوجهات القادمة',
      description: 'تحليل معمق للتوجهات الاقتصادية الرقمية وتأثيرها على الأسواق العالمية',
      image: '/api/placeholder/400/200',
      date: '2025-01-24T06:15:00Z',
      views: 12340,
      likes: 189,
      comments: 78,
      readTime: 8,
      category: {
        name: 'اقتصاد',
        color: '#f59e0b'
      }
    }
  ];

  return (
    <MobileLiteLayout>
      <div className="demo-page">
        {/* العنوان الرئيسي */}
        <div className="page-header">
          <h1 className="page-title">النسخة الخفيفة المحسنة</h1>
          <p className="page-subtitle">
            تجربة محسنة للوضع الليلي مع تصميم احترافي
          </p>
          
          {/* تبديل الوضع في الأعلى */}
          <div className="header-controls">
            <EnhancedDarkModeToggle 
              variant={isMobile ? "mobile" : "desktop"}
              showLabel={true}
              className="demo-toggle"
            />
          </div>
        </div>

        {/* بطاقات الأخبار */}
        <section className="news-section">
          <h2 className="section-title">أحدث الأخبار</h2>
          <div className="news-grid">
            {sampleNews.map((news, index) => (
              <EnhancedMobileCard
                key={news.id}
                title={news.title}
                subtitle={news.subtitle}
                description={news.description}
                image={news.image}
                date={news.date}
                views={news.views}
                likes={news.likes}
                comments={news.comments}
                readTime={news.readTime}
                category={news.category}
                variant={index === 2 ? "analysis" : "news"}
                onClick={() => console.log(`Clicked news: ${news.id}`)}
                className="news-card"
              />
            ))}
          </div>
        </section>

        {/* بطاقات مدمجة */}
        <section className="compact-section">
          <h2 className="section-title">أخبار سريعة</h2>
          <div className="compact-grid">
            {sampleNews.slice(0, 2).map((news) => (
              <EnhancedMobileCard
                key={`compact-${news.id}`}
                title={news.title}
                image={news.image}
                date={news.date}
                views={news.views}
                category={news.category}
                variant="compact"
                onClick={() => console.log(`Clicked compact: ${news.id}`)}
                className="compact-card"
              />
            ))}
          </div>
        </section>

        {/* قسم التحكم في الوضع */}
        <section className="theme-demo-section">
          <h2 className="section-title">تجربة تبديل الوضع</h2>
          <div className="theme-controls">
            <div className="control-group">
              <label className="control-label">الوضع المدمج:</label>
              <EnhancedDarkModeToggle variant="compact" />
            </div>
            
            <div className="control-group">
              <label className="control-label">الوضع مع التسمية:</label>
              <EnhancedDarkModeToggle 
                variant="mobile" 
                showLabel={true}
              />
            </div>
            
            {!isMobile && (
              <div className="control-group">
                <label className="control-label">وضع سطح المكتب:</label>
                <EnhancedDarkModeToggle 
                  variant="desktop" 
                  showLabel={true}
                />
              </div>
            )}
          </div>
        </section>

        {/* معلومات التحسينات */}
        <section className="info-section">
          <h2 className="section-title">التحسينات المطبقة</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3 className="info-title">🎨 ألوان محسنة</h3>
              <p className="info-description">
                نظام ألوان متسق ومتناغم مع تباين محسن للقراءة المريحة في جميع الأوضاع
              </p>
            </div>
            
            <div className="info-card">
              <h3 className="info-title">⚡ انتقالات سلسة</h3>
              <p className="info-description">
                تأثيرات بصرية ناعمة مع دعم للحركة المخفضة ومعايير الوصولية
              </p>
            </div>
            
            <div className="info-card">
              <h3 className="info-title">📱 محسن للموبايل</h3>
              <p className="info-description">
                تصميم متجاوب مع جميع أحجام الشاشات ودعم خاص للأجهزة اللمسية
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .demo-page {
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
        }

        .page-header {
          text-align: center;
          padding: 24px 0;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .header-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--accent-primary);
          display: inline-block;
        }

        .news-section {
          margin-bottom: 32px;
        }

        .news-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        .compact-section {
          margin-bottom: 32px;
        }

        .compact-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .theme-demo-section {
          margin-bottom: 32px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .theme-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 12px;
          border: 1px solid var(--border-light);
        }

        .control-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .info-section {
          margin-bottom: 32px;
        }

        .info-cards {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        .info-card {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--shadow-elevated);
          border-color: var(--accent-primary);
        }

        .info-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .info-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        /* تحسينات للشاشات المتوسطة */
        @media (min-width: 640px) {
          .news-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }

          .compact-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .info-cards {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          .theme-controls {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .control-group {
            flex: 1;
            min-width: 200px;
          }
        }

        /* تحسينات للشاشات الكبيرة */
        @media (min-width: 1024px) {
          .demo-page {
            max-width: 1200px;
            padding: 0 20px;
          }

          .page-title {
            font-size: 32px;
          }

          .page-subtitle {
            font-size: 18px;
          }

          .section-title {
            font-size: 24px;
          }
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 480px) {
          .page-header {
            padding: 16px 0;
          }

          .page-title {
            font-size: 24px;
          }

          .page-subtitle {
            font-size: 14px;
          }

          .section-title {
            font-size: 20px;
          }

          .theme-demo-section,
          .info-card {
            padding: 16px;
          }

          .control-group {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }

        /* دعم الـ RTL */
        [dir="rtl"] .page-header,
        [dir="rtl"] .section-title {
          text-align: right;
        }

        [dir="rtl"] .header-controls {
          justify-content: flex-start;
        }
      `}</style>
    </MobileLiteLayout>
  );
}
