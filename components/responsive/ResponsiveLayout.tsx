"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setMounted(true);
    
    // فحص حجم الشاشة ونوع الجهاز
    const checkDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // اعتبر الجهاز محمول إذا كانت الشاشة صغيرة أو إذا كان جهاز لمس
      setIsMobile(width < 768 || (isTouchDevice && width < 1024));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // عدم عرض أي شيء قبل التأكد من حجم الشاشة
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--theme-primary, #3b82f6)' }}></div>
      </div>
    );
  }

  // النسخة الخفيفة للهواتف والتابلت
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* مؤشر النسخة الخفيفة للتطوير */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-2 left-2 z-50 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
            📱 موبايل - النسخة الخفيفة
          </div>
        )}
        
        <LightHeader />
        <main className="container mx-auto px-4 py-6">
          {/* تمرير معلومة أن الجهاز محمول */}
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
      {/* مؤشر النسخة الكاملة للتطوير */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 left-2 z-50 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
          💻 ديسكتوب - النسخة الكاملة
        </div>
      )}
      
      <UserHeader />
      <main style={{
        flex: 1,
        padding: '16px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        background: 'transparent'
      }}>
        {/* تمرير معلومة أن الجهاز ديسكتوب */}
        <div data-device="desktop">
          {children}
        </div>
      </main>
    </div>
  );
}
