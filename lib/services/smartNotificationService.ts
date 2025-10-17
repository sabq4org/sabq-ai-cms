/**
 * 🔔 خدمة الإشعارات الذكية
 * إدارة شاملة لإنشاء وإرسال وتتبع الإشعارات
 */

import prisma from '@/lib/prisma';
import { NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client';

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  category?: string;
  data?: Record<string, any>;
  scheduled_at?: Date;
  delivery_channels?: string[];
  ai_optimized?: boolean;
}

export interface NotificationFilters {
  user_id?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

export class SmartNotificationService {
  /**
   * إنشاء إشعار واحد
   */
  static async createNotification(input: CreateNotificationInput) {
    try {
      const notification = await prisma.smartNotifications.create({
        data: {
          user_id: input.user_id,
          title: input.title,
          message: input.message,
          type: input.type,
          priority: input.priority || 'medium',
          category: input.category,
          data: input.data,
          scheduled_at: input.scheduled_at,
          delivery_channels: input.delivery_channels || ['in-app'],
          ai_optimized: input.ai_optimized || false,
          status: 'pending' as const
        }
      });

      return notification;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
      throw error;
    }
  }

  /**
   * إنشاء إشعارات متعددة دفعة واحدة
   * (أسرع بكثير من إنشاء واحد تلو الآخر)
   */
  static async createBulkNotifications(inputs: CreateNotificationInput[]) {
    try {
      if (inputs.length === 0) return { count: 0 };

      const notifications = await prisma.smartNotifications.createMany({
        data: inputs.map(input => ({
          user_id: input.user_id,
          title: input.title,
          message: input.message,
          type: input.type,
          priority: input.priority || 'medium',
          category: input.category,
          data: input.data,
          scheduled_at: input.scheduled_at,
          delivery_channels: input.delivery_channels || ['in-app'],
          ai_optimized: input.ai_optimized || false,
          status: 'pending' as const
        }))
      });

      console.log(`✅ تم إنشاء ${notifications.count} إشعار`);
      return notifications;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعارات:', error);
      throw error;
    }
  }

  /**
   * جلب إشعارات المستخدم
   */
  static async getUserNotifications(
    userId: string,
    filters?: Omit<NotificationFilters, 'user_id'>
  ) {
    try {
      const limit = filters?.limit || 30;
      const offset = filters?.offset || 0;

      const where: any = { user_id: userId };

      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.type) {
        where.type = filters.type;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }

      const [notifications, total] = await Promise.all([
        prisma.smartNotifications.findMany({
          where,
          orderBy: [
            { status: 'asc' }, // pending أولاً
            { created_at: 'desc' }
          ],
          take: limit,
          skip: offset
        }),
        prisma.smartNotifications.count({ where })
      ]);

      return {
        data: notifications,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
      throw error;
    }
  }

  /**
   * جلب الإشعارات غير المقروءة فقط
   */
  static async getUnreadNotifications(userId: string, limit = 20) {
    try {
      return await prisma.smartNotifications.findMany({
        where: {
          user_id: userId,
          status: 'pending'
        },
        orderBy: { created_at: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات غير المقروءة:', error);
      throw error;
    }
  }

  /**
   * عد الإشعارات غير المقروءة
   */
  static async getUnreadCount(userId: string) {
    try {
      return await prisma.smartNotifications.count({
        where: {
          user_id: userId,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('❌ خطأ في عد الإشعارات غير المقروءة:', error);
      return 0;
    }
  }

  /**
   * تحديث حالة الإشعار
   */
  static async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus
  ) {
    try {
      return await prisma.smartNotifications.update({
        where: { id: notificationId },
        data: {
          status,
          ...(status === 'read' && { read_at: new Date() })
        }
      });
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الإشعار:', error);
      throw error;
    }
  }

  /**
   * تحديث جميع إشعارات المستخدم إلى مقروء
   */
  static async markAllAsRead(userId: string) {
    try {
      return await prisma.smartNotifications.updateMany({
        where: {
          user_id: userId,
          status: 'pending'
        },
        data: {
          status: 'read',
          read_at: new Date()
        }
      });
    } catch (error) {
      console.error('❌ خطأ في تحديث الإشعارات:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعارات للمستخدمين المهتمين بفئة معينة
   * (مستخدم عند نشر خبر جديد)
   */
  static async sendToInterestedUsers(
    articleId: string,
    articleTitle: string,
    categoryName: string,
    categorySlug: string,
    isBreaking: boolean = false,
    articleUrl?: string
  ) {
    try {
      console.log(`🔔 جاري إرسال إشعارات عن الخبر: ${articleTitle}`);

      // جلب جميع المستخدمين المهتمين بهذه الفئة
      const interestedUsers = await prisma.users.findMany({
        where: {
          status: 'active',
          // البحث عن الفئة في حقل interests (JSON)
          OR: [
            {
              interests: {
                not: 'null'
              }
            }
          ]
        },
        select: { id: true, interests: true }
      });

      // تصفية المستخدمين الذين لديهم اهتمام بهذه الفئة
      const filteredUsers = interestedUsers.filter(user => {
        try {
          const interests = Array.isArray(user.interests) ? user.interests : (typeof user.interests === 'string' ? JSON.parse(user.interests) : []);
          return interests.includes(categorySlug) || interests.includes(categoryName);
        } catch (e) {
          return false;
        }
      });

      if (filteredUsers.length === 0) {
        console.log('⚠️ لم يتم العثور على مستخدمين مهتمين بهذه الفئة');
        return { count: 0 };
      }

      // إنشاء الإشعارات
      const notificationType = isBreaking ? 'article_breaking' : 'article_published';
      const notificationPriority = isBreaking ? 'critical' : 'high';

      const notificationInputs: any[] = filteredUsers.map(user => ({
        user_id: user.id,
        title: isBreaking ? `🚨 خبر عاجل: ${articleTitle}` : `📰 خبر جديد: ${articleTitle}`,
        message: `تم نشر خبر جديد في فئة ${categoryName}`,
        type: notificationType,
        priority: notificationPriority,
        category: categoryName,
        data: {
          articleId,
          articleTitle,
          categoryName,
          categorySlug,
          articleUrl,
          isBreaking
        },
        delivery_channels: ['in-app', 'email'],
        ai_optimized: true
      }));

      const result = await this.createBulkNotifications(notificationInputs);

      console.log(`✅ تم إرسال ${notificationInputs.length} إشعار للمستخدمين المهتمين`);
      return { count: notificationInputs.length };
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعارات:', error);
      throw error;
    }
  }

  /**
   * حذف إشعار
   */
  static async deleteNotification(notificationId: string) {
    try {
      return await prisma.smartNotifications.delete({
        where: { id: notificationId }
      });
    } catch (error) {
      console.error('❌ خطأ في حذف الإشعار:', error);
      throw error;
    }
  }

  /**
   * حذف الإشعارات القديمة
   */
  static async deleteOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.smartNotifications.deleteMany({
        where: {
          created_at: {
            lt: cutoffDate
          },
          status: { in: ['read', 'dismissed'] }
        }
      });

      console.log(`✅ تم حذف ${result.count} إشعار قديم`);
      return result;
    } catch (error) {
      console.error('❌ خطأ في حذف الإشعارات القديمة:', error);
      throw error;
    }
  }

  /**
   * إحصائيات الإشعارات
   */
  static async getNotificationStats(userId: string) {
    try {
      const [total, pending, read, dismissed] = await Promise.all([
        prisma.smartNotifications.count({
          where: { user_id: userId }
        }),
        prisma.smartNotifications.count({
          where: { user_id: userId, status: 'pending' }
        }),
        prisma.smartNotifications.count({
          where: { user_id: userId, status: 'read' }
        }),
        prisma.smartNotifications.count({
          where: { user_id: userId, status: 'dismissed' }
        })
      ]);

      return {
        total,
        pending,
        read,
        dismissed,
        unreadPercentage: total > 0 ? Math.round((pending / total) * 100) : 0
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات الإشعارات:', error);
      throw error;
    }
  }
}

export default SmartNotificationService;
