"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

// النسخة الكاملة (للديسكتوب)
import UserHeader from "@/components/user/UserHeader";
import LightHeader from "@/components/layout/LightHeader";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAdminLogin = pathname?.startsWith("/admin/login");

  // صفحة دخول الإدارة: بدون هيدر/فوتر أو حاويات إضافية
  if (isAdminLogin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-page="admin-login">
        {children}
      </div>
    );
  }

  // تحسين فحص الجهاز
  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // اعتبر الجهاز محمول إذا كانت الشاشة صغيرة أو إذا كان جهاز لمس
    const newIsMobile = width < 768 || (isTouchDevice && width < 1024);
    setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkDevice();

    // تحسين الأداء مع debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 100);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [checkDevice]);

  // تحسين شاشة التحميل
  const LoadingSpinner = useMemo(() => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ), []);

  // مؤشر التطوير (محسن للأداء)
  const DevIndicator = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className={`fixed top-2 left-2 z-50 px-2 py-1 text-white text-xs rounded-full ${
        isMobile ? 'bg-green-500' : 'bg-blue-500'
      }`}>
        {isMobile ? '📱 موبايل' : '💻 ديسكتوب'}
      </div>
    );
  }, [isMobile]);

  // عدم عرض أي شيء قبل التأكد من حجم الشاشة
  if (!mounted) {
    return LoadingSpinner;
  }

  // النسخة الخفيفة للهواتف والتابلت
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {DevIndicator}
        <LightHeader />
        <main className="container mx-auto px-4 py-6">
          <div data-device="mobile">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // النسخة الكاملة للديسكتوب واللابتوب
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingTop: '72px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      {DevIndicator}
      <UserHeader />
      <main style={{
        flex: 1,
        padding: '16px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        background: 'transparent'
      }}>
        <div data-device="desktop">
          {children}
        </div>
      </main>
    </div>
  );
}
