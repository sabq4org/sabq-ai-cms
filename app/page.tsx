"use client";

import { useDeviceType } from "@/hooks/useDeviceType";
import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import WelcomeMetaStrip from "@/components/user/WelcomeMetaStrip";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import LiteStatsBar from "@/components/mobile/LiteStatsBar";

// استيراد المكونات الذكية الجديدة
const SmartBreakingNews = dynamic(
  () => import("@/components/home/SmartBreakingNews"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-16 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 animate-pulse rounded" />
    ),
  }
);

const SmartSummaryWidget = dynamic(
  () => import("@/components/home/SmartSummaryWidget"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
    ),
  }
);

const PersonalizedFeed = dynamic(
  () => import("@/components/home/PersonalizedFeed"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
        ))}
      </div>
    ),
  }
);

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

// استيراد المؤشرات الذكية بشكل ديناميكي مع تأخير التحميل
const SmartInsightsWidget = dynamic(
  () => import("@/components/ai/SmartInsightsWidget"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

// استيراد شريط الأخبار المميزة المحسن للنسخة الخفيفة
const EnhancedFeaturedLoader = dynamic(
  () => import("@/components/featured/EnhancedFeaturedLoader"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
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

  // محاكاة بيانات المستخدم (في التطبيق الحقيقي، ستأتي من السياق أو API)
  const mockUser = {
    id: "user-123",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    interests: ["تقنية", "اقتصاد", "رياضة"],
    readingHistory: ["ai-developments", "economic-growth"],
    followedTopics: ["ذكاء اصطناعي", "رؤية 2030"],
    followedAuthors: ["د. سارة الأحمد"],
    location: "الرياض"
  };

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

  // محتوى الموبايل - محسّن بتحميل متوازي مع المكونات الذكية الجديدة
  const MobileContent = useMemo(() => (
    <>
      {/* الأخبار العاجلة والمخصصة */}
      <Suspense fallback={<div className="h-16 opacity-0" />}>
        <SmartBreakingNews user={mockUser} />
      </Suspense>

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
        
        {/* الأخبار المميزة */}
        <Suspense fallback={
          <div className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-4" />
        }>
          <EnhancedFeaturedLoader heading="الأخبار المميزة" limit={3} showCarousel={false} />
        </Suspense>

        {/* موجز سبق الذكي */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <Suspense fallback={
            <div className="h-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
          }>
            <SmartSummaryWidget user={mockUser} />
          </Suspense>
        </div>

        {/* موجز "من أجلك" */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
          <Suspense fallback={
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
              ))}
            </div>
          }>
            <PersonalizedFeed user={mockUser} />
          </Suspense>
        </div>
        
        {/* المحتوى الذكي */}
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded mt-6 animate-pulse" />}>
          <div className="max-w-6xl mx-auto">
            <SmartContentBlock />
          </div>
        </Suspense>
        
        {/* المؤشرات الذكية - تحميل كسول منفصل */}
        <Suspense fallback={<div className="h-24 opacity-0" />}>
          <div className="max-w-6xl mx-auto mt-12">
            <SmartInsightsWidget variant="compact" />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded mt-6" />}>
          <DeepAnalysisBlock maxItems={3} className="mt-10" />
        </Suspense>
        
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
      </div>
    </>
  ), []);

  // محتوى الديسكتوب محسن مع useMemo والمكونات الذكية الجديدة
  const DesktopContent = useMemo(() => (
    <div style={{ padding: '20px 0' }}>
      {/* الأخبار العاجلة والمخصصة */}
      <Suspense fallback={<div className="h-16 opacity-0" />}>
        <SmartBreakingNews user={mockUser} />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Suspense fallback={<div className="h-6" />}>
          <WelcomeMetaStrip />
        </Suspense>
      </div>

      {/* الأخبار المميزة المحسنة - النسخة الكاملة مع التحميل التدريجي */}
      <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-4" />}> 
        <EnhancedFeaturedLoader heading="الأخبار المميزة" limit={3} showCarousel={true} />
      </Suspense>

      {/* تخطيط ثنائي الأعمدة للمحتوى الذكي */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* العمود الرئيسي - موجز "من أجلك" */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
                ))}
              </div>
            }>
              <PersonalizedFeed user={mockUser} />
            </Suspense>
          </div>

          {/* العمود الجانبي - موجز سبق الذكي والمؤشرات */}
          <div className="space-y-8">
            <Suspense fallback={
              <div className="h-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse" />
            }>
              <SmartSummaryWidget user={mockUser} />
            </Suspense>

            <Suspense fallback={
              <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            }>
              <SmartInsightsWidget />
            </Suspense>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-200 rounded mt-6" />}>
        <div className="max-w-6xl mx-auto px-4 mt-16">
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
