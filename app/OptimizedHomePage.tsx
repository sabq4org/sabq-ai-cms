"use client";

import { useDeviceType } from "@/hooks/useDeviceType";
import { useEffect, useMemo, Suspense, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// استيراد المكونات المهمة مباشرة (بدون dynamic)
import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import WelcomeMetaStrip from "@/components/user/WelcomeMetaStrip";
import LiteStatsBar from "@/components/mobile/LiteStatsBar";

// المكونات الثقيلة فقط يتم تحميلها ديناميكياً
const SmartContentBlock = dynamic(
  () => import("@/components/user/SmartContentBlock"),
  {
    ssr: false,
    loading: () => <ContentBlockSkeleton />,
  }
);

const MuqtarabBlock = dynamic(
  () => import("@/components/home/EnhancedMuqtarabBlock"),
  {
    ssr: false,
    loading: () => <MuqtarabSkeleton />,
  }
);

const DeepAnalysisBlock = dynamic(
  () => import("@/components/DeepAnalysisBlock"),
  {
    ssr: false,
    loading: () => <AnalysisSkeleton />,
  }
);

const SmartInsightsWidget = dynamic(
  () => import("@/components/ai/SmartInsightsWidget"),
  {
    ssr: false,
    loading: () => <InsightsSkeleton />,
  }
);

// تحسين تحميل الأخبار المميزة
const OptimizedFeaturedNews = dynamic(
  () => import("@/components/featured/OptimizedFeaturedNews"),
  {
    ssr: false,
    loading: () => <FeaturedNewsSkeleton />,
  }
);

// مكونات Skeleton محسنة
function ContentBlockSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MuqtarabSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function FeaturedNewsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook لتحسين الأداء
function useOptimizedLoading() {
  const [loadSecondary, setLoadSecondary] = useState(false);
  const [loadTertiary, setLoadTertiary] = useState(false);

  useEffect(() => {
    // تحميل المكونات الثانوية بعد 1 ثانية
    const secondaryTimer = setTimeout(() => {
      setLoadSecondary(true);
    }, 1000);

    // تحميل المكونات الثالثية بعد 2 ثانية
    const tertiaryTimer = setTimeout(() => {
      setLoadTertiary(true);
    }, 2000);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(tertiaryTimer);
    };
  }, []);

  return { loadSecondary, loadTertiary };
}

// مكون محسن للصور
function OptimizedHeroImage({ 
  src, 
  alt, 
  priority = false 
}: { 
  src: string; 
  alt: string; 
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={450}
      priority={priority}
      className="w-full h-auto rounded-lg shadow-md"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}

export default function OptimizedHomePage() {
  const { isMobile, mounted } = useDeviceType();
  const { loadSecondary, loadTertiary } = useOptimizedLoading();

  // تحسين فحص CSS
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      const hasCSS = getComputedStyle(root).getPropertyValue('--bg');
      if (!hasCSS) {
        console.warn('CSS variables might not be loaded');
      }
    }
  }, [mounted]);

  // محتوى الموبايل المحسن
  const MobileContent = useMemo(() => (
    <div className="pb-6">
      {/* شريط الإحصائيات - يتم تحميله فوراً */}
      <div className="md:hidden">
        <LiteStatsBar />
      </div>

      {/* المحتوى الأساسي */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <WelcomeMetaStrip />
      </div>

      {/* الأخبار المميزة - أولوية عالية */}
      <div className="mt-6">
        <OptimizedFeaturedNews 
          heading="الأخبار المميزة" 
          limit={3}
          layout="mobile"
        />
      </div>

      {/* المكونات الثانوية - تحميل متأخر */}
      {loadSecondary && (
        <>
          <div className="max-w-6xl mx-auto mt-8">
            <SmartInsightsWidget variant="compact" />
          </div>
          
          <div className="max-w-6xl mx-auto mt-8">
            <SmartContentBlock />
          </div>
        </>
      )}

      {/* المكونات الثالثية - تحميل متأخر جداً */}
      {loadTertiary && (
        <>
          <DeepAnalysisBlock maxItems={3} className="mt-10" />
          
          <div className="full-bleed py-8 mt-6 muqtarab-section-bg">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
              <MuqtarabBlock
                limit={6}
                showPagination={false}
                showFilters={false}
                viewMode="grid"
                className="mt-12 mx-auto"
              />
            </div>
          </div>
        </>
      )}
    </div>
  ), [loadSecondary, loadTertiary]);

  // محتوى الديسكتوب المحسن
  const DesktopContent = useMemo(() => (
    <div className="py-8">
      {/* المحتوى الأساسي */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <WelcomeMetaStrip />
      </div>

      {/* الأخبار المميزة - أولوية عالية */}
      <div className="mt-8">
        <OptimizedFeaturedNews 
          heading="الأخبار المميزة" 
          limit={6}
          layout="desktop"
        />
      </div>

      {/* المكونات الثانوية */}
      {loadSecondary && (
        <>
          <div className="max-w-6xl mx-auto px-4 mt-16">
            <SmartInsightsWidget />
          </div>
          
          <div className="max-w-6xl mx-auto px-4 mt-12">
            <SmartContentBlock />
          </div>
        </>
      )}

      {/* المكونات الثالثية */}
      {loadTertiary && (
        <>
          <DeepAnalysisBlock maxItems={4} className="mt-16" />
          
          <div className="full-bleed py-8 mt-12 muqtarab-section-bg">
            <div className="w-full max-w-6xl mx-auto px-4">
              <MuqtarabBlock
                limit={8}
                showPagination={false}
                showFilters={false}
                viewMode="grid"
                className="mt-12 mx-auto"
              />
            </div>
          </div>
        </>
      )}
    </div>
  ), [loadSecondary, loadTertiary]);

  // تحسين العرض الأولي
  if (!mounted) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          </div>
        </div>
        <FeaturedNewsSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isMobile ? MobileContent : DesktopContent}
    </div>
  );
}

