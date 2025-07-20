'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports لتحسين الأداء
const MobileDeepAnalysisManagement = dynamic(
  () => import('@/components/mobile/MobileDeepAnalysisManagement'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

const DesktopInsightsPage = dynamic(
  () => import('@/app/dashboard/insights/page'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function InsightsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileUserAgent || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // إعادة توجيه لصفحة الموبايل المحسنة
  useEffect(() => {
    if (isMobile) {
      router.replace('/dashboard/insights/mobile');
    }
  }, [isMobile, router]);

  // عرض نسخة الموبايل أو سطح المكتب
  if (isMobile) {
    return <MobileDeepAnalysisManagement />;
  }

  return <DesktopInsightsPage />;
}
