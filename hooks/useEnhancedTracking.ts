import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TrackingEvent {
  type: 'view' | 'read' | 'like' | 'save' | 'share' | 'comment' | 'duration';
  articleId: string;
  metadata?: any;
  timestamp: number;
}

interface TrackingSession {
  articleId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  scrollDepth: number;
  interactions: TrackingEvent[];
}

interface UseEnhancedTrackingOptions {
  articleId?: string;
  autoTrackView?: boolean;
  autoTrackDuration?: boolean;
  durationInterval?: number; // بالثواني
  debug?: boolean;
}

export function useEnhancedTracking(options: UseEnhancedTrackingOptions = {}) {
  const { user } = useAuth();
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const sessionRef = useRef<TrackingSession | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollDepthRef = useRef(0);

  const {
    articleId,
    autoTrackView = true,
    autoTrackDuration = true,
    durationInterval = 30,
    debug = false
  } = options;

  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[🎯 Tracking]', ...args);
    }
  }, [debug]);

  // بدء جلسة جديدة
  const startSession = useCallback((articleId: string) => {
    const newSession: TrackingSession = {
      articleId,
      startTime: Date.now(),
      duration: 0,
      scrollDepth: 0,
      interactions: []
    };
    
    sessionRef.current = newSession;
    setSession(newSession);
    setIsTracking(true);
    log('Session started:', newSession);

    // تتبع المشاهدة تلقائياً
    if (autoTrackView) {
      trackEvent('view', articleId);
    }

    return newSession;
  }, [autoTrackView, log]);

  // إنهاء الجلسة
  const endSession = useCallback(async () => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    session.endTime = Date.now();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);

    log('Session ended:', session);

    // إرسال بيانات الجلسة النهائية
    if (session.duration > 5) { // فقط إذا كانت الجلسة أطول من 5 ثواني
      await trackEvent('duration', session.articleId, {
        duration: session.duration,
        scrollDepth: session.scrollDepth,
        interactionsCount: session.interactions.length
      });
    }

    // تنظيف
    sessionRef.current = null;
    setSession(null);
    setIsTracking(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [log]);

  // تتبع حدث
  const trackEvent = useCallback(async (
    type: TrackingEvent['type'],
    articleId: string,
    metadata?: any
  ) => {
    try {
      const userId = user?.id || localStorage.getItem('user_id') || 'guest';
      
      const event: TrackingEvent = {
        type,
        articleId,
        metadata,
        timestamp: Date.now()
      };

      // إضافة الحدث للجلسة
      if (sessionRef.current && sessionRef.current.articleId === articleId) {
        sessionRef.current.interactions.push(event);
      }

      log('Tracking event:', event);

      // إرسال للخادم
      const response = await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId,
          interactionType: type,
          metadata: {
            ...metadata,
            source: 'enhanced-tracking',
            device: navigator.userAgent,
            sessionId: sessionRef.current?.startTime
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // عرض إشعار بالنقاط المكتسبة
        if (data.points_earned && data.points_earned > 0) {
          toast.success(`كسبت ${data.points_earned} نقطة!`, {
            icon: '🎉',
            duration: 3000
          });
        }

        return data;
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user, log]);

  // تتبع التفاعلات
  const onView = useCallback(async (articleId: string) => {
    return trackEvent('view', articleId);
  }, [trackEvent]);

  const onLike = useCallback(async (articleId: string, isLiked: boolean) => {
    return trackEvent(isLiked ? 'like' : 'unlike', articleId, { isLiked });
  }, [trackEvent]);

  const onSave = useCallback(async (articleId: string, isSaved: boolean) => {
    return trackEvent(isSaved ? 'save' : 'unsave', articleId, { isSaved });
  }, [trackEvent]);

  const onShare = useCallback(async (articleId: string, platform?: string) => {
    return trackEvent('share', articleId, { platform });
  }, [trackEvent]);

  const onComment = useCallback(async (articleId: string, commentId?: string) => {
    return trackEvent('comment', articleId, { commentId });
  }, [trackEvent]);

  const onDuration = useCallback(async (articleId: string, seconds: number) => {
    return trackEvent('duration', articleId, { duration: seconds });
  }, [trackEvent]);

  // تتبع عمق التمرير
  const updateScrollDepth = useCallback(() => {
    if (!sessionRef.current) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const depth = Math.min(100, Math.round((scrolled / scrollHeight) * 100));

    if (depth > lastScrollDepthRef.current) {
      lastScrollDepthRef.current = depth;
      sessionRef.current.scrollDepth = depth;
      log('Scroll depth updated:', depth);
    }
  }, [log]);

  // تتبع المدة الدورية
  useEffect(() => {
    if (!autoTrackDuration || !sessionRef.current) return;

    intervalRef.current = setInterval(() => {
      if (sessionRef.current) {
        const duration = Math.floor((Date.now() - sessionRef.current.startTime) / 1000);
        sessionRef.current.duration = duration;
        
        // إرسال تحديث كل فترة
        if (duration % durationInterval === 0 && duration > 0) {
          trackEvent('duration', sessionRef.current.articleId, {
            duration,
            scrollDepth: sessionRef.current.scrollDepth,
            checkpoint: true
          });
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoTrackDuration, durationInterval, trackEvent]);

  // تتبع التمرير
  useEffect(() => {
    if (!isTracking) return;

    window.addEventListener('scroll', updateScrollDepth);
    return () => window.removeEventListener('scroll', updateScrollDepth);
  }, [isTracking, updateScrollDepth]);

  // بدء/إنهاء الجلسة تلقائياً
  useEffect(() => {
    if (articleId && !sessionRef.current) {
      startSession(articleId);
    }

    return () => {
      if (sessionRef.current && sessionRef.current.articleId === articleId) {
        endSession();
      }
    };
  }, [articleId, startSession, endSession]);

  // تنظيف عند إغلاق الصفحة
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionRef.current) {
        // إرسال البيانات النهائية بشكل متزامن
        const session = sessionRef.current;
        const duration = Math.floor((Date.now() - session.startTime) / 1000);
        
        navigator.sendBeacon('/api/interactions/track', JSON.stringify({
          userId: user?.id || localStorage.getItem('user_id') || 'guest',
          articleId: session.articleId,
          interactionType: 'duration',
          metadata: {
            duration,
            scrollDepth: session.scrollDepth,
            final: true
          }
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  return {
    // الحالة
    session,
    isTracking,
    
    // دوال التحكم بالجلسة
    startSession,
    endSession,
    
    // دوال التتبع
    onView,
    onLike,
    onSave,
    onShare,
    onComment,
    onDuration,
    
    // دالة عامة للتتبع
    trackEvent,
    
    // معلومات إضافية
    getCurrentDuration: () => sessionRef.current ? 
      Math.floor((Date.now() - sessionRef.current.startTime) / 1000) : 0,
    getScrollDepth: () => sessionRef.current?.scrollDepth || 0,
    getInteractionsCount: () => sessionRef.current?.interactions.length || 0
  };
} 