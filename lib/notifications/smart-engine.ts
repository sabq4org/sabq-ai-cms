// محرك الإشعارات الذكية - سبق الذكية
import prisma from '@/lib/prisma';
import { RedisClient } from '@/lib/redis-client';
import { WebSocketManager } from './websocket-manager';

export interface SmartNotificationData {
  userId: string;
  type: 'new_article' | 'new_comment' | 'recommendation' | 'daily_digest' | 'author_follow';
  title: string;
  message: string;
  entityId?: string;
  entityType?: 'article' | 'comment' | 'author';
  category?: string;
  articleId?: string;
  authorId?: string;
  commentId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: any;
}

export class SmartNotificationEngine {
  private static redis = RedisClient;
  private static wsManager = WebSocketManager;

  /**
   * تولید إشعار ذكي جديد
   */
  static async createNotification(data: SmartNotificationData): Promise<boolean> {
    try {
      console.log('🔔 إنشاء إشعار ذكي:', data.title);

      // إنشاء الإشعار في قاعدة البيانات
      const notification = await prisma.smartNotifications.create({
        data: {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: this.mapNotificationType(data.type),
          priority: this.mapPriority(data.priority || 'medium'),
          category: data.category,
          data: {
            entityId: data.entityId,
            entityType: data.entityType,
            articleId: data.articleId,
            authorId: data.authorId,
            commentId: data.commentId,
            ...data.metadata
          },
          status: 'pending',
          delivery_channels: ['web', 'push'],
          ai_optimized: true,
          personalization_score: await this.calculatePersonalizationScore(data),
          created_at: new Date()
        }
      });

      // إرسال فوري عبر WebSocket
      await this.deliverNotification(notification.id, data.userId);

      console.log('✅ تم إنشاء الإشعار بنجاح:', notification.id);
      return true;

    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
      return false;
    }
  }

  /**
   * إشعار عند نشر مقال جديد في تصنيف يهتم به المستخدم
   */
  static async notifyNewArticleInCategory(articleId: string, categoryId: string): Promise<void> {
    try {
      console.log('📰 معالجة إشعارات مقال جديد في التصنيف:', categoryId);
      console.log('🔍 معرف المقال:', articleId);

      // جلب المقال
      const article = await prisma.articles.findUnique({
        where: { id: articleId },
        include: {
          categories: true,
          author: true,
          article_author: true,
        }
      });

      if (!article) return;

      // العثور على المستخدمين المهتمين بهذا التصنيف
      const interestedUsers = await this.findUsersInterestedInCategory(categoryId);

      console.log(`👥 عدد المستخدمين المهتمين: ${interestedUsers.length}`);

      // إنشاء إشعارات للمستخدمين
      for (const userId of interestedUsers) {
        // الحصول على اسم التصنيف من كائن categories (علاقة مفردة في Prisma)
        const categoryName = article.categories?.name || 'التصنيف المفضل';
        const em = SmartNotificationEngine.pickCategoryEmoji(categoryName);
        
        console.log(`📧 إرسال إشعار للمستخدم ${userId} عن مقال في ${categoryName}`);
        
        await this.createNotification({
          userId,
          type: 'new_article',
          title: `${em} جديد في ${categoryName}`,
          message: `بما أنك مهتم بـ${categoryName}، تم نشر خبر قد يهمك: "${article.title.substring(0, 60)}..."`,
          entityId: articleId,
          entityType: 'article',
          category: categoryName,
          articleId,
          priority: 'medium',
          metadata: {
            categoryId,
            authorName: (article as any).article_author?.full_name || (article as any).author?.name,
            featuredImage: (article as any).featured_image
          }
        });
      }

    } catch (error) {
      console.error('❌ خطأ في إشعارات المقال الجديد:', error);
    }
  }

  /**
   * إشعار عند تعليق جديد على مقال تفاعل معه المستخدم
   */
  static async notifyNewCommentOnUserInteraction(commentId: string, articleId: string): Promise<void> {
    try {
      console.log('💬 معالجة إشعارات تعليق جديد على تفاعل المستخدم');

      // جلب التعليق والمقال
      const [comment, article] = await Promise.all([
        prisma.comments.findUnique({
          where: { id: commentId },
          include: { users: true }
        }),
        prisma.articles.findUnique({
          where: { id: articleId }
        })
      ]);

      if (!comment || !article) return;

      // العثور على المستخدمين الذين تفاعلوا مع المقال
      const interactedUsers = await prisma.interactions.findMany({
        where: {
          article_id: articleId,
          type: { in: ['like', 'save', 'comment'] },
          user_id: { not: comment.user_id } // استبعاد كاتب التعليق
        },
        distinct: ['user_id'],
        select: { user_id: true }
      });

      console.log(`👥 عدد المستخدمين المتفاعلين: ${interactedUsers.length}`);

      // إنشاء إشعارات
      for (const interaction of interactedUsers) {
        await this.createNotification({
          userId: interaction.user_id,
          type: 'new_comment',
          title: '💬 تعليق جديد على مقال أعجبك',
          message: `${comment.users?.name || 'أحد المستخدمين'} أضاف تعليقاً على مقال: "${article.title.substring(0, 40)}..."`,
          entityId: commentId,
          entityType: 'comment',
          articleId,
          commentId,
          priority: 'low',
          metadata: {
            commenterName: comment.users?.name,
            articleTitle: article.title,
            commentContent: comment.content?.substring(0, 100)
          }
        });
      }

    } catch (error) {
      console.error('❌ خطأ في إشعارات التعليق الجديد:', error);
    }
  }

  /**
   * إشعار عند نشر مقال من كاتب يتابعه المستخدم
   */
  static async notifyNewArticleFromFollowedAuthor(articleId: string, authorId: string): Promise<void> {
    try {
      console.log('✍️ معالجة إشعارات مقال جديد من كاتب متابع');

      const [article, author, followers] = await Promise.all([
        prisma.articles.findUnique({ where: { id: articleId } }),
        prisma.users.findUnique({ where: { id: authorId } }),
        prisma.user_follows.findMany({
          where: { followed_id: authorId },
          select: { follower_id: true }
        })
      ]);

      if (!article || !author) return;

      console.log(`👥 عدد المتابعين: ${followers.length}`);

      // إنشاء إشعارات للمتابعين
      for (const follower of followers) {
        await this.createNotification({
          userId: follower.follower_id,
          type: 'author_follow',
          title: `✍️ مقال جديد من ${author.name}`,
          message: `كاتبك المفضل ${author.name} نشر مقالاً جديداً بعنوان: "${article.title.substring(0, 50)}..."`,
          entityId: articleId,
          entityType: 'article',
          articleId,
          authorId,
          priority: 'high',
          metadata: {
            authorName: author.name,
            authorAvatar: author.profile_image,
            articleTitle: article.title,
            featuredImage: article.featured_image
          }
        });
      }

    } catch (error) {
      console.error('❌ خطأ في إشعارات الكاتب المتابع:', error);
    }
  }

  /**
   * إشعارات التوصيات الذكية بناءً على سلوك المستخدم
   */
  static async generateSmartRecommendationNotifications(userId: string): Promise<void> {
    try {
      console.log('🎯 إنتاج إشعارات التوصيات الذكية للمستخدم:', userId);

      // تحليل سلوك المستخدم
      const userBehavior = await this.analyzeUserBehavior(userId);
      
      if (!userBehavior.interests.length) {
        console.log('⚠️ لا توجد اهتمامات كافية للمستخدم');
        return;
      }

      // البحث عن مقالات موصى بها
      const recommendedArticles = await this.findRecommendedArticles(userId, userBehavior);

      if (recommendedArticles.length === 0) {
        console.log('📭 لا توجد مقالات موصى بها');
        return;
      }

      // اختيار أفضل 3 توصيات
      const topRecommendations = recommendedArticles.slice(0, 3);

      for (const article of topRecommendations) {
        await this.createNotification({
          userId,
          type: 'recommendation',
          title: '⭐ توصية خاصة لك',
          message: `بناءً على اهتماماتك، قد يعجبك هذا المقال: "${article.title.substring(0, 50)}..."`,
          entityId: article.id,
          entityType: 'article',
          articleId: article.id,
          category: 'توصيات',
          priority: 'low',
          metadata: {
            recommendationReason: article.reason,
            similarityScore: article.score,
            featuredImage: article.featured_image
          }
        });
      }

      console.log(`✅ تم إنشاء ${topRecommendations.length} إشعارات توصية`);

    } catch (error) {
      console.error('❌ خطأ في إشعارات التوصيات:', error);
    }
  }

  /**
   * إشعار الجرعة اليومية الذكية
   */
  static async generateDailyDigestNotification(userId: string): Promise<void> {
    try {
      console.log('📊 إنتاج إشعار الجرعة اليومية للمستخدم:', userId);

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // جمع إحصائيات اليوم
      const [newArticlesCount, userInterests, topCategories] = await Promise.all([
        prisma.articles.count({
          where: {
            created_at: { gte: yesterday },
            is_active: true
          }
        }),
        this.getUserInterests(userId),
        this.getTopCategoriesForUser(userId)
      ]);

      if (newArticlesCount === 0) {
        console.log('📭 لا توجد مقالات جديدة للجرعة اليومية');
        return;
      }

      // إنشاء رسالة مخصصة
      const timeOfDay = new Date().getHours() < 12 ? 'صباح' : 'مساء';
      const message = this.generateDigestMessage(newArticlesCount, topCategories, timeOfDay);

      await this.createNotification({
        userId,
        type: 'daily_digest',
        title: `🌅 جرعتك ${timeOfDay === 'صباح' ? 'الصباحية' : 'المسائية'}`,
        message,
        category: 'جرعة يومية',
        priority: 'medium',
        metadata: {
          timeOfDay,
          articlesCount: newArticlesCount,
          topCategories,
          digestDate: today.toISOString().split('T')[0]
        }
      });

      console.log('✅ تم إنشاء إشعار الجرعة اليومية');

    } catch (error) {
      console.error('❌ خطأ في إشعار الجرعة اليومية:', error);
    }
  }

  /**
   * إرسال الإشعار فورياً
   */
  private static async deliverNotification(notificationId: string, userId: string): Promise<void> {
    try {
      // تحديث حالة الإرسال
      await prisma.smartNotifications.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sent_at: new Date()
        }
      });

      // إرسال عبر WebSocket
      const notification = await prisma.smartNotifications.findUnique({
        where: { id: notificationId }
      });

      if (notification && this.wsManager) {
        this.wsManager.sendToUser(userId, 'new_notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          data: notification.data,
          created_at: notification.created_at
        });
      }

      // حفظ في Redis للوصول السريع
      if (this.redis) {
        const cacheKey = `notifications:${userId}`;
        await this.redis.lpush(cacheKey, JSON.stringify(notification));
        await this.redis.expire(cacheKey, 86400); // 24 ساعة
      }

    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
    }
  }

  /**
   * العثور على المستخدمين المهتمين بتصنيف معين
   */
  private static async findUsersInterestedInCategory(categoryId: string): Promise<string[]> {
    try {
      const userIds = new Set<string>();

      // 1. البحث في الاهتمامات المحفوظة (المصدر الأساسي)
      const userInterests = await prisma.user_interests.findMany({
        where: {
          category_id: categoryId,
          is_active: true
        },
        select: { user_id: true }
      });

      userInterests.forEach(ui => userIds.add(ui.user_id));
      console.log(`🎯 المستخدمون المهتمون من الاهتمامات المحفوظة: ${userInterests.length}`);

      // 2. البحث في التفاعلات السابقة (مصدر إضافي)
      // نحتاج أولاً للحصول على معرفات المقالات في هذا التصنيف
      const categoryArticles = await prisma.articles.findMany({
        where: {
          category_id: categoryId,
          status: 'published'
        },
        select: { id: true },
        take: 100 // نحدد عدد المقالات لتحسين الأداء
      });

      const articleIds = categoryArticles.map(a => a.id);

      // ثم نبحث عن التفاعلات مع هذه المقالات
      const interactions = articleIds.length > 0 ? await prisma.interactions.findMany({
        where: {
          article_id: { in: articleIds },
          type: { in: ['like', 'save'] },
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
          }
        },
        distinct: ['user_id'],
        select: { user_id: true },
        take: 50
      }) : [];

      interactions.forEach(i => userIds.add(i.user_id));
      console.log(`👥 المستخدمون المهتمون من التفاعلات: ${interactions.length}`);

      // 3. البحث في user_preferences كاحتياطي
      const userPreferences = await prisma.user_preferences.findMany({
        where: {
          preferences: {
            path: ['interests'],
            array_contains: [categoryId]
          }
        },
        select: { user_id: true }
      });

      userPreferences.forEach(up => userIds.add(up.user_id));
      console.log(`⚙️ المستخدمون المهتمون من التفضيلات: ${userPreferences.length}`);

      const totalUsers = Array.from(userIds);
      console.log(`📊 إجمالي المستخدمين المهتمين بالتصنيف ${categoryId}: ${totalUsers.length}`);

      return totalUsers;

    } catch (error) {
      console.error('❌ خطأ في البحث عن المستخدمين المهتمين:', error);
      return [];
    }
  }

  /**
   * تحليل سلوك المستخدم لتحديد الاهتمامات
   */
  private static async analyzeUserBehavior(userId: string): Promise<{
    interests: string[];
    preferredTime: string;
    activityLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      // جمع التفاعلات الأخيرة
      const recentInteractions = await prisma.interactions.findMany({
        where: {
          user_id: userId,
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // آخر 30 يوم
        },
        include: {
          articles: {
            include: { categories: true }
          }
        },
        take: 100
      });

      // تحليل الفئات المفضلة
      const categoryCount: { [key: string]: number } = {};
      recentInteractions.forEach(interaction => {
        const category = interaction.articles?.categories?.name;
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      // ترتيب الاهتمامات
      const interests = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      // تحديد مستوى النشاط
      const activityLevel = recentInteractions.length > 50 ? 'high' : 
                           recentInteractions.length > 20 ? 'medium' : 'low';

      return {
        interests,
        preferredTime: 'morning', // يمكن تحسينه بناءً على أوقات النشاط
        activityLevel
      };

    } catch (error) {
      console.error('❌ خطأ في تحليل سلوك المستخدم:', error);
      return { interests: [], preferredTime: 'morning', activityLevel: 'low' };
    }
  }

  /**
   * البحث عن مقالات موصى بها للمستخدم
   */
  private static async findRecommendedArticles(userId: string, behavior: any): Promise<any[]> {
    try {
      if (!behavior.interests.length) return [];

      // البحث عن مقالات في الفئات المفضلة
      const recommendedArticles = await prisma.articles.findMany({
        where: {
          categories: {
            is: {
              name: { in: behavior.interests }
            }
          },
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          interactions: {
            none: { user_id: userId }
          }
        },
        include: {
          categories: true
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });

      return recommendedArticles.map(article => ({
        id: article.id,
        title: article.title,
        featured_image: (article as any).featured_image,
        reason: `مشابه لاهتماماتك في ${(article as any).categories?.name}`,
        score: 0.8
      }));

    } catch (error) {
      console.error('❌ خطأ في البحث عن التوصيات:', error);
      return [];
    }
  }

  /**
   * الحصول على اهتمامات المستخدم
   */
  private static async getUserInterests(userId: string): Promise<string[]> {
    const behavior = await this.analyzeUserBehavior(userId);
    return behavior.interests;
  }

  /**
   * الحصول على أهم الفئات للمستخدم
   */
  private static async getTopCategoriesForUser(userId: string): Promise<string[]> {
    const interests = await this.getUserInterests(userId);
    return interests.slice(0, 3);
  }

  /**
   * إنتاج رسالة الجرعة اليومية
   */
  private static generateDigestMessage(articlesCount: number, categories: string[], timeOfDay: string): string {
    const greeting = timeOfDay === 'صباح' ? 'صباح الخير!' : 'مساء الخير!';
    let message = `${greeting} لديك ${articlesCount} مقال جديد`;

    if (categories.length > 0) {
      message += ` في مواضيع تهمك مثل: ${categories.slice(0, 2).join(' و ')}`;
    }

    message += '. اكتشف ما هو جديد اليوم!';
    return message;
  }

  /**
   * حساب نقطة التخصيص للإشعار
   */
  private static async calculatePersonalizationScore(data: SmartNotificationData): Promise<number> {
    try {
      // خوارزمية بسيطة لحساب التخصيص
      let score = 0.5; // نقطة أساسية

      // زيادة النقطة حسب نوع الإشعار
      switch (data.type) {
        case 'author_follow':
          score += 0.3;
          break;
        case 'new_comment':
          score += 0.2;
          break;
        case 'recommendation':
          score += 0.1;
          break;
        case 'daily_digest':
          score += 0.2;
          break;
      }

      // زيادة النقطة حسب الأولوية
      switch (data.priority) {
        case 'urgent':
          score += 0.2;
          break;
        case 'high':
          score += 0.1;
          break;
      }

      return Math.min(1.0, score);

    } catch (error) {
      console.error('❌ خطأ في حساب نقطة التخصيص:', error);
      return 0.5;
    }
  }

  /**
   * تحويل نوع الإشعار إلى enum
   */
  private static mapNotificationType(type: string): any {
    const mapping: { [key: string]: any } = {
      'new_article': 'article_recommendation',
      'new_comment': 'user_engagement',
      'recommendation': 'article_recommendation',
      'daily_digest': 'ai_insight',
      'author_follow': 'user_engagement'
    };
    return mapping[type] || 'article_recommendation';
  }

  /**
   * تحويل الأولوية إلى enum
   */
  private static mapPriority(priority: string): any {
    const mapping: { [key: string]: any } = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high',
      'urgent': 'urgent'
    };
    return mapping[priority] || 'medium';
  }

  private static pickCategoryEmoji(categoryName?: string): string {
    const name = (categoryName || '').toLowerCase();
    if (/(سفر|سياحة|ترحال|travel|tourism)/i.test(name)) return '✈️🏝️🧭';
    if (/(اقتصاد|مال|اقتصادى|business|economy|finance)/i.test(name)) return '💼📈';
    if (/(رياضة|sport)/i.test(name)) return '⚽️🏆';
    if (/(طقس|weather)/i.test(name)) return '⛅️🌧️';
    if (/(تقنية|تكنولوجيا|tech)/i.test(name)) return '💡🤖';
    return '📰';
  }
}

export default SmartNotificationEngine;
