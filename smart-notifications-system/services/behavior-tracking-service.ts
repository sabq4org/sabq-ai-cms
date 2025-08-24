/**
 * خدمة تتبع السلوك المتقدمة
 * Advanced Behavior Tracking Service
 */

import { 
  BehaviorTrackingRequest,
  BehaviorAnalysisResponse,
  UserProfile,
  EngagementEvent,
  ContentItem
} from '../types';
import { AdvancedReadingAnalyzer, ReadingSession } from './advanced-reading-analyzer';
import { BehaviorPatternDetector } from './behavior-pattern-detector';
import { RealTimeBehaviorProcessor } from './real-time-processor';

// أنواع الأحداث السلوكية
export enum BehaviorEventType {
  PAGE_VIEW = 'page_view',
  SCROLL = 'scroll',
  CLICK = 'click',
  HOVER = 'hover',
  READ_START = 'read_start',
  READ_PROGRESS = 'read_progress',
  READ_COMPLETE = 'read_complete',
  LIKE = 'like',
  SHARE = 'share',
  COMMENT = 'comment',
  BOOKMARK = 'bookmark',
  SEARCH = 'search',
  NOTIFICATION_CLICK = 'notification_click',
  NOTIFICATION_DISMISS = 'notification_dismiss',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end'
}

// حدث سلوكي مفصل
export interface BehaviorEvent {
  eventId: string;
  userId: string;
  sessionId: string;
  eventType: BehaviorEventType;
  timestamp: Date;
  url: string;
  contentId?: string;
  metadata: {
    scrollPosition?: number;
    scrollDirection?: 'up' | 'down';
    scrollSpeed?: number;
    timeSpent?: number;
    interactionType?: string;
    searchQuery?: string;
    notificationId?: string;
    contentSection?: string;
  };
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
    screenSize: string;
  };
  locationData?: {
    country: string;
    city: string;
    timezone: string;
  };
}

// نتيجة تحليل الجلسة
export interface SessionAnalysis {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  pageViews: number;
  interactions: number;
  readingSessions: ReadingSession[];
  engagementScore: number;
  insights: string[];
  anomalies: string[];
}

export class BehaviorTrackingService {
  private readingAnalyzer: AdvancedReadingAnalyzer;
  private patternDetector: BehaviorPatternDetector;
  private realTimeProcessor: RealTimeBehaviorProcessor;
  private sessionStore: Map<string, BehaviorEvent[]> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.readingAnalyzer = new AdvancedReadingAnalyzer();
    this.patternDetector = new BehaviorPatternDetector();
    this.realTimeProcessor = new RealTimeBehaviorProcessor();
  }

  /**
   * تتبع حدث سلوكي
   */
  async trackBehavior(request: BehaviorTrackingRequest): Promise<BehaviorAnalysisResponse> {
    console.log(`تتبع سلوك المستخدم: ${request.userId}`);

    // تحويل الطلب إلى حدث سلوكي
    const behaviorEvent = this.createBehaviorEvent(request);

    // معالجة الحدث في الوقت الفعلي
    const processingResult = await this.realTimeProcessor.processEvent(behaviorEvent);

    // تحديث جلسة المستخدم
    this.updateUserSession(behaviorEvent);

    // تحليل الجلسة إذا كانت نهاية جلسة أو قراءة
    let sessionAnalysis: SessionAnalysis | null = null;
    if (this.isSessionEndEvent(behaviorEvent)) {
      sessionAnalysis = await this.analyzeSession(request.userId, request.sessionId);
    }

    // تحديث ملف المستخدم
    await this.updateUserProfile(request.userId, behaviorEvent);

    // توليد الرؤى والتوصيات
    const response = await this.generateAnalysisResponse(
      request.userId,
      behaviorEvent,
      processingResult,
      sessionAnalysis
    );

    return response;
  }

  /**
   * تحليل سلوك المستخدم الشامل
   */
  async analyzeUserBehavior(
    userId: string,
    timeWindow: { start: Date; end: Date }
  ): Promise<UserBehaviorAnalysis> {
    console.log(`تحليل سلوك المستخدم الشامل: ${userId}`);

    // جمع جميع الأحداث في النافذة الزمنية
    const events = await this.getUserEvents(userId, timeWindow);

    // تحليل أنماط القراءة
    const readingAnalysis = await this.analyzeReadingPatterns(userId, events);

    // اكتشاف الأنماط السلوكية
    const behaviorPatterns = await this.patternDetector.detectPatterns(userId, events);

    // تحليل رحلة المستخدم
    const userJourney = this.analyzeUserJourney(events);

    // حساب مقاييس التفاعل
    const engagementMetrics = this.calculateEngagementMetrics(events);

    // توليد التوصيات
    const recommendations = this.generateRecommendations(
      readingAnalysis,
      behaviorPatterns,
      engagementMetrics
    );

    return {
      userId,
      timeWindow,
      readingAnalysis,
      behaviorPatterns,
      userJourney,
      engagementMetrics,
      recommendations
    };
  }

  /**
   * إنشاء حدث سلوكي من الطلب
   */
  private createBehaviorEvent(request: BehaviorTrackingRequest): BehaviorEvent {
    return {
      eventId: this.generateEventId(),
      userId: request.userId,
      sessionId: request.sessionId,
      eventType: request.eventType as BehaviorEventType,
      timestamp: request.timestamp,
      url: window?.location?.href || '',
      contentId: request.eventData.contentId,
      metadata: {
        scrollPosition: request.eventData.metadata?.scrollPosition,
        scrollDirection: request.eventData.metadata?.scrollDirection,
        scrollSpeed: request.eventData.metadata?.scrollSpeed,
        timeSpent: request.eventData.duration,
        interactionType: request.eventData.action,
        searchQuery: request.eventData.metadata?.searchQuery,
        notificationId: request.eventData.metadata?.notificationId,
        contentSection: request.eventData.metadata?.contentSection
      },
      deviceInfo: request.deviceInfo,
      locationData: request.eventData.metadata?.location
    };
  }

  /**
   * معالجة الحدث في الوقت الفعلي
   */
  private async processRealTimeEvent(event: BehaviorEvent): Promise<any> {
    // معالجة أنواع مختلفة من الأحداث
    switch (event.eventType) {
      case BehaviorEventType.READ_START:
        return this.handleReadStart(event);
      
      case BehaviorEventType.READ_PROGRESS:
        return this.handleReadProgress(event);
      
      case BehaviorEventType.READ_COMPLETE:
        return this.handleReadComplete(event);
      
      case BehaviorEventType.SCROLL:
        return this.handleScrollEvent(event);
      
      case BehaviorEventType.CLICK:
        return this.handleClickEvent(event);
      
      default:
        return { processed: true };
    }
  }

  /**
   * تحديث جلسة المستخدم
   */
  private updateUserSession(event: BehaviorEvent): void {
    const sessionKey = `${event.userId}_${event.sessionId}`;
    
    if (!this.sessionStore.has(sessionKey)) {
      this.sessionStore.set(sessionKey, []);
    }
    
    this.sessionStore.get(sessionKey)!.push(event);

    // تنظيف الجلسات القديمة (أكثر من 24 ساعة)
    this.cleanupOldSessions();
  }

  /**
   * تحليل الجلسة
   */
  private async analyzeSession(
    userId: string,
    sessionId: string
  ): Promise<SessionAnalysis> {
    const sessionKey = `${userId}_${sessionId}`;
    const events = this.sessionStore.get(sessionKey) || [];

    if (events.length === 0) {
      throw new Error('لا توجد أحداث للجلسة');
    }

    // تحليل جلسات القراءة
    const readingSessions = await this.extractReadingSessions(events);

    // حساب المقاييس
    const startTime = events[0].timestamp;
    const endTime = events[events.length - 1].timestamp;
    const duration = (endTime.getTime() - startTime.getTime()) / 1000; // بالثواني

    const pageViews = events.filter(e => e.eventType === BehaviorEventType.PAGE_VIEW).length;
    const interactions = events.filter(e => 
      [BehaviorEventType.CLICK, BehaviorEventType.LIKE, 
       BehaviorEventType.SHARE, BehaviorEventType.COMMENT].includes(e.eventType)
    ).length;

    // حساب درجة التفاعل
    const engagementScore = this.calculateSessionEngagement(events, readingSessions);

    // استخراج الرؤى
    const insights = this.extractSessionInsights(events, readingSessions);

    // اكتشاف الشذوذ
    const anomalies = await this.detectAnomalies(events);

    return {
      sessionId,
      userId,
      startTime,
      endTime,
      duration,
      pageViews,
      interactions,
      readingSessions,
      engagementScore,
      insights,
      anomalies
    };
  }

  /**
   * استخراج جلسات القراءة
   */
  private async extractReadingSessions(events: BehaviorEvent[]): Promise<ReadingSession[]> {
    const readingSessions: ReadingSession[] = [];
    const readingEvents: Map<string, BehaviorEvent[]> = new Map();

    // تجميع الأحداث حسب المحتوى
    for (const event of events) {
      if (event.contentId && this.isReadingEvent(event)) {
        if (!readingEvents.has(event.contentId)) {
          readingEvents.set(event.contentId, []);
        }
        readingEvents.get(event.contentId)!.push(event);
      }
    }

    // تحليل كل مجموعة قراءة
    for (const [contentId, contentEvents] of readingEvents) {
      if (contentEvents.length >= 2) { // نحتاج على الأقل حدثين
        const session = await this.readingAnalyzer.analyzeReadingSession(contentEvents);
        readingSessions.push(session);
      }
    }

    return readingSessions;
  }

  /**
   * حساب تفاعل الجلسة
   */
  private calculateSessionEngagement(
    events: BehaviorEvent[],
    readingSessions: ReadingSession[]
  ): number {
    let engagementScore = 0;

    // عامل عدد الصفحات المعروضة
    const pageViews = events.filter(e => e.eventType === BehaviorEventType.PAGE_VIEW).length;
    engagementScore += Math.min(pageViews * 0.1, 0.3);

    // عامل التفاعلات
    const interactions = events.filter(e => 
      [BehaviorEventType.LIKE, BehaviorEventType.SHARE, 
       BehaviorEventType.COMMENT, BehaviorEventType.BOOKMARK].includes(e.eventType)
    ).length;
    engagementScore += Math.min(interactions * 0.15, 0.3);

    // عامل جلسات القراءة
    if (readingSessions.length > 0) {
      const avgReadingEngagement = readingSessions.reduce((sum, session) => 
        sum + session.engagementScore, 0
      ) / readingSessions.length;
      engagementScore += avgReadingEngagement * 0.4;
    }

    return Math.min(engagementScore, 1.0);
  }

  /**
   * استخراج رؤى الجلسة
   */
  private extractSessionInsights(
    events: BehaviorEvent[],
    readingSessions: ReadingSession[]
  ): string[] {
    const insights: string[] = [];

    // رؤى القراءة
    if (readingSessions.length > 0) {
      const avgCompletionRate = readingSessions.reduce((sum, s) => 
        sum + s.completionRate, 0
      ) / readingSessions.length;
      
      if (avgCompletionRate > 0.8) {
        insights.push('معدل إكمال قراءة عالي');
      }
      
      const focusedSessions = readingSessions.filter(s => 
        s.intentType === 'focused_reading'
      ).length;
      
      if (focusedSessions > 0) {
        insights.push(`${focusedSessions} جلسات قراءة مركزة`);
      }
    }

    // رؤى التفاعل
    const shares = events.filter(e => e.eventType === BehaviorEventType.SHARE).length;
    if (shares > 0) {
      insights.push(`تمت مشاركة ${shares} محتوى`);
    }

    // رؤى البحث
    const searches = events.filter(e => e.eventType === BehaviorEventType.SEARCH).length;
    if (searches > 2) {
      insights.push('نشاط بحث نشط');
    }

    return insights;
  }

  /**
   * اكتشاف الشذوذ
   */
  private async detectAnomalies(events: BehaviorEvent[]): Promise<string[]> {
    const anomalies: string[] = [];

    // سرعة تصفح غير طبيعية
    const pageViewTimes = events
      .filter(e => e.eventType === BehaviorEventType.PAGE_VIEW)
      .map(e => e.timestamp.getTime());
    
    if (pageViewTimes.length > 5) {
      const avgTimeBetweenPages = this.calculateAverageTimeBetween(pageViewTimes);
      if (avgTimeBetweenPages < 2000) { // أقل من ثانيتين
        anomalies.push('سرعة تصفح غير طبيعية');
      }
    }

    // نقرات متكررة سريعة
    const clickTimes = events
      .filter(e => e.eventType === BehaviorEventType.CLICK)
      .map(e => e.timestamp.getTime());
    
    if (this.hasRapidRepeatedActions(clickTimes)) {
      anomalies.push('نقرات متكررة سريعة');
    }

    return anomalies;
  }

  /**
   * تحديث ملف المستخدم
   */
  private async updateUserProfile(userId: string, event: BehaviorEvent): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      // إنشاء ملف جديد
      profile = await this.createDefaultUserProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    // تحديث تاريخ التفاعل
    profile.engagementHistory.push({
      eventId: event.eventId,
      eventType: this.mapToEngagementType(event.eventType),
      contentId: event.contentId || '',
      timestamp: event.timestamp,
      metadata: event.metadata
    });

    // الاحتفاظ بآخر 1000 حدث
    if (profile.engagementHistory.length > 1000) {
      profile.engagementHistory = profile.engagementHistory.slice(-1000);
    }

    profile.lastUpdated = new Date();
  }

  /**
   * توليد استجابة التحليل
   */
  private async generateAnalysisResponse(
    userId: string,
    event: BehaviorEvent,
    processingResult: any,
    sessionAnalysis: SessionAnalysis | null
  ): Promise<BehaviorAnalysisResponse> {
    const profile = this.userProfiles.get(userId);
    
    // استخراج الاهتمامات الحالية
    const currentInterests = profile ? Object.keys(profile.interests)
      .filter(key => profile.interests[key] > 0.3)
      .slice(0, 5) : [];

    // تحديد مستوى التفاعل
    const engagementLevel = this.determineEngagementLevel(profile);

    // أنواع المحتوى المفضلة
    const preferredContentTypes = this.extractPreferredContentTypes(profile);

    // أوقات الإشعارات المثلى
    const optimalNotificationTimes = profile ? 
      profile.readingPatterns.peakHours.map(h => `${h}:00`) : 
      ['9:00', '13:00', '19:00'];

    // حساب خطر التراجع
    const churnRisk = this.calculateChurnRisk(profile);

    // توصيات المحتوى
    const contentRecommendations = await this.generateContentRecommendations(
      userId,
      currentInterests,
      preferredContentTypes
    );

    // استراتيجيات الإشعارات
    const notificationStrategies = this.generateNotificationStrategies(
      engagementLevel,
      churnRisk,
      profile
    );

    return {
      userId,
      insights: {
        interests: currentInterests,
        engagementLevel,
        preferredContentTypes,
        optimalNotificationTimes,
        riskOfChurn: churnRisk
      },
      recommendations: {
        contentIds: contentRecommendations,
        notificationStrategies
      }
    };
  }

  /**
   * مساعدات
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSessionEndEvent(event: BehaviorEvent): boolean {
    return event.eventType === BehaviorEventType.SESSION_END ||
           event.eventType === BehaviorEventType.READ_COMPLETE;
  }

  private isReadingEvent(event: BehaviorEvent): boolean {
    return [
      BehaviorEventType.READ_START,
      BehaviorEventType.READ_PROGRESS,
      BehaviorEventType.READ_COMPLETE,
      BehaviorEventType.SCROLL
    ].includes(event.eventType);
  }

  private mapToEngagementType(eventType: BehaviorEventType): string {
    const mapping: Record<BehaviorEventType, string> = {
      [BehaviorEventType.CLICK]: 'click',
      [BehaviorEventType.READ_COMPLETE]: 'read',
      [BehaviorEventType.LIKE]: 'like',
      [BehaviorEventType.SHARE]: 'share',
      [BehaviorEventType.COMMENT]: 'comment',
      [BehaviorEventType.BOOKMARK]: 'bookmark'
    };
    
    return mapping[eventType] || 'other';
  }

  private calculateAverageTimeBetween(timestamps: number[]): number {
    if (timestamps.length < 2) return 0;
    
    let totalDiff = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalDiff += timestamps[i] - timestamps[i-1];
    }
    
    return totalDiff / (timestamps.length - 1);
  }

  private hasRapidRepeatedActions(timestamps: number[]): boolean {
    if (timestamps.length < 3) return false;
    
    let rapidCount = 0;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i-1] < 500) { // أقل من نصف ثانية
        rapidCount++;
      }
    }
    
    return rapidCount > 3;
  }

  private async createDefaultUserProfile(userId: string): Promise<UserProfile> {
    return {
      userId,
      interests: {},
      readingPatterns: {
        hourlyDistribution: new Array(24).fill(0),
        dailyDistribution: new Array(7).fill(0),
        peakHours: [9, 13, 19],
        averageSessionDuration: 0,
        averageReadingSpeed: 250,
        averageCompletionRate: 0,
        preferredContentLength: 'medium',
        readingConsistency: 0
      },
      engagementHistory: [],
      temporalPreferences: {
        preferredHours: [9, 13, 19],
        quietHours: [],
        weekendPreferences: false,
        timezone: 'UTC'
      },
      devicePreferences: {
        preferredDevices: ['mobile'],
        channelPreferences: {
          'web_push': 0.8,
          'mobile_push': 0.9,
          'email': 0.6,
          'sms': 0.3,
          'in_app': 1.0,
          'websocket': 0.7
        },
        platformSpecificSettings: {}
      },
      sentimentPreferences: {
        positive: 0.5,
        neutral: 0.3,
        negative: 0.2
      },
      notificationPreferences: {
        enabled: true,
        frequency: 'medium',
        maxDaily: 10,
        enabledTypes: [],
        enabledChannels: [],
        grouping: true,
        soundEnabled: true,
        vibrationEnabled: true
      },
      lastUpdated: new Date()
    };
  }

  private determineEngagementLevel(profile?: UserProfile): 'high' | 'medium' | 'low' {
    if (!profile || profile.engagementHistory.length < 10) return 'low';
    
    const recentEvents = profile.engagementHistory.slice(-50);
    const engagementScore = recentEvents.filter(e => 
      ['like', 'share', 'comment', 'read'].includes(e.eventType)
    ).length / recentEvents.length;
    
    if (engagementScore > 0.5) return 'high';
    if (engagementScore > 0.2) return 'medium';
    return 'low';
  }

  private extractPreferredContentTypes(profile?: UserProfile): string[] {
    if (!profile) return [];
    
    return Object.entries(profile.interests)
      .filter(([key, value]) => value > 0.3 && !key.startsWith('entity_'))
      .map(([key]) => key)
      .slice(0, 5);
  }

  private calculateChurnRisk(profile?: UserProfile): number {
    if (!profile) return 0.5;
    
    // حساب الوقت منذ آخر تفاعل
    const lastEngagement = profile.engagementHistory[profile.engagementHistory.length - 1];
    if (!lastEngagement) return 0.7;
    
    const daysSinceLastEngagement = (Date.now() - lastEngagement.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastEngagement > 7) return 0.9;
    if (daysSinceLastEngagement > 3) return 0.6;
    if (daysSinceLastEngagement > 1) return 0.3;
    
    return 0.1;
  }

  private async generateContentRecommendations(
    userId: string,
    interests: string[],
    contentTypes: string[]
  ): Promise<string[]> {
    // في تطبيق حقيقي، سنستعلم من قاعدة البيانات
    // هنا نعيد قائمة وهمية
    return [
      'article_001',
      'article_002',
      'article_003',
      'article_004',
      'article_005'
    ];
  }

  private generateNotificationStrategies(
    engagementLevel: string,
    churnRisk: number,
    profile?: UserProfile
  ): string[] {
    const strategies: string[] = [];
    
    if (engagementLevel === 'high') {
      strategies.push('إرسال إشعارات المحتوى الحصري');
      strategies.push('تمكين الإشعارات الفورية للأخبار العاجلة');
    } else if (engagementLevel === 'low') {
      strategies.push('تقليل تكرار الإشعارات');
      strategies.push('التركيز على المحتوى عالي الجودة فقط');
    }
    
    if (churnRisk > 0.7) {
      strategies.push('إرسال محتوى تفاعلي لإعادة الجذب');
      strategies.push('تقديم عروض خاصة أو محتوى حصري');
    }
    
    return strategies;
  }

  private cleanupOldSessions(): void {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [key, events] of this.sessionStore) {
      if (events.length > 0 && events[0].timestamp < dayAgo) {
        this.sessionStore.delete(key);
      }
    }
  }

  /**
   * معالجات الأحداث المتخصصة
   */
  private async handleReadStart(event: BehaviorEvent): Promise<any> {
    console.log(`بدء قراءة المحتوى: ${event.contentId}`);
    return { status: 'tracked', type: 'read_start' };
  }

  private async handleReadProgress(event: BehaviorEvent): Promise<any> {
    const progress = event.metadata.scrollPosition || 0;
    console.log(`تقدم القراءة: ${progress}%`);
    return { status: 'tracked', type: 'read_progress', progress };
  }

  private async handleReadComplete(event: BehaviorEvent): Promise<any> {
    console.log(`اكتمال قراءة المحتوى: ${event.contentId}`);
    return { status: 'tracked', type: 'read_complete' };
  }

  private async handleScrollEvent(event: BehaviorEvent): Promise<any> {
    return { 
      status: 'tracked', 
      type: 'scroll',
      position: event.metadata.scrollPosition,
      direction: event.metadata.scrollDirection
    };
  }

  private async handleClickEvent(event: BehaviorEvent): Promise<any> {
    return { 
      status: 'tracked', 
      type: 'click',
      target: event.metadata.interactionType
    };
  }

  private async getUserEvents(
    userId: string,
    timeWindow: { start: Date; end: Date }
  ): Promise<BehaviorEvent[]> {
    const allEvents: BehaviorEvent[] = [];
    
    // جمع الأحداث من جميع الجلسات
    for (const [key, events] of this.sessionStore) {
      if (key.startsWith(userId)) {
        const filteredEvents = events.filter(e => 
          e.timestamp >= timeWindow.start && 
          e.timestamp <= timeWindow.end
        );
        allEvents.push(...filteredEvents);
      }
    }
    
    return allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private async analyzeReadingPatterns(
    userId: string,
    events: BehaviorEvent[]
  ): Promise<any> {
    const readingEvents = events.filter(e => this.isReadingEvent(e));
    
    if (readingEvents.length === 0) {
      return { sessions: 0, averageDuration: 0, completionRate: 0 };
    }
    
    const sessions = await this.extractReadingSessions(readingEvents);
    
    return {
      sessions: sessions.length,
      averageDuration: sessions.reduce((sum, s) => sum + s.totalTime, 0) / sessions.length,
      completionRate: sessions.reduce((sum, s) => sum + s.completionRate, 0) / sessions.length,
      readingSpeed: sessions.reduce((sum, s) => sum + s.readingSpeed, 0) / sessions.length
    };
  }

  private analyzeUserJourney(events: BehaviorEvent[]): any {
    const journey = {
      totalEvents: events.length,
      uniquePages: new Set(events.map(e => e.url)).size,
      sessionCount: new Set(events.map(e => e.sessionId)).size,
      pathAnalysis: this.analyzeNavigationPath(events)
    };
    
    return journey;
  }

  private analyzeNavigationPath(events: BehaviorEvent[]): any {
    const pageTransitions: Map<string, Map<string, number>> = new Map();
    
    for (let i = 1; i < events.length; i++) {
      if (events[i].eventType === BehaviorEventType.PAGE_VIEW &&
          events[i-1].eventType === BehaviorEventType.PAGE_VIEW) {
        
        const fromPage = events[i-1].url;
        const toPage = events[i].url;
        
        if (!pageTransitions.has(fromPage)) {
          pageTransitions.set(fromPage, new Map());
        }
        
        const transitions = pageTransitions.get(fromPage)!;
        transitions.set(toPage, (transitions.get(toPage) || 0) + 1);
      }
    }
    
    return {
      transitions: Array.from(pageTransitions.entries()).map(([from, toMap]) => ({
        from,
        to: Array.from(toMap.entries()).map(([to, count]) => ({ to, count }))
      }))
    };
  }

  private calculateEngagementMetrics(events: BehaviorEvent[]): any {
    const metrics = {
      totalInteractions: events.filter(e => 
        [BehaviorEventType.CLICK, BehaviorEventType.LIKE, 
         BehaviorEventType.SHARE, BehaviorEventType.COMMENT].includes(e.eventType)
      ).length,
      pageViews: events.filter(e => e.eventType === BehaviorEventType.PAGE_VIEW).length,
      avgTimePerPage: 0,
      bounceRate: 0,
      interactionRate: 0
    };
    
    // حساب متوسط الوقت لكل صفحة
    const pageViewEvents = events.filter(e => e.eventType === BehaviorEventType.PAGE_VIEW);
    if (pageViewEvents.length > 1) {
      let totalTime = 0;
      for (let i = 1; i < pageViewEvents.length; i++) {
        totalTime += pageViewEvents[i].timestamp.getTime() - pageViewEvents[i-1].timestamp.getTime();
      }
      metrics.avgTimePerPage = totalTime / (pageViewEvents.length - 1) / 1000; // بالثواني
    }
    
    // حساب معدل التفاعل
    if (metrics.pageViews > 0) {
      metrics.interactionRate = metrics.totalInteractions / metrics.pageViews;
    }
    
    // حساب معدل الارتداد (جلسات بصفحة واحدة)
    const sessions = new Set(events.map(e => e.sessionId));
    let singlePageSessions = 0;
    
    for (const sessionId of sessions) {
      const sessionPageViews = events.filter(e => 
        e.sessionId === sessionId && 
        e.eventType === BehaviorEventType.PAGE_VIEW
      ).length;
      
      if (sessionPageViews === 1) {
        singlePageSessions++;
      }
    }
    
    if (sessions.size > 0) {
      metrics.bounceRate = singlePageSessions / sessions.size;
    }
    
    return metrics;
  }

  private generateRecommendations(
    readingAnalysis: any,
    behaviorPatterns: any,
    engagementMetrics: any
  ): string[] {
    const recommendations: string[] = [];
    
    // توصيات بناءً على القراءة
    if (readingAnalysis.completionRate < 0.5) {
      recommendations.push('تحسين جودة المحتوى أو تقليل طوله');
    }
    
    if (readingAnalysis.readingSpeed > 400) {
      recommendations.push('المستخدم يقرأ بسرعة - قدم محتوى أكثر تفصيلاً');
    }
    
    // توصيات بناءً على التفاعل
    if (engagementMetrics.interactionRate < 0.1) {
      recommendations.push('إضافة عناصر تفاعلية لزيادة المشاركة');
    }
    
    if (engagementMetrics.bounceRate > 0.7) {
      recommendations.push('تحسين المحتوى المقترح وربط المقالات');
    }
    
    return recommendations;
  }
}

// واجهات مساعدة
interface UserBehaviorAnalysis {
  userId: string;
  timeWindow: { start: Date; end: Date };
  readingAnalysis: any;
  behaviorPatterns: any;
  userJourney: any;
  engagementMetrics: any;
  recommendations: string[];
}
