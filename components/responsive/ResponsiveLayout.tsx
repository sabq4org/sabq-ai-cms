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
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const isUserAuthPage = pathname === "/login" || pathname === "/register";
  const isCategoryPage = pathname?.startsWith("/categories/") || pathname?.startsWith("/news/category/");

  // تحسين فحص الجهاز
  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // تبسيط الفحص - فقط حجم الشاشة
    const newIsMobile = width < 768;
    setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
  }, []);

  // التحقق من الوضع الداكن
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark') ||
                     localStorage.getItem('theme') === 'dark';
      setDarkMode(isDark);
    };

    checkDarkMode();
    
    // مراقبة تغييرات الـ class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // تطبيق الخلفية العامة
  useEffect(() => {
    if (pathname?.startsWith('/muqtarab')) {
      document.body.setAttribute('data-muqtarab-page', 'true');
    } else {
      document.body.removeAttribute('data-muqtarab-page');
    }
  }, [pathname]);

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

  // شاشة التحميل البسيطة
  const LoadingSpinner = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
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

  // صفحات الدخول للأعضاء (لا هيدر/فوتر)
  if (isUserAuthPage) {
    return (
      <div className="min-h-screen" data-page="user-auth">
        {children}
      </div>
    );
  }

  // النسخة الخفيفة للهواتف والتابلت
  if (isMobile) {
    return (
      <div className="min-h-screen">
        {DevIndicator}
        <LightHeader />
        <main 
          className={`mx-auto content-main-mobile ${isCategoryPage ? 'px-1' : 'px-4 sm:px-6 py-6'}`} 
          style={{ 
            maxWidth: isCategoryPage ? '1400px' : '72rem'
          }}
        >
          <div data-device="mobile">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // النسخة الكاملة للديسكتوب واللابتوب
  return (
    <div className="min-h-screen" style={{ 
      paddingTop: '72px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      {DevIndicator}
      <UserHeader />
      <main className="content-main-desktop" style={{
        flex: 1,
        padding: isCategoryPage ? '0 8px' : '16px 24px',
        maxWidth: isCategoryPage ? '1400px' : '72rem',
        margin: '0 auto',
        width: '100%'
      }}>
        <div data-device="desktop">
          {children}
        </div>
      </main>
    </div>
  );
}
