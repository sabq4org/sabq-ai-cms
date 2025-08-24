/**
 * React Hook لتتبع السلوك
 * Behavior Tracking React Hook
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  trackBehavior,
  trackReadingStart,
  trackReadingProgress,
  trackReadingComplete,
  trackScroll,
  trackClick,
  trackSocialInteraction,
  trackSearch
} from '../lib/behavior-tracking';

interface UseBehaviorTrackingOptions {
  contentId?: string;
  trackScrolling?: boolean;
  trackReading?: boolean;
  scrollThreshold?: number;
  readingThreshold?: number;
}

export function useBehaviorTracking(options: UseBehaviorTrackingOptions = {}) {
  const {
    contentId,
    trackScrolling = true,
    trackReading = true,
    scrollThreshold = 10, // نسبة مئوية
    readingThreshold = 90  // نسبة مئوية لاعتبار القراءة مكتملة
  } = options;

  const readingStarted = useRef(false);
  const readingCompleted = useRef(false);
  const lastScrollPosition = useRef(0);
  const maxScrollReached = useRef(0);

  // تتبع بداية القراءة
  useEffect(() => {
    if (trackReading && contentId && !readingStarted.current) {
      readingStarted.current = true;
      trackReadingStart(contentId);
    }
  }, [contentId, trackReading]);

  // تتبع التمرير
  const handleScroll = useCallback(() => {
    if (!trackScrolling) return;

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;

    // تتبع التمرير فقط إذا تغير بنسبة كافية
    if (Math.abs(scrollPercentage - lastScrollPosition.current) >= scrollThreshold) {
      trackScroll(contentId);
      lastScrollPosition.current = scrollPercentage;
    }

    // تحديث أقصى عمق للتمرير
    if (scrollPercentage > maxScrollReached.current) {
      maxScrollReached.current = scrollPercentage;

      // تتبع تقدم القراءة
      if (trackReading && contentId && readingStarted.current) {
        trackReadingProgress(contentId, scrollPercentage);

        // تتبع اكتمال القراءة
        if (scrollPercentage >= readingThreshold && !readingCompleted.current) {
          readingCompleted.current = true;
          trackReadingComplete(contentId);
        }
      }
    }
  }, [contentId, trackScrolling, trackReading, scrollThreshold, readingThreshold]);

  // إضافة مستمع التمرير
  useEffect(() => {
    if (trackScrolling) {
      let scrollTimer: NodeJS.Timeout;
      
      const debouncedScroll = () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(handleScroll, 150);
      };

      window.addEventListener('scroll', debouncedScroll);
      return () => {
        window.removeEventListener('scroll', debouncedScroll);
        clearTimeout(scrollTimer);
      };
    }
  }, [handleScroll, trackScrolling]);

  // تتبع النقرات
  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // تتبع النقرات على الروابط والأزرار فقط
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
        target.closest('a') || target.closest('button')) {
      trackClick(target.closest('a') || target.closest('button') || target, contentId);
    }
  }, [contentId]);

  // إضافة مستمع النقرات
  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  // وظائف تتبع مخصصة
  const trackLike = useCallback(() => {
    if (contentId) {
      trackSocialInteraction('like', contentId);
    }
  }, [contentId]);

  const trackShare = useCallback((platform?: string) => {
    if (contentId) {
      trackSocialInteraction('share', contentId, { platform });
    }
  }, [contentId]);

  const trackComment = useCallback((commentLength?: number) => {
    if (contentId) {
      trackSocialInteraction('comment', contentId, { commentLength });
    }
  }, [contentId]);

  const trackBookmark = useCallback(() => {
    if (contentId) {
      trackSocialInteraction('bookmark', contentId);
    }
  }, [contentId]);

  const trackCustomEvent = useCallback((eventType: string, metadata?: Record<string, any>) => {
    trackBehavior({
      eventType,
      contentId,
      metadata
    });
  }, [contentId]);

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      // إذا بدأت القراءة ولم تكتمل، سجل النسبة المئوية النهائية
      if (trackReading && contentId && readingStarted.current && !readingCompleted.current) {
        trackReadingProgress(contentId, maxScrollReached.current);
      }
    };
  }, [contentId, trackReading]);

  return {
    trackLike,
    trackShare,
    trackComment,
    trackBookmark,
    trackCustomEvent,
    trackSearch,
    readingProgress: maxScrollReached.current,
    isReadingComplete: readingCompleted.current
  };
}

// Hook لتتبع الوقت المقضي على الصفحة
export function useTimeSpent(pageId?: string) {
  const startTime = useRef(Date.now());
  const totalTime = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      totalTime.current = Date.now() - startTime.current;
    }, 1000);

    return () => {
      clearInterval(interval);
      
      // تتبع الوقت المقضي عند مغادرة الصفحة
      if (totalTime.current > 0) {
        trackBehavior({
          eventType: 'time_spent',
          contentId: pageId,
          metadata: {
            timeSpent: Math.round(totalTime.current / 1000), // بالثواني
            pageUrl: window.location.href
          }
        });
      }
    };
  }, [pageId]);

  return {
    timeSpent: totalTime.current,
    timeSpentSeconds: Math.round(totalTime.current / 1000)
  };
}

// Hook لتتبع رؤية العناصر
export function useElementVisibility(elementRef: React.RefObject<HTMLElement>, options?: {
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
  onHidden?: () => void;
  trackingId?: string;
}) {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    onVisible,
    onHidden,
    trackingId
  } = options || {};

  const isVisible = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.current) {
            isVisible.current = true;
            onVisible?.();
            
            if (trackingId) {
              trackBehavior({
                eventType: 'element_visible',
                metadata: {
                  elementId: trackingId,
                  visibilityRatio: entry.intersectionRatio
                }
              });
            }
          } else if (!entry.isIntersecting && isVisible.current) {
            isVisible.current = false;
            onHidden?.();
            
            if (trackingId) {
              trackBehavior({
                eventType: 'element_hidden',
                metadata: {
                  elementId: trackingId
                }
              });
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, onVisible, onHidden, trackingId]);

  return isVisible.current;
}