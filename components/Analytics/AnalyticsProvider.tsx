"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnalyticsContextType {
  isTracking: boolean;
  userId?: string;
  sessionId: string;
  enableTracking: () => void;
  disableTracking: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // إنشاء session ID فريد
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    setSessionId(generateSessionId());

    // التحقق من إعدادات التتبع المحفوظة
    const savedTrackingPreference = localStorage.getItem('analytics_tracking_enabled');
    if (savedTrackingPreference !== null) {
      setIsTracking(savedTrackingPreference === 'true');
    } else {
      // افتراضياً، تعطيل التتبع للحفاظ على الخصوصية
      setIsTracking(false);
    }

    // محاولة الحصول على معرف المستخدم من localStorage أو sessionStorage
    const storedUserId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const enableTracking = () => {
    setIsTracking(true);
    localStorage.setItem('analytics_tracking_enabled', 'true');
  };

  const disableTracking = () => {
    setIsTracking(false);
    localStorage.setItem('analytics_tracking_enabled', 'false');
  };

  const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
    if (!isTracking) {
      return;
    }

    try {
      // إرسال الحدث إلى API الداخلي
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          sessionId,
          userId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer,
        }
      };

      // إرسال غير متزامن لتجنب تأثير الأداء
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }).catch(error => {
        // تسجيل الخطأ بصمت دون إيقاف التطبيق
        console.debug('Analytics tracking error:', error);
      });
    } catch (error) {
      // تجاهل أخطاء التتبع لتجنب تعطيل التطبيق
      console.debug('Analytics event error:', error);
    }
  };

  const trackPageView = async (page: string, properties?: Record<string, any>) => {
    if (!isTracking) {
      return;
    }

    await trackEvent('page_view', {
      page,
      ...properties,
    });
  };

  const value: AnalyticsContextType = {
    isTracking,
    userId,
    sessionId,
    enableTracking,
    disableTracking,
    trackEvent,
    trackPageView,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
export type { AnalyticsContextType };
