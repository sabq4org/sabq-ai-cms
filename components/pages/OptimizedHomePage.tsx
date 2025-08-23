"use client";

import React from 'react';
import { useDeviceType } from "@/hooks/useDeviceType";
import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import WelcomeMetaStrip from "@/components/user/WelcomeMetaStrip";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import LiteStatsBar from "@/components/mobile/LiteStatsBar";
import LiteLayoutWrapper, { 
  LiteFullWidthContainer, 
  LiteGrid,
  LiteCard,
  LiteHeading 
} from "@/components/layout/LiteLayoutWrapper";

// استيراد المكونات بشكل ديناميكي
const MuqtarabBlock = dynamic(
  () => import("@/components/home/EnhancedMuqtarabBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const DeepAnalysisBlock = dynamic(
  () => import("@/components/DeepAnalysisBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const SmartInsightsWidget = dynamic(
  () => import("@/components/ai/SmartInsightsWidget"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

const OldFeaturedHero = dynamic(
  () => import("@/components/old/OldFeaturedHero"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
    ),
  }
);

const LightFeaturedLoader = dynamic(
  () => import("@/components/featured/LightFeaturedLoader"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
    ),
  }
);

const LoadingScreen = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function OptimizedHomePage() {
  const { isMobile, mounted } = useDeviceType();

  useEffect(() => {
    // تحميل نظام التحسينات التلقائي للنسخة الخفيفة
    if (mounted && isMobile) {
      const script = document.createElement('script');
      script.src = '/js/lite-optimizer.js';
      script.onload = () => {
        const globalWindow = window as any;
        if (globalWindow.LiteOptimizer) {
          globalWindow.LiteOptimizer.enable();
        }
      };
      document.head.appendChild(script);

      return () => {
        const globalWindow = window as any;
        if (globalWindow.LiteOptimizer) {
          globalWindow.LiteOptimizer.disable();
        }
      };
    }
  }, [mounted, isMobile]);

  // محتوى الموبايل المحسن مع التحسينات الجديدة
  const MobileContent = useMemo(() => (
    <LiteLayoutWrapper fullWidth className="homepage-mobile-optimized">
      {/* شريط الإحصائيات للنسخة الخفيفة - ملاصق للهيدر */}
      <LiteFullWidthContainer background className="lite-stats-container">
        <LiteStatsBar />
      </LiteFullWidthContainer>

      {/* المحتوى الرئيسي */}
      <div className="lite-main-content pb-6">
        {/* شريط الترحيب */}
        <div className="lite-welcome-section">
          <Suspense fallback={<div className="h-6" />}>
            <WelcomeMetaStrip />
          </Suspense>
        </div>

        {/* الأخبار المميزة - النسخة الخفيفة المحسنة */}
        <LiteFullWidthContainer className="lite-featured-section">
          <LiteHeading level={2} className="mb-4 text-center">
            الأخبار المميزة
          </LiteHeading>
          <Suspense fallback={
            <LiteGrid columns={1} gap="md">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </LiteGrid>
          }> 
            <LightFeaturedLoader heading="" limit={3} />
          </Suspense>
        </LiteFullWidthContainer>

        {/* المؤشرات الذكية */}
        <LiteFullWidthContainer className="lite-insights-section mt-8">
          <Suspense fallback={
            <LiteCard>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </LiteCard>
          }> 
            <SmartInsightsWidget variant="compact" />
          </Suspense>
        </LiteFullWidthContainer>
        
        {/* بلوك المحتوى الذكي */}
        <LiteFullWidthContainer className="lite-smart-content-section mt-8">
          <Suspense fallback={
            <LiteCard>
              <div className="h-48 animate-pulse bg-gray-200 rounded" />
            </LiteCard>
          }>
            <SmartContentBlock />
          </Suspense>
        </LiteFullWidthContainer>
        
        {/* بلوك التحليل العميق */}
        <LiteFullWidthContainer className="lite-analysis-section mt-10">
          <Suspense fallback={
            <LiteGrid columns={1} gap="md">
              {[1, 2, 3].map(i => (
                <LiteCard key={i}>
                  <div className="h-32 animate-pulse bg-gray-200 rounded" />
                </LiteCard>
              ))}
            </LiteGrid>
          }>
            <DeepAnalysisBlock maxItems={3} className="" />
          </Suspense>
        </LiteFullWidthContainer>
        
        {/* بلوك مقترب */}
        <LiteFullWidthContainer background className="lite-muqtarab-section mt-12 py-8">
          <Suspense fallback={
            <LiteGrid columns={1} gap="lg">
              {[1, 2, 3, 4].map(i => (
                <LiteCard key={i}>
                  <div className="h-48 animate-pulse bg-gray-200 rounded" />
                </LiteCard>
              ))}
            </LiteGrid>
          }>
            <MuqtarabBlock
              limit={8}
              showPagination={false}
              showFilters={false}
              viewMode="grid"
              className="w-full"
            />
          </Suspense>
        </LiteFullWidthContainer>
      </div>

      {/* إضافة CSS مخصص للتحسينات */}
      <style jsx>{`
        .homepage-mobile-optimized {
          padding: 0;
          margin: 0;
        }

        .lite-stats-container {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .lite-welcome-section {
          padding: 1rem 0.75rem;
          text-align: center;
        }

        .lite-featured-section {
          margin: 1.5rem 0;
          padding: 1.5rem 0.75rem;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.03) 0%, 
            rgba(16, 185, 129, 0.03) 100%);
          border-radius: 16px;
        }

        .lite-insights-section {
          margin: 2rem 0;
        }

        .lite-smart-content-section {
          margin: 2rem 0;
        }

        .lite-analysis-section {
          margin: 2rem 0;
        }

        .lite-muqtarab-section {
          margin: 2rem -0.75rem 0 -0.75rem;
          padding: 2rem 0.75rem;
          background: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.05) 0%, 
            rgba(236, 72, 153, 0.05) 100%);
        }

        /* تحسينات إضافية للشاشات الصغيرة */
        @media (max-width: 375px) {
          .lite-featured-section,
          .lite-insights-section,
          .lite-smart-content-section,
          .lite-analysis-section {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .lite-muqtarab-section {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
      `}</style>
    </LiteLayoutWrapper>
  ), []);

  // محتوى الديسكتوب (بدون تغيير)
  const DesktopContent = useMemo(() => (
    <div style={{ padding: '20px 0' }}>
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Suspense fallback={<div className="h-6" />}>
          <WelcomeMetaStrip />
        </Suspense>
      </div>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-4" />}> 
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
          <SmartInsightsWidget />
        </div>
      </Suspense>
      
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
        <div className="max-w-6xl mx-auto px-4">
          <SmartContentBlock />
        </div>
      </Suspense>
      
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded mt-6" />}>
        <DeepAnalysisBlock maxItems={3} className="mt-12" />
      </Suspense>
      
      <div className="full-bleed py-6 mt-6 muqtarab-section-bg">
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded" />}>
          <div className="w-full max-w-6xl mx-auto px-4">
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
    </div>
  ), []);

  // عرض شاشة تحميل أثناء التحقق من نوع الجهاز
  if (!mounted) {
    return <LoadingScreen />;
  }

  // النسخة المحمولة المحسنة
  if (isMobile) {
    return MobileContent;
  }

  // النسخة الكاملة للديسكتوب
  return DesktopContent;
}
