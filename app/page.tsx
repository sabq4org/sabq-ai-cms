"use client";

import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import FeaturedNewsBlock from "@/components/user/FeaturedNewsBlock";
import SmartContentBlock from "@/components/user/SmartContentBlock";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // التأكد من تحميل CSS variables
    const root = document.documentElement;
    const hasCSS = getComputedStyle(root).getPropertyValue('--bg');
    if (!hasCSS) {
      console.error('CSS variables not loaded! Check manus-ui.css');
    }
  }, []);

  return (
    <div style={{ padding: '20px 0' }}>
      <UserWelcomeBlock />
      
      {/* بلوك المحتوى الذكي */}
      <SmartContentBlock />
      
      {/* بلوك الأخبار المميزة */}
      <FeaturedNewsBlock />
    </div>
  );
}