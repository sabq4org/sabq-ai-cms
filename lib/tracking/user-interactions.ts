// نظام تتبع تفاعلات المستخدم المتقدم - سبق الذكية
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { SecurityManager } from '../auth/user-management';
import { AdvancedEncryption } from '../auth/security-standards';
import { z } from 'zod';

const prisma = new PrismaClient();

// تعريف أنواع التفاعلات
export type InteractionType = 'like' | 'save' | 'share' | 'comment' | 'view' | 'reading_session';

// Schema للتحقق من صحة بيانات التفاعل
export const InteractionEventSchema = z.object({
  article_id: z.string().min(1, 'معرف المقال مطلوب'),
  interaction_type: z.enum(['like', 'save', 'share', 'comment', 'view', 'reading_session']),
  interaction_value: z.any().optional(), // بيانات إضافية حسب نوع التفاعل
  timestamp: z.string().datetime().optional(),
  session_id: z.string().optional(),
  context: z.object({
    device_type: z.string().optional(),
    browser_type: z.string().optional(),
    screen_resolution: z.string().optional(),
    referrer: z.string().optional(),
    page_url: z.string().optional(),
    user_agent: z.string().optional(),
    ip_address: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      city: z.string().optional(),
      timezone: z.string().optional()
    }).optional()
  }).optional()
});

export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

// فئة إدارة تتبع التفاعلات
export class UserInteractionTracker {
  private static readonly BATCH_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 30000; // 30 ثانية
  private static eventQueue: InteractionEvent[] = [];
  private static processingQueue = false;

  /**
   * تسجيل تفاعل مستخدم
   */
  static async trackInteraction(
    userId: string | null,
    event: InteractionEvent,
    request?: NextRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من صحة البيانات
      const validatedEvent = InteractionEventSchema.parse(event);

      // إضافة بيانات السياق من الطلب
      const contextData = this.extractContextFromRequest(request);
      const enrichedEvent = {
        ...validatedEvent,
        context: {
          ...validatedEvent.context,
          ...contextData
        },
        timestamp: validatedEvent.timestamp || new Date().toISOString()
      };

      // إضافة إلى قائمة الانتظار للمعالجة المجمعة
      this.eventQueue.push(enrichedEvent);

      // معالجة فورية للتفاعلات المهمة (لايك، حفظ)
      if (['like', 'save'].includes(enrichedEvent.interaction_type)) {
        await this.processInteractionImmediate(userId, enrichedEvent);
      }

      // معالجة مجمعة للباقي
      this.scheduleProcessing();

      // تسجيل النشاط للمراقبة
      await this.logInteractionActivity(userId, enrichedEvent);

      return { success: true };

    } catch (error: any) {
      console.error('❌ خطأ في تتبع التفاعل:', error);
      return { 
        success: false, 
        error: error.message || 'فشل في تتبع التفاعل' 
      };
    }
  }

  /**
   * معالجة فورية للتفاعلات المهمة
   */
  private static async processInteractionImmediate(
    userId: string | null,
    event: InteractionEvent
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // تسجيل في جدول interactions الأساسي
        await tx.interactions.upsert({
          where: {
            user_id_article_id_type: {
              user_id: userId || 'anonymous',
              article_id: event.article_id,
              type: event.interaction_type as any
            }
          },
          update: {
            created_at: new Date(event.timestamp!)
          },
          create: {
            id: SecurityManager.generateSecureToken(16),
            user_id: userId || 'anonymous',
            article_id: event.article_id,
            type: event.interaction_type as any,
            created_at: new Date(event.timestamp!)
          }
        });

        // تحديث عدادات المقال
        await this.updateArticleCounters(tx, event.article_id, event.interaction_type, 1);

        // تسجيل في جدول UserInteractions المفصل
        if (userId) {
          await tx.userInteractions.create({
            data: {
              id: SecurityManager.generateSecureToken(16),
              user_id: userId,
              article_id: event.article_id,
              interaction_type: event.interaction_type,
              interaction_value: event.interaction_value || null,
              session_id: event.context?.user_agent ? 
                SecurityManager.generateSecureToken(8) : null,
              device_type: event.context?.device_type,
              ip_address: event.context?.ip_address,
              user_agent: event.context?.user_agent,
              points_earned: this.calculatePoints(event.interaction_type),
              created_at: new Date(event.timestamp!)
            }
          });

          // إضافة نقاط الولاء
          await this.awardLoyaltyPoints(tx, userId, event.interaction_type);
        }
      });

    } catch (error) {
      console.error('❌ خطأ في المعالجة الفورية للتفاعل:', error);
      throw error;
    }
  }

  /**
   * معالجة مجمعة للأحداث
   */
  private static scheduleProcessing(): void {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    // معالجة فورية إذا امتلأت القائمة
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flushEventQueue();
      return;
    }

    // معالجة دورية
    setTimeout(() => {
      this.flushEventQueue();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * تفريغ قائمة الأحداث ومعالجتها
   */
  private static async flushEventQueue(): Promise<void> {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;
    const eventsToProcess = this.eventQueue.splice(0, this.BATCH_SIZE);

    try {
      console.log(`🔄 معالجة مجمعة لـ ${eventsToProcess.length} حدث تفاعل`);

      // تجميع الأحداث حسب النوع لتحسين الأداء
      const groupedEvents = this.groupEventsByType(eventsToProcess);

      await prisma.$transaction(async (tx) => {
        for (const [eventType, events] of Object.entries(groupedEvents)) {
          await this.processBatchByType(tx, eventType as InteractionType, events);
        }
      });

      console.log(`✅ تمت معالجة ${eventsToProcess.length} حدث تفاعل بنجاح`);

    } catch (error) {
      console.error('❌ خطأ في المعالجة المجمعة:', error);
      
      // إعادة الأحداث إلى القائمة في حالة الفشل
      this.eventQueue.unshift(...eventsToProcess);

    } finally {
      this.processingQueue = false;
      
      // معالجة الأحداث المتبقية إن وجدت
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.flushEventQueue(), 5000);
      }
    }
  }

  /**
   * معالجة الأحداث حسب النوع
   */
  private static async processBatchByType(
    tx: any,
    eventType: InteractionType,
    events: InteractionEvent[]
  ): Promise<void> {
    switch (eventType) {
      case 'view':
        await this.processBatchViews(tx, events);
        break;
      case 'reading_session':
        await this.processBatchReadingSessions(tx, events);
        break;
      case 'share':
        await this.processBatchShares(tx, events);
        break;
      case 'comment':
        await this.processBatchComments(tx, events);
        break;
      default:
        console.warn(`⚠️ نوع حدث غير مدعوم: ${eventType}`);
    }
  }

  /**
   * معالجة مجمعة للمشاهدات
   */
  private static async processBatchViews(tx: any, events: InteractionEvent[]): Promise<void> {
    // تجميع المشاهدات حسب المقال
    const viewsByArticle = events.reduce((acc, event) => {
      acc[event.article_id] = (acc[event.article_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // تحديث عدادات المشاهدات
    for (const [articleId, viewCount] of Object.entries(viewsByArticle)) {
      await tx.articles.update({
        where: { id: articleId },
        data: { views: { increment: viewCount } }
      });
    }

    // تسجيل في Analytics
    await this.recordAnalyticsData(tx, 'views', viewsByArticle);
  }

  /**
   * معالجة مجمعة لجلسات القراءة
   */
  private static async processBatchReadingSessions(tx: any, events: InteractionEvent[]): Promise<void> {
    for (const event of events) {
      if (event.interaction_value) {
        await tx.user_reading_sessions.create({
          data: {
            id: SecurityManager.generateSecureToken(16),
            user_id: event.interaction_value.user_id || 'anonymous',
            article_id: event.article_id,
            started_at: new Date(event.interaction_value.started_at),
            ended_at: event.interaction_value.ended_at ? 
              new Date(event.interaction_value.ended_at) : null,
            duration_seconds: event.interaction_value.duration_seconds,
            read_percentage: event.interaction_value.read_percentage,
            scroll_depth: event.interaction_value.scroll_depth,
            device_type: event.context?.device_type,
            time_of_day: new Date(event.timestamp!).getHours(),
            created_at: new Date(event.timestamp!)
          }
        });
      }
    }
  }

  /**
   * معالجة مجمعة للمشاركات
   */
  private static async processBatchShares(tx: any, events: InteractionEvent[]): Promise<void> {
    const sharesByArticle = events.reduce((acc, event) => {
      acc[event.article_id] = (acc[event.article_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [articleId, shareCount] of Object.entries(sharesByArticle)) {
      await tx.articles.update({
        where: { id: articleId },
        data: { shares: { increment: shareCount } }
      });
    }
  }

  /**
   * تحديث عدادات المقال
   */
  private static async updateArticleCounters(
    tx: any,
    articleId: string,
    interactionType: string,
    increment: number
  ): Promise<void> {
    const updateData: any = {};

    switch (interactionType) {
      case 'like':
        updateData.likes = { increment };
        break;
      case 'save':
        updateData.saves = { increment };
        break;
      case 'share':
        updateData.shares = { increment };
        break;
      case 'view':
        updateData.views = { increment };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.articles.update({
        where: { id: articleId },
        data: updateData
      });
    }
  }

  /**
   * حساب النقاط للتفاعل
   */
  private static calculatePoints(interactionType: string): number {
    const pointsMap: Record<string, number> = {
      'view': 1,
      'like': 2,
      'save': 3,
      'share': 5,
      'comment': 10,
      'reading_session': 1
    };

    return pointsMap[interactionType] || 0;
  }

  /**
   * منح نقاط الولاء
   */
  private static async awardLoyaltyPoints(
    tx: any,
    userId: string,
    interactionType: string
  ): Promise<void> {
    const points = this.calculatePoints(interactionType);
    
    if (points > 0) {
      // تحديث نقاط المستخدم
      await tx.users.update({
        where: { id: userId },
        data: { loyalty_points: { increment: points } }
      });

      // تسجيل معاملة النقاط
      await tx.loyaltyTransactions.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          user_id: userId,
          points: points,
          transaction_type: 'earned',
          reason: `تفاعل: ${interactionType}`,
          reference_type: 'interaction',
          reference_id: SecurityManager.generateSecureToken(8),
          balance_after: 0, // سيتم تحديثه بـ trigger
          created_at: new Date()
        }
      });
    }
  }

  /**
   * استخراج بيانات السياق من الطلب
   */
  private static extractContextFromRequest(request?: NextRequest): any {
    if (!request) return {};

    const userAgent = request.headers.get('user-agent') || '';
    
    return {
      ip_address: SecurityManager.cleanIpAddress(request as any),
      user_agent: userAgent,
      device_type: this.detectDeviceType(userAgent),
      browser_type: this.detectBrowserType(userAgent),
      referrer: request.headers.get('referer'),
      page_url: request.url
    };
  }

  /**
   * كشف نوع الجهاز
   */
  private static detectDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  /**
   * كشف نوع المتصفح
   */
  private static detectBrowserType(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'chrome';
    if (/firefox/i.test(userAgent)) return 'firefox';
    if (/safari/i.test(userAgent)) return 'safari';
    if (/edge/i.test(userAgent)) return 'edge';
    return 'other';
  }

  /**
   * تجميع الأحداث حسب النوع
   */
  private static groupEventsByType(events: InteractionEvent[]): Record<string, InteractionEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.interaction_type]) {
        acc[event.interaction_type] = [];
      }
      acc[event.interaction_type].push(event);
      return acc;
    }, {} as Record<string, InteractionEvent[]>);
  }

  /**
   * تسجيل بيانات التحليلات
   */
  private static async recordAnalyticsData(
    tx: any,
    metricType: string,
    data: Record<string, number>
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    
    for (const [key, value] of Object.entries(data)) {
      await tx.analytics_data.upsert({
        where: {
          date_metric_name: {
            date: new Date(date),
            metric_name: `${metricType}_${key}`
          }
        },
        update: {
          metric_value: { increment: value }
        },
        create: {
          id: SecurityManager.generateSecureToken(16),
          date: new Date(date),
          metric_name: `${metricType}_${key}`,
          metric_value: value,
          dimensions: { article_id: key },
          created_at: new Date()
        }
      });
    }
  }

  /**
   * تسجيل نشاط التفاعل للمراقبة
   */
  private static async logInteractionActivity(
    userId: string | null,
    event: InteractionEvent
  ): Promise<void> {
    try {
      await prisma.activity_logs.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          user_id: userId,
          action: `interaction_${event.interaction_type}`,
          entity_type: 'user_interaction',
          entity_id: event.article_id,
          metadata: {
            interaction_type: event.interaction_type,
            timestamp: event.timestamp,
            context: event.context,
            interaction_value: event.interaction_value
          },
          ip_address: event.context?.ip_address,
          user_agent: event.context?.user_agent,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('⚠️ فشل في تسجيل نشاط التفاعل:', error);
    }
  }

  /**
   * الحصول على إحصائيات التفاعل
   */
  static async getInteractionStats(
    articleId?: string,
    userId?: string,
    timeRange?: { from: Date; to: Date }
  ): Promise<any> {
    try {
      const whereClause: any = {};
      
      if (articleId) whereClause.article_id = articleId;
      if (userId) whereClause.user_id = userId;
      if (timeRange) {
        whereClause.created_at = {
          gte: timeRange.from,
          lte: timeRange.to
        };
      }

      const stats = await prisma.userInteractions.groupBy({
        by: ['interaction_type'],
        where: whereClause,
        _count: {
          interaction_type: true
        },
        _sum: {
          points_earned: true
        }
      });

      return {
        success: true,
        stats: stats.reduce((acc, stat) => {
          acc[stat.interaction_type] = {
            count: stat._count.interaction_type,
            total_points: stat._sum.points_earned || 0
          };
          return acc;
        }, {} as Record<string, any>)
      };

    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات التفاعل:', error);
      return { success: false, error: 'فشل في جلب الإحصائيات' };
    }
  }

  /**
   * تنظيف البيانات القديمة
   */
  static async cleanupOldData(daysToKeep: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      console.log(`🧹 تنظيف بيانات التفاعل الأقدم من ${cutoffDate.toLocaleDateString()}`);

      const deletedCount = await prisma.userInteractions.deleteMany({
        where: {
          created_at: { lt: cutoffDate }
        }
      });

      console.log(`✅ تم حذف ${deletedCount.count} سجل تفاعل قديم`);

    } catch (error) {
      console.error('❌ خطأ في تنظيف البيانات القديمة:', error);
    }
  }
}

export default UserInteractionTracker;
