/**
 * 🎯 نظام التتبع الموحد والذكي
 * يربط جميع الأنشطة بنقاط الولاء والملف الشخصي
 */

import prisma from '@/lib/prisma';

// أنواع التفاعل المدعومة
export type InteractionType = 'like' | 'save' | 'share' | 'comment' | 'view' | 'read' | 'bookmark';

// قواعد النقاط الموحدة (متطابقة مع صفحة نظام الولاء)
export const UNIFIED_POINTS_RULES = {
  'read': 2,           // قراءة مقال (30+ ثانية)
  'read_long': 3,      // قراءة طويلة (60+ ثانية) 
  'like': 1,           // إعجاب
  'save': 2,           // حفظ
  'comment': 4,        // تعليق
  'share': 5,          // مشاركة
  'bookmark': 2,       // إشارة مرجعية
  'notification_open': 2, // فتح إشعار
  'referral': 20,      // دعوة صديق
  'streak_bonus': 10,  // مكافأة القراءة المتتالية
  'monthly_activity': 100, // النشاط الشهري
  'completion_bonus': 50,  // قارئ متفاني
  'diversity_bonus': 30,   // مستخدم متفاعل
} as const;

// حدود يومية لمنع التلاعب
export const DAILY_LIMITS = {
  'like': 20,
  'save': 50,
  'comment': 10,
  'share': 10,
  'notification_open': 5,
  'read': 100,
  'read_long': 50,
} as const;

// حدود لكل مقال
export const ARTICLE_LIMITS = {
  'like': 1,
  'save': 1,
  'read': 1,
  'bookmark': 1,
} as const;

interface TrackingData {
  userId: string;
  articleId: string;
  interactionType: InteractionType;
  metadata?: {
    readingTime?: number;
    scrollPercentage?: number;
    source?: string;
    deviceType?: string;
    sessionId?: string;
  };
}

interface TrackingResult {
  success: boolean;
  pointsAwarded: number;
  totalPoints: number;
  level: string;
  message: string;
  limitReached?: boolean;
  alreadyExists?: boolean;
}

/**
 * النظام الموحد لتتبع جميع التفاعلات
 */
export class UnifiedTrackingSystem {
  
  /**
   * تسجيل تفاعل جديد مع التحقق من الحدود ومنح النقاط
   */
  static async trackInteraction(data: TrackingData): Promise<TrackingResult> {
    const { userId, articleId, interactionType, metadata = {} } = data;
    
    try {
      console.log('🎯 تتبع تفاعل موحد:', { userId, articleId, interactionType });

      // 1. التحقق من وجود المستخدم والمقال
      const [user, article] = await Promise.all([
        prisma.users.findUnique({ where: { id: userId } }),
        prisma.articles.findUnique({ where: { id: articleId } })
      ]);

      if (!user || !article) {
        return {
          success: false,
          pointsAwarded: 0,
          totalPoints: 0,
          level: 'برونزي',
          message: 'المستخدم أو المقال غير موجود'
        };
      }

      // 2. التحقق من الحدود اليومية
      const dailyLimit = DAILY_LIMITS[interactionType as keyof typeof DAILY_LIMITS];
      if (dailyLimit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayInteractions = await prisma.interactions.count({
          where: {
            user_id: userId,
            type: interactionType,
            created_at: { gte: today }
          }
        });

        if (todayInteractions >= dailyLimit) {
          return {
            success: false,
            pointsAwarded: 0,
            totalPoints: await this.getUserTotalPoints(userId),
            level: await this.getUserLevel(userId),
            message: `تم الوصول للحد الأقصى اليومي (${dailyLimit})`,
            limitReached: true
          };
        }
      }

      // 3. التحقق من حدود المقال
      const articleLimit = ARTICLE_LIMITS[interactionType as keyof typeof ARTICLE_LIMITS];
      if (articleLimit) {
        const existingInteraction = await prisma.interactions.findFirst({
          where: {
            user_id: userId,
            article_id: articleId,
            type: interactionType
          }
        });

        if (existingInteraction) {
          return {
            success: false,
            pointsAwarded: 0,
            totalPoints: await this.getUserTotalPoints(userId),
            level: await this.getUserLevel(userId),
            message: 'تم تسجيل هذا التفاعل مسبقاً لهذا المقال',
            alreadyExists: true
          };
        }
      }

      // 4. تسجيل التفاعل
      const interaction = await prisma.interactions.create({
        data: {
          id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          article_id: articleId,
          type: interactionType,
          created_at: new Date()
        }
      });

      // 5. تحديث إحصائيات المقال
      await this.updateArticleStats(articleId, interactionType);

      // 6. منح نقاط الولاء
      const points = UNIFIED_POINTS_RULES[interactionType as keyof typeof UNIFIED_POINTS_RULES] || 0;
      let pointsAwarded = 0;
      
      if (points > 0) {
        await prisma.loyalty_points.create({
          data: {
            id: `lp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            points,
            action: interactionType,
            reference_id: articleId,
            reference_type: 'article',
            metadata: {
              interactionId: interaction.id,
              ...metadata,
              timestamp: new Date().toISOString()
            },
            created_at: new Date()
          }
        });
        pointsAwarded = points;
      }

      // 7. فحص المكافآت الخاصة
      const bonusPoints = await this.checkSpecialBonuses(userId, interactionType, articleId);
      pointsAwarded += bonusPoints;

      // 8. حساب النقاط الإجمالية والمستوى
      const totalPoints = await this.getUserTotalPoints(userId);
      const level = await this.getUserLevel(userId);

      // 9. تحديث ملف المستخدم
      await this.updateUserProfile(userId, interactionType, metadata);

      return {
        success: true,
        pointsAwarded,
        totalPoints,
        level,
        message: `تم تسجيل ${interactionType} وحصلت على ${pointsAwarded} نقطة`
      };

    } catch (error) {
      console.error('❌ خطأ في النظام الموحد:', error);
      return {
        success: false,
        pointsAwarded: 0,
        totalPoints: 0,
        level: 'برونزي',
        message: 'حدث خطأ في تسجيل التفاعل'
      };
    }
  }

  /**
   * تحديث إحصائيات المقال
   */
  private static async updateArticleStats(articleId: string, interactionType: InteractionType) {
    const updateData: any = {};
    
    switch (interactionType) {
      case 'like':
        updateData.likes = { increment: 1 };
        break;
      case 'save':
      case 'bookmark':
        updateData.saves = { increment: 1 };
        break;
      case 'share':
        updateData.shares = { increment: 1 };
        break;
      case 'view':
      case 'read':
        updateData.views = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.articles.update({
        where: { id: articleId },
        data: updateData
      });
    }
  }

  /**
   * فحص المكافآت الخاصة
   */
  private static async checkSpecialBonuses(userId: string, interactionType: InteractionType, articleId: string): Promise<number> {
    let bonusPoints = 0;

    try {
      // مكافأة القراءة المتتالية (5 مقالات في جلسة واحدة)
      if (interactionType === 'read') {
        const recentReads = await prisma.interactions.count({
          where: {
            user_id: userId,
            type: 'read',
            created_at: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // آخر ساعة
            }
          }
        });

        if (recentReads >= 5 && recentReads % 5 === 0) {
          // تحقق من عدم منح المكافأة اليوم
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayBonus = await prisma.loyalty_points.findFirst({
            where: {
              user_id: userId,
              action: 'streak_bonus',
              created_at: { gte: today }
            }
          });

          if (!todayBonus) {
            await prisma.loyalty_points.create({
              data: {
                id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: userId,
                points: UNIFIED_POINTS_RULES.streak_bonus,
                action: 'streak_bonus',
                reference_id: articleId,
                reference_type: 'article',
                metadata: {
                  type: 'reading_streak',
                  articlesCount: recentReads,
                  timestamp: new Date().toISOString()
                },
                created_at: new Date()
              }
            });
            bonusPoints += UNIFIED_POINTS_RULES.streak_bonus;
          }
        }
      }

      // فحص النشاط الشهري (30+ تفاعل في الشهر)
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyInteractions = await prisma.interactions.count({
        where: {
          user_id: userId,
          created_at: { gte: monthStart }
        }
      });

      if (monthlyInteractions >= 30) {
        const monthlyBonus = await prisma.loyalty_points.findFirst({
          where: {
            user_id: userId,
            action: 'monthly_activity',
            created_at: { gte: monthStart }
          }
        });

        if (!monthlyBonus) {
          await prisma.loyalty_points.create({
            data: {
              id: `monthly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              user_id: userId,
              points: UNIFIED_POINTS_RULES.monthly_activity,
              action: 'monthly_activity',
              metadata: {
                type: 'monthly_bonus',
                interactionsCount: monthlyInteractions,
                timestamp: new Date().toISOString()
              },
              created_at: new Date()
            }
          });
          bonusPoints += UNIFIED_POINTS_RULES.monthly_activity;
        }
      }

    } catch (error) {
      console.error('خطأ في فحص المكافآت الخاصة:', error);
    }

    return bonusPoints;
  }

  /**
   * حساب إجمالي نقاط المستخدم
   */
  static async getUserTotalPoints(userId: string): Promise<number> {
    const result = await prisma.loyalty_points.aggregate({
      where: { user_id: userId },
      _sum: { points: true }
    });
    return result._sum.points || 0;
  }

  /**
   * تحديد مستوى المستخدم
   */
  static async getUserLevel(userId: string): Promise<string> {
    const totalPoints = await this.getUserTotalPoints(userId);
    
    if (totalPoints >= 2000) return 'بلاتيني';
    if (totalPoints >= 500) return 'ذهبي';
    if (totalPoints >= 100) return 'فضي';
    return 'برونزي';
  }

  /**
   * تحديث ملف المستخدم
   */
  private static async updateUserProfile(userId: string, interactionType: InteractionType, metadata: any) {
    try {
      // تحديث آخر نشاط
      await prisma.users.update({
        where: { id: userId },
        data: { 
          updated_at: new Date()
        }
      });

      // يمكن إضافة المزيد من التحديثات هنا حسب الحاجة
      
    } catch (error) {
      console.error('خطأ في تحديث ملف المستخدم:', error);
    }
  }

  /**
   * جلب إحصائيات المستخدم الشاملة
   */
  static async getUserStats(userId: string) {
    try {
      const [interactions, loyaltyPoints, user] = await Promise.all([
        prisma.interactions.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' }
        }),
        prisma.loyalty_points.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' }
        }),
        prisma.users.findUnique({ where: { id: userId } })
      ]);

      // حساب الإحصائيات
      const stats = {
        totalInteractions: interactions.length,
        totalLikes: interactions.filter(i => i.type === 'like').length,
        totalSaves: interactions.filter(i => i.type === 'save').length,
        totalShares: interactions.filter(i => i.type === 'share').length,
        totalComments: interactions.filter(i => i.type === 'comment').length,
        totalViews: interactions.filter(i => i.type === 'view' || i.type === 'read').length,
        totalPoints: loyaltyPoints.reduce((sum, lp) => sum + lp.points, 0),
        level: await this.getUserLevel(userId),
        joinDate: user?.created_at,
        lastActivity: user?.updated_at
      };

      return {
        success: true,
        stats,
        interactions: interactions.slice(0, 50), // آخر 50 تفاعل
        loyaltyHistory: loyaltyPoints.slice(0, 50) // آخر 50 نقطة
      };

    } catch (error) {
      console.error('خطأ في جلب إحصائيات المستخدم:', error);
      return {
        success: false,
        error: 'فشل في جلب الإحصائيات'
      };
    }
  }

  /**
   * تفعيل التتبع التلقائي لمقال
   */
  static async enableAutoTracking(articleId: string, userId: string) {
    // تسجيل بداية جلسة القراءة
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      trackView: () => this.trackInteraction({
        userId,
        articleId,
        interactionType: 'view',
        metadata: { sessionId }
      }),
      trackRead: (readingTime: number) => this.trackInteraction({
        userId,
        articleId,
        interactionType: readingTime >= 60 ? 'read_long' : 'read',
        metadata: { sessionId, readingTime }
      }),
      trackLike: () => this.trackInteraction({
        userId,
        articleId,
        interactionType: 'like',
        metadata: { sessionId }
      }),
      trackSave: () => this.trackInteraction({
        userId,
        articleId,
        interactionType: 'save',
        metadata: { sessionId }
      }),
      trackShare: (platform?: string) => this.trackInteraction({
        userId,
        articleId,
        interactionType: 'share',
        metadata: { sessionId, platform }
      })
    };
  }
}

export default UnifiedTrackingSystem;
