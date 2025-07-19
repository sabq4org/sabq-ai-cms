'use client';

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import MobileHeader from './MobileHeader'
import MobileOptimizer, { 
  MobilePerformanceOptimizer, 
  TouchInteractionOptimizer, 
  DisplayOptimizer 
} from './MobileOptimizer';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function MobileLayout({ 
  children, 
  showHeader = true, 
  showFooter = false,
  className = '' 
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // إضافة timeout للتأكد من عدم البقاء في حالة التحميل
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 ثانية كحد أقصى
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // فحص نوع الجهاز
    const checkDevice = () => {
      // التحقق من وجود window
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const userAgent = navigator.userAgent || '';
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
      setIsLoading(false);
    };

    checkDevice();
    
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isSmallScreen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // عرض مؤشر التحميل
  if (isLoading) {
    return (
      <div className="mobile-loading-screen flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">س</span>
          </div>
          <div className="animate-pulse text-gray-600 dark:text-gray-400">
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileOptimizer>
      <div className={`mobile-layout min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        {/* تحسينات الأداء */}
        <MobilePerformanceOptimizer />
        <TouchInteractionOptimizer />
        <DisplayOptimizer />
        
        {/* الهيدر */}
        {showHeader && <MobileHeader />}
        
        {/* المحتوى الرئيسي */}
        <main className="mobile-main-content">
          {isMobile ? (
            <div className="mobile-optimized-content">
              {children}
            </div>
          ) : (
            <div className="desktop-content">
              {children}
            </div>
          )}
        </main>
        
        {/* الفوتر */}
        {showFooter && <MobileFooter />}
      </div>
    </MobileOptimizer>
  );
}

// مكون الفوتر للموبايل
function MobileFooter() {
  return (
    <footer className="mobile-footer bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
      <div className="px-4 py-6">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">س</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            صحيفة سبق الذكية
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            مدعومة بالذكاء الاصطناعي
          </p>
          
          <div className="flex justify-center gap-4 mb-4">
            <a href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              من نحن
            </a>
            <a href="/loyalty-program" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              🔁 نظام الولاء
            </a>
            <a href="/user-guide" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              دليل المستخدم
            </a>
            <a href="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              الخصوصية
            </a>
            <a href="/terms-of-use" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              الشروط
            </a>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2024 صحيفة سبق. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

// مكون التخطيط المضغوط للموبايل
export function CompactMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="compact-mobile-layout">
      <div className="px-4 py-2">
        {children}
      </div>
    </div>
  );
}

// مكون تخطيط الصفحة الكاملة للموبايل
export function FullPageMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="full-page-mobile-layout min-h-screen bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}

// مكون تخطيط المقال للموبايل
export function ArticleMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileLayout showHeader={true} showFooter={true}>
      <article className="article-mobile-layout max-w-none">
        <div className="px-4 py-6">
          {children}
        </div>
      </article>
    </MobileLayout>
  );
}

// مكون تخطيط لوحة التحكم للموبايل
export function DashboardMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileLayout showHeader={true} showFooter={false} className="dashboard-mobile">
      <div className="dashboard-mobile-content bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="px-4 py-6">
          {children}
        </div>
      </div>
    </MobileLayout>
  );
}