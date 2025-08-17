// متتبع سلوك القراءة - سبق الذكية
'use client';

import { getTrackingManager } from './tracking-manager';

// واجهة بيانات جلسة القراءة
export interface ReadingSession {
  session_id: string;
  article_id: string;
  user_id?: string;
  started_at: Date;
  ended_at?: Date;
  duration_seconds: number;
  read_percentage: number;
  scroll_depth: number;
  reading_speed?: number;
  pause_points: PausePoint[];
  interactions: ReadingInteraction[];
  highlights: TextHighlight[];
  reading_pattern: ReadingPattern;
  device_orientation?: 'portrait' | 'landscape';
  reading_environment?: ReadingEnvironment;
}

export interface PausePoint {
  timestamp: number; // milliseconds from start
  scroll_position: number; // percentage
  duration_ms: number;
}

export interface ReadingInteraction {
  type: 'click' | 'hover' | 'select' | 'copy';
  element: string;
  timestamp: number;
  position?: { x: number; y: number };
}

export interface TextHighlight {
  text: string;
  position: { start: number; end: number };
  timestamp: number;
}

export interface ReadingPattern {
  is_sequential: boolean;
  back_tracking_count: number;
  jumping_sections: number;
  focus_areas: FocusArea[];
}

export interface FocusArea {
  section: string;
  time_spent: number;
  revisits: number;
}

export interface ReadingEnvironment {
  screen_brightness?: number;
  font_size?: string;
  zoom_level?: number;
  theme?: 'light' | 'dark' | 'auto';
}

// فئة متتبع القراءة
export class ReadingTracker {
  private articleId: string;
  private sessionId: string;
  private isTracking: boolean = false;
  private startTime: Date | null = null;
  private endTime: Date | null = null;
  private scrollEvents: Array<{ position: number; timestamp: number }> = [];
  private pausePoints: PausePoint[] = [];
  private interactions: ReadingInteraction[] = [];
  private highlights: TextHighlight[] = [];
  private focusAreas: Map<string, FocusArea> = new Map();
  private currentSection: string = 'start';
  private lastScrollTime: number = 0;
  private lastScrollPosition: number = 0;
  private isReading: boolean = true;
  private pauseStartTime: number | null = null;
  private visibilityChangeTime: number = 0;
  private backTrackingCount: number = 0;
  private jumpingCount: number = 0;
  private maxScrollDepth: number = 0;

  // مراقبة الأحداث
  private scrollHandler: () => void;
  private clickHandler: (e: MouseEvent) => void;
  private selectionHandler: () => void;
  private visibilityHandler: () => void;
  private beforeUnloadHandler: () => void;
  private orientationHandler: () => void;

  constructor(articleId: string) {
    this.articleId = articleId;
    this.sessionId = this.generateSessionId();

    // ربط معالجات الأحداث
    this.scrollHandler = this.handleScroll.bind(this);
    this.clickHandler = this.handleClick.bind(this);
    this.selectionHandler = this.handleSelection.bind(this);
    this.visibilityHandler = this.handleVisibilityChange.bind(this);
    this.beforeUnloadHandler = this.handleBeforeUnload.bind(this);
    this.orientationHandler = this.handleOrientationChange.bind(this);
  }

  /**
   * بدء تتبع جلسة القراءة
   */
  startTracking(): void {
    if (this.isTracking) {
      console.warn('⚠️ تتبع القراءة نشط بالفعل');
      return;
    }

    this.isTracking = true;
    this.startTime = new Date();
    this.setupEventListeners();
    this.initializeFocusAreas();

    console.log(`📖 بدء تتبع القراءة للمقال: ${this.articleId}`);
  }

  /**
   * إيقاف تتبع جلسة القراءة
   */
  async stopTracking(): Promise<ReadingSession | null> {
    if (!this.isTracking || !this.startTime) {
      console.warn('⚠️ تتبع القراءة غير نشط');
      return null;
    }

    this.isTracking = false;
    this.endTime = new Date();
    this.removeEventListeners();

    // إنهاء أي توقف حالي
    this.endCurrentPause();

    // بناء جلسة القراءة
    const session = this.buildReadingSession();

    // إرسال البيانات
    try {
      const trackingManager = getTrackingManager();
      trackingManager.trackReadingSession(session);
      
      console.log(`✅ تم إرسال بيانات جلسة القراءة: ${this.sessionId}`);
    } catch (error) {
      console.error('❌ فشل في إرسال بيانات جلسة القراءة:', error);
    }

    return session;
  }

  /**
   * تسجيل تمييز نص
   */
  highlightText(text: string, startPos: number, endPos: number): void {
    if (!this.isTracking) return;

    const highlight: TextHighlight = {
      text: text.substring(0, 100), // حد أقصى 100 حرف
      position: { start: startPos, end: endPos },
      timestamp: Date.now() - (this.startTime?.getTime() || 0)
    };

    this.highlights.push(highlight);
    console.log('✨ تم تسجيل تمييز نص:', highlight);
  }

  /**
   * تحديث القسم الحالي
   */
  updateCurrentSection(sectionName: string): void {
    if (!this.isTracking || this.currentSection === sectionName) return;

    // إنهاء القسم السابق
    this.endCurrentSection();

    // بدء القسم الجديد
    this.currentSection = sectionName;
    this.startCurrentSection();
  }

  // الطرق الخاصة

  private generateSessionId(): string {
    return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('selectionchange', this.selectionHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('orientationchange', this.orientationHandler);

    // مراقبة copy
    document.addEventListener('copy', (e) => {
      this.recordInteraction('copy', 'text', { x: 0, y: 0 });
    });
  }

  private removeEventListeners(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('click', this.clickHandler);
    document.removeEventListener('selectionchange', this.selectionHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('orientationchange', this.orientationHandler);
  }

  private handleScroll(): void {
    if (!this.isTracking) return;

    const now = Date.now();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight;
    const scrollPercentage = Math.min(100, (scrollTop / (documentHeight - windowHeight)) * 100);

    // تسجيل حدث التمرير
    this.scrollEvents.push({
      position: scrollPercentage,
      timestamp: now - (this.startTime?.getTime() || 0)
    });

    // تحديث أقصى عمق تمرير
    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercentage);

    // كشف الرجوع للخلف
    if (scrollPercentage < this.lastScrollPosition - 5) {
      this.backTrackingCount++;
    }

    // كشف القفز بين الأقسام
    if (Math.abs(scrollPercentage - this.lastScrollPosition) > 20) {
      this.jumpingCount++;
    }

    // كشف التوقف (إذا لم يحدث تمرير لأكثر من 3 ثوان)
    if (now - this.lastScrollTime > 3000 && this.isReading) {
      this.startPause(scrollPercentage);
    } else if (this.pauseStartTime && this.isReading) {
      this.endCurrentPause();
    }

    this.lastScrollTime = now;
    this.lastScrollPosition = scrollPercentage;

    // تحديث القسم الحالي بناءً على الموقع
    this.updateSectionByScroll(scrollPercentage);
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isTracking) return;

    const element = this.getElementSelector(event.target as Element);
    this.recordInteraction('click', element, { x: event.clientX, y: event.clientY });
  }

  private handleSelection(): void {
    if (!this.isTracking) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.recordInteraction('select', 'text');
    }
  }

  private handleVisibilityChange(): void {
    if (!this.isTracking) return;

    const now = Date.now();

    if (document.hidden) {
      // الصفحة مخفية - بدء توقف
      this.isReading = false;
      this.visibilityChangeTime = now;
      this.startPause(this.lastScrollPosition);
    } else {
      // الصفحة ظاهرة - إنهاء التوقف
      this.isReading = true;
      this.endCurrentPause();
    }
  }

  private handleBeforeUnload(): void {
    if (this.isTracking) {
      this.stopTracking();
    }
  }

  private handleOrientationChange(): void {
    if (!this.isTracking) return;

    setTimeout(() => {
      this.recordInteraction('hover', 'orientation_change');
    }, 100); // انتظار لاستقرار الشاشة
  }

  private recordInteraction(type: ReadingInteraction['type'], element: string, position?: { x: number; y: number }): void {
    const interaction: ReadingInteraction = {
      type,
      element,
      timestamp: Date.now() - (this.startTime?.getTime() || 0),
      position
    };

    this.interactions.push(interaction);
  }

  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';

    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private startPause(scrollPosition: number): void {
    if (this.pauseStartTime) return; // توقف نشط بالفعل

    this.pauseStartTime = Date.now();
  }

  private endCurrentPause(): void {
    if (!this.pauseStartTime) return;

    const pauseDuration = Date.now() - this.pauseStartTime;
    const pausePoint: PausePoint = {
      timestamp: this.pauseStartTime - (this.startTime?.getTime() || 0),
      scroll_position: this.lastScrollPosition,
      duration_ms: pauseDuration
    };

    this.pausePoints.push(pausePoint);
    this.pauseStartTime = null;
  }

  private initializeFocusAreas(): void {
    // تحديد المناطق الأساسية
    const sections = ['start', 'middle', 'end'];
    sections.forEach(section => {
      this.focusAreas.set(section, {
        section,
        time_spent: 0,
        revisits: 0
      });
    });
  }

  private updateSectionByScroll(scrollPercentage: number): void {
    let newSection = 'start';
    
    if (scrollPercentage > 70) newSection = 'end';
    else if (scrollPercentage > 30) newSection = 'middle';

    this.updateCurrentSection(newSection);
  }

  private startCurrentSection(): void {
    const area = this.focusAreas.get(this.currentSection);
    if (area) {
      area.revisits++;
      this.focusAreas.set(this.currentSection, area);
    }
  }

  private endCurrentSection(): void {
    const area = this.focusAreas.get(this.currentSection);
    if (area) {
      // حساب الوقت المقضي (تقديري)
      const timeSpent = Date.now() - (this.startTime?.getTime() || 0);
      area.time_spent += Math.min(timeSpent / 1000, 300); // حد أقصى 5 دقائق لكل قسم
      this.focusAreas.set(this.currentSection, area);
    }
  }

  private buildReadingSession(): ReadingSession {
    const now = Date.now();
    const startTime = this.startTime?.getTime() || now;
    const endTime = this.endTime?.getTime() || now;
    const duration = Math.round((endTime - startTime) / 1000);

    // حساب نسبة القراءة التقديرية
    const readPercentage = this.calculateReadPercentage();

    // حساب سرعة القراءة التقديرية
    const readingSpeed = this.calculateReadingSpeed(duration, readPercentage);

    // بناء نمط القراءة
    const readingPattern: ReadingPattern = {
      is_sequential: this.backTrackingCount < 3 && this.jumpingCount < 5,
      back_tracking_count: this.backTrackingCount,
      jumping_sections: this.jumpingCount,
      focus_areas: Array.from(this.focusAreas.values())
    };

    return {
      session_id: this.sessionId,
      article_id: this.articleId,
      started_at: this.startTime!,
      ended_at: this.endTime,
      duration_seconds: duration,
      read_percentage: readPercentage,
      scroll_depth: this.maxScrollDepth,
      reading_speed: readingSpeed,
      pause_points: this.pausePoints,
      interactions: this.interactions,
      highlights: this.highlights,
      reading_pattern: readingPattern,
      device_orientation: this.getDeviceOrientation(),
      reading_environment: this.getReadingEnvironment()
    };
  }

  private calculateReadPercentage(): number {
    // تقدير نسبة القراءة بناءً على التمرير والوقت
    const scrollFactor = Math.min(this.maxScrollDepth / 100, 1);
    const timeFactor = Math.min(this.getDuration() / 60, 1); // نسبة للدقيقة الواحدة
    
    return Math.round((scrollFactor * 0.7 + timeFactor * 0.3) * 100);
  }

  private calculateReadingSpeed(duration: number, readPercentage: number): number {
    // تقدير سرعة القراءة (كلمة في الدقيقة)
    const estimatedWords = (readPercentage / 100) * 500; // تقدير 500 كلمة للمقال
    const minutes = duration / 60;
    
    return minutes > 0 ? Math.round(estimatedWords / minutes) : 0;
  }

  private getDuration(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || new Date();
    return Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  private getDeviceOrientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  private getReadingEnvironment(): ReadingEnvironment {
    return {
      font_size: this.detectFontSize(),
      zoom_level: this.detectZoomLevel(),
      theme: this.detectTheme()
    };
  }

  private detectFontSize(): string {
    const fontSize = parseInt(getComputedStyle(document.body).fontSize);
    if (fontSize >= 18) return 'large';
    if (fontSize >= 16) return 'medium';
    return 'small';
  }

  private detectZoomLevel(): number {
    return Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
  }

  private detectTheme(): 'light' | 'dark' | 'auto' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}

export default ReadingTracker;
