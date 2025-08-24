"use client";

/**
 * تخطيط موحد يدمج نظام المصادقة الموحد مع جميع المكونات
 * يحل مشاكل تضارب أنظمة المصادقة
 */

import React from 'react';
import { UnifiedAuthProvider, useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import UnifiedHeader from './UnifiedHeader';
import BehaviorTrackingProvider from '@/components/tracking/BehaviorTrackingProvider';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  enableTracking?: boolean;
  className?: string;
}

export default function UnifiedLayout({
  children,
  showHeader = true,
  enableTracking = true,
  className = ''
}: UnifiedLayoutProps) {
  return (
    <UnifiedAuthProvider>
      <UnifiedLayoutContent 
        showHeader={showHeader}
        enableTracking={enableTracking}
        className={className}
      >
        {children}
      </UnifiedLayoutContent>
    </UnifiedAuthProvider>
  );
}

function UnifiedLayoutContent({
  children,
  showHeader,
  enableTracking,
  className
}: UnifiedLayoutProps) {
  const { user } = useUnifiedAuth();

  const content = (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {showHeader && <UnifiedHeader />}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );

  // إذا كان التتبع مفعلاً ويوجد مستخدم، استخدم مزود التتبع
  if (enableTracking && user?.id) {
    return (
      <BehaviorTrackingProvider userId={user.id}>
        {content}
      </BehaviorTrackingProvider>
    );
  }

  return content;
}

// إعادة تصدير للتوافق
export { useUnifiedAuth as useAuth, useUnifiedAuth as useUser } from '@/contexts/UnifiedAuthContext';
