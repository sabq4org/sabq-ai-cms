/**
 * نظام التقييم الديناميكي المحسن
 * Dynamic Engagement Scoring System
 */

import { UserProfile, ContentItem, AIScores, DeliveryChannel } from '../types';

// واجهة السياق للتقييم
export interface ScoringContext {
  proposedTime: Date;
  channel: DeliveryChannel;
  previousNotifications: string[];
  currentUserState?: {
    isActive: boolean;
    lastActivityTime: Date;
    currentDevice: string;
  };
}

// نتيجة التقييم المفصلة
export interface ScoringResult {
  totalScore: number;
  scores: AIScores;
  recommendation: 'send' | 'delay' | 'skip';
  reasoning: string[];
  optimizations: string[];
}

// بيانات التغذية الراجعة
export interface FeedbackData {
  notificationId: string;
  userId: string;
  action: 'opened' | 'clicked' | 'dismissed' | 'ignored';
  engagementTime?: number;
  conversionValue?: number;
}

export class DynamicEngagementScorer {
  private baseWeights = {
    contentRelevance: 0.25,    // صلة المحتوى
    timingScore: 0.20,         // التوقيت
    userActivity: 0.15,        // نشاط المستخدم
    contentQuality: 0.15,      // جودة المحتوى
    socialSignals: 0.10,       // الإشارات الاجتماعية
    sentimentAlignment: 0.10,  // توافق المشاعر
    noveltyScore: 0.05        // الجدة
  };

  private personalizedWeights: Map<string, typeof this.baseWeights> = new Map();
  private feedbackHistory: Map<string, FeedbackData[]> = new Map();
  private contentSimilarityCache: Map<string, number> = new Map();

  /**
   * حساب درجة التفاعل المتوقعة
   */
  async calculateEngagementScore(
    userProfile: UserProfile,
    contentItem: ContentItem,
    context: ScoringContext
  ): Promise<ScoringResult> {
    console.log(`حساب درجة التفاعل للمستخدم: ${userProfile.userId}`);

    // حساب كل مكون من مكونات النتيجة
    const scores: AIScores = {
      engagementScore: 0,
      relevanceScore: this.calculateContentRelevance(userProfile, contentItem),
      timingScore: this.calculateTimingScore(userProfile, context.proposedTime),
      qualityScore: contentItem.qualityScore,
      noveltyScore: this.calculateNoveltyScore(userProfile, contentItem),
      sentimentAlignment: this.calculateSentimentAlignment(userProfile, contentItem),
      socialSignals: this.calculateSocialSignals(contentItem)
    };

    // حساب نشاط المستخدم
    const userActivityScore = this.calculateUserActivityScore(userProfile, context);

    // الحصول على الأوزان المخصصة للمستخدم
    const weights = this.getPersonalizedWeights(userProfile.userId);

    // حساب النتيجة الأولية
    let totalScore = 
      scores.relevanceScore * weights.contentRelevance +
      scores.timingScore * weights.timingScore +
      userActivityScore * weights.userActivity +
      scores.qualityScore * weights.contentQuality +
      scores.socialSignals * weights.socialSignals +
      scores.sentimentAlignment * weights.sentimentAlignment +
      scores.noveltyScore * weights.noveltyScore;

    // تطبيق العوامل التعديلية
    totalScore = this.applyModifiers(totalScore, userProfile, contentItem, context);

    // تحديد درجة التفاعل النهائية
    scores.engagementScore = Math.min(Math.max(totalScore, 0), 1);

    // توليد التوصية
    const recommendation = this.generateRecommendation(scores.engagementScore, context);
    
    // توليد التفسير
    const reasoning = this.generateReasoning(scores, userProfile, contentItem);
    
    // اقتراح التحسينات
    const optimizations = this.suggestOptimizations(scores, userProfile, context);

    return {
      totalScore: scores.engagementScore,
      scores,
      recommendation,
      reasoning,
      optimizations
    };
  }

  /**
   * حساب صلة المحتوى بالمستخدم
   */
  private calculateContentRelevance(
    userProfile: UserProfile,
    contentItem: ContentItem
  ): number {
    let relevanceScore = 0;

    // صلة الفئة (60%)
    const categoryInterest = userProfile.interests[contentItem.category] || 0;
    relevanceScore += categoryInterest * 0.6;

    // صلة الكيانات (25%)
    let entityRelevance = 0;
    for (const entity of contentItem.entities) {
      const entityKey = `entity_${entity}`;
      const entityInterest = userProfile.interests[entityKey] || 0;
      entityRelevance += entityInterest;
    }
    if (contentItem.entities.length > 0) {
      entityRelevance /= contentItem.entities.length;
    }
    relevanceScore += entityRelevance * 0.25;

    // صلة العلامات (15%)
    let tagRelevance = 0;
    for (const tag of contentItem.tags || []) {
      const tagKey = `tag_${tag}`;
      const tagInterest = userProfile.interests[tagKey] || 0;
      tagRelevance += tagInterest;
    }
    if (contentItem.tags && contentItem.tags.length > 0) {
      tagRelevance /= contentItem.tags.length;
    }
    relevanceScore += tagRelevance * 0.15;

    return Math.min(relevanceScore, 1);
  }

  /**
   * حساب درجة التوقيت
   */
  private calculateTimingScore(
    userProfile: UserProfile,
    proposedTime: Date
  ): number {
    const hour = proposedTime.getHours();
    const day = proposedTime.getDay();

    // النقاط الأساسية من التوزيع الساعي
    const hourlyDist = userProfile.readingPatterns.hourlyDistribution;
    const maxActivity = Math.max(...hourlyDist);
    let timingScore = maxActivity > 0 ? hourlyDist[hour] / maxActivity : 0.5;

    // مكافأة إضافية لساعات الذروة
    if (userProfile.readingPatterns.peakHours.includes(hour)) {
      timingScore = Math.min(timingScore * 1.3, 1);
    }

    // تعديل بناءً على يوم الأسبوع
    const dailyDist = userProfile.readingPatterns.dailyDistribution;
    const maxDaily = Math.max(...dailyDist);
    const dayScore = maxDaily > 0 ? dailyDist[day] / maxDaily : 0.5;
    
    timingScore = (timingScore * 0.7) + (dayScore * 0.3);

    // عقوبة للساعات الهادئة
    for (const quietPeriod of userProfile.temporalPreferences.quietHours) {
      if (hour >= quietPeriod.start && hour <= quietPeriod.end) {
        timingScore *= 0.1; // تقليل كبير
      }
    }

    return timingScore;
  }

  /**
   * حساب نشاط المستخدم
   */
  private calculateUserActivityScore(
    userProfile: UserProfile,
    context: ScoringContext
  ): number {
    // إذا كان المستخدم نشطاً حالياً
    if (context.currentUserState?.isActive) {
      return 1.0;
    }

    // حساب الوقت منذ آخر نشاط
    if (context.currentUserState?.lastActivityTime) {
      const timeSinceActivity = Date.now() - context.currentUserState.lastActivityTime.getTime();
      const minutes = timeSinceActivity / (1000 * 60);
      
      if (minutes < 5) return 0.9;
      if (minutes < 15) return 0.7;
      if (minutes < 30) return 0.5;
      if (minutes < 60) return 0.3;
    }

    // الافتراض بناءً على الوقت
    const hour = new Date().getHours();
    const hourlyActivity = userProfile.readingPatterns.hourlyDistribution[hour];
    const avgActivity = userProfile.readingPatterns.hourlyDistribution.reduce((a, b) => a + b, 0) / 24;
    
    return hourlyActivity > avgActivity ? 0.6 : 0.4;
  }

  /**
   * حساب درجة الجدة
   */
  private calculateNoveltyScore(
    userProfile: UserProfile,
    contentItem: ContentItem
  ): number {
    // تحليل مدى اختلاف المحتوى عن اهتمامات المستخدم الحالية
    const categoryFamiliarity = userProfile.interests[contentItem.category] || 0;
    
    // كلما قل الاهتمام بالفئة، زادت درجة الجدة
    let novelty = 1 - categoryFamiliarity;

    // مكافأة إضافية للمحتوى عالي الجودة في فئات جديدة
    if (novelty > 0.7 && contentItem.qualityScore > 0.8) {
      novelty = Math.min(novelty * 1.2, 1);
    }

    // عقوبة للمحتوى منخفض الجودة في فئات جديدة
    if (novelty > 0.7 && contentItem.qualityScore < 0.5) {
      novelty *= 0.7;
    }

    // التحقق من التشابه مع المحتوى السابق
    const similarityPenalty = this.calculateSimilarityPenalty(contentItem);
    novelty *= (1 - similarityPenalty);

    return novelty;
  }

  /**
   * حساب توافق المشاعر
   */
  private calculateSentimentAlignment(
    userProfile: UserProfile,
    contentItem: ContentItem
  ): number {
    const contentSentiment = this.categorizeSentiment(contentItem.sentimentScore);
    const userPreference = userProfile.sentimentPreferences[contentSentiment] || 0.33;
    
    // إضافة تعديل بناءً على شدة المشاعر
    const sentimentIntensity = Math.abs(contentItem.sentimentScore);
    const intensityBonus = sentimentIntensity * 0.2;
    
    return Math.min(userPreference + intensityBonus, 1);
  }

  /**
   * حساب الإشارات الاجتماعية
   */
  private calculateSocialSignals(contentItem: ContentItem): number {
    const metrics = contentItem.engagementMetrics;
    
    // تطبيع المقاييس (افتراض قيم مرجعية)
    const viewsScore = Math.min(metrics.views / 10000, 1);
    const likesScore = Math.min(metrics.likes / 1000, 1);
    const sharesScore = Math.min(metrics.shares / 100, 1);
    const commentsScore = Math.min(metrics.comments / 50, 1);
    
    // حساب النتيجة المرجحة
    const socialScore = 
      viewsScore * 0.2 +
      likesScore * 0.3 +
      sharesScore * 0.3 +
      commentsScore * 0.2;
    
    return socialScore;
  }

  /**
   * تطبيق العوامل التعديلية
   */
  private applyModifiers(
    baseScore: number,
    userProfile: UserProfile,
    contentItem: ContentItem,
    context: ScoringContext
  ): number {
    let modifiedScore = baseScore;

    // عقوبة التكرار
    const dedupPenalty = this.calculateDeduplicationPenalty(userProfile, contentItem, context);
    modifiedScore *= (1 - dedupPenalty);

    // مكافأة التنويع
    const diversityBonus = this.calculateDiversityBonus(userProfile, contentItem);
    modifiedScore *= (1 + diversityBonus);

    // عامل القناة
    const channelFactor = this.calculateChannelFactor(userProfile, context.channel);
    modifiedScore *= channelFactor;

    // عامل الحداثة
    const freshnessBonus = this.calculateFreshnessBonus(contentItem);
    modifiedScore *= (1 + freshnessBonus);

    return modifiedScore;
  }

  /**
   * حساب عقوبة التكرار
   */
  private calculateDeduplicationPenalty(
    userProfile: UserProfile,
    contentItem: ContentItem,
    context: ScoringContext
  ): number {
    // التحقق من المحتوى المماثل في الإشعارات السابقة
    const recentNotifications = context.previousNotifications.slice(-10);
    
    let penalty = 0;
    for (const prevId of recentNotifications) {
      if (prevId === contentItem.contentId) {
        penalty = 1; // منع كامل للتكرار المباشر
        break;
      }
      
      // يمكن إضافة منطق للتحقق من التشابه
      const similarity = this.checkContentSimilarity(prevId, contentItem.contentId);
      penalty = Math.max(penalty, similarity * 0.8);
    }
    
    return penalty;
  }

  /**
   * حساب مكافأة التنويع
   */
  private calculateDiversityBonus(
    userProfile: UserProfile,
    contentItem: ContentItem
  ): number {
    // تشجيع المحتوى من فئات مختلفة
    const recentCategories = this.getRecentCategories(userProfile);
    
    if (!recentCategories.includes(contentItem.category)) {
      return 0.1; // مكافأة 10% للتنويع
    }
    
    return 0;
  }

  /**
   * حساب عامل القناة
   */
  private calculateChannelFactor(
    userProfile: UserProfile,
    channel: DeliveryChannel
  ): number {
    const channelPreference = userProfile.devicePreferences.channelPreferences[channel] || 0.5;
    return 0.7 + (channelPreference * 0.3); // النطاق: 0.7-1.0
  }

  /**
   * حساب مكافأة الحداثة
   */
  private calculateFreshnessBonus(contentItem: ContentItem): number {
    const ageInHours = (Date.now() - new Date(contentItem.publishTime).getTime()) / (1000 * 60 * 60);
    
    if (ageInHours < 1) return 0.2;    // محتوى جديد جداً
    if (ageInHours < 6) return 0.1;    // محتوى حديث
    if (ageInHours < 24) return 0.05;  // محتوى يوم واحد
    if (ageInHours < 72) return 0;     // محتوى عادي
    
    return -0.1; // عقوبة للمحتوى القديم
  }

  /**
   * توليد التوصية
   */
  private generateRecommendation(
    engagementScore: number,
    context: ScoringContext
  ): 'send' | 'delay' | 'skip' {
    // عتبات القرار
    const SEND_THRESHOLD = 0.6;
    const DELAY_THRESHOLD = 0.4;
    
    if (engagementScore >= SEND_THRESHOLD) {
      return 'send';
    } else if (engagementScore >= DELAY_THRESHOLD) {
      // التحقق من إمكانية التحسين بالتأجيل
      const hour = context.proposedTime.getHours();
      if (hour >= 22 || hour < 6) {
        return 'delay'; // تأجيل الإشعارات الليلية منخفضة الأولوية
      }
      return 'send';
    } else {
      return 'skip';
    }
  }

  /**
   * توليد التفسير
   */
  private generateReasoning(
    scores: AIScores,
    userProfile: UserProfile,
    contentItem: ContentItem
  ): string[] {
    const reasoning: string[] = [];

    // تفسير درجة الصلة
    if (scores.relevanceScore > 0.7) {
      reasoning.push(`محتوى عالي الصلة بفئة ${contentItem.category} (${(scores.relevanceScore * 100).toFixed(0)}%)`);
    } else if (scores.relevanceScore < 0.3) {
      reasoning.push('المحتوى خارج نطاق اهتمامات المستخدم الأساسية');
    }

    // تفسير التوقيت
    if (scores.timingScore > 0.8) {
      reasoning.push('التوقيت مثالي بناءً على أنماط النشاط');
    } else if (scores.timingScore < 0.4) {
      reasoning.push('التوقيت غير مناسب لهذا المستخدم');
    }

    // تفسير الجودة
    if (scores.qualityScore > 0.8) {
      reasoning.push('محتوى عالي الجودة');
    }

    // تفسير الجدة
    if (scores.noveltyScore > 0.7) {
      reasoning.push('محتوى جديد يساعد على توسيع الاهتمامات');
    }

    // تفسير الإشارات الاجتماعية
    if (scores.socialSignals > 0.6) {
      reasoning.push('محتوى شائع مع تفاعل اجتماعي عالي');
    }

    return reasoning;
  }

  /**
   * اقتراح التحسينات
   */
  private suggestOptimizations(
    scores: AIScores,
    userProfile: UserProfile,
    context: ScoringContext
  ): string[] {
    const optimizations: string[] = [];

    // تحسين التوقيت
    if (scores.timingScore < 0.5) {
      const peakHours = userProfile.readingPatterns.peakHours;
      if (peakHours.length > 0) {
        optimizations.push(`جرب الإرسال في الساعة ${peakHours[0]} للحصول على تفاعل أفضل`);
      }
    }

    // تحسين القناة
    const bestChannel = this.getBestChannel(userProfile);
    if (bestChannel !== context.channel) {
      optimizations.push(`قناة ${bestChannel} قد تحقق نتائج أفضل لهذا المستخدم`);
    }

    // تحسين المحتوى
    if (scores.relevanceScore < 0.5) {
      const topInterests = this.getTopInterests(userProfile, 3);
      optimizations.push(`ركز على محتوى من فئات: ${topInterests.join('، ')}`);
    }

    // تحسين التنويع
    if (scores.noveltyScore < 0.3) {
      optimizations.push('حاول تقديم محتوى من فئات جديدة لتجنب الملل');
    }

    return optimizations;
  }

  /**
   * تحديث الأوزان من التغذية الراجعة
   */
  updateWeightsFromFeedback(userId: string, feedback: FeedbackData): void {
    // حفظ التغذية الراجعة
    if (!this.feedbackHistory.has(userId)) {
      this.feedbackHistory.set(userId, []);
    }
    this.feedbackHistory.get(userId)!.push(feedback);

    // إعادة حساب الأوزان المخصصة
    this.recalculatePersonalizedWeights(userId);
  }

  /**
   * إعادة حساب الأوزان المخصصة
   */
  private recalculatePersonalizedWeights(userId: string): void {
    const userFeedback = this.feedbackHistory.get(userId) || [];
    if (userFeedback.length < 10) return; // نحتاج بيانات كافية

    // تحليل أنماط التغذية الراجعة
    const successfulNotifications = userFeedback.filter(f => 
      f.action === 'opened' || f.action === 'clicked'
    );

    // حساب الأوزان الجديدة بناءً على النجاح
    // هذا مثال مبسط، يمكن استخدام خوارزميات أكثر تعقيداً
    const newWeights = { ...this.baseWeights };
    
    // تعديل الأوزان بناءً على الأداء
    if (successfulNotifications.length / userFeedback.length > 0.5) {
      // الحفاظ على الأوزان الحالية إذا كان الأداء جيد
    } else {
      // تعديل الأوزان لتحسين الأداء
      newWeights.contentRelevance += 0.05;
      newWeights.timingScore += 0.05;
      newWeights.noveltyScore -= 0.05;
      newWeights.socialSignals -= 0.05;
    }

    // تطبيع الأوزان
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    for (const key in newWeights) {
      newWeights[key as keyof typeof newWeights] /= total;
    }

    this.personalizedWeights.set(userId, newWeights);
  }

  /**
   * الحصول على الأوزان المخصصة
   */
  private getPersonalizedWeights(userId: string): typeof this.baseWeights {
    return this.personalizedWeights.get(userId) || this.baseWeights;
  }

  /**
   * مساعدات
   */
  private categorizeSentiment(score: number): string {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  private calculateSimilarityPenalty(contentItem: ContentItem): number {
    // مثال مبسط، يمكن استخدام خوارزميات أكثر تعقيداً
    return 0.1;
  }

  private checkContentSimilarity(id1: string, id2: string): number {
    // مثال مبسط، يمكن استخدام مقارنة النصوص الفعلية
    const cacheKey = `${id1}-${id2}`;
    if (this.contentSimilarityCache.has(cacheKey)) {
      return this.contentSimilarityCache.get(cacheKey)!;
    }
    
    // حساب التشابه (مثال)
    const similarity = 0.2; // قيمة افتراضية
    this.contentSimilarityCache.set(cacheKey, similarity);
    
    return similarity;
  }

  private getRecentCategories(userProfile: UserProfile): string[] {
    // استخراج الفئات من آخر 10 تفاعلات
    const recentEvents = userProfile.engagementHistory.slice(-10);
    const categories = new Set<string>();
    
    // في بيئة حقيقية، سنحصل على الفئات من المحتوى المرتبط بالأحداث
    return Array.from(categories);
  }

  private getBestChannel(userProfile: UserProfile): DeliveryChannel {
    const preferences = userProfile.devicePreferences.channelPreferences;
    let bestChannel: DeliveryChannel = DeliveryChannel.IN_APP;
    let maxPreference = 0;
    
    for (const [channel, preference] of Object.entries(preferences)) {
      if (preference > maxPreference) {
        maxPreference = preference;
        bestChannel = channel as DeliveryChannel;
      }
    }
    
    return bestChannel;
  }

  private getTopInterests(userProfile: UserProfile, count: number): string[] {
    const interests = Object.entries(userProfile.interests)
      .filter(([key]) => !key.startsWith('entity_') && !key.startsWith('tag_'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key]) => key);
    
    return interests;
  }
}
