"use client";

import { useDeviceType } from "@/hooks/useDeviceType";
import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import WelcomeMetaStrip from "@/components/user/WelcomeMetaStrip";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect, useMemo, Suspense, useState } from "react";
import dynamic from "next/dynamic";
import LiteStatsBar from "@/components/mobile/LiteStatsBar";

// تفعيل/تعطيل بلوك "مقترب" من الواجهة بسهولة
const SHOW_MUQTARAB = true;

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

// استيراد بلوك التحليل العميق بشكل ديناميكي
const DeepAnalysisBlock = dynamic(
  () => import("@/components/DeepAnalysisBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

// استيراد المؤشرات الذكية بشكل ديناميكي
const SmartInsightsWidget = dynamic(
  () => import("@/components/ai/SmartInsightsWidget"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

// استيراد بلوك الأخبار المميزة من النسخة القديمة لاستخدامه في النسخة الكاملة فقط
const OldFeaturedHero = dynamic(
  () => import("@/components/old/OldFeaturedHero"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
    ),
  }
);

// استيراد شريط الأخبار المميزة للنسخة الخفيفة
const LightFeaturedLoader = dynamic(
  () => import("@/components/featured/LightFeaturedLoader"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
    ),
  }
);

// (تم حذف الأخبار المميزة من النسخة الكاملة)

// مكون شاشة التحميل المحسن
const LoadingScreen = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Page() {
  const { isMobile, mounted } = useDeviceType();
  const [isIdle, setIsIdle] = useState(false);

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

  // جدولة تحميل الكتل الثقيلة بعد خمول المتصفح لتقليل LCP/TTI
  useEffect(() => {
    const schedule: any = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 600));
    schedule(() => setIsIdle(true));
  }, []);

  // محتوى الموبايل - نفس المحتوى لكن مُحسن للموبايل
  const MobileContent = useMemo(() => (
    <>
      {/* شريط الإحصائيات للنسخة الخفيفة - ملاصق للهيدر */}
      <div className="md:hidden">
        <LiteStatsBar />
      </div>
      <div className="pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <Suspense fallback={<div className="h-6" />}>
            <WelcomeMetaStrip />
          </Suspense>
        </div>
        {/* الأخبار المميزة - النسخة الخفيفة */}
        <Suspense fallback={<div className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />}> 
          <LightFeaturedLoader heading="الأخبار المميزة" limit={3} />
        </Suspense>
        {/* المؤشرات الذكية */}
        <Suspense
          fallback={
            <div className="max-w-6xl mx-auto mt-8">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
          }
        > 
          <div className="max-w-6xl mx-auto mt-12">
            <SmartInsightsWidget variant="compact" />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
          <div className="max-w-6xl mx-auto">
            <SmartContentBlock />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded mt-6" />}>
          <DeepAnalysisBlock maxItems={3} className="mt-10" />
        </Suspense>
        
        {SHOW_MUQTARAB ? (
          <div className="full-bleed py-8 mt-6 muqtarab-section-bg">
            <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded" />}>
              <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MuqtarabBlock
                  limit={8}
                  showPagination={false}
                  showFilters={false}
                  viewMode="grid"
                  className="mt-12 mx-auto"
                />
              </div>
            </Suspense>
          </div>
        ) : null}
      </div>
    </>
  ), []);

  // محتوى الديسكتوب محسن مع useMemo
  const DesktopContent = useMemo(() => (
    <div style={{ padding: '20px 0' }}>
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Suspense fallback={<div className="h-6" />}>
          <WelcomeMetaStrip />
        </Suspense>
      </div>
      {/* الأخبار المميزة من النسخة القديمة - النسخة الكاملة فقط */}
      <Suspense fallback={<div className="h-[360px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-4" />}> 
        <OldFeaturedHero />
      </Suspense>
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-4 mt-10">
            <div className="h-24 animate-pulse bg-gray-200 rounded" />
          </div>
        }
      >
        <div className="max-w-6xl mx-auto px-4 mt-16">
          {isIdle ? (
            <SmartInsightsWidget />
          ) : (
            <div className="h-24 animate-pulse bg-gray-200 rounded" />
          )}
        </div>
      </Suspense>
      
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
        <div className="max-w-6xl mx-auto px-4">
          {isIdle ? (
            <SmartContentBlock />
          ) : (
            <div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />
          )}
        </div>
      </Suspense>
      
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded mt-6" />}>
        {isIdle ? (
          <DeepAnalysisBlock maxItems={3} className="mt-12" />
        ) : (
          <div className="h-64 animate-pulse bg-gray-200 rounded mt-6" />
        )}
      </Suspense>
      
      {SHOW_MUQTARAB ? (
        <div className="full-bleed py-6 mt-6 muqtarab-section-bg">
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded" />}>
            <div className="w-full max-w-6xl mx-auto px-4">
              {isIdle ? (
                <MuqtarabBlock
                  limit={8}
                  showPagination={false}
                  showFilters={false}
                  viewMode="grid"
                  className="mt-12 mx-auto"
                />
              ) : (
                <div className="h-96 animate-pulse bg-gray-200 rounded" />
              )}
            </div>
          </Suspense>
        </div>
      ) : null}
    </div>
  ), []);

  // إصلاح: لا تُظهر شاشة تحميل عامة؛ اعرض تخطيطًا افتراضيًا سريعًا لتجنب التعليق
  // نفترض الديسكتوب حتى يتم التثبيت ثم يُعاد العرض تلقائيًا
  if (!mounted) {
    return DesktopContent;
  }

  // النسخة المحمولة - نفس المحتوى الأصلي مع تخطيط محسن للموبايل
  if (isMobile) {
    return MobileContent;
  }

  // النسخة الكاملة للديسكتوب
  return DesktopContent;
}