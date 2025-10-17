/**
 * 🔔 خدمة الإشعارات الذكية (Smart Notification Service)
 * 
 * تدير إرسال الإشعارات للمستخدمين بناءً على:
 * - اهتماماتهم
 * - تفضيلاتهم
 * - قواعد الأولوية
 * - منع التكرار (Deduplication)
 * - التحكم في المعدل (Throttling)
 * 
 * @version 1.0.0
 */

import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// Types & Interfaces
// ========================================

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  icon: string;
  color: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  resourceId?: string; // للتحكم في التكرار
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  isBreaking?: boolean;
  isFeatured?: boolean;
}

// ========================================
// خرائط العرض (أيقونة/لون/نص)
// ========================================

const TYPE_CONFIG = {
  ARTICLE_PUBLISHED: {
    icon: 'bell',
    color: 'sky',
    priority: 'MEDIUM' as NotificationPriority,
    titleTemplate: 'خبر جديد',
    bodyTemplate: (data: ArticleData) => 
      `نُشر قبل قليل في ${data.categoryName || 'الأخبار'}: ${data.title}`
  },
  ARTICLE_BREAKING: {
    icon: 'flash',
    color: 'red',
    priority: 'HIGH' as NotificationPriority,
    titleTemplate: 'خبر عاجل',
    bodyTemplate: (data: ArticleData) => 
      `عاجل في ${data.categoryName || 'الأخبار'}: ${data.title}`
  },
  ARTICLE_FEATURED: {
    icon: 'star',
    color: 'violet',
    priority: 'HIGH' as NotificationPriority,
    titleTemplate: 'خبر مميّز',
    bodyTemplate: (data: ArticleData) => 
      `مختار لك: ${data.title}`
  },
  COMMENTS_SPIKE: {
    icon: 'message-circle',
    color: 'amber',
    priority: 'MEDIUM' as NotificationPriority,
    titleTemplate: 'يزداد نقاشه',
    bodyTemplate: (data: ArticleData) => 
      `التعليقات تتزايد على: ${data.title}`
  },
  READS_TOP: {
    icon: 'flame',
    color: 'orange',
    priority: 'LOW' as NotificationPriority,
    titleTemplate: 'الأكثر تداولاً',
    bodyTemplate: (data: ArticleData) => 
      `ضمن الأكثر قراءة: ${data.title}`
  },
  USER_REPLY: {
    icon: 'reply',
    color: 'emerald',
    priority: 'HIGH' as NotificationPriority,
    titleTemplate: 'رد جديد',
    bodyTemplate: (data: any) => 
      `تم الرد على تعليقك في: ${data.articleTitle}`
  },
  SYSTEM_ANNOUNCEMENT: {
    icon: 'bell',
    color: 'slate',
    priority: 'MEDIUM' as NotificationPriority,
    titleTemplate: 'إعلان',
    bodyTemplate: (data: any) => data.message || 'لديك إعلان جديد'
  }
} as const;

// ========================================
// Notification Bus (In-Memory Event Emitter)
// ========================================

type NotificationListener = (payload: NotificationPayload) => void;

class NotificationBus {
  private listeners: Map<string, Set<NotificationListener>> = new Map();

  subscribe(userId: string, listener: NotificationListener): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    
    this.listeners.get(userId)!.add(listener);

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        userListeners.delete(listener);
        if (userListeners.size === 0) {
          this.listeners.delete(userId);
        }
      }
    };
  }

  emit(userId: string, payload: NotificationPayload): void {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  getActiveConnections(): number {
    return this.listeners.size;
  }
}

// Global singleton
export const notificationBus = new NotificationBus();

// ========================================
// Smart Notification Service
// ========================================

class SmartNotificationService {
  /**
   * إرسال إشعار لمستخدم واحد
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // 1. التحقق من التفضيلات
      const canSend = await this.checkUserPreferences(payload.userId, payload.type);
      if (!canSend) {
        console.log(`⏭️  Skipped notification for user ${payload.userId} - preferences`);
        return false;
      }

      // 2. التحقق من التكرار (Deduplication)
      if (payload.resourceId) {
        const isDuplicate = await this.checkDeduplication(
          payload.userId,
          payload.type,
          payload.resourceId
        );
        if (isDuplicate) {
          console.log(`⏭️  Skipped notification for user ${payload.userId} - duplicate`);
          return false;
        }
      }

      // 3. التحقق من الحد الأقصى/ساعة (Throttling)
      const isThrottled = await this.checkThrottling(payload.userId);
      if (isThrottled) {
        console.log(`⏭️  Skipped notification for user ${payload.userId} - throttled`);
        return false;
      }

      // 4. حفظ الإشعار في قاعدة البيانات
      const notification = await prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          link: payload.link,
          icon: payload.icon,
          color: payload.color,
          priority: payload.priority,
          metadata: payload.metadata || {}
        }
      });

      // 5. إضافة سجل dedup إذا كان هناك resourceId
      if (payload.resourceId) {
        await this.createDedupRecord(
          payload.userId,
          payload.type,
          payload.resourceId
        );
      }

      // 6. بث الإشعار عبر SSE
      notificationBus.emit(payload.userId, payload);

      console.log(`✅ Notification sent to user ${payload.userId}: ${payload.title}`);
      return true;

    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار لعدة مستخدمين
   */
  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<number> {
    let sentCount = 0;

    for (const payload of payloads) {
      const sent = await this.sendNotification(payload);
      if (sent) sentCount++;
    }

    return sentCount;
  }

  /**
   * إشعار عند نشر مقال
   */
  async notifyArticlePublished(article: ArticleData): Promise<number> {
    // جلب المستخدمين المهتمين
    const interestedUsers = await this.getInterestedUsers(
      article.categoryId,
      article.tags
    );

    const payloads: NotificationPayload[] = interestedUsers.map(userId => {
      const config = TYPE_CONFIG.ARTICLE_PUBLISHED;
      return {
        userId,
        type: 'ARTICLE_PUBLISHED',
        title: config.titleTemplate,
        body: config.bodyTemplate(article),
        link: `/article/${article.slug}`,
        icon: config.icon,
        color: config.color,
        priority: config.priority,
        resourceId: article.id,
        metadata: {
          articleId: article.id,
          categoryId: article.categoryId
        }
      };
    });

    return await this.sendBulkNotifications(payloads);
  }

  /**
   * إشعار عند نشر خبر عاجل
   */
  async notifyArticleBreaking(article: ArticleData): Promise<number> {
    // الأخبار العاجلة ترسل لجميع المستخدمين النشطين
    const activeUsers = await this.getActiveUsers();

    const config = TYPE_CONFIG.ARTICLE_BREAKING;
    const payloads: NotificationPayload[] = activeUsers.map(userId => ({
      userId,
      type: 'ARTICLE_BREAKING',
      title: config.titleTemplate,
      body: config.bodyTemplate(article),
      link: `/article/${article.slug}`,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      resourceId: article.id,
      metadata: {
        articleId: article.id,
        isBreaking: true
      }
    }));

    return await this.sendBulkNotifications(payloads);
  }

  /**
   * إشعار عند تمييز مقال
   */
  async notifyArticleFeatured(article: ArticleData): Promise<number> {
    const interestedUsers = await this.getInterestedUsers(
      article.categoryId,
      article.tags
    );

    const config = TYPE_CONFIG.ARTICLE_FEATURED;
    const payloads: NotificationPayload[] = interestedUsers.map(userId => ({
      userId,
      type: 'ARTICLE_FEATURED',
      title: config.titleTemplate,
      body: config.bodyTemplate(article),
      link: `/article/${article.slug}`,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      resourceId: article.id,
      metadata: {
        articleId: article.id,
        isFeatured: true
      }
    }));

    return await this.sendBulkNotifications(payloads);
  }

  /**
   * إشعار عند ارتفاع التعليقات
   */
  async notifyCommentsSpike(article: ArticleData): Promise<number> {
    const interestedUsers = await this.getInterestedUsers(
      article.categoryId,
      article.tags
    );

    const config = TYPE_CONFIG.COMMENTS_SPIKE;
    const payloads: NotificationPayload[] = interestedUsers.map(userId => ({
      userId,
      type: 'COMMENTS_SPIKE',
      title: config.titleTemplate,
      body: config.bodyTemplate(article),
      link: `/article/${article.slug}#comments`,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      resourceId: `${article.id}-comments-spike`,
      metadata: {
        articleId: article.id
      }
    }));

    return await this.sendBulkNotifications(payloads);
  }

  /**
   * إشعار عند دخول المقال ضمن الأكثر قراءة
   */
  async notifyReadsTop(article: ArticleData): Promise<number> {
    const interestedUsers = await this.getInterestedUsers(
      article.categoryId,
      article.tags
    );

    const config = TYPE_CONFIG.READS_TOP;
    const payloads: NotificationPayload[] = interestedUsers.map(userId => ({
      userId,
      type: 'READS_TOP',
      title: config.titleTemplate,
      body: config.bodyTemplate(article),
      link: `/article/${article.slug}`,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      resourceId: `${article.id}-reads-top`,
      metadata: {
        articleId: article.id
      }
    }));

    return await this.sendBulkNotifications(payloads);
  }

  /**
   * إشعار عند الرد على تعليق المستخدم
   */
  async notifyUserReply(
    userId: string,
    articleTitle: string,
    articleSlug: string,
    commentId: string
  ): Promise<boolean> {
    const config = TYPE_CONFIG.USER_REPLY;
    
    return await this.sendNotification({
      userId,
      type: 'USER_REPLY',
      title: config.titleTemplate,
      body: config.bodyTemplate({ articleTitle }),
      link: `/article/${articleSlug}#comment-${commentId}`,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      resourceId: commentId,
      metadata: {
        commentId,
        articleSlug
      }
    });
  }

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * التحقق من تفضيلات المستخدم
   */
  private async checkUserPreferences(
    userId: string,
    type: NotificationType
  ): Promise<boolean> {
    const prefs = await prisma.userNotificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) return true; // افتراضياً مفعّل

    const typeMap: Record<NotificationType, keyof typeof prefs> = {
      ARTICLE_PUBLISHED: 'articlePublished',
      ARTICLE_BREAKING: 'articleBreaking',
      ARTICLE_FEATURED: 'articleFeatured',
      COMMENTS_SPIKE: 'commentsSpike',
      READS_TOP: 'readsTop',
      USER_REPLY: 'userReply',
      SYSTEM_ANNOUNCEMENT: 'articlePublished' // استخدام نفس الإعداد
    };

    const prefKey = typeMap[type];
    return prefs[prefKey] as boolean;
  }

  /**
   * التحقق من التكرار
   */
  private async checkDeduplication(
    userId: string,
    type: string,
    resourceId: string
  ): Promise<boolean> {
    const existing = await prisma.notificationDedup.findUnique({
      where: {
        userId_type_resourceId: {
          userId,
          type,
          resourceId
        }
      }
    });

    return existing !== null;
  }

  /**
   * إنشاء سجل dedup
   */
  private async createDedupRecord(
    userId: string,
    type: string,
    resourceId: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 دقيقة

    await prisma.notificationDedup.create({
      data: {
        userId,
        type,
        resourceId,
        expiresAt
      }
    });
  }

  /**
   * التحقق من الحد الأقصى/ساعة
   */
  private async checkThrottling(userId: string): Promise<boolean> {
    const prefs = await prisma.userNotificationPreference.findUnique({
      where: { userId },
      select: { throttlePerHour: true }
    });

    const limit = prefs?.throttlePerHour || 8;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await prisma.notification.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo
        }
      }
    });

    return count >= limit;
  }

  /**
   * جلب المستخدمين المهتمين بتصنيف/وسوم معينة
   */
  private async getInterestedUsers(
    categoryId?: string,
    tags?: string[]
  ): Promise<string[]> {
    // جلب المستخدمين الذين لديهم اهتمامات تتطابق
    const users = await prisma.user_interests.findMany({
      where: {
        OR: [
          categoryId ? { category_id: categoryId } : {},
          tags && tags.length > 0 ? { tag_name: { in: tags } } : {}
        ]
      },
      select: {
        user_id: true
      },
      distinct: ['user_id']
    });

    return users.map(u => u.user_id);
  }

  /**
   * جلب المستخدمين النشطين (آخر 7 أيام)
   */
  private async getActiveUsers(): Promise<string[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const users = await prisma.users.findMany({
      where: {
        last_login_at: {
          gte: sevenDaysAgo
        },
        status: 'active'
      },
      select: {
        id: true
      }
    });

    return users.map(u => u.id);
  }

  /**
   * تنظيف سجلات dedup المنتهية
   */
  async cleanupExpiredDedup(): Promise<number> {
    const result = await prisma.notificationDedup.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} expired dedup records`);
    return result.count;
  }
}

// ========================================
// Singleton Export
// ========================================

let serviceInstance: SmartNotificationService | null = null;

export function getSmartNotificationService(): SmartNotificationService {
  if (!serviceInstance) {
    serviceInstance = new SmartNotificationService();
  }
  return serviceInstance;
}

export default SmartNotificationService;

