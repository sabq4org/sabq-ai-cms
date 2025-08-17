import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';

/**
 * مدير المقالات المميزة - يضمن وجود مقال مميز واحد فقط في أي وقت
 */
export class FeaturedArticleManager {
  /**
   * تعيين مقال كمميز مع إلغاء تمييز جميع المقالات الأخرى
   * يستخدم transaction لضمان الـ atomicity
   */
  static async setFeaturedArticle(
    articleId: string,
    options: {
      categoryId?: string; // لتقييد إلغاء التمييز حسب التصنيف
      skipValidation?: boolean; // لتخطي التحقق من وجود المقال
    } = {}
  ): Promise<{
    success: boolean;
    message: string;
    featuredArticle?: any;
    previouslyFeatured?: string[];
  }> {
    const { categoryId, skipValidation = false } = options;

    try {
      // استخدام transaction لضمان الـ atomicity
      return await dbConnectionManager.executeWithConnection(async () => {
        return await prisma.$transaction(async (tx) => {
          // 1. التحقق من وجود المقال (إذا لم يتم تخطي التحقق)
          if (!skipValidation) {
            const article = await tx.articles.findUnique({
              where: { id: articleId },
              select: {
                id: true,
                title: true,
                status: true,
                category_id: true,
              },
            });

            if (!article) {
              throw new Error('المقال غير موجود');
            }

            if (article.status !== 'published') {
              throw new Error('لا يمكن تمييز مقال غير منشور');
            }
          }

          // 2. جلب قائمة المقالات المميزة الحالية (للتتبع)
          const currentlyFeatured = await tx.articles.findMany({
            where: {
              featured: true,
              id: { not: articleId },
              ...(categoryId ? { category_id: categoryId } : {}),
            },
            select: { id: true },
          });

          const previouslyFeaturedIds = currentlyFeatured.map((a) => a.id);

          // 3. إلغاء تمييز جميع المقالات الأخرى
          if (previouslyFeaturedIds.length > 0) {
            await tx.articles.updateMany({
              where: {
                featured: true,
                id: { not: articleId },
                ...(categoryId ? { category_id: categoryId } : {}),
              },
              data: {
                featured: false,
                updated_at: new Date(),
              },
            });

            console.log(`✅ تم إلغاء تمييز ${previouslyFeaturedIds.length} مقال(ات)`);
          }

          // 4. تعيين المقال الحالي كمميز
          const featuredArticle = await tx.articles.update({
            where: { id: articleId },
            data: {
              featured: true,
              updated_at: new Date(),
            },
            include: {
              categories: {
                select: {
                  id: true,
                  name: true,
                },
              },
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          console.log(`🌟 تم تعيين المقال "${featuredArticle.title}" كمميز`);

          return {
            success: true,
            message: `تم تعيين المقال كمميز وإلغاء تمييز ${previouslyFeaturedIds.length} مقال(ات) أخرى`,
            featuredArticle,
            previouslyFeatured: previouslyFeaturedIds,
          };
        });
      });
    } catch (error: any) {
      console.error('❌ خطأ في تعيين المقال المميز:', error);
      return {
        success: false,
        message: error.message || 'حدث خطأ في تعيين المقال المميز',
      };
    }
  }

  /**
   * إلغاء تمييز مقال محدد
   */
  static async unsetFeaturedArticle(articleId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      return await dbConnectionManager.executeWithConnection(async () => {
        const article = await prisma.articles.update({
          where: { id: articleId },
          data: {
            featured: false,
            updated_at: new Date(),
          },
          select: {
            title: true,
          },
        });

        console.log(`⭕ تم إلغاء تمييز المقال "${article.title}"`);

        return {
          success: true,
          message: `تم إلغاء تمييز المقال "${article.title}"`,
        };
      });
    } catch (error: any) {
      console.error('❌ خطأ في إلغاء تمييز المقال:', error);
      return {
        success: false,
        message: error.message || 'حدث خطأ في إلغاء تمييز المقال',
      };
    }
  }

  /**
   * إلغاء تمييز جميع المقالات
   */
  static async clearAllFeatured(categoryId?: string): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> {
    try {
      return await dbConnectionManager.executeWithConnection(async () => {
        const result = await prisma.articles.updateMany({
          where: {
            featured: true,
            ...(categoryId ? { category_id: categoryId } : {}),
          },
          data: {
            featured: false,
            updated_at: new Date(),
          },
        });

        console.log(`🧹 تم إلغاء تمييز ${result.count} مقال(ات)`);

        return {
          success: true,
          message: `تم إلغاء تمييز ${result.count} مقال(ات)`,
          count: result.count,
        };
      });
    } catch (error: any) {
      console.error('❌ خطأ في إلغاء تمييز جميع المقالات:', error);
      return {
        success: false,
        message: error.message || 'حدث خطأ في إلغاء تمييز المقالات',
        count: 0,
      };
    }
  }

  /**
   * جلب المقال المميز الحالي
   */
  static async getCurrentFeatured(categoryId?: string): Promise<any | null> {
    try {
      return await dbConnectionManager.executeWithConnection(async () => {
        // أولاً، نتحقق من جميع المقالات المميزة للتشخيص
        const allFeatured = await prisma.articles.findMany({
          where: {
            featured: true,
            status: 'published',
          },
          select: {
            id: true,
            title: true,
            published_at: true,
            updated_at: true,
          },
          orderBy: {
            updated_at: 'desc',
          },
        });

        if (allFeatured.length > 0) {
          console.log(`📋 عدد المقالات المميزة المنشورة: ${allFeatured.length}`);
          console.log(`🔝 أحدث مقال مميز: "${allFeatured[0].title}" (تحديث: ${allFeatured[0].updated_at})`);
          
          // التحقق من المقالات المميزة غير المنشورة بعد
          const futureArticles = allFeatured.filter(a => 
            a.published_at && a.published_at > new Date()
          );
          
          if (futureArticles.length > 0) {
            console.log(`⏳ يوجد ${futureArticles.length} مقال(ات) مميزة مجدولة للنشر في المستقبل`);
          }
        }

        // الآن نجلب المقال المميز الحالي مع تحسين الشروط
        return await prisma.articles.findFirst({
          where: {
            featured: true,
            status: 'published',
            // نضيف OR condition للتعامل مع المقالات بدون published_at
            OR: [
              { published_at: null },
              { published_at: { lte: new Date() } }
            ],
            ...(categoryId ? { category_id: categoryId } : {}),
          },
          include: {
            categories: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true,
              },
            },
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                reporter_profile: {
                  select: {
                    id: true,
                    full_name: true,
                    slug: true,
                    title: true,
                    is_verified: true,
                    verification_badge: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { updated_at: 'desc' },
            { published_at: 'desc' },
          ],
        });
      });
    } catch (error: any) {
      console.error('❌ خطأ في جلب المقال المميز:', error);
      return null;
    }
  }

  /**
   * التحقق من عدد المقالات المميزة (للتشخيص)
   */
  static async getFeaturedCount(categoryId?: string): Promise<number> {
    try {
      return await dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.count({
          where: {
            featured: true,
            status: 'published',
            ...(categoryId ? { category_id: categoryId } : {}),
          },
        });
      });
    } catch (error: any) {
      console.error('❌ خطأ في حساب المقالات المميزة:', error);
      return 0;
    }
  }
}

export default FeaturedArticleManager;