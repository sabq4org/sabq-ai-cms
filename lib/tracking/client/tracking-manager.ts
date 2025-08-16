// مدير التتبع في العميل - سبق الذكية
'use client';

import { v4 as uuidv4 } from 'uuid';

// أنواع الأحداث المدعومة
export type TrackingEventType = 'interaction' | 'reading_session' | 'page_view' | 'scroll' | 'click';

// واجهة حدث التتبع
export interface TrackingEvent {
  id: string;
  type: TrackingEventType;
  timestamp: number;
  data: any;
  session_id: string;
  user_id?: string;
}

// إعدادات التتبع
export interface TrackingConfig {
  enabledEvents: TrackingEventType[];
  batchSize: number;
  flushInterval: number; // ميلي ثانية
  enableOfflineQueue: boolean;
  privacyMode: boolean;
  debug: boolean;
  apiEndpoint: string;
}

// الإعدادات الافتراضية
const DEFAULT_CONFIG: TrackingConfig = {
  enabledEvents: ['interaction', 'reading_session', 'page_view'],
  batchSize: 10,
  flushInterval: 30000, // 30 ثانية
  enableOfflineQueue: true,
  privacyMode: false,
  debug: false,
  apiEndpoint: '/api/tracking'
};

// مدير التتبع الأساسي
export class TrackingManager {
  private config: TrackingConfig;
  private sessionId: string;
  private userId?: string;
  private eventQueue: TrackingEvent[] = [];
  private isOnline: boolean = true;
  private flushTimer?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
  }

  /**
   * تهيئة المدير
   */
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) {
      console.warn('🔄 مدير التتبع مهيأ بالفعل');
      return;
    }

    this.userId = userId;
    this.isInitialized = true;

    // تحديد حالة الاتصال
    this.isOnline = navigator.onLine;

    // بدء دورة التفريغ
    this.startFlushCycle();

    // استعادة الأحداث المحفوظة محلياً
    if (this.config.enableOfflineQueue) {
      await this.restoreOfflineEvents();
    }

    // تتبع زيارة الصفحة
    this.trackPageView();

    this.log('✅ تم تهيئة مدير التتبع', { sessionId: this.sessionId, userId });
  }

  /**
   * تتبع حدث
   */
  track(type: TrackingEventType, data: any): void {
    if (!this.isInitialized) {
      console.warn('⚠️ مدير التتبع غير مهيأ. قم بتشغيل initialize() أولاً');
      return;
    }

    if (!this.config.enabledEvents.includes(type)) {
      this.log(`⏭️ تجاهل حدث ${type} - غير مفعل في الإعدادات`);
      return;
    }

    const event: TrackingEvent = {
      id: uuidv4(),
      type,
      timestamp: Date.now(),
      data: this.sanitizeData(data),
      session_id: this.sessionId,
      user_id: this.userId
    };

    this.eventQueue.push(event);
    this.log(`📝 تم إضافة حدث ${type}`, event);

    // تفريغ فوري للأحداث المهمة
    if (this.shouldFlushImmediately(type)) {
      this.flush();
    }

    // تفريغ عند امتلاء القائمة
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * تتبع تفاعل المستخدم
   */
  trackInteraction(interactionType: string, articleId: string, additionalData: any = {}): void {
    this.track('interaction', {
      interaction_type: interactionType,
      article_id: articleId,
      context: {
        page_url: window.location.href,
        referrer: document.referrer,
        device_type: this.getDeviceType(),
        viewport: this.getViewportInfo(),
        user_agent: navigator.userAgent
      },
      ...additionalData
    });
  }

  /**
   * تتبع جلسة القراءة
   */
  trackReadingSession(sessionData: any): void {
    this.track('reading_session', {
      ...sessionData,
      device: this.getDeviceInfo(),
      environment: this.getReadingEnvironment(),
      performance: this.getPerformanceMetrics()
    });
  }

  /**
   * تتبع زيارة الصفحة
   */
  trackPageView(): void {
    this.track('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      viewport: this.getViewportInfo(),
      device: this.getDeviceInfo(),
      performance: this.getPerformanceMetrics()
    });
  }

  /**
   * تفريغ الأحداث المعلقة
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    this.log(`📤 تفريغ ${events.length} حدث`);

    try {
      await this.sendEvents(events);
      this.log(`✅ تم إرسال ${events.length} حدث بنجاح`);
    } catch (error) {
      this.log(`❌ فشل في إرسال الأحداث:`, error);
      
      // إعادة الأحداث للقائمة في حالة الفشل
      if (this.config.enableOfflineQueue) {
        this.saveOfflineEvents(events);
      }
    }
  }

  /**
   * تحديث معرف المستخدم
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.log(`👤 تم تحديث معرف المستخدم: ${userId}`);
  }

  /**
   * تنظيف الموارد
   */
  destroy(): void {
    this.flush(); // تفريغ أخير
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.removeEventListeners();
    this.isInitialized = false;
    
    this.log('🔴 تم إيقاف مدير التتبع');
  }

  // الطرق الخاصة

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.log('🌐 تم الاتصال بالإنترنت');
      this.restoreOfflineEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.log('📴 تم قطع الاتصال بالإنترنت');
    });

    // تفريغ عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // تفريغ عند إخفاء الصفحة
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }

  private removeEventListeners(): void {
    // إزالة المستمعات - يمكن تحسينها حسب الحاجة
  }

  private startFlushCycle(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private shouldFlushImmediately(type: TrackingEventType): boolean {
    // أحداث مهمة تحتاج إرسال فوري
    return ['interaction'].includes(type);
  }

  private async sendEvents(events: TrackingEvent[]): Promise<void> {
    if (!this.isOnline && !this.config.enableOfflineQueue) {
      throw new Error('غير متصل بالإنترنت');
    }

    // تجميع الأحداث حسب النوع لتحسين الإرسال
    const groupedEvents = this.groupEventsByType(events);

    for (const [type, typeEvents] of Object.entries(groupedEvents)) {
      await this.sendEventsByType(type as TrackingEventType, typeEvents);
    }
  }

  private async sendEventsByType(type: TrackingEventType, events: TrackingEvent[]): Promise<void> {
    const endpoint = this.getEndpointForType(type);
    
    const payload = {
      events: events.map(e => e.data),
      session_id: this.sessionId,
      context: this.getContextData(),
      batch_id: uuidv4()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.userId && { 'Authorization': `Bearer ${this.getAuthToken()}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    this.log(`📊 استجابة الخادم لـ ${type}:`, result);
  }

  private getEndpointForType(type: TrackingEventType): string {
    const endpoints = {
      interaction: `${this.config.apiEndpoint}/interactions`,
      reading_session: `${this.config.apiEndpoint}/reading-session`,
      page_view: `${this.config.apiEndpoint}/page-views`,
      scroll: `${this.config.apiEndpoint}/interactions`,
      click: `${this.config.apiEndpoint}/interactions`
    };

    return endpoints[type] || `${this.config.apiEndpoint}/events`;
  }

  private groupEventsByType(events: TrackingEvent[]): Record<string, TrackingEvent[]> {
    return events.reduce((groups, event) => {
      const type = event.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(event);
      return groups;
    }, {} as Record<string, TrackingEvent[]>);
  }

  private sanitizeData(data: any): any {
    if (this.config.privacyMode) {
      // إزالة البيانات الحساسة في وضع الخصوصية
      return this.removeSensitiveData(data);
    }
    return data;
  }

  private removeSensitiveData(data: any): any {
    const sanitized = { ...data };
    
    // قائمة الحقول الحساسة
    const sensitiveFields = ['email', 'phone', 'password', 'token', 'ip'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    }

    return sanitized;
  }

  private getDeviceType(): string {
    if (/mobile/i.test(navigator.userAgent)) return 'mobile';
    if (/tablet/i.test(navigator.userAgent)) return 'tablet';
    return 'desktop';
  }

  private getDeviceInfo(): any {
    return {
      type: this.getDeviceType(),
      screen_resolution: {
        width: screen.width,
        height: screen.height,
        pixel_ratio: window.devicePixelRatio || 1
      },
      viewport: this.getViewportInfo(),
      orientation: screen.orientation?.type || 'unknown',
      touch_support: 'ontouchstart' in window,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (navigator as any).deviceMemory || null,
      cpu_cores: navigator.hardwareConcurrency || null
    };
  }

  private getViewportInfo(): any {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  private getReadingEnvironment(): any {
    return {
      theme: this.detectTheme(),
      font_size: this.detectFontSize(),
      zoom_level: Math.round((window.outerWidth / window.innerWidth) * 100) / 100,
      cookies_enabled: navigator.cookieEnabled,
      local_storage_available: this.isLocalStorageAvailable(),
      online_status: navigator.onLine
    };
  }

  private getPerformanceMetrics(): any {
    if (!window.performance) return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      page_load_time: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      dom_ready_time: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
  }

  private getContextData(): any {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      referrer: document.referrer
    };
  }

  private detectTheme(): string {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private detectFontSize(): string {
    const fontSize = parseInt(getComputedStyle(document.body).fontSize);
    if (fontSize >= 18) return 'large';
    if (fontSize >= 16) return 'medium';
    return 'small';
  }

  private isLocalStorageAvailable(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  private getAuthToken(): string {
    // استخراج الرمز من localStorage أو cookies
    return localStorage.getItem('access_token') || '';
  }

  // إدارة الأحداث المحفوظة محلياً
  private async saveOfflineEvents(events: TrackingEvent[]): Promise<void> {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const existingEvents = JSON.parse(localStorage.getItem('tracking_offline_events') || '[]');
      const allEvents = [...existingEvents, ...events];
      
      // الاحتفاظ بأحدث 1000 حدث فقط
      const limitedEvents = allEvents.slice(-1000);
      
      localStorage.setItem('tracking_offline_events', JSON.stringify(limitedEvents));
      this.log(`💾 تم حفظ ${events.length} حدث محلياً`);
    } catch (error) {
      this.log('❌ فشل في حفظ الأحداث محلياً:', error);
    }
  }

  private async restoreOfflineEvents(): Promise<void> {
    if (!this.isLocalStorageAvailable() || !this.isOnline) return;

    try {
      const offlineEvents = JSON.parse(localStorage.getItem('tracking_offline_events') || '[]');
      
      if (offlineEvents.length > 0) {
        this.log(`📂 استعادة ${offlineEvents.length} حدث محفوظ محلياً`);
        
        await this.sendEvents(offlineEvents);
        localStorage.removeItem('tracking_offline_events');
        
        this.log(`✅ تم إرسال الأحداث المحفوظة محلياً`);
      }
    } catch (error) {
      this.log('❌ فشل في استعادة الأحداث المحفوظة:', error);
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[TrackingManager] ${message}`, data || '');
    }
  }
}

// إنشاء مثيل عام
let globalTrackingManager: TrackingManager | null = null;

/**
 * الحصول على مدير التتبع العام
 */
export function getTrackingManager(config?: Partial<TrackingConfig>): TrackingManager {
  if (!globalTrackingManager) {
    globalTrackingManager = new TrackingManager(config);
  }
  return globalTrackingManager;
}

/**
 * تهيئة التتبع العام
 */
export async function initializeTracking(userId?: string, config?: Partial<TrackingConfig>): Promise<TrackingManager> {
  const manager = getTrackingManager(config);
  await manager.initialize(userId);
  return manager;
}

export default TrackingManager;
