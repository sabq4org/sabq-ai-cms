/**
 * كاشف أنماط السلوك
 * Behavior Pattern Detector
 */

import { UserProfile } from '../types';
import { BehaviorEvent } from './behavior-tracking-service';

// أنواع الأنماط السلوكية
export enum BehaviorPatternType {
  POWER_USER = 'power_user',              // مستخدم نشط جداً
  REGULAR_USER = 'regular_user',          // مستخدم منتظم
  CASUAL_USER = 'casual_user',            // مستخدم عرضي
  DORMANT_USER = 'dormant_user',          // مستخدم خامل
  CONTENT_EXPLORER = 'content_explorer',   // مستكشف المحتوى
  FOCUSED_READER = 'focused_reader',       // قارئ مركز
  SOCIAL_SHARER = 'social_sharer',        // مشارك اجتماعي
  NIGHT_OWL = 'night_owl',                // بومة ليلية
  EARLY_BIRD = 'early_bird',              // الطائر المبكر
  WEEKEND_WARRIOR = 'weekend_warrior'     // محارب نهاية الأسبوع
}

// نمط سلوكي
export interface BehaviorPattern {
  type: BehaviorPatternType;
  confidence: number;
  characteristics: string[];
  recommendations: string[];
}

// ملف تعريف السلوك
export interface UserBehaviorProfile {
  userId: string;
  primaryPattern: BehaviorPatternType;
  secondaryPatterns: BehaviorPatternType[];
  behaviorClusters: string[];
  anomalyScore: number;
  riskOfChurn: number;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  lastAnalyzed: Date;
}

export class BehaviorPatternDetector {
  private readonly MINIMUM_EVENTS_FOR_ANALYSIS = 50;
  private readonly ANOMALY_THRESHOLD = 0.8;

  /**
   * اكتشاف أنماط السلوك للمستخدم
   */
  async detectPatterns(
    userId: string,
    events: BehaviorEvent[]
  ): Promise<BehaviorPattern[]> {
    console.log(`اكتشاف أنماط السلوك للمستخدم: ${userId}`);

    if (events.length < this.MINIMUM_EVENTS_FOR_ANALYSIS) {
      return [{
        type: BehaviorPatternType.CASUAL_USER,
        confidence: 0.5,
        characteristics: ['بيانات غير كافية للتحليل الدقيق'],
        recommendations: ['جمع المزيد من البيانات السلوكية']
      }];
    }

    const patterns: BehaviorPattern[] = [];

    // تحليل مستوى النشاط
    const activityPattern = this.analyzeActivityLevel(events);
    if (activityPattern) patterns.push(activityPattern);

    // تحليل أنماط القراءة
    const readingPattern = this.analyzeReadingBehavior(events);
    if (readingPattern) patterns.push(readingPattern);

    // تحليل السلوك الاجتماعي
    const socialPattern = this.analyzeSocialBehavior(events);
    if (socialPattern) patterns.push(socialPattern);

    // تحليل الأنماط الزمنية
    const temporalPattern = this.analyzeTemporalBehavior(events);
    if (temporalPattern) patterns.push(temporalPattern);

    // ترتيب الأنماط حسب الثقة
    patterns.sort((a, b) => b.confidence - a.confidence);

    return patterns;
  }

  /**
   * تحليل مستوى النشاط
   */
  private analyzeActivityLevel(events: BehaviorEvent[]): BehaviorPattern | null {
    const timeRange = this.getTimeRange(events);
    const daysActive = this.calculateActiveDays(events);
    const avgEventsPerDay = events.length / daysActive;
    const sessionCount = new Set(events.map(e => e.sessionId)).size;
    const avgSessionsPerDay = sessionCount / daysActive;

    let type: BehaviorPatternType;
    let confidence: number;
    let characteristics: string[] = [];
    let recommendations: string[] = [];

    if (avgEventsPerDay > 50 && avgSessionsPerDay > 3) {
      type = BehaviorPatternType.POWER_USER;
      confidence = 0.9;
      characteristics = [
        'نشاط يومي مكثف',
        `متوسط ${avgEventsPerDay.toFixed(0)} حدث يومياً`,
        `متوسط ${avgSessionsPerDay.toFixed(1)} جلسة يومياً`
      ];
      recommendations = [
        'تقديم محتوى حصري ومتقدم',
        'تمكين ميزات المستخدم المتقدم',
        'زيادة حدود الإشعارات اليومية'
      ];
    } else if (avgEventsPerDay > 20 && avgSessionsPerDay > 1) {
      type = BehaviorPatternType.REGULAR_USER;
      confidence = 0.85;
      characteristics = [
        'نشاط منتظم ومستقر',
        `متوسط ${avgEventsPerDay.toFixed(0)} حدث يومياً`,
        'تفاعل يومي متسق'
      ];
      recommendations = [
        'الحفاظ على جدول الإشعارات الحالي',
        'تقديم محتوى متنوع',
        'تشجيع المشاركة الاجتماعية'
      ];
    } else if (avgEventsPerDay > 5) {
      type = BehaviorPatternType.CASUAL_USER;
      confidence = 0.8;
      characteristics = [
        'استخدام عرضي',
        `متوسط ${avgEventsPerDay.toFixed(0)} حدث يومياً`,
        'زيارات متقطعة'
      ];
      recommendations = [
        'تقليل تكرار الإشعارات',
        'التركيز على المحتوى عالي الجودة',
        'تقديم ملخصات أسبوعية'
      ];
    } else {
      type = BehaviorPatternType.DORMANT_USER;
      confidence = 0.75;
      characteristics = [
        'نشاط منخفض جداً',
        'خطر عالي للتراجع',
        'تفاعل نادر'
      ];
      recommendations = [
        'حملة إعادة تفعيل',
        'محتوى تحفيزي خاص',
        'عروض حصرية لإعادة الجذب'
      ];
    }

    return {
      type,
      confidence,
      characteristics,
      recommendations
    };
  }

  /**
   * تحليل سلوك القراءة
   */
  private analyzeReadingBehavior(events: BehaviorEvent[]): BehaviorPattern | null {
    const readingEvents = events.filter(e => 
      ['read_start', 'read_progress', 'read_complete', 'scroll'].includes(e.eventType)
    );

    if (readingEvents.length < 10) return null;

    const completionEvents = events.filter(e => e.eventType === 'read_complete');
    const completionRate = completionEvents.length / 
      events.filter(e => e.eventType === 'read_start').length;

    const avgScrollSpeed = this.calculateAverageScrollSpeed(readingEvents);
    const pauseEvents = this.detectReadingPauses(readingEvents);

    if (completionRate > 0.7 && pauseEvents.length > readingEvents.length * 0.1) {
      return {
        type: BehaviorPatternType.FOCUSED_READER,
        confidence: 0.85,
        characteristics: [
          'قراءة متأنية ومركزة',
          `معدل إكمال ${(completionRate * 100).toFixed(0)}%`,
          'توقفات متكررة للتفكير'
        ],
        recommendations: [
          'تقديم محتوى طويل ومفصل',
          'إضافة مقالات ذات صلة',
          'تمكين ميزات الحفظ والملاحظات'
        ]
      };
    } else if (avgScrollSpeed > 1000) {
      return {
        type: BehaviorPatternType.CONTENT_EXPLORER,
        confidence: 0.8,
        characteristics: [
          'تصفح سريع للمحتوى',
          'بحث عن معلومات محددة',
          'قراءة انتقائية'
        ],
        recommendations: [
          'تحسين العناوين والملخصات',
          'إضافة فهرس للمحتوى الطويل',
          'تمييز النقاط الرئيسية'
        ]
      };
    }

    return null;
  }

  /**
   * تحليل السلوك الاجتماعي
   */
  private analyzeSocialBehavior(events: BehaviorEvent[]): BehaviorPattern | null {
    const socialEvents = events.filter(e => 
      ['like', 'share', 'comment'].includes(e.eventType)
    );

    if (socialEvents.length < 5) return null;

    const shareRate = socialEvents.filter(e => e.eventType === 'share').length / events.length;
    const commentRate = socialEvents.filter(e => e.eventType === 'comment').length / events.length;

    if (shareRate > 0.05 || commentRate > 0.03) {
      return {
        type: BehaviorPatternType.SOCIAL_SHARER,
        confidence: 0.82,
        characteristics: [
          'نشط اجتماعياً',
          `معدل مشاركة ${(shareRate * 100).toFixed(1)}%`,
          'يساهم في النقاشات'
        ],
        recommendations: [
          'تسهيل أدوات المشاركة',
          'إبراز المحتوى الشائع',
          'تشجيع النقاشات'
        ]
      };
    }

    return null;
  }

  /**
   * تحليل الأنماط الزمنية
   */
  private analyzeTemporalBehavior(events: BehaviorEvent[]): BehaviorPattern | null {
    const hourlyDistribution = this.calculateHourlyDistribution(events);
    const weekdayDistribution = this.calculateWeekdayDistribution(events);

    // تحليل نشاط الليل
    const nightActivity = hourlyDistribution.slice(22, 24).concat(hourlyDistribution.slice(0, 6))
      .reduce((a, b) => a + b, 0);
    const totalActivity = hourlyDistribution.reduce((a, b) => a + b, 0);
    const nightActivityRatio = nightActivity / totalActivity;

    if (nightActivityRatio > 0.5) {
      return {
        type: BehaviorPatternType.NIGHT_OWL,
        confidence: 0.78,
        characteristics: [
          'نشط في ساعات الليل',
          `${(nightActivityRatio * 100).toFixed(0)}% من النشاط ليلاً`,
          'يفضل القراءة في الهدوء'
        ],
        recommendations: [
          'جدولة الإشعارات للمساء',
          'محتوى مناسب للقراءة الليلية',
          'تفعيل الوضع الليلي'
        ]
      };
    }

    // تحليل نشاط الصباح
    const morningActivity = hourlyDistribution.slice(5, 9).reduce((a, b) => a + b, 0);
    const morningActivityRatio = morningActivity / totalActivity;

    if (morningActivityRatio > 0.4) {
      return {
        type: BehaviorPatternType.EARLY_BIRD,
        confidence: 0.76,
        characteristics: [
          'نشط في الصباح الباكر',
          `${(morningActivityRatio * 100).toFixed(0)}% من النشاط صباحاً`,
          'يبدأ يومه بالقراءة'
        ],
        recommendations: [
          'إشعارات الصباح المبكر',
          'ملخص أخبار اليوم',
          'محتوى تحفيزي صباحي'
        ]
      };
    }

    // تحليل نشاط نهاية الأسبوع
    const weekendActivity = weekdayDistribution[0] + weekdayDistribution[6]; // الأحد والسبت
    const weekdayActivity = weekdayDistribution.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekendRatio = weekendActivity / (weekendActivity + weekdayActivity);

    if (weekendRatio > 0.4) {
      return {
        type: BehaviorPatternType.WEEKEND_WARRIOR,
        confidence: 0.74,
        characteristics: [
          'نشط في نهاية الأسبوع',
          `${(weekendRatio * 100).toFixed(0)}% من النشاط في الإجازة`,
          'قراءة مكثفة في العطلة'
        ],
        recommendations: [
          'محتوى خاص لنهاية الأسبوع',
          'مقالات طويلة للقراءة المتأنية',
          'تجميع إشعارات الأسبوع'
        ]
      };
    }

    return null;
  }

  /**
   * إنشاء ملف تعريف سلوكي شامل
   */
  async createBehaviorProfile(
    userId: string,
    events: BehaviorEvent[],
    patterns: BehaviorPattern[]
  ): Promise<UserBehaviorProfile> {
    const primaryPattern = patterns[0]?.type || BehaviorPatternType.CASUAL_USER;
    const secondaryPatterns = patterns.slice(1).map(p => p.type);

    // تجميع السلوكيات
    const behaviorClusters = await this.clusterBehaviors(events);

    // حساب درجة الشذوذ
    const anomalyScore = this.calculateAnomalyScore(events, patterns);

    // حساب خطر التراجع
    const riskOfChurn = this.calculateChurnRisk(events);

    // تحديد اتجاه التفاعل
    const engagementTrend = this.analyzeEngagementTrend(events);

    return {
      userId,
      primaryPattern,
      secondaryPatterns,
      behaviorClusters,
      anomalyScore,
      riskOfChurn,
      engagementTrend,
      lastAnalyzed: new Date()
    };
  }

  /**
   * مساعدات التحليل
   */
  private getTimeRange(events: BehaviorEvent[]): number {
    if (events.length === 0) return 0;
    
    const timestamps = events.map(e => e.timestamp.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return (maxTime - minTime) / (1000 * 60 * 60 * 24); // بالأيام
  }

  private calculateActiveDays(events: BehaviorEvent[]): number {
    const uniqueDays = new Set(
      events.map(e => e.timestamp.toISOString().split('T')[0])
    );
    return uniqueDays.size;
  }

  private calculateAverageScrollSpeed(events: BehaviorEvent[]): number {
    const scrollEvents = events.filter(e => 
      e.metadata.scrollSpeed && e.metadata.scrollSpeed > 0
    );
    
    if (scrollEvents.length === 0) return 0;
    
    const totalSpeed = scrollEvents.reduce((sum, e) => 
      sum + (e.metadata.scrollSpeed || 0), 0
    );
    
    return totalSpeed / scrollEvents.length;
  }

  private detectReadingPauses(events: BehaviorEvent[]): any[] {
    const pauses = [];
    const pauseThreshold = 5000; // 5 ثواني

    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp.getTime() - events[i-1].timestamp.getTime();
      if (timeDiff > pauseThreshold) {
        pauses.push({
          duration: timeDiff,
          position: events[i-1].metadata.scrollPosition || 0
        });
      }
    }

    return pauses;
  }

  private calculateHourlyDistribution(events: BehaviorEvent[]): number[] {
    const distribution = new Array(24).fill(0);
    
    events.forEach(e => {
      const hour = e.timestamp.getHours();
      distribution[hour]++;
    });
    
    return distribution;
  }

  private calculateWeekdayDistribution(events: BehaviorEvent[]): number[] {
    const distribution = new Array(7).fill(0);
    
    events.forEach(e => {
      const day = e.timestamp.getDay();
      distribution[day]++;
    });
    
    return distribution;
  }

  private async clusterBehaviors(events: BehaviorEvent[]): Promise<string[]> {
    // في تطبيق حقيقي، سنستخدم خوارزمية تجميع متقدمة
    const clusters: string[] = [];
    
    // تحليل بسيط للتجميعات
    const sessionLengths = this.analyzeSessionLengths(events);
    if (sessionLengths.avg > 300) clusters.push('long_sessions');
    if (sessionLengths.avg < 60) clusters.push('quick_sessions');
    
    const contentDiversity = this.analyzeContentDiversity(events);
    if (contentDiversity > 0.7) clusters.push('diverse_interests');
    if (contentDiversity < 0.3) clusters.push('focused_interests');
    
    return clusters;
  }

  private analyzeSessionLengths(events: BehaviorEvent[]): any {
    const sessions = new Map<string, BehaviorEvent[]>();
    
    // تجميع الأحداث حسب الجلسة
    events.forEach(e => {
      if (!sessions.has(e.sessionId)) {
        sessions.set(e.sessionId, []);
      }
      sessions.get(e.sessionId)!.push(e);
    });
    
    // حساب أطوال الجلسات
    const lengths: number[] = [];
    sessions.forEach(sessionEvents => {
      if (sessionEvents.length >= 2) {
        const start = sessionEvents[0].timestamp.getTime();
        const end = sessionEvents[sessionEvents.length - 1].timestamp.getTime();
        lengths.push((end - start) / 1000); // بالثواني
      }
    });
    
    const avg = lengths.length > 0 ? 
      lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
    
    return { avg, max: Math.max(...lengths, 0), min: Math.min(...lengths, 0) };
  }

  private analyzeContentDiversity(events: BehaviorEvent[]): number {
    const uniqueContent = new Set(events.map(e => e.contentId).filter(id => id));
    const totalContent = events.filter(e => e.contentId).length;
    
    return totalContent > 0 ? uniqueContent.size / totalContent : 0;
  }

  private calculateAnomalyScore(
    events: BehaviorEvent[],
    patterns: BehaviorPattern[]
  ): number {
    // حساب بسيط للشذوذ
    let anomalyScore = 0;
    
    // فحص الأنماط الزمنية الشاذة
    const hourlyDist = this.calculateHourlyDistribution(events);
    const maxHour = Math.max(...hourlyDist);
    const avgHour = hourlyDist.reduce((a, b) => a + b, 0) / 24;
    
    if (maxHour > avgHour * 5) {
      anomalyScore += 0.3; // نشاط مركز جداً في ساعة واحدة
    }
    
    // فحص السرعة الشاذة
    const avgScrollSpeed = this.calculateAverageScrollSpeed(events);
    if (avgScrollSpeed > 2000 || avgScrollSpeed < 50) {
      anomalyScore += 0.2; // سرعة تمرير غير طبيعية
    }
    
    // فحص التناسق
    if (patterns.length > 0 && patterns[0].confidence < 0.6) {
      anomalyScore += 0.2; // عدم وضوح النمط
    }
    
    return Math.min(anomalyScore, 1);
  }

  private calculateChurnRisk(events: BehaviorEvent[]): number {
    if (events.length === 0) return 0.9;
    
    // حساب الوقت منذ آخر حدث
    const lastEventTime = Math.max(...events.map(e => e.timestamp.getTime()));
    const daysSinceLastEvent = (Date.now() - lastEventTime) / (1000 * 60 * 60 * 24);
    
    // حساب تكرار الأحداث
    const timeRange = this.getTimeRange(events);
    const eventFrequency = events.length / Math.max(timeRange, 1);
    
    let risk = 0;
    
    // عوامل الخطر
    if (daysSinceLastEvent > 7) risk += 0.4;
    else if (daysSinceLastEvent > 3) risk += 0.2;
    
    if (eventFrequency < 5) risk += 0.3;
    else if (eventFrequency < 10) risk += 0.1;
    
    // انخفاض التفاعل
    const engagementEvents = events.filter(e => 
      ['like', 'share', 'comment', 'read_complete'].includes(e.eventType)
    );
    const engagementRate = engagementEvents.length / events.length;
    
    if (engagementRate < 0.1) risk += 0.3;
    else if (engagementRate < 0.2) risk += 0.1;
    
    return Math.min(risk, 1);
  }

  private analyzeEngagementTrend(events: BehaviorEvent[]): 'increasing' | 'stable' | 'decreasing' {
    if (events.length < 20) return 'stable';
    
    // تقسيم الأحداث إلى نصفين
    const midPoint = Math.floor(events.length / 2);
    const firstHalf = events.slice(0, midPoint);
    const secondHalf = events.slice(midPoint);
    
    // حساب معدل التفاعل لكل نصف
    const firstEngagement = this.calculateEngagementRate(firstHalf);
    const secondEngagement = this.calculateEngagementRate(secondHalf);
    
    const change = (secondEngagement - firstEngagement) / firstEngagement;
    
    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  private calculateEngagementRate(events: BehaviorEvent[]): number {
    const engagementEvents = events.filter(e => 
      ['like', 'share', 'comment', 'read_complete', 'bookmark'].includes(e.eventType)
    );
    
    return events.length > 0 ? engagementEvents.length / events.length : 0;
  }
}
