'use client';

import React from 'react';
import MobileLiteLayout from '@/components/mobile/MobileLiteLayout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Link from 'next/link';
import { Home, Newspaper, TrendingUp, BookOpen, User } from 'lucide-react';

export default function LitePage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const quickLinks = [
    { icon: Home, title: 'الرئيسية', href: '/', color: 'blue' },
    { icon: Newspaper, title: 'آخر الأخبار', href: '/news', color: 'green' },
    { icon: TrendingUp, title: 'الأكثر قراءة', href: '/trending', color: 'red' },
    { icon: BookOpen, title: 'مقالات الرأي', href: '/opinion', color: 'purple' },
    { icon: User, title: 'حسابي', href: '/profile', color: 'orange' }
  ];

  return (
    <MobileLiteLayout>
      <div className="lite-home">
        {/* رسالة ترحيب */}
        <div className="welcome-section">
          <h2 className="welcome-title">مرحباً بك في النسخة الخفيفة</h2>
          <p className="welcome-text">
            تصفح أخبار سبق بسرعة وسهولة
          </p>
        </div>

        {/* روابط سريعة */}
        <div className="quick-links">
          <h3 className="section-title">الوصول السريع</h3>
          <div className="links-grid">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`link-card link-${link.color}`}
                >
                  <Icon className="link-icon" />
                  <span className="link-title">{link.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* نصائح */}
        <div className="tips-section">
          <h3 className="section-title">نصائح الاستخدام</h3>
          <ul className="tips-list">
            <li>اضغط على أيقونة الجرس لمشاهدة آخر الإشعارات</li>
            <li>استخدم الوضع الليلي للقراءة المريحة في الإضاءة المنخفضة</li>
            <li>النسخة الخفيفة محسنة لاستهلاك أقل للبيانات</li>
          </ul>
        </div>

        {/* رابط النسخة الكاملة */}
        <div className="full-version-link">
          <Link href="/" className="switch-version">
            التبديل إلى النسخة الكاملة
          </Link>
        </div>
      </div>

      <style jsx>{`
        .lite-home {
          padding: 20px 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 32px;
          padding: 24px;
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-light);
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .welcome-text {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .quick-links {
          margin-bottom: 32px;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 400px) {
          .links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .link-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          min-height: 100px;
        }

        .link-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .link-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
          transition: color 0.2s ease;
        }

        .link-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          text-align: center;
        }

        .link-blue { --link-color: #3b82f6; }
        .link-green { --link-color: #10b981; }
        .link-red { --link-color: #ef4444; }
        .link-purple { --link-color: #8b5cf6; }
        .link-orange { --link-color: #f59e0b; }

        .link-card:hover .link-icon {
          color: var(--link-color);
        }

        .tips-section {
          background: var(--bg-tertiary);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-list li {
          padding: 12px 0;
          padding-right: 24px;
          position: relative;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        .tips-list li::before {
          content: "•";
          position: absolute;
          right: 0;
          color: var(--accent-primary);
          font-weight: bold;
          font-size: 20px;
          line-height: 1;
        }

        .full-version-link {
          text-align: center;
          padding: 24px 0;
        }

        .switch-version {
          display: inline-block;
          padding: 12px 24px;
          background: var(--accent-primary);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .switch-version:hover {
          background: var(--accent-secondary);
          transform: translateY(-1px);
        }

        /* متغيرات الألوان */
        .lite-home {
          --bg-secondary: var(--mobile-bg-secondary);
          --bg-tertiary: var(--mobile-bg-tertiary);
          --border-light: var(--mobile-border-light);
          --text-primary: var(--mobile-text-primary);
          --text-secondary: var(--mobile-text-secondary);
          --accent-primary: var(--mobile-accent-primary);
          --accent-secondary: var(--mobile-accent-secondary);
        }
      `}</style>
    </MobileLiteLayout>
  );
}
