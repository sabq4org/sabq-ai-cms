/**
 * محلل الاهتمامات المحسن مع دعم اللغة العربية
 * Enhanced Interest Analyzer with Arabic Language Support
 */

import { UserProfile, ContentItem, EngagementEvent } from '../types';

// أنواع تطور الاهتمامات
export enum InterestEvolutionType {
  EMERGING = 'emerging',      // ناشئة
  STABLE = 'stable',         // مستقرة
  DECLINING = 'declining',   // متراجعة
  SEASONAL = 'seasonal'      // موسمية
}

// كلمات الإيقاف العربية
const ARABIC_STOPWORDS = [
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
  'التي', 'الذي', 'اللذان', 'اللتان', 'الذين', 'اللواتي',
  'كان', 'كانت', 'يكون', 'تكون', 'أن', 'إن', 'لكن', 'غير',
  'بعد', 'قبل', 'أثناء', 'خلال', 'عند', 'لدى', 'حول', 'نحو', 'ضد'
];

export class EnhancedInterestAnalyzer {
  private interestDecayRate = 0.95;  // معدل تلاشي الاهتمامات
  private minInterestThreshold = 0.1; // الحد الأدنى للاهتمام
  private categories = [
    'سياسة', 'اقتصاد', 'رياضة', 'تقنية', 'صحة', 'ثقافة',
    'فن', 'علوم', 'تعليم', 'سفر', 'طبخ', 'موضة'
  ];

  /**
   * تحليل اهتمامات المستخدم بطريقة محسنة
   */
  async analyzeUserInterests(
    userId: string,
    readingHistory: ContentItem[],
    interactionHistory: EngagementEvent[]
  ): Promise<UserProfile> {
    console.log(`تحليل اهتمامات المستخدم: ${userId}`);

    // تحليل المحتوى المقروء
    const contentInterests = this.analyzeContentInterests(readingHistory);
    
    // تحليل الأنماط الزمنية
    const temporalPatterns = this.analyzeTemporalPatterns(readingHistory);
    
    // تحليل التفاعلات الاجتماعية
    const socialInterests = this.analyzeSocialInteractions(interactionHistory);
    
    // تحليل تطور الاهتمامات
    const interestEvolution = this.analyzeInterestEvolution(userId, readingHistory);
    
    // دمج جميع الإشارات
    const combinedInterests = this.combineInterestSignals(
      contentInterests, 
      socialInterests, 
      temporalPatterns
    );
    
    // تطبيق تلاشي الاهتمامات
    const decayedInterests = this.applyInterestDecay(combinedInterests);
    
    // تحليل تفضيلات المشاعر
    const sentimentPreferences = this.analyzeSentimentPreferences(readingHistory);

    // بناء ملف المستخدم
    const userProfile: UserProfile = {
      userId,
      interests: decayedInterests,
      readingPatterns: {
        hourlyDistribution: temporalPatterns.hourlyDistribution,
        dailyDistribution: temporalPatterns.dailyDistribution,
        peakHours: temporalPatterns.peakHours,
        averageSessionDuration: this.calculateAverageSessionDuration(readingHistory),
        averageReadingSpeed: this.calculateAverageReadingSpeed(readingHistory),
        averageCompletionRate: this.calculateAverageCompletionRate(readingHistory),
        preferredContentLength: this.determinePreferredContentLength(readingHistory),
        readingConsistency: this.calculateReadingConsistency(temporalPatterns)
      },
      engagementHistory: interactionHistory.slice(-100), // آخر 100 تفاعل
      temporalPreferences: {
        preferredHours: temporalPatterns.peakHours,
        quietHours: this.calculateQuietHours(temporalPatterns),
        weekendPreferences: this.analyzeWeekendPreferences(readingHistory),
        timezone: this.detectTimezone()
      },
      devicePreferences: this.extractDevicePreferences(readingHistory),
      sentimentPreferences,
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

    return userProfile;
  }

  /**
   * تحليل المحتوى للحصول على الاهتمامات
   */
  private analyzeContentInterests(readingHistory: ContentItem[]): Record<string, number> {
    const interests: Record<string, number> = {};

    for (const item of readingHistory) {
      // حساب وزن المقال بناءً على التفاعل
      const engagementWeight = this.calculateEngagementWeight(item);
      
      // تحديث اهتمامات الفئة
      const category = item.category;
      if (!interests[category]) {
        interests[category] = 0;
      }
      interests[category] += engagementWeight;
      
      // تحليل الكيانات المذكورة
      for (const entity of item.entities) {
        const entityKey = `entity_${entity}`;
        if (!interests[entityKey]) {
          interests[entityKey] = 0;
        }
        interests[entityKey] += engagementWeight * 0.5;
      }
      
      // تحليل العلامات
      for (const tag of item.tags || []) {
        const tagKey = `tag_${tag}`;
        if (!interests[tagKey]) {
          interests[tagKey] = 0;
        }
        interests[tagKey] += engagementWeight * 0.3;
      }
    }

    // تطبيع النتائج
    return this.normalizeInterests(interests);
  }

  /**
   * حساب وزن التفاعل للمقال
   */
  private calculateEngagementWeight(item: ContentItem): number {
    const baseWeight = 1.0;
    
    // وزن إضافي للمقالات عالية الجودة
    const qualityBonus = item.qualityScore * 0.3;
    
    // وزن إضافي بناءً على مقاييس التفاعل
    const metrics = item.engagementMetrics;
    const engagementBonus = (
      (metrics.completionRate || 0) * 0.4 +
      (metrics.averageTimeSpent ? Math.min(metrics.averageTimeSpent / 300, 1) : 0) * 0.3 +
      (metrics.likes > 0 ? 0.1 : 0) +
      (metrics.shares > 0 ? 0.1 : 0) +
      (metrics.comments > 0 ? 0.1 : 0)
    );
    
    return baseWeight + qualityBonus + engagementBonus;
  }

  /**
   * تحليل الأنماط الزمنية
   */
  private analyzeTemporalPatterns(readingHistory: ContentItem[]): any {
    const patterns = {
      hourlyDistribution: new Array(24).fill(0),
      dailyDistribution: new Array(7).fill(0),
      peakHours: [] as number[],
      totalSessions: 0
    };

    for (const item of readingHistory) {
      const date = new Date(item.publishTime);
      const hour = date.getHours();
      const day = date.getDay();
      
      patterns.hourlyDistribution[hour]++;
      patterns.dailyDistribution[day]++;
      patterns.totalSessions++;
    }

    // تحديد ساعات الذروة
    const avgHourly = patterns.hourlyDistribution.reduce((a, b) => a + b, 0) / 24;
    patterns.peakHours = patterns.hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count > avgHourly * 1.2)
      .map(item => item.hour);

    return patterns;
  }

  /**
   * تحليل التفاعلات الاجتماعية
   */
  private analyzeSocialInteractions(interactions: EngagementEvent[]): Record<string, number> {
    const socialInterests: Record<string, number> = {};

    for (const interaction of interactions) {
      const weight = this.getInteractionWeight(interaction.eventType);
      
      // تحديث الاهتمامات بناءً على نوع التفاعل
      const interestKey = `social_${interaction.eventType}`;
      if (!socialInterests[interestKey]) {
        socialInterests[interestKey] = 0;
      }
      socialInterests[interestKey] += weight;
    }

    return this.normalizeInterests(socialInterests);
  }

  /**
   * الحصول على وزن التفاعل
   */
  private getInteractionWeight(eventType: string): number {
    const weights: Record<string, number> = {
      'click': 0.2,
      'read': 0.3,
      'like': 0.5,
      'share': 0.8,
      'comment': 1.0,
      'bookmark': 0.7
    };
    return weights[eventType] || 0.1;
  }

  /**
   * تحليل تطور الاهتمامات
   */
  private analyzeInterestEvolution(
    userId: string, 
    readingHistory: ContentItem[]
  ): Record<string, InterestEvolutionType> {
    const evolution: Record<string, InterestEvolutionType> = {};
    
    // تقسيم التاريخ إلى نوافذ زمنية
    const timeWindows = this.createTimeWindows(readingHistory);
    
    for (const category of this.categories) {
      const trend = this.analyzeCategoryTrend(category, timeWindows);
      evolution[category] = trend;
    }

    return evolution;
  }

  /**
   * دمج إشارات الاهتمامات
   */
  private combineInterestSignals(
    contentInterests: Record<string, number>,
    socialInterests: Record<string, number>,
    temporalPatterns: any
  ): Record<string, number> {
    const combined: Record<string, number> = {};

    // دمج اهتمامات المحتوى (وزن 60%)
    for (const [key, value] of Object.entries(contentInterests)) {
      combined[key] = value * 0.6;
    }

    // دمج الاهتمامات الاجتماعية (وزن 30%)
    for (const [key, value] of Object.entries(socialInterests)) {
      if (!combined[key]) combined[key] = 0;
      combined[key] += value * 0.3;
    }

    // إضافة مكافأة للفئات النشطة في ساعات الذروة (وزن 10%)
    if (temporalPatterns.peakHours.length > 0) {
      for (const category of this.categories) {
        if (combined[category]) {
          combined[category] += 0.1;
        }
      }
    }

    return this.normalizeInterests(combined);
  }

  /**
   * تطبيق تلاشي الاهتمامات
   */
  private applyInterestDecay(interests: Record<string, number>): Record<string, number> {
    const decayedInterests: Record<string, number> = {};

    for (const [interest, score] of Object.entries(interests)) {
      // تطبيق معدل التلاشي
      const decayedScore = score * this.interestDecayRate;
      
      // الاحتفاظ بالاهتمامات فوق الحد الأدنى فقط
      if (decayedScore >= this.minInterestThreshold) {
        decayedInterests[interest] = decayedScore;
      }
    }

    return decayedInterests;
  }

  /**
   * تحليل تفضيلات المشاعر
   */
  private analyzeSentimentPreferences(readingHistory: ContentItem[]): Record<string, number> {
    const sentimentCounts: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    for (const item of readingHistory) {
      const sentiment = this.categorizeSentiment(item.sentimentScore);
      sentimentCounts[sentiment]++;
    }

    // تطبيع النتائج
    const total = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);
    const preferences: Record<string, number> = {};
    
    for (const [sentiment, count] of Object.entries(sentimentCounts)) {
      preferences[sentiment] = total > 0 ? count / total : 0.33;
    }

    return preferences;
  }

  /**
   * تصنيف المشاعر
   */
  private categorizeSentiment(score: number): string {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  /**
   * تطبيع الاهتمامات
   */
  private normalizeInterests(interests: Record<string, number>): Record<string, number> {
    const total = Object.values(interests).reduce((a, b) => a + b, 0);
    if (total === 0) return interests;

    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(interests)) {
      normalized[key] = value / total;
    }

    return normalized;
  }

  /**
   * حساب متوسط مدة الجلسة
   */
  private calculateAverageSessionDuration(readingHistory: ContentItem[]): number {
    if (readingHistory.length === 0) return 0;
    
    const totalTime = readingHistory.reduce((sum, item) => {
      return sum + (item.engagementMetrics.averageTimeSpent || 0);
    }, 0);
    
    return totalTime / readingHistory.length;
  }

  /**
   * حساب متوسط سرعة القراءة
   */
  private calculateAverageReadingSpeed(readingHistory: ContentItem[]): number {
    // افتراض متوسط 250 كلمة في الدقيقة
    return 250;
  }

  /**
   * حساب متوسط معدل الإكمال
   */
  private calculateAverageCompletionRate(readingHistory: ContentItem[]): number {
    if (readingHistory.length === 0) return 0;
    
    const totalCompletion = readingHistory.reduce((sum, item) => {
      return sum + (item.engagementMetrics.completionRate || 0);
    }, 0);
    
    return totalCompletion / readingHistory.length;
  }

  /**
   * تحديد طول المحتوى المفضل
   */
  private determinePreferredContentLength(readingHistory: ContentItem[]): 'short' | 'medium' | 'long' {
    const lengths = readingHistory.map(item => item.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    if (avgLength < 500) return 'short';
    if (avgLength < 1500) return 'medium';
    return 'long';
  }

  /**
   * حساب ثبات القراءة
   */
  private calculateReadingConsistency(patterns: any): number {
    const distribution = patterns.hourlyDistribution;
    const mean = distribution.reduce((a: number, b: number) => a + b, 0) / distribution.length;
    
    if (mean === 0) return 0;
    
    const variance = distribution.reduce((sum: number, val: number) => {
      return sum + Math.pow(val - mean, 2);
    }, 0) / distribution.length;
    
    const stdDev = Math.sqrt(variance);
    return 1 - (stdDev / mean); // كلما قل التباين، زاد الثبات
  }

  /**
   * حساب ساعات الهدوء
   */
  private calculateQuietHours(patterns: any): { start: number; end: number }[] {
    const quietHours: { start: number; end: number }[] = [];
    const threshold = patterns.hourlyDistribution.reduce((a: number, b: number) => a + b, 0) / 24 * 0.3;
    
    let quietStart = -1;
    for (let hour = 0; hour < 24; hour++) {
      if (patterns.hourlyDistribution[hour] < threshold) {
        if (quietStart === -1) quietStart = hour;
      } else if (quietStart !== -1) {
        quietHours.push({ start: quietStart, end: hour - 1 });
        quietStart = -1;
      }
    }
    
    // التعامل مع الحالة عند نهاية اليوم
    if (quietStart !== -1) {
      quietHours.push({ start: quietStart, end: 23 });
    }
    
    return quietHours;
  }

  /**
   * تحليل تفضيلات نهاية الأسبوع
   */
  private analyzeWeekendPreferences(readingHistory: ContentItem[]): boolean {
    const weekendReading = readingHistory.filter(item => {
      const day = new Date(item.publishTime).getDay();
      return day === 0 || day === 6; // الأحد والسبت
    });
    
    return weekendReading.length > readingHistory.length * 0.3;
  }

  /**
   * اكتشاف المنطقة الزمنية
   */
  private detectTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }

  /**
   * استخراج تفضيلات الأجهزة
   */
  private extractDevicePreferences(readingHistory: ContentItem[]): any {
    // في بيئة حقيقية، سيتم استخراج هذا من بيانات الجلسة
    return {
      preferredDevices: ['mobile', 'desktop'],
      channelPreferences: {
        'web_push': 0.8,
        'mobile_push': 0.9,
        'email': 0.6,
        'sms': 0.3,
        'in_app': 1.0,
        'websocket': 0.7
      },
      platformSpecificSettings: {}
    };
  }

  /**
   * إنشاء نوافذ زمنية
   */
  private createTimeWindows(readingHistory: ContentItem[]): any[] {
    // تقسيم التاريخ إلى نوافذ أسبوعية
    const windows: any[] = [];
    const windowSize = 7 * 24 * 60 * 60 * 1000; // أسبوع بالميللي ثانية
    
    if (readingHistory.length === 0) return windows;
    
    const sortedHistory = [...readingHistory].sort((a, b) => 
      new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()
    );
    
    const startTime = new Date(sortedHistory[0].publishTime).getTime();
    const endTime = new Date(sortedHistory[sortedHistory.length - 1].publishTime).getTime();
    
    for (let time = startTime; time <= endTime; time += windowSize) {
      const windowEnd = time + windowSize;
      const windowItems = sortedHistory.filter(item => {
        const itemTime = new Date(item.publishTime).getTime();
        return itemTime >= time && itemTime < windowEnd;
      });
      
      windows.push({
        start: new Date(time),
        end: new Date(windowEnd),
        items: windowItems
      });
    }
    
    return windows;
  }

  /**
   * تحليل اتجاه الفئة
   */
  private analyzeCategoryTrend(category: string, timeWindows: any[]): InterestEvolutionType {
    const categoryFrequencies = timeWindows.map(window => {
      const categoryItems = window.items.filter((item: ContentItem) => item.category === category);
      return categoryItems.length / (window.items.length || 1);
    });
    
    if (categoryFrequencies.length < 2) return InterestEvolutionType.STABLE;
    
    // حساب الاتجاه
    const firstHalf = categoryFrequencies.slice(0, Math.floor(categoryFrequencies.length / 2));
    const secondHalf = categoryFrequencies.slice(Math.floor(categoryFrequencies.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / (firstAvg || 1);
    
    if (change > 0.3) return InterestEvolutionType.EMERGING;
    if (change < -0.3) return InterestEvolutionType.DECLINING;
    
    // التحقق من الموسمية
    const variance = this.calculateVariance(categoryFrequencies);
    if (variance > 0.2) return InterestEvolutionType.SEASONAL;
    
    return InterestEvolutionType.STABLE;
  }

  /**
   * حساب التباين
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}
