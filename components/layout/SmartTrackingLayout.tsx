"use client";

/**
 * تخطيط ذكي يدمج تتبع السلوك ونظام الولاء
 */

import React from 'react';
import BehaviorTrackingProvider from '@/components/tracking/BehaviorTrackingProvider';
import LoyaltyWidget from '@/components/loyalty/LoyaltyWidget';
import PersonalizedRecommendations from '@/components/personalization/PersonalizedRecommendations';

interface SmartTrackingLayoutProps {
  userId?: string;
  children: React.ReactNode;
  showLoyaltyWidget?: boolean;
  showRecommendations?: boolean;
  loyaltyWidgetPosition?: 'sidebar' | 'header' | 'footer';
  className?: string;
}

export default function SmartTrackingLayout({
  userId,
  children,
  showLoyaltyWidget = true,
  showRecommendations = false,
  loyaltyWidgetPosition = 'sidebar',
  className = ''
}: SmartTrackingLayoutProps) {

  // إذا لم يكن هناك معرف مستخدم، عرض المحتوى بدون تتبع
  if (!userId) {
    return <div className={className}>{children}</div>;
  }

  return (
    <BehaviorTrackingProvider userId={userId}>
      <div className={`smart-tracking-layout ${className}`}>
        
        {/* المحتوى الرئيسي */}
        <main className="flex-1">
          {children}
          
          {/* التوصيات المخصصة */}
          {showRecommendations && (
            <div className="mt-8">
              <PersonalizedRecommendations 
                userId={userId}
                limit={6}
                showInsights={true}
              />
            </div>
          )}
        </main>

        {/* مكون نقاط الولاء */}
        {showLoyaltyWidget && (
          <LoyaltyWidgetContainer 
            userId={userId}
            position={loyaltyWidgetPosition}
          />
        )}

      </div>
    </BehaviorTrackingProvider>
  );
}

// مكون حاوي مكون الولاء
function LoyaltyWidgetContainer({ 
  userId, 
  position 
}: { 
  userId: string; 
  position: 'sidebar' | 'header' | 'footer';
}) {
  const getPositionClasses = () => {
    switch (position) {
      case 'header':
        return 'fixed top-4 right-4 z-50 w-80';
      case 'footer':
        return 'fixed bottom-4 right-4 z-50 w-80';
      case 'sidebar':
      default:
        return 'fixed top-1/2 right-4 transform -translate-y-1/2 z-40 w-72';
    }
  };

  return (
    <div className={`loyalty-widget-container ${getPositionClasses()}`}>
      <LoyaltyWidget 
        userId={userId}
        showDetails={position !== 'header'}
        className="shadow-lg"
      />
    </div>
  );
}

// Hook لاستخدام تتبع السلوك
export function useSmartTracking(userId?: string) {
  React.useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      // تأكد من تحميل المتتبع
      const checkTracker = () => {
        if ((window as any).behaviorTracker) {
          console.log('✅ متتبع السلوك جاهز');
          return true;
        }
        return false;
      };

      // انتظار تحميل المتتبع
      if (!checkTracker()) {
        const interval = setInterval(() => {
          if (checkTracker()) {
            clearInterval(interval);
          }
        }, 100);

        // تنظيف بعد 10 ثواني
        setTimeout(() => clearInterval(interval), 10000);
      }
    }
  }, [userId]);

  // دوال مساعدة للتتبع اليدوي
  const trackEvent = React.useCallback((eventType: string, metadata?: any) => {
    if (typeof window !== 'undefined' && (window as any).behaviorTracker) {
      (window as any).behaviorTracker.sendEvent(eventType, metadata);
    }
  }, []);

  const awardPoints = React.useCallback((actionType: string, contentId?: string) => {
    if (typeof window !== 'undefined' && (window as any).behaviorTracker) {
      (window as any).behaviorTracker.awardLoyaltyPoints(actionType, contentId);
    }
  }, []);

  return {
    trackEvent,
    awardPoints,
    isReady: typeof window !== 'undefined' && !!(window as any).behaviorTracker
  };
}
