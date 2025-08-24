/**
 * نظام الولاء الذكي المحسن
 * يدير منح النقاط التلقائية لجميع أنشطة المستخدم
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// تعريف أنواع الأنشطة ونقاطها
export const LOYALTY_ACTIONS = {
  // القراءة والتفاعل الأساسي
  'article_view': { points: 2, description: 'عرض مقال', cooldown: 0 },
  'article_read': { points: 5, description: 'قراءة مقال كامل', cooldown: 300 }, // 5 دقائق
  'article_like': { points: 3, description: 'إعجاب بمقال', cooldown: 0 },
  'article_share': { points: 8, description: 'مشاركة مقال', cooldown: 60 }, // دقيقة واحدة
  'article_comment': { points: 10, description: 'تعليق على مقال', cooldown: 0 },
  'article_bookmark': { points: 4, description: 'حفظ مقال', cooldown: 0 },
  
  // التفاعل المتقدم
  'deep_read': { points: 15, description: 'قراءة عميقة (أكثر من 3 دقائق)', cooldown: 600 },
  'scroll_complete': { points: 7, description: 'قراءة المقال كاملاً', cooldown: 300 },
  'category_exploration': { points: 3, description: 'استكشاف قسم جديد', cooldown: 1800 }, // 30 دقيقة
  'search_usage': { points: 1, description: 'استخدام البحث', cooldown: 60 },
  'related_articles_click': { points: 2, description: 'النقر على مقال مشابه', cooldown: 0 },
  
  // الولاء والعودة
  'daily_visit': { points: 5, description: 'زيارة يومية', cooldown: 86400 }, // 24 ساعة
  'weekly_streak': { points: 25, description: 'أسبوع متواصل من الزيارات', cooldown: 0 },
  'monthly_active': { points: 100, description: 'نشاط شهري متواصل', cooldown: 0 },
  'return_visitor': { points: 3, description: 'زائر عائد', cooldown: 3600 }, // ساعة واحدة
  
  // التفاعل الاجتماعي والملف الشخصي
  'profile_complete': { points: 50, description: 'إكمال الملف الشخصي', cooldown: 0 },
  'profile_update': { points: 10, description: 'تحديث الملف الشخصي', cooldown: 86400 },
  'newsletter_signup': { points: 20, description: 'الاشتراك في النشرة', cooldown: 0 },
  'notification_enable': { points: 15, description: 'تفعيل الإشعارات', cooldown: 0 },
  'preferences_set': { points: 8, description: 'تحديد التفضيلات', cooldown: 86400 },
  
  // التفاعل مع المحتوى المتخصص
  'audio_listen': { points: 6, description: 'الاستماع لمحتوى صوتي', cooldown: 300 },
  'video_watch': { points: 8, description: 'مشاهدة فيديو', cooldown: 300 },
  'poll_participate': { points: 5, description: 'المشاركة في استطلاع', cooldown: 0 },
  'quiz_complete': { points: 12, description: 'إكمال اختبار', cooldown: 0 },
  
  // الإنجازات الخاصة
  'first_article_read': { points: 20, description: 'قراءة أول مقال', cooldown: 0 },
  'first_comment': { points: 25, description: 'أول تعليق', cooldown: 0 },
  'first_share': { points: 15, description: 'أول مشاركة', cooldown: 0 },
  'milestone_10_articles': { points: 50, description: 'قراءة 10 مقالات', cooldown: 0 },
  'milestone_50_articles': { points: 150, description: 'قراءة 50 مقال', cooldown: 0 },
  'milestone_100_articles': { points: 300, description: 'قراءة 100 مقال', cooldown: 0 }
} as const;

export type LoyaltyActionType = keyof typeof LOYALTY_ACTIONS;

// مستويات الولاء
export const LOYALTY_LEVELS = [
  { name: 'مبتدئ', nameEn: 'Beginner', minPoints: 0, maxPoints: 99, benefits: ['إشعارات أساسية'] },
  { name: 'نشط', nameEn: 'Active', minPoints: 100, maxPoints: 299, benefits: ['إشعارات مخصصة', 'محتوى مقترح'] },
  { name: 'مخلص', nameEn: 'Loyal', minPoints: 300, maxPoints: 699, benefits: ['محتوى حصري', 'أولوية في التعليقات'] },
  { name: 'خبير', nameEn: 'Expert', minPoints: 700, maxPoints: 1499, benefits: ['وصول مبكر للمحتوى', 'شارة خاصة'] },
  { name: 'سفير', nameEn: 'Ambassador', minPoints: 1500, maxPoints: null, benefits: ['جميع المزايا', 'دعوات خاصة', 'محتوى VIP'] }
];

export class LoyaltySystem {
  
  /**
   * منح نقاط الولاء للمستخدم
   */
  async awardPoints(
    userId: string, 
    actionType: LoyaltyActionType, 
    contentId?: string, 
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; points?: number; message?: string; newLevel?: string }> {
    try {
      const action = LOYALTY_ACTIONS[actionType];
      if (!action) {
        return { success: false, message: 'نوع النشاط غير صحيح' };
      }

      // فحص التكرار والـ cooldown
      const isDuplicate = await this.checkCooldown(userId, actionType, contentId, action.cooldown);
      if (isDuplicate) {
        return { success: false, message: 'تم منح النقاط مؤخراً لهذا النشاط' };
      }

      // الحصول على رصيد المستخدم الحالي
      const currentUser = await prisma.users.findUnique({
        where: { id: userId },
        select: { loyalty_points: true }
      });

      if (!currentUser) {
        return { success: false, message: 'المستخدم غير موجود' };
      }

      const oldBalance = currentUser.loyalty_points;
      const newBalance = oldBalance + action.points;

      // تسجيل المعاملة
      await prisma.loyaltyTransactions.create({
        data: {
          id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          points: action.points,
          transaction_type: 'earn',
          reason: action.description,
          reference_type: contentId ? 'content' : 'activity',
          reference_id: contentId || null,
          balance_after: newBalance,
          metadata: {
            action_type: actionType,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        }
      });

      // تحديث رصيد المستخدم
      await prisma.users.update({
        where: { id: userId },
        data: { loyalty_points: newBalance }
      });

      // فحص ترقية المستوى
      const levelUpgrade = await this.checkLevelUpgrade(oldBalance, newBalance);

      // تسجيل التفاعل
      await this.recordInteraction(userId, actionType, contentId, action.points, metadata);

      return {
        success: true,
        points: action.points,
        message: `تم منح ${action.points} نقطة - ${action.description}`,
        newLevel: levelUpgrade
      };

    } catch (error) {
      console.error('خطأ في منح نقاط الولاء:', error);
      return { success: false, message: 'حدث خطأ في النظام' };
    }
  }

  /**
   * فحص فترة الانتظار للنشاط
   */
  private async checkCooldown(
    userId: string, 
    actionType: LoyaltyActionType, 
    contentId?: string, 
    cooldownSeconds: number = 0
  ): Promise<boolean> {
    if (cooldownSeconds === 0) return false;

    const cutoffTime = new Date(Date.now() - (cooldownSeconds * 1000));
    
    const recentTransaction = await prisma.loyaltyTransactions.findFirst({
      where: {
        user_id: userId,
        metadata: {
          path: ['action_type'],
          equals: actionType
        },
        reference_id: contentId || null,
        created_at: {
          gte: cutoffTime
        }
      }
    });

    return !!recentTransaction;
  }

  /**
   * فحص ترقية المستوى
   */
  private async checkLevelUpgrade(oldPoints: number, newPoints: number): Promise<string | undefined> {
    const oldLevel = this.getUserLevel(oldPoints);
    const newLevel = this.getUserLevel(newPoints);
    
    if (oldLevel.name !== newLevel.name) {
      return newLevel.name;
    }
    
    return undefined;
  }

  /**
   * الحصول على مستوى المستخدم
   */
  getUserLevel(points: number) {
    for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
      const level = LOYALTY_LEVELS[i];
      if (points >= level.minPoints && (level.maxPoints === null || points <= level.maxPoints)) {
        return level;
      }
    }
    return LOYALTY_LEVELS[0]; // المستوى الأول كافتراضي
  }

  /**
   * تسجيل التفاعل
   */
  private async recordInteraction(
    userId: string, 
    actionType: string, 
    contentId?: string, 
    pointsEarned: number = 0, 
    metadata: Record<string, any> = {}
  ) {
    try {
      await prisma.userInteractions.create({
        data: {
          id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          article_id: contentId || null,
          interaction_type: actionType,
          interaction_value: metadata,
          points_earned: pointsEarned,
          session_id: metadata.sessionId || null,
          device_type: metadata.deviceType || null,
          ip_address: metadata.ipAddress || null,
          user_agent: metadata.userAgent || null
        }
      });
    } catch (error) {
      console.error('خطأ في تسجيل التفاعل:', error);
    }
  }

  /**
   * الحصول على إحصائيات المستخدم
   */
  async getUserStats(userId: string) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { loyalty_points: true }
      });

      if (!user) return null;

      const currentLevel = this.getUserLevel(user.loyalty_points);
      const nextLevel = LOYALTY_LEVELS.find(l => l.minPoints > user.loyalty_points);
      
      const recentTransactions = await prisma.loyaltyTransactions.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 10
      });

      const totalEarned = await prisma.loyaltyTransactions.aggregate({
        where: { 
          user_id: userId,
          transaction_type: 'earn'
        },
        _sum: { points: true }
      });

      return {
        currentPoints: user.loyalty_points,
        totalEarned: totalEarned._sum.points || 0,
        currentLevel,
        nextLevel,
        pointsToNextLevel: nextLevel ? nextLevel.minPoints - user.loyalty_points : 0,
        recentTransactions: recentTransactions.map(t => ({
          points: t.points,
          reason: t.reason,
          date: t.created_at,
          type: t.transaction_type
        }))
      };
    } catch (error) {
      console.error('خطأ في جلب إحصائيات المستخدم:', error);
      return null;
    }
  }

  /**
   * منح نقاط الإنجازات التلقائية
   */
  async checkAndAwardMilestones(userId: string) {
    try {
      // عدد المقالات المقروءة
      const articlesRead = await prisma.userInteractions.count({
        where: {
          user_id: userId,
          interaction_type: 'article_read'
        }
      });

      // فحص إنجازات القراءة
      const milestones = [
        { count: 1, action: 'first_article_read' as LoyaltyActionType },
        { count: 10, action: 'milestone_10_articles' as LoyaltyActionType },
        { count: 50, action: 'milestone_50_articles' as LoyaltyActionType },
        { count: 100, action: 'milestone_100_articles' as LoyaltyActionType }
      ];

      for (const milestone of milestones) {
        if (articlesRead >= milestone.count) {
          // فحص إذا تم منح هذا الإنجاز من قبل
          const existingAward = await prisma.loyaltyTransactions.findFirst({
            where: {
              user_id: userId,
              metadata: {
                path: ['action_type'],
                equals: milestone.action
              }
            }
          });

          if (!existingAward) {
            await this.awardPoints(userId, milestone.action);
          }
        }
      }

      // فحص التعليق الأول
      const firstComment = await prisma.userInteractions.findFirst({
        where: {
          user_id: userId,
          interaction_type: 'article_comment'
        }
      });

      if (firstComment) {
        const existingFirstComment = await prisma.loyaltyTransactions.findFirst({
          where: {
            user_id: userId,
            metadata: {
              path: ['action_type'],
              equals: 'first_comment'
            }
          }
        });

        if (!existingFirstComment) {
          await this.awardPoints(userId, 'first_comment');
        }
      }

      // فحص المشاركة الأولى
      const firstShare = await prisma.userInteractions.findFirst({
        where: {
          user_id: userId,
          interaction_type: 'article_share'
        }
      });

      if (firstShare) {
        const existingFirstShare = await prisma.loyaltyTransactions.findFirst({
          where: {
            user_id: userId,
            metadata: {
              path: ['action_type'],
              equals: 'first_share'
            }
          }
        });

        if (!existingFirstShare) {
          await this.awardPoints(userId, 'first_share');
        }
      }

    } catch (error) {
      console.error('خطأ في فحص الإنجازات:', error);
    }
  }

  /**
   * منح نقاط الزيارة اليومية
   */
  async awardDailyVisit(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingDailyVisit = await prisma.loyaltyTransactions.findFirst({
      where: {
        user_id: userId,
        metadata: {
          path: ['action_type'],
          equals: 'daily_visit'
        },
        created_at: {
          gte: today
        }
      }
    });

    if (!existingDailyVisit) {
      return await this.awardPoints(userId, 'daily_visit');
    }

    return { success: false, message: 'تم منح نقاط الزيارة اليومية مسبقاً' };
  }
}

// إنشاء مثيل واحد للاستخدام
export const loyaltySystem = new LoyaltySystem();
