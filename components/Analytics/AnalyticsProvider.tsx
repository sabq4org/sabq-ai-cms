'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';

interface AnalyticsProviderProps {
  children?: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // تفعيل تتبع إضافي للصفحات المهمة
    const trackPageView = () => {
      const path = window.location.pathname;
      const title = document.title;
      
      // تتبع مخصص للصفحات الرئيسية
      if (path === '/') {
        console.log('📊 تتبع الصفحة الرئيسية');
      } else if (path.startsWith('/article/')) {
        console.log('📰 تتبع مقال:', title);
      } else if (path.startsWith('/admin/')) {
        console.log('⚙️ تتبع لوحة التحكم');
      }
    };

    // تتبع أولي
    trackPageView();

    // تتبع التنقل بين الصفحات
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(trackPageView, 100);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(trackPageView, 100);
    };

    // تتبع الرجوع والتقدم
    window.addEventListener('popstate', trackPageView);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', trackPageView);
    };
  }, []);

  // تتبع الأخطاء للتحليلات
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      // يمكن إضافة تتبع مخصص للأخطاء هنا
      console.warn('📊 Analytics - خطأ تم رصده:', error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <>
      {children}
      {/* Vercel Analytics - تتبع الزوار والصفحات */}
      <Analytics />
      
      {/* Vercel Speed Insights - تتبع الأداء */}
      <SpeedInsights />
    </>
  );
};

export default AnalyticsProvider;