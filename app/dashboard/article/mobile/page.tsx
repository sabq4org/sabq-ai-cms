'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import لتحسين الأداء
const MobileArticleManagement = dynamic(
  () => import('@/components/mobile/MobileArticleManagement'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

const DesktopArticlePage = dynamic(
  () => import('@/app/dashboard/article/page').then(mod => ({ default: () => <div>Desktop Article Page</div> })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function ArticlePage() {
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
      router.replace('/dashboard/article/mobile');
    }
  }, [isMobile, router]);

  // عرض نسخة الموبايل أو سطح المكتب
  if (isMobile) {
    return <MobileArticleManagement />;
  }

  return <DesktopArticlePage />;
}
