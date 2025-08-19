"use client";

import UserWelcomeBlock from "@/components/user/UserWelcomeBlock";
import FeaturedNewsBlock from "@/components/user/FeaturedNewsBlock";
import SmartContentBlock from "@/components/user/SmartContentBlock";

export default function NewUIPage() {
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
