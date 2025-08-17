'use client';

import React, { useEffect, useState, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

// تحميل المكونات بشكل ديناميكي لتحسين الأداء
const MobileHeader = dynamic(() => import('./MobileHeader'), {
  loading: () => <div className="h-16 bg-white dark:bg-gray-800 animate-pulse" />
});

const MobileOptimizer = dynamic(() => import('./MobileOptimizer'), {
  ssr: false
});

// واجهة محسنة ومبسطة
interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'fullscreen' | 'article' | 'dashboard';
}

// hook مخصص لاكتشاف الموبايل
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return false;
      
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      
      return isMobileDevice || isSmallScreen;
    };

    const updateDeviceState = () => {
      setIsMobile(detectDevice());
      setIsLoading(false);
    };

    // تحديث فوري
    updateDeviceState();

    // مستمع لتغيير الحجم مع throttling
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDeviceState, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    // timeout للحماية من البقاء في حالة التحميل
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
    };
  }, [isLoading]);

  return { isMobile, isLoading };
};

// مكون شاشة التحميل المحسن
const LoadingScreen = memo(() => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-300">
    <div className="text-center space-y-4">
      {/* لوجو محسن */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl font-arabic">س</span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl blur opacity-30 animate-pulse"></div>
      </div>
      
      {/* نص التحميل */}
      <div className="space-y-2">
        <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          جاري تحميل المحتوى...
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));

LoadingScreen.displayName = 'LoadingScreen';

// نظام تخطيط موحد ومرن
const LayoutVariants = {
  default: {
    container: 'min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200',
    content: 'mobile-optimized-content',
    padding: ''
  },
  compact: {
    container: 'min-h-screen bg-white dark:bg-gray-800',
    content: 'compact-content',
    padding: 'px-3 py-2'
  },
  fullscreen: {
    container: 'min-h-screen bg-white dark:bg-gray-900',
    content: 'fullscreen-content',
    padding: ''
  },
  article: {
    container: 'min-h-screen bg-white dark:bg-gray-900',
    content: 'article-content max-w-none',
    padding: 'px-4 py-6'
  },
  dashboard: {
    container: 'min-h-screen bg-gray-50 dark:bg-gray-900',
    content: 'dashboard-content',
    padding: 'px-4 py-6'
  }
};

// المكون الرئيسي المحسن
const MobileLayout = memo(({ 
  children, 
  showHeader = true, 
  showFooter = false,
  className = '',
  variant = 'default'
}: MobileLayoutProps) => {
  const { darkMode } = useDarkModeContext();
  const { isMobile, isLoading } = useDeviceDetection();
  
  // تحسين الأداء بـ useMemo
  const layoutConfig = useMemo(() => LayoutVariants[variant], [variant]);
  
  const containerClasses = useMemo(() => 
    `mobile-layout ${layoutConfig.container} ${className}`.trim()
  , [layoutConfig.container, className]);

  // عرض شاشة التحميل
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={containerClasses}>
      {/* الهيدر مع lazy loading */}
      {showHeader && (
        <header className="mobile-header-container sticky top-0 z-40 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <MobileHeader />
        </header>
      )}
      
      {/* المحتوى الرئيسي */}
      <main className="mobile-main-content relative" style={{ paddingTop: showHeader ? '8px' : undefined }}>
        {isMobile ? (
          <div className={`${layoutConfig.content} ${layoutConfig.padding} mt-2`}>
            <MobileOptimizer>
              {children}
            </MobileOptimizer>
          </div>
        ) : (
          <div className="desktop-fallback-content px-6 py-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                💡 للحصول على أفضل تجربة
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                يرجى استخدام جهاز محمول أو تصغير نافذة المتصفح
              </div>
            </div>
            {children}
          </div>
        )}
      </main>
      
      {/* الفوتر */}
      {showFooter && <MobileFooter />}
    </div>
  );
});

MobileLayout.displayName = 'MobileLayout';

// مكون الفوتر المحسن
const MobileFooter = memo(() => (
  <footer className="mobile-footer bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
    <div className="px-4 py-6">
      <div className="text-center space-y-4">
        {/* لوجو */}
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">س</span>
          </div>
        </div>
        
        {/* معلومات */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            صحيفة سبق الذكية
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            مدعومة بالذكاء الاصطناعي
          </p>
        </div>
        
        {/* روابط */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          {[
            { href: '/about', label: 'من نحن' },
            { href: '/loyalty-program', label: '🔁 الولاء' },
            { href: '/help', label: 'المساعدة' },
            { href: '/privacy', label: 'الخصوصية' }
          ].map(({ href, label }) => (
            <a 
              key={href}
              href={href} 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>
        
        {/* حقوق الطبع */}
        <p className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
          © 2024 صحيفة سبق. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  </footer>
));

MobileFooter.displayName = 'MobileFooter';

// مكونات تخطيط متخصصة ومحسنة
export const CompactMobileLayout = memo(({ children }: { children: React.ReactNode }) => (
  <MobileLayout variant="compact" showHeader={false} showFooter={false}>
    {children}
  </MobileLayout>
));

export const FullPageMobileLayout = memo(({ children }: { children: React.ReactNode }) => (
  <MobileLayout variant="fullscreen" showHeader={false} showFooter={false}>
    {children}
  </MobileLayout>
));

export const ArticleMobileLayout = memo(({ children }: { children: React.ReactNode }) => (
  <MobileLayout variant="article" showHeader={true} showFooter={true}>
    {children}
  </MobileLayout>
));

export const DashboardMobileLayout = memo(({ children }: { children: React.ReactNode }) => (
  <MobileLayout variant="dashboard" showHeader={true} showFooter={false}>
    {children}
  </MobileLayout>
));

// تسمية المكونات للتطوير
CompactMobileLayout.displayName = 'CompactMobileLayout';
FullPageMobileLayout.displayName = 'FullPageMobileLayout'; 
ArticleMobileLayout.displayName = 'ArticleMobileLayout';
DashboardMobileLayout.displayName = 'DashboardMobileLayout';

export default MobileLayout;
