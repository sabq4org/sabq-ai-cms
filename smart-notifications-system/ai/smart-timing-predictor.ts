/**
 * نموذج التوقيت الذكي المحسن
 * Smart Timing Predictor Model
 */

import { UserProfile, ContentItem, DeliveryChannel } from '../types';

// واجهة سياق الإشعار
export interface NotificationContext {
  timeZone: string;
  timeSinceLastNotification: number; // بالثواني
  deviceType: 'mobile' | 'desktop' | 'tablet';
  notificationType: string;
  urgencyLevel: number; // 0-1
  userLocation?: {
    country: string;
    city: string;
  };
}

// نتيجة التنبؤ بالتوقيت
export interface TimingPrediction {
  optimalTime: Date;
  confidence: number;
  alternativeTimes: Date[];
  reasoning: string[];
  riskFactors: string[];
}

export class SmartTimingPredictor {
  private readonly workingHours = { start: 9, end: 17 }; // ساعات العمل
  private readonly sleepingHours = { start: 22, end: 6 }; // ساعات النوم
  private readonly peakEngagementHours = [8, 12, 19, 21]; // ساعات الذروة العامة
  
  /**
   * التنبؤ بالوقت الأمثل لإرسال الإشعار
   */
  async predictOptimalTime(
    userProfile: UserProfile,
    contentItem: ContentItem,
    context: NotificationContext
  ): Promise<TimingPrediction> {
    console.log(`التنبؤ بالتوقيت الأمثل للمستخدم: ${userProfile.userId}`);

    // حساب نقاط النشاط للساعات المختلفة
    const activityScores = this.calculateHourlyActivityScores(userProfile, context);
    
    // تطبيق عوامل السياق
    const contextAdjustedScores = this.applyContextFactors(
      activityScores,
      contentItem,
      context
    );
    
    // العثور على أفضل الأوقات
    const optimalTimes = this.findOptimalTimes(contextAdjustedScores, context);
    
    // حساب درجة الثقة
    const confidence = this.calculateConfidence(userProfile, optimalTimes);
    
    // توليد التفسير
    const reasoning = this.generateReasoning(userProfile, optimalTimes, context);
    
    // تحديد عوامل الخطر
    const riskFactors = this.identifyRiskFactors(userProfile, optimalTimes, context);

    return {
      optimalTime: optimalTimes[0],
      confidence,
      alternativeTimes: optimalTimes.slice(1, 4),
      reasoning,
      riskFactors
    };
  }

  /**
   * حساب نقاط النشاط لكل ساعة
   */
  private calculateHourlyActivityScores(
    userProfile: UserProfile,
    context: NotificationContext
  ): Map<number, number> {
    const scores = new Map<number, number>();
    
    // البدء بالنقاط الأساسية من توزيع النشاط التاريخي
    const hourlyDist = userProfile.readingPatterns.hourlyDistribution;
    const maxActivity = Math.max(...hourlyDist);
    
    for (let hour = 0; hour < 24; hour++) {
      const baseScore = maxActivity > 0 ? hourlyDist[hour] / maxActivity : 0.5;
      scores.set(hour, baseScore);
    }
    
    // تعزيز ساعات الذروة المحددة
    for (const peakHour of userProfile.readingPatterns.peakHours) {
      const currentScore = scores.get(peakHour) || 0;
      scores.set(peakHour, Math.min(currentScore * 1.5, 1.0));
    }
    
    // تطبيق تفضيلات الجهاز
    this.applyDevicePreferences(scores, userProfile, context.deviceType);
    
    // تطبيق القيود الزمنية (ساعات الهدوء)
    this.applyQuietHours(scores, userProfile);

    return scores;
  }

  /**
   * تطبيق عوامل السياق على النقاط
   */
  private applyContextFactors(
    scores: Map<number, number>,
    contentItem: ContentItem,
    context: NotificationContext
  ): Map<number, number> {
    const adjustedScores = new Map(scores);
    
    // تطبيق عامل الاستعجال
    if (context.urgencyLevel > 0.7) {
      // للمحتوى العاجل، نفضل الأوقات القريبة
      const currentHour = new Date().getHours();
      for (let i = 0; i < 3; i++) {
        const hour = (currentHour + i) % 24;
        const currentScore = adjustedScores.get(hour) || 0;
        adjustedScores.set(hour, Math.min(currentScore * (1 + context.urgencyLevel), 1.0));
      }
    }
    
    // تطبيق عامل نوع المحتوى
    this.applyContentTypeFactors(adjustedScores, contentItem);
    
    // تطبيق عامل الوقت منذ آخر إشعار
    this.applyNotificationSpacing(adjustedScores, context.timeSinceLastNotification);
    
    // تطبيق العوامل الثقافية والمحلية
    this.applyCulturalFactors(adjustedScores, context);

    return adjustedScores;
  }

  /**
   * العثور على أفضل الأوقات بناءً على النقاط
   */
  private findOptimalTimes(
    scores: Map<number, number>,
    context: NotificationContext
  ): Date[] {
    const now = new Date();
    const times: { time: Date; score: number }[] = [];
    
    // النظر في الـ 24 ساعة القادمة
    for (let hoursAhead = 0; hoursAhead < 24; hoursAhead++) {
      const candidateTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      const hour = candidateTime.getHours();
      const score = scores.get(hour) || 0;
      
      // تجاهل الأوقات ذات النقاط المنخفضة جداً
      if (score > 0.2) {
        times.push({ time: candidateTime, score });
      }
    }
    
    // ترتيب حسب النقاط
    times.sort((a, b) => b.score - a.score);
    
    // إرجاع أفضل الأوقات
    return times.map(t => t.time);
  }

  /**
   * حساب درجة الثقة في التنبؤ
   */
  private calculateConfidence(
    userProfile: UserProfile,
    optimalTimes: Date[]
  ): number {
    let confidence = 0.5; // البداية من 50%
    
    // زيادة الثقة بناءً على حجم البيانات التاريخية
    const historySize = userProfile.engagementHistory.length;
    if (historySize > 100) confidence += 0.2;
    else if (historySize > 50) confidence += 0.1;
    
    // زيادة الثقة بناءً على ثبات أنماط القراءة
    const consistency = userProfile.readingPatterns.readingConsistency;
    confidence += consistency * 0.2;
    
    // زيادة الثقة إذا كان الوقت المختار في ساعات الذروة
    if (optimalTimes.length > 0) {
      const optimalHour = optimalTimes[0].getHours();
      if (userProfile.readingPatterns.peakHours.includes(optimalHour)) {
        confidence += 0.1;
      }
    }
    
    return Math.min(confidence, 0.95); // الحد الأقصى 95%
  }

  /**
   * توليد تفسير للتنبؤ
   */
  private generateReasoning(
    userProfile: UserProfile,
    optimalTimes: Date[],
    context: NotificationContext
  ): string[] {
    const reasoning: string[] = [];
    
    if (optimalTimes.length === 0) {
      reasoning.push('لا توجد أوقات مناسبة في الـ 24 ساعة القادمة');
      return reasoning;
    }
    
    const optimalHour = optimalTimes[0].getHours();
    
    // التفسير بناءً على ساعات الذروة
    if (userProfile.readingPatterns.peakHours.includes(optimalHour)) {
      reasoning.push(`الساعة ${optimalHour} هي من ساعات الذروة للمستخدم`);
    }
    
    // التفسير بناءً على نوع الجهاز
    if (context.deviceType === 'mobile' && (optimalHour >= 7 && optimalHour <= 9)) {
      reasoning.push('وقت الصباح مناسب لإشعارات الموبايل');
    }
    
    // التفسير بناءً على الاستعجال
    if (context.urgencyLevel > 0.7) {
      reasoning.push('تم اختيار وقت قريب بسبب أهمية المحتوى');
    }
    
    // التفسير بناءً على تباعد الإشعارات
    if (context.timeSinceLastNotification < 3600) {
      reasoning.push('تم تأجيل الإشعار لتجنب الإزعاج');
    }

    return reasoning;
  }

  /**
   * تحديد عوامل الخطر
   */
  private identifyRiskFactors(
    userProfile: UserProfile,
    optimalTimes: Date[],
    context: NotificationContext
  ): string[] {
    const risks: string[] = [];
    
    if (optimalTimes.length === 0) {
      risks.push('لا توجد أوقات مثالية متاحة');
      return risks;
    }
    
    const optimalHour = optimalTimes[0].getHours();
    
    // التحقق من ساعات النوم
    if (optimalHour >= this.sleepingHours.start || optimalHour < this.sleepingHours.end) {
      risks.push('الوقت المختار قد يكون في ساعات النوم');
    }
    
    // التحقق من ساعات العمل
    if (optimalHour >= this.workingHours.start && optimalHour < this.workingHours.end) {
      const day = optimalTimes[0].getDay();
      if (day >= 1 && day <= 5) { // أيام العمل
        risks.push('الوقت المختار خلال ساعات العمل');
      }
    }
    
    // التحقق من تكرار الإشعارات
    if (context.timeSinceLastNotification < 1800) { // أقل من 30 دقيقة
      risks.push('قد يكون هناك إشعارات متكررة');
    }
    
    // التحقق من البيانات التاريخية
    if (userProfile.engagementHistory.length < 10) {
      risks.push('بيانات تاريخية محدودة قد تؤثر على الدقة');
    }

    return risks;
  }

  /**
   * تطبيق تفضيلات الجهاز
   */
  private applyDevicePreferences(
    scores: Map<number, number>,
    userProfile: UserProfile,
    deviceType: string
  ): void {
    // تعزيز الأوقات المناسبة لكل جهاز
    if (deviceType === 'mobile') {
      // الموبايل: تعزيز أوقات الصباح والمساء
      for (const hour of [7, 8, 9, 18, 19, 20, 21]) {
        const currentScore = scores.get(hour) || 0;
        scores.set(hour, Math.min(currentScore * 1.2, 1.0));
      }
    } else if (deviceType === 'desktop') {
      // الديسكتوب: تعزيز ساعات العمل
      for (let hour = 9; hour < 17; hour++) {
        const currentScore = scores.get(hour) || 0;
        scores.set(hour, Math.min(currentScore * 1.1, 1.0));
      }
    }
  }

  /**
   * تطبيق ساعات الهدوء
   */
  private applyQuietHours(
    scores: Map<number, number>,
    userProfile: UserProfile
  ): void {
    for (const quietPeriod of userProfile.temporalPreferences.quietHours) {
      for (let hour = quietPeriod.start; hour <= quietPeriod.end; hour++) {
        scores.set(hour, 0); // منع الإشعارات تماماً
      }
    }
  }

  /**
   * تطبيق عوامل نوع المحتوى
   */
  private applyContentTypeFactors(
    scores: Map<number, number>,
    contentItem: ContentItem
  ): void {
    // أخبار عاجلة: أي وقت مناسب
    if (contentItem.engagementMetrics.urgencyScore > 0.8) {
      // لا نغير النقاط للأخبار العاجلة
      return;
    }
    
    // محتوى ترفيهي: تفضيل المساء
    if (contentItem.category === 'ترفيه' || contentItem.category === 'رياضة') {
      for (const hour of [18, 19, 20, 21, 22]) {
        const currentScore = scores.get(hour) || 0;
        scores.set(hour, Math.min(currentScore * 1.3, 1.0));
      }
    }
    
    // محتوى تعليمي: تفضيل الصباح
    if (contentItem.category === 'تعليم' || contentItem.category === 'علوم') {
      for (const hour of [6, 7, 8, 9, 10]) {
        const currentScore = scores.get(hour) || 0;
        scores.set(hour, Math.min(currentScore * 1.2, 1.0));
      }
    }
  }

  /**
   * تطبيق تباعد الإشعارات
   */
  private applyNotificationSpacing(
    scores: Map<number, number>,
    timeSinceLastNotification: number
  ): void {
    // إذا كان آخر إشعار قريب جداً، نؤجل الإشعارات القادمة
    if (timeSinceLastNotification < 1800) { // أقل من 30 دقيقة
      const hoursToDelay = Math.ceil((1800 - timeSinceLastNotification) / 3600);
      const currentHour = new Date().getHours();
      
      for (let i = 0; i < hoursToDelay; i++) {
        const hour = (currentHour + i) % 24;
        scores.set(hour, scores.get(hour)! * 0.3); // تقليل النقاط بشكل كبير
      }
    }
  }

  /**
   * تطبيق العوامل الثقافية والمحلية
   */
  private applyCulturalFactors(
    scores: Map<number, number>,
    context: NotificationContext
  ): void {
    // ساعات الصلاة التقريبية (يمكن تحسينها بناءً على الموقع)
    const prayerHours = [5, 12, 15, 18, 19]; // الفجر، الظهر، العصر، المغرب، العشاء
    
    // تقليل النقاط قليلاً خلال أوقات الصلاة
    for (const hour of prayerHours) {
      const currentScore = scores.get(hour) || 0;
      scores.set(hour, currentScore * 0.7);
    }
    
    // الجمعة: تقليل النقاط خلال صلاة الجمعة
    const now = new Date();
    if (now.getDay() === 5) { // الجمعة
      for (const hour of [12, 13]) {
        scores.set(hour, scores.get(hour)! * 0.5);
      }
    }
    
    // رمضان وأوقات خاصة (يمكن إضافة المزيد من التفاصيل)
    // هذا يحتاج إلى معلومات إضافية عن التقويم الهجري
  }

  /**
   * الحصول على الوقت الافتراضي الأمثل
   */
  getDefaultOptimalTime(userProfile: UserProfile): Date {
    const peakHours = userProfile.readingPatterns.peakHours;
    
    if (peakHours.length === 0) {
      // استخدام ساعات الذروة العامة
      peakHours.push(...this.peakEngagementHours);
    }
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    // البحث عن أقرب ساعة ذروة
    let nextPeakHour = peakHours.find(hour => hour > currentHour);
    
    if (!nextPeakHour) {
      // إذا لم نجد ساعة ذروة اليوم، استخدم أول ساعة ذروة غداً
      nextPeakHour = peakHours[0];
      currentTime.setDate(currentTime.getDate() + 1);
    }
    
    currentTime.setHours(nextPeakHour);
    currentTime.setMinutes(0);
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);
    
    return currentTime;
  }
}
