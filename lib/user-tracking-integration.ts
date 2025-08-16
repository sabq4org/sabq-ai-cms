/**
 * تكامل نظام تتبع سلوك المستخدم مع Next.js
 * User Behavior Tracking Integration for Next.js
 */

import { toast } from 'sonner';

// ===== Types =====

export interface UserInteraction {
  user_id: string;
  session_id: string;
  content_id: string;
  content_type: 'article' | 'video' | 'podcast' | 'image' | 'infographic' | 'poll';
  interaction_type: 'like' | 'save' | 'share' | 'comment' | 'view' | 'click';
  interaction_value?: number;
  page_url?: string;
  element_id?: string;
  element_type?: string;
  scroll_position?: number;
  viewport_position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  time_on_page?: number;
  metadata?: Record<string, any>;
}

export interface ReadingSession {
  user_id: string;
  session_id: string;
  content_id: string;
  reading_session_id: string;
  start_time?: string;
  end_time?: string;
  total_reading_time?: number;
  active_reading_time?: number;
  scroll_depth_max?: number;
  scroll_events_count?: number;
  content_length?: number;
  reading_speed?: number;
  pause_count?: number;
  pause_duration_total?: number;
  is_completed?: boolean;
  completion_percentage?: number;
  exit_point?: number;
  device_orientation?: string;
  page_visibility_changes?: number;
  metadata?: Record<string, any>;
}

export interface ScrollEvent {
  reading_session_id: string;
  user_id: string;
  content_id: string;
  scroll_position: number;
  scroll_direction: 'up' | 'down' | 'none';
  scroll_speed?: number;
  timestamp?: string;
  time_since_start: number;
  viewport_height?: number;
  content_height?: number;
  is_pause_point?: boolean;
  pause_duration?: number;
  content_section?: string;
  visible_text_length?: number;
  metadata?: Record<string, any>;
}

export interface ContextData {
  user_id: string;
  session_id: string;
  timestamp?: string;
  local_time?: string;
  day_of_week?: number;
  hour_of_day?: number;
  weather_condition?: string;
  temperature?: number;
  is_weekend?: boolean;
  is_holiday?: boolean;
  activity_type: 'reading' | 'browsing' | 'searching' | 'commenting' | 'sharing';
  content_category?: string;
  current_mood?: string;
  connection_type?: string;
  connection_speed?: string;
  page_load_time?: number;
  social_context?: string;
  notification_source?: string;
  metadata?: Record<string, any>;
  environmental_data?: Record<string, any>;
}

export interface UserSession {
  user_id: string;
  session_id: string;
  user_agent?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'unknown';
  browser?: string;
  os?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  ip_address?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  metadata?: Record<string, any>;
}

// ===== Configuration =====

const CONFIG = {
  // في التطوير، استخدم localhost، في الإنتاج استخدم URL الحقيقي
  TRACKING_API_BASE: process.env.NODE_ENV === 'production' 
    ? 'https://tracking-api.sabq.ai' 
    : 'http://localhost:8000',
  
  // إعدادات التخزين المؤقت
  CACHE_DURATION: 5 * 60 * 1000, // 5 دقائق
  
  // إعدادات الإرسال
  BATCH_SIZE: 10,
  BATCH_TIMEOUT: 30 * 1000, // 30 ثانية
  
  // إعدادات إعادة المحاولة
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 ثانية
  
  // إعدادات التتبع
  SCROLL_THROTTLE: 100, // ms
  READING_UPDATE_INTERVAL: 10 * 1000, // 10 ثواني
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
};

// ===== User Behavior Tracking Service =====

class UserBehaviorTracker {
  private userId: string | null = null;
  private sessionId: string;
  private readingSessionId: string | null = null;
  private startTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private isTracking: boolean = false;
  
  // إعدادات المعايرة
  private scrollPosition: number = 0;
  private maxScrollDepth: number = 0;
  private readingTime: number = 0;
  private scrollEvents: number = 0;
  private pauseCount: number = 0;
  private pauseStartTime: number | null = null;
  private totalPauseTime: number = 0;
  private pageVisibilityChanges: number = 0;
  
  // queue لتجميع الأحداث
  private eventQueue: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    if (userId) {
      this.setUserId(userId);
    }
    
    this.initializeTracking();
  }
  
  // ===== إعداد المستخدم والجلسة =====
  
  setUserId(userId: string) {
    this.userId = userId;
    this.createUserSession();
  }
  
  setReadingSession(contentId: string, contentType: string = 'article') {
    this.readingSessionId = this.generateReadingSessionId();
    this.startTime = Date.now();
    this.resetReadingMetrics();
    
    const readingSession: ReadingSession = {
      user_id: this.userId!,
      session_id: this.sessionId,
      content_id: contentId,
      reading_session_id: this.readingSessionId,
      start_time: new Date().toISOString(),
      content_length: this.getContentLength(),
      device_orientation: this.getDeviceOrientation(),
      metadata: {
        content_type: contentType,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      }
    };
    
    this.sendEvent('reading-sessions', readingSession);
  }
  
  // ===== تتبع التفاعلات =====
  
  async trackInteraction(
    contentId: string,
    interactionType: UserInteraction['interaction_type'],
    options: Partial<UserInteraction> = {}
  ): Promise<boolean> {
    if (!this.userId) {
      console.warn('User tracking: No user ID set');
      return false;
    }
    
    try {
      const interaction: UserInteraction = {
        user_id: this.userId,
        session_id: this.sessionId,
        content_id: contentId,
        content_type: options.content_type || 'article',
        interaction_type: interactionType,
        interaction_value: options.interaction_value,
        page_url: window.location.href,
        element_id: options.element_id,
        element_type: options.element_type,
        scroll_position: this.getScrollPercentage(),
        viewport_position: options.viewport_position,
        time_on_page: Math.floor((Date.now() - this.startTime) / 1000),
        metadata: {
          ...options.metadata,
          timestamp: new Date().toISOString(),
          session_duration: this.getSessionDuration(),
          reading_time: this.readingTime
        }
      };
      
      // إرسال فوري للتفاعلات المهمة
      if (['like', 'save', 'share'].includes(interactionType)) {
        const response = await this.sendEventImmediate('interactions', interaction);
        
        if (response.success) {
          // تحديث أيضاً الـ API الحالي للتوافق مع النظام الموجود
          await this.updateCurrentSystemInteraction(contentId, interactionType);
          return true;
        }
      } else {
        // إضافة للـ queue للتفاعلات الأخرى
        this.addToQueue('interactions', interaction);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return false;
    }
  }
  
  // ===== تتبع القراءة =====
  
  startReadingTracking(contentId: string) {
    if (!this.userId) return;
    
    this.setReadingSession(contentId);
    this.isTracking = true;
    
    // بدء تتبع الأحداث
    this.setupScrollTracking();
    this.setupVisibilityTracking();
    this.setupReadingProgressTracking();
    
    // تسجيل بداية القراءة
    this.trackInteraction(contentId, 'view', {
      element_type: 'article_start'
    });
  }
  
  stopReadingTracking() {
    if (!this.isTracking || !this.readingSessionId || !this.userId) return;
    
    this.isTracking = false;
    
    // حساب الإحصائيات النهائية
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - this.startTime) / 1000);
    const completionPercentage = this.maxScrollDepth;
    const isCompleted = completionPercentage > 80;
    
    const finalSession: Partial<ReadingSession> = {
      end_time: new Date().toISOString(),
      total_reading_time: totalTime,
      active_reading_time: this.readingTime,
      scroll_depth_max: this.maxScrollDepth,
      scroll_events_count: this.scrollEvents,
      pause_count: this.pauseCount,
      pause_duration_total: this.totalPauseTime,
      is_completed: isCompleted,
      completion_percentage: completionPercentage,
      exit_point: this.getScrollPercentage(),
      page_visibility_changes: this.pageVisibilityChanges,
      reading_speed: this.calculateReadingSpeed()
    };
    
    this.sendEvent('reading-sessions', finalSession);
    
    // إرسال جميع الأحداث المتبقية
    this.flushQueue();
  }
  
  // ===== تتبع التمرير =====
  
  private setupScrollTracking() {
    let lastScrollTime = Date.now();
    let lastScrollPosition = window.scrollY;
    
    const scrollHandler = this.throttle(() => {
      if (!this.isTracking || !this.readingSessionId) return;
      
      const currentScroll = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime;
      const scrollDiff = Math.abs(currentScroll - lastScrollPosition);
      const scrollSpeed = timeDiff > 0 ? scrollDiff / timeDiff * 1000 : 0; // pixels/second
      
      const scrollPercentage = this.getScrollPercentage();
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercentage);
      this.scrollEvents++;
      
      // تحديد اتجاه التمرير
      const direction = currentScroll > lastScrollPosition ? 'down' : 
                       currentScroll < lastScrollPosition ? 'up' : 'none';
      
      // تحديد نقاط التوقف
      const isPausePoint = timeDiff > 2000 && scrollDiff < 10; // توقف لأكثر من ثانيتين
      
      if (isPausePoint) {
        this.pauseCount++;
        if (this.pauseStartTime) {
          this.totalPauseTime += currentTime - this.pauseStartTime;
        }
        this.pauseStartTime = currentTime;
      } else {
        this.pauseStartTime = null;
      }
      
      const scrollEvent: ScrollEvent = {
        reading_session_id: this.readingSessionId!,
        user_id: this.userId!,
        content_id: this.getCurrentContentId(),
        scroll_position: scrollPercentage,
        scroll_direction: direction,
        scroll_speed: scrollSpeed,
        time_since_start: Math.floor((currentTime - this.startTime) / 1000),
        viewport_height: window.innerHeight,
        content_height: document.documentElement.scrollHeight,
        is_pause_point: isPausePoint,
        pause_duration: isPausePoint && this.pauseStartTime ? timeDiff : undefined,
        content_section: this.getCurrentSection(),
        visible_text_length: this.getVisibleTextLength()
      };
      
      this.addToQueue('scroll-events', scrollEvent);
      
      lastScrollTime = currentTime;
      lastScrollPosition = currentScroll;
    }, CONFIG.SCROLL_THROTTLE);
    
    window.addEventListener('scroll', scrollHandler);
    
    // تنظيف عند إيقاف التتبع
    const cleanup = () => window.removeEventListener('scroll', scrollHandler);
    this.addCleanupTask(cleanup);
  }
  
  // ===== تتبع الرؤية =====
  
  private setupVisibilityTracking() {
    const visibilityHandler = () => {
      this.pageVisibilityChanges++;
      
      if (document.hidden) {
        this.pauseStartTime = Date.now();
      } else {
        if (this.pauseStartTime) {
          this.totalPauseTime += Date.now() - this.pauseStartTime;
          this.pauseStartTime = null;
        }
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    
    const cleanup = () => document.removeEventListener('visibilitychange', visibilityHandler);
    this.addCleanupTask(cleanup);
  }
  
  // ===== تتبع تقدم القراءة =====
  
  private setupReadingProgressTracking() {
    const progressTimer = setInterval(() => {
      if (!this.isTracking || document.hidden) return;
      
      this.readingTime += CONFIG.READING_UPDATE_INTERVAL / 1000;
      this.lastActivityTime = Date.now();
      
      // إرسال تحديث دوري
      const contextData: ContextData = {
        user_id: this.userId!,
        session_id: this.sessionId,
        activity_type: 'reading',
        content_category: this.getContentCategory(),
        current_mood: this.inferMood(),
        connection_type: this.getConnectionType(),
        page_load_time: this.getPageLoadTime(),
        metadata: {
          reading_time: this.readingTime,
          scroll_depth: this.maxScrollDepth,
          engagement_score: this.calculateEngagementScore()
        }
      };
      
      this.addToQueue('context-data', contextData);
      
    }, CONFIG.READING_UPDATE_INTERVAL);
    
    const cleanup = () => clearInterval(progressTimer);
    this.addCleanupTask(cleanup);
  }
  
  // ===== إرسال البيانات =====
  
  private async sendEventImmediate(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${CONFIG.TRACKING_API_BASE}/api/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error sending ${endpoint}:`, error);
      
      // في حالة فشل API الجديد، تراجع للنظام القديم
      if (endpoint === 'interactions') {
        return await this.sendToLegacyAPI(data);
      }
      
      throw error;
    }
  }
  
  private addToQueue(endpoint: string, data: any) {
    this.eventQueue.push({ endpoint, data, timestamp: Date.now() });
    
    if (this.eventQueue.length >= CONFIG.BATCH_SIZE) {
      this.flushQueue();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushQueue(), CONFIG.BATCH_TIMEOUT);
    }
  }
  
  private async flushQueue() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // تجميع الأحداث حسب النوع
    const groupedEvents: Record<string, any[]> = {};
    events.forEach(event => {
      if (!groupedEvents[event.endpoint]) {
        groupedEvents[event.endpoint] = [];
      }
      groupedEvents[event.endpoint].push(event.data);
    });
    
    // إرسال كل مجموعة
    for (const [endpoint, eventList] of Object.entries(groupedEvents)) {
      try {
        if (eventList.length === 1) {
          await this.sendEventImmediate(endpoint, eventList[0]);
        } else {
          await this.sendEventImmediate(`${endpoint}/batch`, {
            batch_id: this.generateBatchId(),
            [endpoint.replace('-', '_')]: eventList
          });
        }
      } catch (error) {
        console.error(`Failed to send batch ${endpoint}:`, error);
      }
    }
  }
  
  // ===== التوافق مع النظام الحالي =====
  
  private async updateCurrentSystemInteraction(contentId: string, interactionType: string): Promise<void> {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.userId,
          article_id: contentId,
          type: interactionType === 'bookmark' ? 'save' : interactionType,
          metadata: {
            tracking_system: 'enhanced',
            session_id: this.sessionId
          }
        })
      });
    } catch (error) {
      console.error('Error updating current system:', error);
    }
  }
  
  private async sendToLegacyAPI(data: UserInteraction): Promise<any> {
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user_id,
          article_id: data.content_id,
          type: data.interaction_type === 'bookmark' ? 'save' : data.interaction_type,
          metadata: data.metadata
        })
      });
      
      if (response.ok) {
        return { success: true };
      }
      
      throw new Error('Legacy API failed');
    } catch (error) {
      console.error('Legacy API error:', error);
      throw error;
    }
  }
  
  // ===== Helper Methods =====
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateReadingSessionId(): string {
    return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getScrollPercentage(): number {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }
  
  private getContentLength(): number {
    const content = document.querySelector('article, .article-content, .content');
    return content ? content.textContent?.length || 0 : 0;
  }
  
  private getDeviceOrientation(): string {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  
  private getSessionDuration(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  private getCurrentContentId(): string {
    // استخراج معرف المحتوى من URL أو DOM
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'unknown';
  }
  
  private getCurrentSection(): string {
    // تحديد القسم الحالي من المحتوى بناءً على الموقع
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const scrollTop = window.scrollY + window.innerHeight / 2;
    
    for (let i = headers.length - 1; i >= 0; i--) {
      const header = headers[i] as HTMLElement;
      if (header.offsetTop <= scrollTop) {
        return header.textContent?.slice(0, 50) || `section_${i}`;
      }
    }
    
    return 'intro';
  }
  
  private getVisibleTextLength(): number {
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    
    let visibleLength = 0;
    const textNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = textNodes.nextNode()) {
      const element = node.parentElement;
      if (element && this.isElementInViewport(element, viewportTop, viewportBottom)) {
        visibleLength += node.textContent?.length || 0;
      }
    }
    
    return visibleLength;
  }
  
  private isElementInViewport(element: Element, viewportTop: number, viewportBottom: number): boolean {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementBottom = elementTop + rect.height;
    
    return elementBottom > viewportTop && elementTop < viewportBottom;
  }
  
  private calculateReadingSpeed(): number {
    const contentLength = this.getContentLength();
    const wordsCount = contentLength / 5; // متوسط 5 أحرف لكل كلمة
    const readingTimeMinutes = this.readingTime / 60;
    
    return readingTimeMinutes > 0 ? Math.round(wordsCount / readingTimeMinutes) : 0;
  }
  
  private calculateEngagementScore(): number {
    const timeScore = Math.min(this.readingTime / 300, 1); // مقياس من 0 إلى 1 لـ 5 دقائق
    const scrollScore = this.maxScrollDepth / 100;
    const interactionScore = Math.min(this.scrollEvents / 100, 1);
    
    return (timeScore * 0.4 + scrollScore * 0.4 + interactionScore * 0.2);
  }
  
  private getContentCategory(): string {
    // استخراج تصنيف المحتوى من meta tags أو URL
    const metaCategory = document.querySelector('meta[name="category"]')?.getAttribute('content');
    if (metaCategory) return metaCategory;
    
    const pathParts = window.location.pathname.split('/');
    return pathParts[1] || 'general';
  }
  
  private inferMood(): string {
    // استنتاج بسيط للمزاج بناءً على سلوك القراءة
    const engagementScore = this.calculateEngagementScore();
    
    if (engagementScore > 0.7) return 'engaged';
    if (engagementScore > 0.4) return 'interested';
    if (engagementScore > 0.2) return 'browsing';
    return 'distracted';
  }
  
  private getConnectionType(): string {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  }
  
  private getPageLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0;
  }
  
  private createUserSession() {
    if (!this.userId) return;
    
    const userSession: UserSession = {
      user_id: this.userId,
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      device_type: this.detectDeviceType(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer_url: document.referrer,
      ...this.parseUTMParameters(),
      metadata: {
        session_start: new Date().toISOString(),
        page_load_time: this.getPageLoadTime()
      }
    };
    
    this.sendEvent('user-sessions', userSession);
  }
  
  private detectDeviceType(): UserSession['device_type'] {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|mini|windows\sce|palm/i.test(userAgent)) {
      return 'mobile';
    }
    if (/ipad|tablet|kindle|silk|gt-p|sgh-t|nexus|sch-i800|playbook|xoom|sm-t/i.test(userAgent)) {
      return 'tablet';
    }
    if (/tv|television|smart-tv|googletv|appletv|hbbtv|pov_tv|netcast/i.test(userAgent)) {
      return 'tv';
    }
    
    return 'desktop';
  }
  
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }
  
  private detectOS(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }
  
  private parseUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
    };
  }
  
  private initializeTracking() {
    // معالجة أحداث النافذة
    window.addEventListener('beforeunload', () => {
      this.stopReadingTracking();
    });
    
    // معالجة انتهاء الجلسة
    this.sessionTimeoutHandler();
  }
  
  private sessionTimeoutHandler() {
    const checkSessionTimeout = () => {
      if (Date.now() - this.lastActivityTime > CONFIG.SESSION_TIMEOUT) {
        this.stopReadingTracking();
      }
    };
    
    setInterval(checkSessionTimeout, 60000); // فحص كل دقيقة
  }
  
  private cleanupTasks: (() => void)[] = [];
  
  private addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }
  
  private cleanup() {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
  
  private sendEvent(endpoint: string, data: any) {
    this.addToQueue(endpoint, data);
  }
  
  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // ===== واجهة عامة =====
  
  public destroy() {
    this.stopReadingTracking();
    this.cleanup();
    this.flushQueue();
  }
}

// ===== Singleton Instance =====

let globalTracker: UserBehaviorTracker | null = null;

export function initializeUserTracking(userId?: string): UserBehaviorTracker {
  if (globalTracker) {
    globalTracker.destroy();
  }
  
  globalTracker = new UserBehaviorTracker(userId);
  return globalTracker;
}

export function getUserTracker(): UserBehaviorTracker | null {
  return globalTracker;
}

// ===== React Hook =====

import { useEffect, useRef } from 'react';

export function useUserTracking(userId?: string, contentId?: string) {
  const trackerRef = useRef<UserBehaviorTracker | null>(null);
  
  useEffect(() => {
    if (userId) {
      trackerRef.current = initializeUserTracking(userId);
      
      if (contentId) {
        trackerRef.current.startReadingTracking(contentId);
      }
    }
    
    return () => {
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
      }
    };
  }, [userId, contentId]);
  
  const trackInteraction = async (
    interactionType: UserInteraction['interaction_type'],
    options: Partial<UserInteraction> = {}
  ) => {
    if (trackerRef.current && contentId) {
      return await trackerRef.current.trackInteraction(contentId, interactionType, options);
    }
    return false;
  };
  
  return {
    tracker: trackerRef.current,
    trackInteraction
  };
}

// ===== مساعدات إضافية =====

export function trackPageView(userId: string, pageUrl?: string) {
  const tracker = getUserTracker();
  if (tracker && userId) {
    tracker.setUserId(userId);
    // يمكن إضافة تتبع مشاهدة الصفحة هنا
  }
}

export function trackSearchQuery(userId: string, query: string, results: number) {
  const tracker = getUserTracker();
  if (tracker) {
    tracker.trackInteraction('search', 'click', {
      metadata: {
        search_query: query,
        results_count: results,
        search_timestamp: new Date().toISOString()
      }
    });
  }
}

export function trackSocialShare(userId: string, contentId: string, platform: string) {
  const tracker = getUserTracker();
  if (tracker) {
    tracker.trackInteraction(contentId, 'share', {
      metadata: {
        platform,
        share_timestamp: new Date().toISOString()
      }
    });
  }
}
