"use client";

import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import FeaturedNewsBlock from "@/components/user/FeaturedNewsBlock";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect } from "react";
import dynamic from "next/dynamic";

// استيراد بلوك مقترب بشكل ديناميكي
const MuqtarabBlock = dynamic(
  () => import("@/components/home/EnhancedMuqtarabBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

export default function Page() {
  useEffect(() => {
    // التأكد من تحميل CSS variables
    const root = document.documentElement;
    const hasCSS = getComputedStyle(root).getPropertyValue('--bg');
    if (!hasCSS) {
      console.error('CSS variables not loaded! Check manus-ui.css');
    }
    console.log('Page component loaded successfully');
  }, []);

  return (
    <div style={{ padding: '20px 0' }}>
      <h1>صفحة الاختبار تعمل!</h1>
      <UserWelcomeBlock />
      
      {/* بلوك المحتوى الذكي */}
      <SmartContentBlock />
      
      {/* بلوك الأخبار المميزة */}
      <FeaturedNewsBlock />
      
      {/* بلوك مقترب - أسفل بطاقات الأخبار */}
      <MuqtarabBlock
        limit={8}
        showPagination={false}
        showFilters={false}
        viewMode="grid"
        className="mt-12"
      />
    </div>
  );
}