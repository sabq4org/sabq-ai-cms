// React Hook لتتبع سلوك المستخدم - سبق الذكية
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getTrackingManager, TrackingManager } from '@/lib/tracking/client/tracking-manager';
import { ReadingTracker } from '@/lib/tracking/client/reading-tracker';
import { useAuth } from '@/contexts/AuthContext';

// واجهة إعدادات التتبع
export interface UseTrackingOptions {
  enableInteractionTracking?: boolean;
  enableReadingTracking?: boolean;
  enableScrollTracking?: boolean;
  autoStart?: boolean;
  debug?: boolean;
}

// واجهة نتيجة الـ Hook
export interface UseTrackingResult {
  // حالة التتبع
  isInitialized: boolean;
  isTrackingReading: boolean;
  
  // وظائف التتبع
  trackInteraction: (type: string, articleId?: string, data?: any) => void;
  trackPageView: () => void;
  startReadingSession: (articleId: string) => void;
  stopReadingSession: () => Promise<void>;
  highlightText: (text: string, startPos: number, endPos: number) => void;
  updateReadingSection: (sectionName: string) => void;
  
  // إدارة التتبع
  pauseTracking: () => void;
  resumeTracking: () => void;
  
  // بيانات التتبع
  sessionId: string | null;
  readingInsights: any;
}

// Hook الرئيسي لتتبع المستخدم
export function useUserTracking(options: UseTrackingOptions = {}): UseTrackingResult {
  const {
    enableInteractionTracking = true,
    enableReadingTracking = true,
    enableScrollTracking = true,
    autoStart = true,
    debug = false
  } = options;

  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTrackingReading, setIsTrackingReading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readingInsights, setReadingInsights] = useState<any>(null);

  const trackingManagerRef = useRef<TrackingManager | null>(null);
  const readingTrackerRef = useRef<ReadingTracker | null>(null);
  const isTrackingPausedRef = useRef(false);

  // تهيئة مدير التتبع
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const manager = getTrackingManager({
          enabledEvents: [
            ...(enableInteractionTracking ? ['interaction'] : []),
            ...(enableReadingTracking ? ['reading_session'] : []),
            'page_view'
          ],
          debug,
          batchSize: 5,
          flushInterval: 20000
        });

        await manager.initialize(user?.id);
        trackingManagerRef.current = manager;
        setSessionId(manager['sessionId'] || null);
        setIsInitialized(true);

        console.log('🎯 تم تهيئة تتبع المستخدم بنجاح');

      } catch (error) {
        console.error('❌ فشل في تهيئة تتبع المستخدم:', error);
      }
    };

    if (autoStart) {
      initializeTracking();
    }

    return () => {
      // تنظيف عند الإلغاء
      if (trackingManagerRef.current) {
        trackingManagerRef.current.destroy();
      }
      if (readingTrackerRef.current) {
        readingTrackerRef.current.stopTracking();
      }
    };
  }, [autoStart, user?.id, debug, enableInteractionTracking, enableReadingTracking]);

  // تحديث معرف المستخدم عند تغييره
  useEffect(() => {
    if (trackingManagerRef.current && user?.id) {
      trackingManagerRef.current.setUserId(user.id);
    }
  }, [user?.id]);

  // تتبع التفاعل
  const trackInteraction = useCallback((type: string, articleId?: string, data: any = {}) => {
    if (!trackingManagerRef.current || !enableInteractionTracking || isTrackingPausedRef.current) {
      return;
    }

    try {
      trackingManagerRef.current.trackInteraction(type, articleId || 'unknown', {
        timestamp: Date.now(),
        ...data
      });

      if (debug) {
        console.log(`🎯 تم تتبع التفاعل: ${type}`, { articleId, data });
      }
    } catch (error) {
      console.error('❌ فشل في تتبع التفاعل:', error);
    }
  }, [enableInteractionTracking, debug]);

  // تتبع زيارة الصفحة
  const trackPageView = useCallback(() => {
    if (!trackingManagerRef.current || isTrackingPausedRef.current) {
      return;
    }

    try {
      trackingManagerRef.current.trackPageView();
      
      if (debug) {
        console.log('📄 تم تتبع زيارة الصفحة');
      }
    } catch (error) {
      console.error('❌ فشل في تتبع زيارة الصفحة:', error);
    }
  }, [debug]);

  // بدء جلسة قراءة
  const startReadingSession = useCallback((articleId: string) => {
    if (!enableReadingTracking || isTrackingPausedRef.current) {
      return;
    }

    try {
      // إيقاف الجلسة السابقة إن وجدت
      if (readingTrackerRef.current) {
        readingTrackerRef.current.stopTracking();
      }

      // بدء جلسة جديدة
      const tracker = new ReadingTracker(articleId);
      tracker.startTracking();
      readingTrackerRef.current = tracker;
      setIsTrackingReading(true);

      if (debug) {
        console.log(`📖 بدء جلسة قراءة للمقال: ${articleId}`);
      }
    } catch (error) {
      console.error('❌ فشل في بدء جلسة القراءة:', error);
    }
  }, [enableReadingTracking, debug]);

  // إيقاف جلسة القراءة
  const stopReadingSession = useCallback(async () => {
    if (!readingTrackerRef.current) {
      return;
    }

    try {
      const session = await readingTrackerRef.current.stopTracking();
      readingTrackerRef.current = null;
      setIsTrackingReading(false);

      if (session) {
        setReadingInsights(session);
        
        if (debug) {
          console.log('✅ تم إيقاف جلسة القراءة:', session);
        }
      }
    } catch (error) {
      console.error('❌ فشل في إيقاف جلسة القراءة:', error);
    }
  }, [debug]);

  // تمييز النص
  const highlightText = useCallback((text: string, startPos: number, endPos: number) => {
    if (!readingTrackerRef.current || isTrackingPausedRef.current) {
      return;
    }

    try {
      readingTrackerRef.current.highlightText(text, startPos, endPos);
      
      if (debug) {
        console.log('✨ تم تمييز النص:', { text: text.substring(0, 50), startPos, endPos });
      }
    } catch (error) {
      console.error('❌ فشل في تمييز النص:', error);
    }
  }, [debug]);

  // تحديث القسم الحالي
  const updateReadingSection = useCallback((sectionName: string) => {
    if (!readingTrackerRef.current || isTrackingPausedRef.current) {
      return;
    }

    try {
      readingTrackerRef.current.updateCurrentSection(sectionName);
      
      if (debug) {
        console.log(`📍 تحديث القسم: ${sectionName}`);
      }
    } catch (error) {
      console.error('❌ فشل في تحديث القسم:', error);
    }
  }, [debug]);

  // إيقاف التتبع مؤقتاً
  const pauseTracking = useCallback(() => {
    isTrackingPausedRef.current = true;
    console.log('⏸️ تم إيقاف التتبع مؤقتاً');
  }, []);

  // استئناف التتبع
  const resumeTracking = useCallback(() => {
    isTrackingPausedRef.current = false;
    console.log('▶️ تم استئناف التتبع');
  }, []);

  return {
    isInitialized,
    isTrackingReading,
    trackInteraction,
    trackPageView,
    startReadingSession,
    stopReadingSession,
    highlightText,
    updateReadingSection,
    pauseTracking,
    resumeTracking,
    sessionId,
    readingInsights
  };
}

// Hook مبسط لتتبع المقالات
export function useArticleTracking(articleId: string, options: UseTrackingOptions = {}) {
  const tracking = useUserTracking(options);

  // تلقائي: بدء تتبع القراءة عند تحميل المقال
  useEffect(() => {
    if (tracking.isInitialized && articleId) {
      tracking.startReadingSession(articleId);

      // إيقاف التتبع عند مغادرة الصفحة
      return () => {
        tracking.stopReadingSession();
      };
    }
  }, [tracking.isInitialized, articleId]);

  // وظائف محددة للمقال
  const trackLike = useCallback(() => {
    tracking.trackInteraction('like', articleId);
  }, [tracking.trackInteraction, articleId]);

  const trackSave = useCallback(() => {
    tracking.trackInteraction('save', articleId);
  }, [tracking.trackInteraction, articleId]);

  const trackShare = useCallback((platform?: string) => {
    tracking.trackInteraction('share', articleId, { platform });
  }, [tracking.trackInteraction, articleId]);

  const trackComment = useCallback(() => {
    tracking.trackInteraction('comment', articleId);
  }, [tracking.trackInteraction, articleId]);

  return {
    ...tracking,
    trackLike,
    trackSave,
    trackShare,
    trackComment
  };
}

// Hook لتتبع الأداء
export function usePerformanceTracking() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const collectMetrics = () => {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const performanceMetrics = {
        page_load_time: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        dom_ready_time: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        // Core Web Vitals
        largest_contentful_paint: 0, // يحتاج مراقب منفصل
        cumulative_layout_shift: 0, // يحتاج مراقب منفصل
        first_input_delay: 0 // يحتاج مراقب منفصل
      };

      setMetrics(performanceMetrics);

      // إرسال بيانات الأداء
      const trackingManager = getTrackingManager();
      trackingManager.track('page_view', {
        performance: performanceMetrics,
        user_agent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    };

    // انتظار اكتمال تحميل الصفحة
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, []);

  return metrics;
}

// Hook لتتبع الأخطاء
export function useErrorTracking() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const trackingManager = getTrackingManager();
      trackingManager.track('interaction', {
        interaction_type: 'error',
        error_message: event.message,
        error_filename: event.filename,
        error_line: event.lineno,
        error_column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const trackingManager = getTrackingManager();
      trackingManager.track('interaction', {
        interaction_type: 'unhandled_promise_rejection',
        error_reason: event.reason?.toString(),
        timestamp: Date.now()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

export default useUserTracking;
