/**
 * نظام تتبع السلوك الذكي المحسن
 * يتتبع جميع تفاعلات المستخدم ويحلل السلوك لتقديم محتوى مخصص
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BehaviorEvent {
  userId: string;
  sessionId: string;
  eventType: string;
  pageUrl: string;
  contentId?: string;
  contentCategory?: string;
  timeSpent?: number;
  scrollDepth?: number;
  clickCount?: number;
  metadata?: Record<string, any>;
}

export interface UserInterest {
  category: string;
  score: number;
  lastInteraction: Date;
  interactionCount: number;
}

export interface PersonalizedRecommendation {
  contentId: string;
  score: number;
  reason: string;
  category: string;
}

export class BehaviorTracker {
  
  /**
   * تسجيل حدث سلوكي
   */
  async trackEvent(event: BehaviorEvent): Promise<{ success: boolean; message?: string }> {
    try {
      // تسجيل الحدث في قاعدة البيانات
      await prisma.userInteractions.create({
        data: {
          id: `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: event.userId,
          article_id: event.contentId || null,
          interaction_type: event.eventType,
          interaction_value: {
            pageUrl: event.pageUrl,
            timeSpent: event.timeSpent,
            scrollDepth: event.scrollDepth,
            clickCount: event.clickCount,
            ...event.metadata
          },
          session_id: event.sessionId,
          device_type: event.metadata?.deviceType || null,
          ip_address: event.metadata?.ipAddress || null,
          user_agent: event.metadata?.userAgent || null
        }
      });

      // تحديث اهتمامات المستخدم إذا كان هناك فئة محتوى
      if (event.contentCategory) {
        await this.updateUserInterests(
          event.userId, 
          event.contentCategory, 
          this.calculateEngagementScore(event)
        );
      }

      // تحديث جلسة المستخدم
      await this.updateUserSession(event.userId, event.sessionId, event.metadata);

      return { success: true };

    } catch (error) {
      console.error('خطأ في تتبع السلوك:', error);
      return { success: false, message: 'فشل في تسجيل الحدث' };
    }
  }

  /**
   * حساب نقاط التفاعل بناءً على السلوك
   */
  private calculateEngagementScore(event: BehaviorEvent): number {
    let score = 1; // النقاط الأساسية

    // نقاط إضافية للوقت المقضي
    if (event.timeSpent) {
      if (event.timeSpent > 180) score += 5; // أكثر من 3 دقائق
      else if (event.timeSpent > 60) score += 3; // أكثر من دقيقة
      else if (event.timeSpent > 30) score += 1; // أكثر من 30 ثانية
    }

    // نقاط إضافية لعمق التمرير
    if (event.scrollDepth) {
      if (event.scrollDepth > 90) score += 4; // قراءة كاملة
      else if (event.scrollDepth > 70) score += 3; // قراءة جيدة
      else if (event.scrollDepth > 50) score += 2; // قراءة متوسطة
      else if (event.scrollDepth > 25) score += 1; // قراءة سطحية
    }

    // نقاط إضافية للنقرات (تفاعل نشط)
    if (event.clickCount && event.clickCount > 0) {
      score += Math.min(event.clickCount * 0.5, 3); // حد أقصى 3 نقاط للنقرات
    }

    // نقاط إضافية حسب نوع الحدث
    const eventTypeScores: Record<string, number> = {
      'article_like': 3,
      'article_share': 5,
      'article_comment': 4,
      'article_bookmark': 2,
      'search_usage': 1,
      'category_exploration': 2
    };

    if (eventTypeScores[event.eventType]) {
      score += eventTypeScores[event.eventType];
    }

    return Math.min(score, 20); // حد أقصى 20 نقطة
  }

  /**
   * تحديث اهتمامات المستخدم
   */
  async updateUserInterests(userId: string, category: string, engagementScore: number) {
    try {
      // البحث عن الاهتمام الموجود أو إنشاء جديد
      const existingInterest = await prisma.userDetailedPreferences.findFirst({
        where: {
          user_id: userId,
          preference_key: `interest_${category}`
        }
      });

      if (existingInterest) {
        // تحديث النقاط باستخدام متوسط مرجح
        const currentScore = parseFloat(existingInterest.preference_value) || 0;
        const interactionCount = parseInt(existingInterest.metadata?.toString() || '1');
        const newScore = (currentScore * 0.8) + (engagementScore * 0.2);
        
        await prisma.userDetailedPreferences.update({
          where: { id: existingInterest.id },
          data: {
            preference_value: newScore.toString(),
            metadata: (interactionCount + 1).toString(),
            updated_at: new Date()
          }
        });
      } else {
        // إنشاء اهتمام جديد
        await prisma.userDetailedPreferences.create({
          data: {
            id: `interest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            preference_key: `interest_${category}`,
            preference_value: engagementScore.toString(),
            metadata: '1' // عدد التفاعلات
          }
        });
      }

      // تحديث قائمة الاهتمامات في جدول المستخدمين
      await this.updateUserInterestsList(userId);

    } catch (error) {
      console.error('خطأ في تحديث اهتمامات المستخدم:', error);
    }
  }

  /**
   * تحديث قائمة اهتمامات المستخدم المجمعة
   */
  private async updateUserInterestsList(userId: string) {
    try {
      const interests = await prisma.userDetailedPreferences.findMany({
        where: {
          user_id: userId,
          preference_key: {
            startsWith: 'interest_'
          }
        },
        orderBy: {
          preference_value: 'desc'
        }
      });

      const interestsList = interests.map(interest => ({
        category: interest.preference_key.replace('interest_', ''),
        score: parseFloat(interest.preference_value),
        interactions: parseInt(interest.metadata?.toString() || '0')
      }));

      await prisma.users.update({
        where: { id: userId },
        data: {
          interests: interestsList
        }
      });

    } catch (error) {
      console.error('خطأ في تحديث قائمة الاهتمامات:', error);
    }
  }

  /**
   * تحديث جلسة المستخدم
   */
  private async updateUserSession(userId: string, sessionId: string, metadata?: Record<string, any>) {
    try {
      const existingSession = await prisma.userSessions.findFirst({
        where: {
          user_id: userId,
          session_token: sessionId
        }
      });

      if (existingSession) {
        await prisma.userSessions.update({
          where: { id: existingSession.id },
          data: {
            last_activity_at: new Date(),
            location: metadata?.location || existingSession.location
          }
        });
      } else {
        await prisma.userSessions.create({
          data: {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            session_token: sessionId,
            ip_address: metadata?.ipAddress || null,
            user_agent: metadata?.userAgent || null,
            device_type: metadata?.deviceType || null,
            location: metadata?.location || null
          }
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث الجلسة:', error);
    }
  }

  /**
   * الحصول على اهتمامات المستخدم
   */
  async getUserInterests(userId: string): Promise<UserInterest[]> {
    try {
      const interests = await prisma.userDetailedPreferences.findMany({
        where: {
          user_id: userId,
          preference_key: {
            startsWith: 'interest_'
          }
        },
        orderBy: {
          preference_value: 'desc'
        }
      });

      return interests.map(interest => ({
        category: interest.preference_key.replace('interest_', ''),
        score: parseFloat(interest.preference_value),
        lastInteraction: interest.updated_at,
        interactionCount: parseInt(interest.metadata?.toString() || '0')
      }));

    } catch (error) {
      console.error('خطأ في جلب اهتمامات المستخدم:', error);
      return [];
    }
  }

  /**
   * توليد توصيات مخصصة للمستخدم
   */
  async generatePersonalizedRecommendations(userId: string, limit: number = 10): Promise<PersonalizedRecommendation[]> {
    try {
      const userInterests = await this.getUserInterests(userId);
      
      if (userInterests.length === 0) {
        // إذا لم توجد اهتمامات، أرجع المحتوى الشائع
        return await this.getPopularContent(limit);
      }

      const recommendations: PersonalizedRecommendation[] = [];

      // جلب المحتوى لكل فئة اهتمام
      for (const interest of userInterests.slice(0, 5)) { // أفضل 5 اهتمامات
        const categoryContent = await this.getContentByCategory(interest.category, limit);
        
        for (const content of categoryContent) {
          const score = this.calculateRecommendationScore(content, interest, userId);
          
          recommendations.push({
            contentId: content.id,
            score,
            reason: `بناءً على اهتمامك بـ ${interest.category}`,
            category: interest.category
          });
        }
      }

      // ترتيب حسب النقاط وإرجاع أفضل النتائج
      recommendations.sort((a, b) => b.score - a.score);
      
      // تجنب التكرار
      const uniqueRecommendations = recommendations.filter((rec, index, arr) => 
        arr.findIndex(r => r.contentId === rec.contentId) === index
      );

      return uniqueRecommendations.slice(0, limit);

    } catch (error) {
      console.error('خطأ في توليد التوصيات:', error);
      return [];
    }
  }

  /**
   * حساب نقاط التوصية
   */
  private calculateRecommendationScore(content: any, userInterest: UserInterest, userId: string): number {
    let score = userInterest.score * 0.4; // 40% من نقاط الاهتمام

    // عامل الحداثة
    const daysSincePublished = Math.floor((Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const recencyScore = Math.max(0, 10 - daysSincePublished * 0.5);
    score += recencyScore * 0.2; // 20% للحداثة

    // عامل الشعبية
    const popularityScore = Math.min((content.views || 0) / 1000, 10);
    score += popularityScore * 0.2; // 20% للشعبية

    // عامل التنوع (تجنب التكرار المفرط)
    const diversityScore = this.calculateDiversityScore(userId, content.category);
    score += diversityScore * 0.2; // 20% للتنوع

    return Math.round(score * 100) / 100;
  }

  /**
   * حساب نقاط التنوع
   */
  private calculateDiversityScore(userId: string, category: string): number {
    // هذا مبسط - يمكن تحسينه لاحقاً بناءً على التاريخ الحقيقي
    return Math.random() * 5; // نقاط عشوائية للتنوع (0-5)
  }

  /**
   * جلب المحتوى حسب الفئة
   */
  private async getContentByCategory(category: string, limit: number) {
    try {
      return await prisma.articles.findMany({
        where: {
          category: category,
          status: 'published'
        },
        orderBy: [
          { created_at: 'desc' },
          { views: 'desc' }
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          views: true,
          created_at: true,
          slug: true
        }
      });
    } catch (error) {
      console.error('خطأ في جلب المحتوى حسب الفئة:', error);
      return [];
    }
  }

  /**
   * جلب المحتوى الشائع
   */
  private async getPopularContent(limit: number): Promise<PersonalizedRecommendation[]> {
    try {
      const popularArticles = await prisma.articles.findMany({
        where: {
          status: 'published'
        },
        orderBy: [
          { views: 'desc' },
          { created_at: 'desc' }
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          views: true
        }
      });

      return popularArticles.map((article, index) => ({
        contentId: article.id,
        score: 10 - (index * 0.5), // نقاط تنازلية
        reason: 'محتوى شائع',
        category: article.category || 'عام'
      }));

    } catch (error) {
      console.error('خطأ في جلب المحتوى الشائع:', error);
      return [];
    }
  }

  /**
   * تحليل أنماط السلوك
   */
  async analyzeBehaviorPatterns(userId: string) {
    try {
      const interactions = await prisma.userInteractions.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 100
      });

      // تحليل أوقات النشاط
      const activityHours = interactions.map(i => new Date(i.created_at).getHours());
      const peakHours = this.findPeakHours(activityHours);

      // تحليل أنواع المحتوى المفضلة
      const contentTypes = interactions
        .filter(i => i.interaction_value && typeof i.interaction_value === 'object')
        .map(i => (i.interaction_value as any)?.contentType)
        .filter(Boolean);

      // تحليل مدة الجلسات
      const sessions = await prisma.userSessions.findMany({
        where: { user_id: userId },
        orderBy: { started_at: 'desc' },
        take: 20
      });

      const avgSessionDuration = this.calculateAverageSessionDuration(sessions);

      return {
        peakActivityHours: peakHours,
        preferredContentTypes: this.getTopItems(contentTypes, 5),
        averageSessionDuration: avgSessionDuration,
        totalInteractions: interactions.length,
        lastActivity: interactions[0]?.created_at || null
      };

    } catch (error) {
      console.error('خطأ في تحليل أنماط السلوك:', error);
      return null;
    }
  }

  /**
   * العثور على ساعات الذروة
   */
  private findPeakHours(hours: number[]): number[] {
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  /**
   * الحصول على أفضل العناصر
   */
  private getTopItems(items: string[], limit: number): string[] {
    const itemCounts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * حساب متوسط مدة الجلسة
   */
  private calculateAverageSessionDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const durations = sessions
      .filter(s => s.last_activity_at && s.started_at)
      .map(s => new Date(s.last_activity_at).getTime() - new Date(s.started_at).getTime());

    if (durations.length === 0) return 0;

    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000 / 60; // بالدقائق
  }
}

// إنشاء مثيل واحد للاستخدام
export const behaviorTracker = new BehaviorTracker();
