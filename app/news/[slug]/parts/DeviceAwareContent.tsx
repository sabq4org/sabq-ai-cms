"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MobileContent = dynamic(() => import("./MobileContent"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#f8f8f7] dark:bg-neutral-950" />
});

const DesktopContent = dynamic(() => import("./DesktopContent"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#f8f8f7] dark:bg-neutral-950" />
});

interface DeviceAwareContentProps {
  article: any;
  insights: any;
  slug: string;
}

export default function DeviceAwareContent({ article, insights, slug }: DeviceAwareContentProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      // التحقق من حجم الشاشة ونوع الجهاز
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // التحقق من الأجهزة المحمولة
      const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // الآيباد يعتبر جهاز كبير (ليس موبايل)
      const isIPad = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // اعتبار الجهاز موبايل إذا كان العرض أقل من 768 بكسل أو كان جهاز محمول (ليس آيباد)
      const mobile = (width < 768 && !isIPad) || (isMobileDevice && !isIPad);
      
      setIsMobile(mobile);
      setIsLoading(false);
    };

    // التحقق عند التحميل
    checkDevice();

    // التحقق عند تغيير حجم النافذة
    window.addEventListener('resize', checkDevice);
    
    // التحقق عند تغيير الاتجاه
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f7] dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  // عرض النسخة المناسبة حسب نوع الجهاز
  if (isMobile) {
    return <MobileContent article={article} insights={insights} slug={slug} />;
  }

  return <DesktopContent article={article} insights={insights} slug={slug} />;
}
