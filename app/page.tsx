"use client";

import { useDeviceType } from "@/hooks/useDeviceType";
import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import FeaturedNewsBlock from "@/components/user/FeaturedNewsBlock";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";

// استيراد بلوك مقترب بشكل ديناميكي مع تحسين التحميل
const MuqtarabBlock = dynamic(
  () => import("@/components/home/EnhancedMuqtarabBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

// مكون شاشة التحميل المحسن
const LoadingScreen = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Page() {
  const { isMobile, mounted } = useDeviceType();

  useEffect(() => {
    // تحسين فحص CSS
    if (mounted) {
      const root = document.documentElement;
      const hasCSS = getComputedStyle(root).getPropertyValue('--bg');
      if (!hasCSS) {
        console.warn('CSS variables might not be loaded');
      }
    }
  }, [mounted]);

  // محتوى الموبايل - نفس المحتوى لكن مُحسن للموبايل
  const MobileContent = useMemo(() => (
    <div className="px-4 py-6">
      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 rounded" />}>
        <UserWelcomeBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
        <SmartContentBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded mt-6" />}>
        <FeaturedNewsBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded mt-6" />}>
        <MuqtarabBlock
          limit={8}
          showPagination={false}
          showFilters={false}
          viewMode="grid"
          className="mt-12"
        />
      </Suspense>
    </div>
  ), []);

  // محتوى الديسكتوب محسن مع useMemo
  const DesktopContent = useMemo(() => (
    <div style={{ padding: '20px 0' }}>
      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 rounded" />}>
        <UserWelcomeBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
        <SmartContentBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded mt-6" />}>
        <FeaturedNewsBlock />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded mt-6" />}>
        <MuqtarabBlock
          limit={8}
          showPagination={false}
          showFilters={false}
          viewMode="grid"
          className="mt-12"
        />
      </Suspense>
    </div>
  ), []);

  // عرض شاشة تحميل أثناء التحقق من نوع الجهاز
  if (!mounted) {
    return <LoadingScreen />;
  }

  // النسخة المحمولة - نفس المحتوى الأصلي مع تخطيط محسن للموبايل
  if (isMobile) {
    return MobileContent;
  }

  // النسخة الكاملة للديسكتوب
  return DesktopContent;
}