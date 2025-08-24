/**
 * محلل القراءة المتقدم
 * Advanced Reading Analyzer
 */

import { BehaviorEventType } from './behavior-tracking-service';

// أنواع نية القراءة
export enum ReadingIntentType {
  FOCUSED_READING = 'focused_reading',      // قراءة مركزة
  SCANNING = 'scanning',                    // مسح سريع
  SEARCHING = 'searching',                  // بحث عن معلومة محددة
  CASUAL_BROWSING = 'casual_browsing',      // تصفح عشوائي
  RESEARCH = 'research',                    // بحث أكاديمي
  ENTERTAINMENT = 'entertainment'          // ترفيه
}

// جلسة القراءة
export interface ReadingSession {
  sessionId: string;
  userId: string;
  contentId: string;
  startTime: Date;
  endTime?: Date;
  totalTime: number;  // بالثواني
  scrollEvents: ScrollEvent[];
  pauseEvents: PauseEvent[];
  readingSpeed: number;  // كلمة في الدقيقة
  completionRate: number;  // نسبة الإكمال
  engagementScore: number;
  intentType: ReadingIntentType;
  qualityIndicators: QualityIndicators;
}

// حدث التمرير
interface ScrollEvent {
  timestamp: Date;
  position: number;
  direction: 'up' | 'down';
  speed: number;
}

// حدث التوقف
interface PauseEvent {
  startTime: Date;
  endTime: Date;
  duration: number;
  position: number;
  context: string;
}

// مؤشرات الجودة
interface QualityIndicators {
  backScrolling: number;      // العودة للقراءة
  steadyReading: number;      // ثبات القراءة
  focusedSections: number;    // الأقسام المركزة
  skippedSections: number;    // الأقسام المتجاوزة
  interactionDepth: number;   // عمق التفاعل
}

export class AdvancedReadingAnalyzer {
  private readingSpeedThresholds = {
    very_slow: 150,    // كلمة في الدقيقة
    slow: 200,
    normal: 250,
    fast: 350,
    very_fast: 500
  };

  private engagementWeights = {
    time_spent: 0.3,
    scroll_pattern: 0.2,
    pause_frequency: 0.2,
    completion_rate: 0.3
  };

  /**
   * تحليل جلسة قراءة
   */
  async analyzeReadingSession(events: any[]): Promise<ReadingSession> {
    if (!events || events.length === 0) {
      throw new Error('لا توجد أحداث للتحليل');
    }

    // ترتيب الأحداث حسب الوقت
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const sessionId = events[0].sessionId;
    const userId = events[0].userId;
    const contentId = events[0].contentId;

    // تحليل أحداث التمرير
    const scrollEvents = this.extractScrollEvents(events);
    const scrollAnalysis = this.analyzeScrollPattern(scrollEvents);

    // تحليل نقاط التوقف
    const pauseEvents = this.detectPauseEvents(events);
    const pauseAnalysis = this.analyzePausePattern(pauseEvents);

    // حساب سرعة القراءة
    const readingSpeed = await this.calculateReadingSpeed(events, contentId);

    // حساب معدل الإكمال
    const completionRate = this.calculateCompletionRate(scrollEvents);

    // تحديد نية القراءة
    const intentType = this.determineReadingIntent(
      scrollAnalysis,
      pauseAnalysis,
      readingSpeed
    );

    // حساب درجة التفاعل
    const engagementScore = this.calculateEngagementScore(
      scrollAnalysis,
      pauseAnalysis,
      completionRate,
      readingSpeed
    );

    // مؤشرات الجودة
    const qualityIndicators = this.calculateQualityIndicators(
      events,
      scrollAnalysis,
      pauseAnalysis
    );

    return {
      sessionId,
      userId,
      contentId,
      startTime: new Date(events[0].timestamp),
      endTime: new Date(events[events.length - 1].timestamp),
      totalTime: this.calculateTotalTime(events),
      scrollEvents: scrollAnalysis.events,
      pauseEvents,
      readingSpeed,
      completionRate,
      engagementScore,
      intentType,
      qualityIndicators
    };
  }

  /**
   * استخراج أحداث التمرير
   */
  private extractScrollEvents(events: any[]): ScrollEvent[] {
    return events
      .filter(e => e.eventType === BehaviorEventType.SCROLL)
      .map(e => ({
        timestamp: new Date(e.timestamp),
        position: e.metadata?.scrollPosition || 0,
        direction: e.metadata?.scrollDirection || 'down',
        speed: e.metadata?.scrollSpeed || 0
      }));
  }

  /**
   * تحليل نمط التمرير
   */
  private analyzeScrollPattern(scrollEvents: ScrollEvent[]): any {
    if (scrollEvents.length === 0) {
      return { 
        events: [], 
        pattern: 'no_scroll', 
        speedVariance: 0,
        totalScrolls: 0,
        averageSpeed: 0
      };
    }

    // حساب تباين السرعة
    const speeds = scrollEvents.map(e => e.speed).filter(s => s > 0);
    const speedVariance = this.calculateVariance(speeds);
    const averageSpeed = speeds.length > 0 ? 
      speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

    // تحديد نمط التمرير
    const pattern = this.classifyScrollPattern(scrollEvents, speedVariance, averageSpeed);

    return {
      events: scrollEvents,
      pattern,
      speedVariance,
      totalScrolls: scrollEvents.length,
      averageSpeed
    };
  }

  /**
   * تصنيف نمط التمرير
   */
  private classifyScrollPattern(
    scrollEvents: ScrollEvent[],
    speedVariance: number,
    averageSpeed: number
  ): string {
    if (scrollEvents.length === 0) return 'no_scroll';

    // أنماط التمرير
    if (averageSpeed > 1000 && speedVariance < 100) {
      return 'fast_consistent';  // تمرير سريع ومتسق (مسح سريع)
    } else if (averageSpeed < 300 && speedVariance < 50) {
      return 'slow_consistent';  // تمرير بطيء ومتسق (قراءة مركزة)
    } else if (speedVariance > 500) {
      return 'erratic';  // تمرير غير منتظم (بحث عن معلومة)
    } else if (averageSpeed > 500) {
      return 'fast_scanning';  // مسح سريع
    } else {
      return 'normal_reading';  // قراءة عادية
    }
  }

  /**
   * اكتشاف نقاط التوقف
   */
  private detectPauseEvents(events: any[]): PauseEvent[] {
    const pauseEvents: PauseEvent[] = [];
    const pauseThreshold = 5000; // 5 ثواني

    for (let i = 1; i < events.length; i++) {
      const timeDiff = new Date(events[i].timestamp).getTime() - 
                      new Date(events[i-1].timestamp).getTime();

      if (timeDiff >= pauseThreshold) {
        pauseEvents.push({
          startTime: new Date(events[i-1].timestamp),
          endTime: new Date(events[i].timestamp),
          duration: timeDiff / 1000, // بالثواني
          position: events[i-1].metadata?.scrollPosition || 0,
          context: events[i-1].metadata?.contentSection || 'unknown'
        });
      }
    }

    return pauseEvents;
  }

  /**
   * تحليل نمط التوقف
   */
  private analyzePausePattern(pauseEvents: PauseEvent[]): any {
    if (pauseEvents.length === 0) {
      return {
        totalPauses: 0,
        averagePauseDuration: 0,
        pausePositions: []
      };
    }

    const totalDuration = pauseEvents.reduce((sum, p) => sum + p.duration, 0);
    const averageDuration = totalDuration / pauseEvents.length;
    const pausePositions = pauseEvents.map(p => p.position);

    return {
      totalPauses: pauseEvents.length,
      averagePauseDuration: averageDuration,
      pausePositions,
      longestPause: Math.max(...pauseEvents.map(p => p.duration)),
      pauseDistribution: this.analyzePauseDistribution(pauseEvents)
    };
  }

  /**
   * تحليل توزيع التوقفات
   */
  private analyzePauseDistribution(pauseEvents: PauseEvent[]): string {
    if (pauseEvents.length < 3) return 'sparse';

    const positions = pauseEvents.map(p => p.position);
    const variance = this.calculateVariance(positions);

    if (variance < 10) return 'concentrated'; // توقفات مركزة
    if (variance > 50) return 'distributed';  // توقفات موزعة
    return 'moderate';
  }

  /**
   * حساب سرعة القراءة
   */
  private async calculateReadingSpeed(events: any[], contentId: string): Promise<number> {
    // في تطبيق حقيقي، سنحصل على عدد الكلمات من قاعدة البيانات
    const wordCount = 500; // افتراضي

    // حساب الوقت المقضي في القراءة الفعلية
    const readingTime = this.calculateActiveReadingTime(events);

    if (readingTime <= 0) return 0;

    // سرعة القراءة = عدد الكلمات / الوقت بالدقائق
    const readingSpeed = wordCount / (readingTime / 60);

    return Math.min(readingSpeed, 1000); // حد أقصى معقول
  }

  /**
   * حساب وقت القراءة الفعلي
   */
  private calculateActiveReadingTime(events: any[]): number {
    let totalTime = 0;
    const pauseThreshold = 5000; // 5 ثواني

    for (let i = 1; i < events.length; i++) {
      const timeDiff = new Date(events[i].timestamp).getTime() - 
                      new Date(events[i-1].timestamp).getTime();

      if (timeDiff < pauseThreshold) {
        totalTime += timeDiff;
      }
    }

    return totalTime / 1000; // بالثواني
  }

  /**
   * حساب معدل الإكمال
   */
  private calculateCompletionRate(scrollEvents: ScrollEvent[]): number {
    if (scrollEvents.length === 0) return 0;

    const maxPosition = Math.max(...scrollEvents.map(e => e.position));
    return Math.min(maxPosition / 100, 1); // افتراض أن 100 هو نهاية المحتوى
  }

  /**
   * تحديد نية القراءة
   */
  private determineReadingIntent(
    scrollAnalysis: any,
    pauseAnalysis: any,
    readingSpeed: number
  ): ReadingIntentType {
    const scrollPattern = scrollAnalysis.pattern;
    const pauseCount = pauseAnalysis.totalPauses;
    const avgPauseDuration = pauseAnalysis.averagePauseDuration;

    // قواعد تحديد النية
    if (scrollPattern === 'fast_consistent' && readingSpeed > 400) {
      return ReadingIntentType.SCANNING;
    } else if (scrollPattern === 'slow_consistent' && pauseCount > 3 && avgPauseDuration > 10) {
      return ReadingIntentType.FOCUSED_READING;
    } else if (scrollPattern === 'erratic' && pauseCount > 5) {
      return ReadingIntentType.SEARCHING;
    } else if (readingSpeed > 300 && pauseCount < 2) {
      return ReadingIntentType.CASUAL_BROWSING;
    } else if (pauseCount > 7 && avgPauseDuration > 15) {
      return ReadingIntentType.RESEARCH;
    } else {
      return ReadingIntentType.ENTERTAINMENT;
    }
  }

  /**
   * حساب درجة التفاعل
   */
  private calculateEngagementScore(
    scrollAnalysis: any,
    pauseAnalysis: any,
    completionRate: number,
    readingSpeed: number
  ): number {
    let score = 0;

    // عامل الوقت المقضي
    const normalReadingTime = readingSpeed > 0 && readingSpeed < 400;
    score += normalReadingTime ? this.engagementWeights.time_spent : 
             this.engagementWeights.time_spent * 0.5;

    // عامل نمط التمرير
    const goodScrollPattern = ['slow_consistent', 'normal_reading'].includes(scrollAnalysis.pattern);
    score += goodScrollPattern ? this.engagementWeights.scroll_pattern : 
             this.engagementWeights.scroll_pattern * 0.3;

    // عامل التوقفات
    const meaningfulPauses = pauseAnalysis.totalPauses > 0 && pauseAnalysis.totalPauses < 10;
    score += meaningfulPauses ? this.engagementWeights.pause_frequency : 
             this.engagementWeights.pause_frequency * 0.5;

    // عامل الإكمال
    score += completionRate * this.engagementWeights.completion_rate;

    return Math.min(score, 1);
  }

  /**
   * حساب مؤشرات الجودة
   */
  private calculateQualityIndicators(
    events: any[],
    scrollAnalysis: any,
    pauseAnalysis: any
  ): QualityIndicators {
    // العودة للقراءة (التمرير لأعلى)
    const backScrolling = scrollAnalysis.events
      .filter((e: ScrollEvent) => e.direction === 'up').length / 
      Math.max(scrollAnalysis.totalScrolls, 1);

    // ثبات القراءة
    const steadyReading = scrollAnalysis.speedVariance < 200 ? 1 : 
                         1 - Math.min(scrollAnalysis.speedVariance / 1000, 1);

    // الأقسام المركزة (بناءً على التوقفات)
    const focusedSections = Math.min(pauseAnalysis.totalPauses / 5, 1);

    // الأقسام المتجاوزة (تمرير سريع جداً)
    const veryFastScrolls = scrollAnalysis.events
      .filter((e: ScrollEvent) => e.speed > 1500).length;
    const skippedSections = Math.min(veryFastScrolls / 10, 1);

    // عمق التفاعل
    const interactionEvents = events.filter(e => 
      ['click', 'like', 'share', 'comment'].includes(e.eventType)
    );
    const interactionDepth = Math.min(interactionEvents.length / 5, 1);

    return {
      backScrolling,
      steadyReading,
      focusedSections,
      skippedSections,
      interactionDepth
    };
  }

  /**
   * حساب الوقت الإجمالي
   */
  private calculateTotalTime(events: any[]): number {
    if (events.length < 2) return 0;

    const startTime = new Date(events[0].timestamp).getTime();
    const endTime = new Date(events[events.length - 1].timestamp).getTime();

    return (endTime - startTime) / 1000; // بالثواني
  }

  /**
   * حساب التباين
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}
