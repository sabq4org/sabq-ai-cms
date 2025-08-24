/**
 * نقطة دخول نظام تتبع السلوك
 * Behavior Tracking System Entry Point
 */

import { BehaviorTrackingService } from '../../smart-notifications-system/services/behavior-tracking-service';
import { BehaviorTrackingRequest } from '../../smart-notifications-system/types';

// إنشاء instance واحد من خدمة تتبع السلوك
const behaviorService = new BehaviorTrackingService();

/**
 * تتبع حدث سلوكي من المتصفح
 */
export async function trackBehavior(eventData: {
  eventType: string;
  contentId?: string;
  action?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // الحصول على معلومات المستخدم والجلسة
    const userId = getUserId();
    const sessionId = getSessionId();
    
    if (!userId || !sessionId) {
      console.warn('لا يمكن تتبع السلوك بدون معرف المستخدم والجلسة');
      return;
    }

    // إنشاء طلب التتبع
    const trackingRequest: BehaviorTrackingRequest = {
      userId,
      sessionId,
      eventType: eventData.eventType,
      eventData: {
        contentId: eventData.contentId,
        action: eventData.action,
        metadata: {
          ...eventData.metadata,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      deviceInfo: getDeviceInfo()
    };

    // إرسال الحدث للخادم
    const response = await fetch('/api/behavior/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingRequest)
    });

    if (!response.ok) {
      console.error('فشل تتبع السلوك:', response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('خطأ في تتبع السلوك:', error);
  }
}

/**
 * تتبع بداية القراءة
 */
export async function trackReadingStart(contentId: string) {
  return trackBehavior({
    eventType: 'read_start',
    contentId,
    metadata: {
      readingStartTime: Date.now()
    }
  });
}

/**
 * تتبع تقدم القراءة
 */
export async function trackReadingProgress(contentId: string, progress: number) {
  return trackBehavior({
    eventType: 'read_progress',
    contentId,
    metadata: {
      scrollPosition: progress,
      readingTime: getReadingTime(contentId)
    }
  });
}

/**
 * تتبع اكتمال القراءة
 */
export async function trackReadingComplete(contentId: string) {
  return trackBehavior({
    eventType: 'read_complete',
    contentId,
    metadata: {
      totalReadingTime: getReadingTime(contentId),
      completionRate: 1.0
    }
  });
}

/**
 * تتبع التمرير
 */
let scrollTimeout: NodeJS.Timeout;
let lastScrollPosition = 0;
let scrollStartTime = Date.now();

export function trackScroll(contentId?: string) {
  clearTimeout(scrollTimeout);
  
  const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = (currentPosition / maxScroll) * 100;
  const scrollDirection = currentPosition > lastScrollPosition ? 'down' : 'up';
  const scrollSpeed = Math.abs(currentPosition - lastScrollPosition) / ((Date.now() - scrollStartTime) / 1000);
  
  scrollTimeout = setTimeout(() => {
    trackBehavior({
      eventType: 'scroll',
      contentId,
      metadata: {
        scrollPosition: scrollPercentage,
        scrollDirection,
        scrollSpeed,
        scrollDepth: Math.max(scrollPercentage, getMaxScrollDepth())
      }
    });
  }, 500); // تأخير نصف ثانية لتجنب الإفراط في التتبع
  
  lastScrollPosition = currentPosition;
  scrollStartTime = Date.now();
}

/**
 * تتبع النقرات
 */
export async function trackClick(element: HTMLElement, contentId?: string) {
  const elementInfo = {
    tagName: element.tagName,
    className: element.className,
    id: element.id,
    text: element.textContent?.substring(0, 100),
    href: (element as HTMLAnchorElement).href
  };

  return trackBehavior({
    eventType: 'click',
    contentId,
    action: 'click',
    metadata: {
      element: elementInfo,
      position: {
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY
      }
    }
  });
}

/**
 * تتبع التفاعلات الاجتماعية
 */
export async function trackSocialInteraction(
  action: 'like' | 'share' | 'comment' | 'bookmark',
  contentId: string,
  metadata?: Record<string, any>
) {
  return trackBehavior({
    eventType: action,
    contentId,
    action,
    metadata: {
      ...metadata,
      timestamp: Date.now()
    }
  });
}

/**
 * تتبع البحث
 */
export async function trackSearch(query: string, resultsCount?: number) {
  return trackBehavior({
    eventType: 'search',
    action: 'search',
    metadata: {
      searchQuery: query,
      resultsCount,
      searchTimestamp: Date.now()
    }
  });
}

/**
 * تتبع بداية الجلسة
 */
export async function trackSessionStart() {
  return trackBehavior({
    eventType: 'session_start',
    metadata: {
      sessionStartTime: Date.now(),
      landingPage: window.location.href,
      referrer: document.referrer
    }
  });
}

/**
 * تتبع نهاية الجلسة
 */
export async function trackSessionEnd() {
  return trackBehavior({
    eventType: 'session_end',
    metadata: {
      sessionEndTime: Date.now(),
      sessionDuration: getSessionDuration(),
      totalPageViews: getPageViewCount()
    }
  });
}

/**
 * مساعدات
 */
function getUserId(): string | null {
  // الحصول على معرف المستخدم من localStorage أو cookie
  return localStorage.getItem('userId') || getCookie('userId');
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceInfo() {
  return {
    type: getDeviceType(),
    os: getOS(),
    browser: getBrowser(),
    screenSize: `${window.screen.width}x${window.screen.height}`
  };
}

function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function getOS(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Win') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1) return 'macOS';
  if (userAgent.indexOf('Linux') !== -1) return 'Linux';
  if (userAgent.indexOf('Android') !== -1) return 'Android';
  if (userAgent.indexOf('iOS') !== -1) return 'iOS';
  return 'Unknown';
}

function getBrowser(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
  if (userAgent.indexOf('Safari') !== -1) return 'Safari';
  if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
  if (userAgent.indexOf('Edge') !== -1) return 'Edge';
  return 'Unknown';
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// تخزين معلومات القراءة
const readingTimes: Record<string, number> = {};
const scrollDepths: Record<string, number> = {};

function getReadingTime(contentId: string): number {
  return readingTimes[contentId] || 0;
}

function getMaxScrollDepth(): number {
  const pageId = window.location.pathname;
  return scrollDepths[pageId] || 0;
}

function getSessionDuration(): number {
  const startTime = sessionStorage.getItem('sessionStartTime');
  if (startTime) {
    return Date.now() - parseInt(startTime);
  }
  return 0;
}

function getPageViewCount(): number {
  const count = sessionStorage.getItem('pageViewCount');
  return count ? parseInt(count) : 1;
}

// تتبع وقت القراءة
setInterval(() => {
  const contentId = getCurrentContentId();
  if (contentId) {
    readingTimes[contentId] = (readingTimes[contentId] || 0) + 1;
  }
}, 1000);

// تتبع عمق التمرير
window.addEventListener('scroll', () => {
  const pageId = window.location.pathname;
  const currentDepth = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  scrollDepths[pageId] = Math.max(scrollDepths[pageId] || 0, currentDepth);
});

// تتبع بداية الجلسة عند التحميل
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!sessionStorage.getItem('sessionStartTime')) {
      sessionStorage.setItem('sessionStartTime', Date.now().toString());
      trackSessionStart();
    }
    
    // زيادة عداد مشاهدات الصفحة
    const currentCount = parseInt(sessionStorage.getItem('pageViewCount') || '0');
    sessionStorage.setItem('pageViewCount', (currentCount + 1).toString());
  });

  // تتبع نهاية الجلسة عند الخروج
  window.addEventListener('beforeunload', () => {
    trackSessionEnd();
  });
}

function getCurrentContentId(): string | null {
  // استخراج معرف المحتوى من URL أو DOM
  const match = window.location.pathname.match(/\/article\/(\d+)/);
  if (match) return match[1];
  
  const articleElement = document.querySelector('[data-article-id]');
  if (articleElement) return articleElement.getAttribute('data-article-id');
  
  return null;
}

// تصدير خدمة تتبع السلوك للاستخدام المباشر
export { behaviorService };
