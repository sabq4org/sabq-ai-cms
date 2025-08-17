'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import EnhancedDarkModeToggle from './EnhancedDarkModeToggle';
import NotificationBell from '@/components/Notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface MobileLiteLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * تخطيط النسخة الخفيفة المحسن للموبايل
 * مع دعم كامل للوضع الليلي الاحترافي
 */
export default function MobileLiteLayout({
  children,
  showHeader = true,
  showFooter = true,
  className = ''
}: MobileLiteLayoutProps) {
  const { resolvedTheme, mounted } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoaded, setIsLoaded] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // تطبيق كلاسات الوضع الليلي
  useEffect(() => {
    if (mounted && isLoaded) {
      document.body.className = `
        mobile-lite-body 
        ${resolvedTheme === 'dark' ? 'dark-mode' : 'light-mode'}
        ${isMobile ? 'is-mobile' : 'is-desktop'}
      `.trim();
    }
  }, [resolvedTheme, mounted, isLoaded, isMobile]);

  // قياس ارتفاع الهيدر لتفادي تراكب المحتوى تحته
  useEffect(() => {
    const measure = () => {
      if (showHeader && headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderHeight(Math.ceil(rect.height));
      } else {
        setHeaderHeight(0);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure as any);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure as any);
    };
  }, [showHeader, isLoaded]);

  if (!mounted || !isLoaded) {
    return <MobileLiteLayoutSkeleton />;
  }

  return (
    <div
      className={`mobile-lite-layout ${resolvedTheme} ${className}`}
      style={{ ['--ml-header-h' as any]: `${headerHeight}px` }}
    >
      {/* Header محسن */}
      {showHeader && (
        <header className="mobile-lite-header" ref={headerRef}>
          <div className="header-content">
            <div className="header-brand">
              <h1 className="brand-title">سبق الذكية</h1>
              <span className="brand-subtitle">النسخة الخفيفة</span>
            </div>
            
            <div className="header-actions">
              {/* الإشعارات الذكية الفعلية */}
              <NotificationBell />
              {/* الاكتفاء بصورة الملف الشخصي بدون الاسم */}
              <Link
                href={user ? '/profile' : '/login'}
                aria-label={user ? 'الملف الشخصي' : 'تسجيل الدخول'}
                className="avatar-button"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'الملف الشخصي'}
                    width={36}
                    height={36}
                    className="avatar-img"
                    unoptimized
                  />
                ) : (
                  <User className="avatar-fallback" />
                )}
              </Link>
            </div>
          </div>
          
          {/* شريط التقدم */}
          <div className="progress-bar">
            <div className="progress-indicator" />
          </div>
        </header>
      )}

      {/* المحتوى الرئيسي */}
      <main className="mobile-lite-main">
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Footer محسن */}
      {showFooter && (
        <footer className="mobile-lite-footer">
          <div className="footer-content">
            <div className="footer-info">
              <span className="footer-text">سبق الذكية - النسخة الخفيفة</span>
              <span className="footer-version">v2.0</span>
            </div>
            
            <div className="footer-theme">
              <EnhancedDarkModeToggle 
                variant="compact" 
                className="footer-theme-toggle"
              />
            </div>
          </div>
        </footer>
      )}

      <style jsx>{`
        .mobile-lite-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
          position: relative;
        }

        /* Header محسن */
        .mobile-lite-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--mobile-header-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-light);
          transition: all 0.3s ease;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          max-width: 100%;
        }

        .header-brand {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* إلغاء الخلفيات البيضاء لأيقونات داخل الهيدر الخفيف */
        .header-actions :global(button),
        .header-actions :global(a) {
          background: transparent !important;
          border: none;
          box-shadow: none;
        }

        /* زر الصورة الشخصية */
        .avatar-button {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 9999px;
        }

        .avatar-fallback {
          width: 20px;
          height: 20px;
          color: var(--text-primary);
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--border-light);
          overflow: hidden;
        }

        .progress-indicator {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          width: 0%;
          transition: width 0.3s ease;
          animation: progress-pulse 2s ease-in-out infinite;
        }

        /* المحتوى الرئيسي */
        .mobile-lite-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          padding-top: calc(var(--ml-header-h, 56px) + env(safe-area-inset-top));
        }

        .main-content {
          flex: 1;
          padding: 16px;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Footer محسن */
        .mobile-lite-footer {
          background: var(--mobile-header-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-light);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .footer-text {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .footer-version {
          font-size: 10px;
          color: var(--text-tertiary);
          opacity: 0.7;
        }

        .footer-theme {
          display: flex;
          align-items: center;
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 480px) {
          .header-content,
          .footer-content {
            padding: 10px 12px;
          }

          .brand-title {
            font-size: 16px;
          }

          .brand-subtitle {
            font-size: 11px;
          }

          .main-content {
            padding: 12px;
          }
        }

        /* تحسينات للشاشات الكبيرة */
        @media (min-width: 769px) {
          .header-content,
          .footer-content,
          .main-content {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }

          .main-content {
            padding: 24px 20px;
          }
        }

        /* تحسينات الوضع الليلي */
        .mobile-lite-layout.dark {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-tertiary: #334155;
          --text-primary: #f8fafc;
          --text-secondary: #e2e8f0;
          --text-tertiary: #cbd5e1;
          --border-color: #475569;
          --border-light: #334155;
          --mobile-header-bg: rgba(15, 23, 42, 0.95);
          --accent-primary: #3b82f6;
          --accent-secondary: #60a5fa;
        }

        .mobile-lite-layout.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --text-tertiary: #64748b;
          --border-color: #e2e8f0;
          --border-light: #f1f5f9;
          --mobile-header-bg: rgba(255, 255, 255, 0.95);
          --accent-primary: #2563eb;
          --accent-secondary: #3b82f6;
        }

        /* الحركات */
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* تحسينات الـ accessibility */
        @media (prefers-reduced-motion: reduce) {
          .mobile-lite-header,
          .mobile-lite-footer,
          .progress-indicator {
            transition: none;
          }
          
          .progress-indicator {
            animation: none;
          }
        }

        /* دعم الـ RTL */
        [dir="rtl"] .header-content,
        [dir="rtl"] .footer-content {
          direction: rtl;
        }

        /* تحسينات للطباعة */
        @media print {
          .mobile-lite-header,
          .mobile-lite-footer {
            display: none;
          }
          
          .main-content {
            padding: 0;
          }
        }

        /* إصلاحات خاصة بـ iOS */
        @supports (-webkit-touch-callout: none) {
          .mobile-lite-header {
            -webkit-backdrop-filter: blur(20px);
          }
          
          .mobile-lite-footer {
            -webkit-backdrop-filter: blur(20px);
          }
        }

        /* دعم المتصفحات القديمة */
        @supports not (backdrop-filter: blur(20px)) {
          .mobile-lite-header,
          .mobile-lite-footer {
            background: var(--bg-primary);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * مكون التحميل المؤقت
 */
function MobileLiteLayoutSkeleton() {
  return (
    <div className="mobile-lite-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-brand">
          <div className="skeleton-title" />
          <div className="skeleton-subtitle" />
        </div>
        <div className="skeleton-toggle" />
      </div>
      
      <div className="skeleton-main">
        <div className="skeleton-content" />
      </div>
      
      <div className="skeleton-footer">
        <div className="skeleton-info" />
        <div className="skeleton-toggle small" />
      </div>

      <style jsx>{`
        .mobile-lite-skeleton {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .skeleton-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid #f1f5f9;
        }

        .skeleton-brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .skeleton-title {
          width: 80px;
          height: 18px;
          background: #e2e8f0;
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-subtitle {
          width: 60px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-toggle {
          width: 44px;
          height: 44px;
          background: #e2e8f0;
          border-radius: 50%;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-toggle.small {
          width: 36px;
          height: 36px;
        }

        .skeleton-main {
          flex: 1;
          padding: 16px;
        }

        .skeleton-content {
          height: 200px;
          background: #e2e8f0;
          border-radius: 12px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid #f1f5f9;
        }

        .skeleton-info {
          width: 100px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
