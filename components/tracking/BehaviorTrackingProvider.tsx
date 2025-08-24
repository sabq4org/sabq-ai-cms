"use client";

/**
 * مزود تتبع السلوك - يدمج سكريبت التتبع في التطبيق
 */

import React, { useEffect } from 'react';
import Script from 'next/script';

interface BehaviorTrackingProviderProps {
  userId?: string;
  children: React.ReactNode;
}

export default function BehaviorTrackingProvider({ 
  userId, 
  children 
}: BehaviorTrackingProviderProps) {
  
  useEffect(() => {
    // تعيين معرف المستخدم كمتغير عام
    if (userId) {
      (window as any).userId = userId;
      
      // منح نقاط الزيارة اليومية
      fetch('/api/loyalty/daily-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      }).catch(console.error);
    }
  }, [userId]);

  return (
    <>
      {/* تحميل سكريبت التتبع */}
      <Script
        src="/js/behavior-tracker-client.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ تم تحميل سكريبت تتبع السلوك');
        }}
        onError={(e) => {
          console.error('❌ فشل في تحميل سكريبت تتبع السلوك:', e);
        }}
      />
      
      {/* إضافة البيانات الوصفية للتتبع */}
      {userId && (
        <>
          <meta name="user-id" content={userId} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.userId = "${userId}";
                window.trackingEnabled = true;
              `
            }}
          />
        </>
      )}
      
      {children}
    </>
  );
}
