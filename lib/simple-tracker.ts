/**
 * نظام تتبع مبسط يركز على الأحداث المهمة فقط
 * Simple tracking system focused on important events only
 */

import apiClient from './api-client';

// الأحداث الأساسية فقط
export type TrackingEvent = 
  | 'page_view'
  | 'article_read'
  | 'interaction'
  | 'session_end';

export interface TrackingData {
  event: TrackingEvent;
  userId?: string;
  sessionId: string;
  articleId?: string;
  interactionType?: 'like' | 'save' | 'share' | 'comment';
  metadata?: {
    scrollDepth?: number;
    timeSpent?: number;
    [key: string]: any;
  };
}

class SimpleTracker {
  private sessionId: string;
  private pageStartTime: number;
  private lastActivityTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.lastActivityTime = Date.now();
    
    // تنظيف عند مغادرة الصفحة
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.handlePageExit());
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تتبع عرض الصفحة
   */
  trackPageView(pageUrl?: string) {
    this.send({
      event: 'page_view',
      sessionId: this.sessionId,
      metadata: {
        url: pageUrl || window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * تتبع التفاعل (like, save, share, comment)
   */
  trackInteraction(
    articleId: string, 
    interactionType: 'like' | 'save' | 'share' | 'comment',
    value?: any
  ) {
    this.send({
      event: 'interaction',
      sessionId: this.sessionId,
      articleId,
      interactionType,
      metadata: {
        value,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * تتبع إتمام قراءة المقال
   */
  trackArticleRead(articleId: string, scrollDepth: number) {
    const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
    
    // اعتبر المقال مقروءاً إذا:
    // 1. وصل التمرير إلى 85% أو أكثر
    // 2. قضى المستخدم 30 ثانية على الأقل
    if (scrollDepth >= 85 && timeSpent >= 30) {
      this.send({
        event: 'article_read',
        sessionId: this.sessionId,
        articleId,
        metadata: {
          scrollDepth,
          timeSpent,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * معالجة مغادرة الصفحة
   */
  private handlePageExit() {
    const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
    
    // استخدم sendBeacon لضمان إرسال البيانات
    const data = {
      event: 'session_end' as const,
      sessionId: this.sessionId,
      metadata: {
        timeSpent,
        timestamp: new Date().toISOString()
      }
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/tracking', JSON.stringify(data));
    } else {
      // fallback للمتصفحات القديمة
      this.send(data);
    }
  }

  /**
   * إرسال البيانات إلى الخادم
   */
  private async send(data: TrackingData) {
    try {
      // إضافة معلومات المستخدم من السياق
      const enrichedData = {
        ...data,
        userId: this.getUserId(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };

      // إرسال البيانات باستخدام apiClient
      await apiClient.post('/tracking', enrichedData);
    } catch (error) {
      // فشل التتبع لا يجب أن يؤثر على تجربة المستخدم
      console.debug('Tracking error (non-critical):', error);
    }
  }

  /**
   * الحصول على معرف المستخدم من السياق
   */
  private getUserId(): string | undefined {
    // يمكن الحصول عليه من useAuth hook أو من الكوكيز
    // هذا مجرد مثال، يجب تحديثه حسب التطبيق
    return undefined;
  }

  /**
   * تتبع بسيط لعمق التمرير (بدون throttling مفرط)
   */
  setupScrollTracking(articleId: string) {
    let maxScrollDepth = 0;
    let scrollTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollDepth = Math.round((scrolled / scrollHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        // تأجيل الإرسال لتجنب الإرسال المتكرر
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          if (maxScrollDepth >= 85) {
            this.trackArticleRead(articleId, maxScrollDepth);
          }
        }, 2000); // انتظر ثانيتين بعد توقف التمرير
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // تنظيف عند مغادرة الصفحة
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }
}

// Export singleton instance
const tracker = new SimpleTracker();
export default tracker;
