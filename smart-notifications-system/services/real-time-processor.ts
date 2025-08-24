/**
 * معالج السلوك في الوقت الفعلي
 * Real-Time Behavior Processor
 */

import { BehaviorEvent, BehaviorEventType } from './behavior-tracking-service';

// نتيجة المعالجة
export interface ProcessingResult {
  eventId: string;
  processedAt: Date;
  insights: string[];
  actionsTriggered: string[];
  anomalyDetected: boolean;
  recommendedActions: string[];
}

// حالة المستخدم في الوقت الفعلي
interface UserRealtimeState {
  userId: string;
  isActive: boolean;
  lastActivityTime: Date;
  currentSessionId?: string;
  currentContentId?: string;
  engagementLevel: 'high' | 'medium' | 'low';
  recentEvents: BehaviorEvent[];
  anomalyCount: number;
}

export class RealTimeBehaviorProcessor {
  private userStates: Map<string, UserRealtimeState> = new Map();
  private eventBuffer: Map<string, BehaviorEvent[]> = new Map();
  private readonly BUFFER_SIZE = 100;
  private readonly PROCESSING_INTERVAL = 30000; // 30 ثانية
  private readonly ANOMALY_THRESHOLD = 3;

  /**
   * معالجة حدث سلوكي في الوقت الفعلي
   */
  async processEvent(event: BehaviorEvent): Promise<ProcessingResult> {
    console.log(`معالجة حدث في الوقت الفعلي: ${event.eventId}`);

    const result: ProcessingResult = {
      eventId: event.eventId,
      processedAt: new Date(),
      insights: [],
      actionsTriggered: [],
      anomalyDetected: false,
      recommendedActions: []
    };

    // تحديث حالة المستخدم
    this.updateUserState(event);

    // إضافة الحدث إلى المخزن المؤقت
    this.addToBuffer(event);

    // تحليل فوري للأحداث المهمة
    if (this.isSignificantEvent(event)) {
      const immediateInsights = await this.analyzeSignificantEvent(event);
      result.insights.push(...immediateInsights);
    }

    // اكتشاف الأنماط الشاذة
    const anomalies = await this.detectRealTimeAnomalies(event);
    if (anomalies.length > 0) {
      result.anomalyDetected = true;
      result.insights.push(...anomalies);
      result.actionsTriggered.push('anomaly_alert');
    }

    // تحليل التفاعل الفوري
    const engagementAnalysis = this.analyzeInstantEngagement(event);
    if (engagementAnalysis) {
      result.insights.push(engagementAnalysis);
    }

    // توليد التوصيات الفورية
    const recommendations = this.generateInstantRecommendations(event);
    result.recommendedActions.push(...recommendations);

    // تشغيل الإجراءات التلقائية
    const triggeredActions = await this.triggerAutomatedActions(event, result);
    result.actionsTriggered.push(...triggeredActions);

    return result;
  }

  /**
   * تحديث حالة المستخدم
   */
  private updateUserState(event: BehaviorEvent): void {
    let userState = this.userStates.get(event.userId);

    if (!userState) {
      userState = {
        userId: event.userId,
        isActive: true,
        lastActivityTime: event.timestamp,
        currentSessionId: event.sessionId,
        currentContentId: event.contentId,
        engagementLevel: 'medium',
        recentEvents: [],
        anomalyCount: 0
      };
      this.userStates.set(event.userId, userState);
    }

    // تحديث الحالة
    userState.isActive = true;
    userState.lastActivityTime = event.timestamp;
    userState.currentSessionId = event.sessionId;
    
    if (event.contentId) {
      userState.currentContentId = event.contentId;
    }

    // إضافة الحدث إلى الأحداث الأخيرة
    userState.recentEvents.push(event);
    if (userState.recentEvents.length > 20) {
      userState.recentEvents = userState.recentEvents.slice(-20);
    }

    // تحديث مستوى التفاعل
    userState.engagementLevel = this.calculateEngagementLevel(userState.recentEvents);
  }

  /**
   * إضافة إلى المخزن المؤقت
   */
  private addToBuffer(event: BehaviorEvent): void {
    const userId = event.userId;
    
    if (!this.eventBuffer.has(userId)) {
      this.eventBuffer.set(userId, []);
    }

    const buffer = this.eventBuffer.get(userId)!;
    buffer.push(event);

    // الحفاظ على حجم المخزن
    if (buffer.length > this.BUFFER_SIZE) {
      buffer.shift();
    }
  }

  /**
   * التحقق من الأحداث المهمة
   */
  private isSignificantEvent(event: BehaviorEvent): boolean {
    const significantTypes = [
      BehaviorEventType.READ_COMPLETE,
      BehaviorEventType.SHARE,
      BehaviorEventType.COMMENT,
      BehaviorEventType.SESSION_END,
      BehaviorEventType.NOTIFICATION_CLICK
    ];

    return significantTypes.includes(event.eventType);
  }

  /**
   * تحليل الأحداث المهمة
   */
  private async analyzeSignificantEvent(event: BehaviorEvent): Promise<string[]> {
    const insights: string[] = [];

    switch (event.eventType) {
      case BehaviorEventType.READ_COMPLETE:
        insights.push('اكتمال قراءة المحتوى');
        const readingTime = event.metadata.timeSpent;
        if (readingTime && readingTime > 300) {
          insights.push('قراءة متعمقة (أكثر من 5 دقائق)');
        }
        break;

      case BehaviorEventType.SHARE:
        insights.push('مشاركة المحتوى - مؤشر قوي على الاهتمام');
        break;

      case BehaviorEventType.COMMENT:
        insights.push('تعليق على المحتوى - تفاعل عالي');
        break;

      case BehaviorEventType.SESSION_END:
        const userState = this.userStates.get(event.userId);
        if (userState) {
          const sessionDuration = event.timestamp.getTime() - 
            (userState.recentEvents[0]?.timestamp.getTime() || event.timestamp.getTime());
          
          if (sessionDuration > 600000) { // 10 دقائق
            insights.push('جلسة طويلة - مستخدم نشط');
          }
        }
        break;

      case BehaviorEventType.NOTIFICATION_CLICK:
        insights.push('نقر على الإشعار - الإشعارات فعالة');
        break;
    }

    return insights;
  }

  /**
   * اكتشاف الأنماط الشاذة في الوقت الفعلي
   */
  private async detectRealTimeAnomalies(event: BehaviorEvent): Promise<string[]> {
    const anomalies: string[] = [];
    const userState = this.userStates.get(event.userId);
    
    if (!userState) return anomalies;

    // فحص سرعة الأحداث
    const recentEvents = userState.recentEvents.slice(-5);
    if (recentEvents.length >= 5) {
      const timeSpan = recentEvents[4].timestamp.getTime() - recentEvents[0].timestamp.getTime();
      if (timeSpan < 2000) { // 5 أحداث في أقل من ثانيتين
        anomalies.push('سرعة أحداث غير طبيعية - احتمال بوت');
        userState.anomalyCount++;
      }
    }

    // فحص التمرير السريع جداً
    if (event.eventType === BehaviorEventType.SCROLL) {
      const scrollSpeed = event.metadata.scrollSpeed;
      if (scrollSpeed && scrollSpeed > 5000) {
        anomalies.push('سرعة تمرير غير بشرية');
        userState.anomalyCount++;
      }
    }

    // فحص النقرات المتكررة
    const clickEvents = userState.recentEvents.filter(e => e.eventType === BehaviorEventType.CLICK);
    if (clickEvents.length >= 10) {
      const clickTimeSpan = clickEvents[clickEvents.length - 1].timestamp.getTime() - 
                          clickEvents[0].timestamp.getTime();
      if (clickTimeSpan < 5000) { // 10 نقرات في 5 ثواني
        anomalies.push('نقرات متكررة سريعة جداً');
        userState.anomalyCount++;
      }
    }

    // فحص تغيير الجهاز المفاجئ
    if (userState.recentEvents.length > 1) {
      const lastDevice = userState.recentEvents[userState.recentEvents.length - 2].deviceInfo;
      const currentDevice = event.deviceInfo;
      
      if (lastDevice && currentDevice && 
          (lastDevice.type !== currentDevice.type || 
           lastDevice.os !== currentDevice.os)) {
        const timeDiff = event.timestamp.getTime() - 
                        userState.recentEvents[userState.recentEvents.length - 2].timestamp.getTime();
        
        if (timeDiff < 60000) { // أقل من دقيقة
          anomalies.push('تغيير جهاز مشبوه');
          userState.anomalyCount++;
        }
      }
    }

    // اتخاذ إجراء إذا تجاوز عدد الشذوذات الحد المسموح
    if (userState.anomalyCount > this.ANOMALY_THRESHOLD) {
      anomalies.push('تجاوز حد الأنماط الشاذة - يتطلب مراجعة');
    }

    return anomalies;
  }

  /**
   * تحليل التفاعل الفوري
   */
  private analyzeInstantEngagement(event: BehaviorEvent): string | null {
    const userState = this.userStates.get(event.userId);
    if (!userState) return null;

    // تحليل بناءً على نوع الحدث
    if (event.eventType === BehaviorEventType.READ_PROGRESS) {
      const progress = event.metadata.scrollPosition || 0;
      if (progress > 75) {
        return 'المستخدم على وشك إكمال قراءة المحتوى';
      } else if (progress < 25 && userState.recentEvents.length > 5) {
        return 'المستخدم يبدو أنه يواجه صعوبة في التقدم في المحتوى';
      }
    }

    // تحليل التفاعل الاجتماعي
    const socialEvents = userState.recentEvents.filter(e => 
      [BehaviorEventType.LIKE, BehaviorEventType.SHARE, BehaviorEventType.COMMENT].includes(e.eventType)
    );
    
    if (socialEvents.length >= 3) {
      return 'مستخدم نشط اجتماعياً - تفاعل عالي';
    }

    // تحليل الجلسة
    const sessionEvents = userState.recentEvents.filter(e => 
      e.sessionId === event.sessionId
    );
    
    if (sessionEvents.length > 20) {
      return 'جلسة نشطة جداً - اهتمام عالي';
    }

    return null;
  }

  /**
   * توليد التوصيات الفورية
   */
  private generateInstantRecommendations(event: BehaviorEvent): string[] {
    const recommendations: string[] = [];
    const userState = this.userStates.get(event.userId);
    
    if (!userState) return recommendations;

    // توصيات بناءً على نوع الحدث
    switch (event.eventType) {
      case BehaviorEventType.READ_COMPLETE:
        recommendations.push('اقترح محتوى مشابه فوراً');
        recommendations.push('اعرض خيار المشاركة');
        break;

      case BehaviorEventType.SHARE:
        recommendations.push('اشكر المستخدم على المشاركة');
        recommendations.push('اقترح محتوى للمشاركة');
        break;

      case BehaviorEventType.SESSION_START:
        if (userState.engagementLevel === 'high') {
          recommendations.push('اعرض المحتوى الحصري');
        } else {
          recommendations.push('اعرض أفضل المحتويات');
        }
        break;

      case BehaviorEventType.SCROLL:
        const scrollPos = event.metadata.scrollPosition || 0;
        if (scrollPos > 90) {
          recommendations.push('اعرض المقالات ذات الصلة');
        }
        break;
    }

    // توصيات بناءً على مستوى التفاعل
    if (userState.engagementLevel === 'low') {
      recommendations.push('تبسيط واجهة المستخدم');
      recommendations.push('تقليل كمية المحتوى المعروض');
    } else if (userState.engagementLevel === 'high') {
      recommendations.push('تفعيل المزيد من الميزات التفاعلية');
      recommendations.push('زيادة تكرار التحديثات');
    }

    // توصيات بناءً على الوقت
    const hour = event.timestamp.getHours();
    if (hour >= 22 || hour < 6) {
      recommendations.push('تفعيل الوضع الليلي');
      recommendations.push('تقليل سطوع الإشعارات');
    }

    return recommendations;
  }

  /**
   * تشغيل الإجراءات التلقائية
   */
  private async triggerAutomatedActions(
    event: BehaviorEvent,
    result: ProcessingResult
  ): Promise<string[]> {
    const actions: string[] = [];
    const userState = this.userStates.get(event.userId);
    
    if (!userState) return actions;

    // إجراءات للأحداث الشاذة
    if (result.anomalyDetected && userState.anomalyCount > this.ANOMALY_THRESHOLD) {
      actions.push('flag_user_for_review');
      actions.push('limit_api_access');
      console.log(`تم وضع علامة على المستخدم ${event.userId} للمراجعة`);
    }

    // إجراءات للتفاعل العالي
    if (userState.engagementLevel === 'high' && this.isSignificantEvent(event)) {
      actions.push('increase_content_recommendations');
      actions.push('enable_premium_features');
    }

    // إجراءات لإكمال القراءة
    if (event.eventType === BehaviorEventType.READ_COMPLETE) {
      actions.push('trigger_related_content_notification');
      actions.push('update_user_interests');
    }

    // إجراءات للمشاركة
    if (event.eventType === BehaviorEventType.SHARE) {
      actions.push('award_loyalty_points');
      actions.push('track_viral_content');
    }

    // إجراءات لنهاية الجلسة
    if (event.eventType === BehaviorEventType.SESSION_END) {
      actions.push('save_session_analytics');
      actions.push('schedule_re_engagement_notification');
    }

    return actions;
  }

  /**
   * حساب مستوى التفاعل
   */
  private calculateEngagementLevel(events: BehaviorEvent[]): 'high' | 'medium' | 'low' {
    if (events.length === 0) return 'low';

    const engagementEvents = events.filter(e => 
      [
        BehaviorEventType.READ_COMPLETE,
        BehaviorEventType.LIKE,
        BehaviorEventType.SHARE,
        BehaviorEventType.COMMENT,
        BehaviorEventType.BOOKMARK
      ].includes(e.eventType)
    );

    const engagementRate = engagementEvents.length / events.length;

    if (engagementRate > 0.3) return 'high';
    if (engagementRate > 0.1) return 'medium';
    return 'low';
  }

  /**
   * تنظيف البيانات القديمة
   */
  cleanupOldData(): void {
    const now = Date.now();
    const inactivityThreshold = 30 * 60 * 1000; // 30 دقيقة

    // تنظيف حالات المستخدمين غير النشطين
    for (const [userId, state] of this.userStates) {
      if (now - state.lastActivityTime.getTime() > inactivityThreshold) {
        state.isActive = false;
        
        // حذف المستخدمين غير النشطين لفترة طويلة
        if (now - state.lastActivityTime.getTime() > inactivityThreshold * 4) {
          this.userStates.delete(userId);
          this.eventBuffer.delete(userId);
        }
      }
    }
  }

  /**
   * الحصول على حالة المستخدم
   */
  getUserState(userId: string): UserRealtimeState | undefined {
    return this.userStates.get(userId);
  }

  /**
   * الحصول على إحصائيات المعالج
   */
  getProcessorStats(): ProcessorStats {
    return {
      activeUsers: Array.from(this.userStates.values()).filter(s => s.isActive).length,
      totalUsers: this.userStates.size,
      bufferedEvents: Array.from(this.eventBuffer.values()).reduce((sum, buffer) => sum + buffer.length, 0),
      anomalousUsers: Array.from(this.userStates.values()).filter(s => s.anomalyCount > 0).length
    };
  }
}

// واجهة إحصائيات المعالج
interface ProcessorStats {
  activeUsers: number;
  totalUsers: number;
  bufferedEvents: number;
  anomalousUsers: number;
}
