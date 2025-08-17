// API اختبار إشعارات الاهتمامات - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { SmartNotificationEngine } from '@/lib/notifications/smart-engine';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول للاختبار',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const body = await req.json();
    const { articleId, categoryId, testType = 'specific' } = body;

    console.log('🧪 بداية اختبار إشعارات الاهتمامات:', {
      articleId,
      categoryId,
      testType,
      userId: user.id
    });

    let result;

    if (testType === 'specific' && articleId && categoryId) {
      // اختبار مقال محدد
      console.log('🎯 اختبار إشعار مقال محدد...');
      await SmartNotificationEngine.notifyNewArticleInCategory(articleId, categoryId);
      
      result = {
        type: 'specific_article',
        articleId,
        categoryId,
        message: `تم إرسال إشعارات للمستخدمين المهتمين بالتصنيف ${categoryId}`
      };

    } else if (testType === 'user_interests') {
      // اختبار اهتمامات المستخدم الحالي
      console.log('👤 اختبار اهتمامات المستخدم الحالي...');
      
      const userInterests = await prisma.user_interests.findMany({
        where: {
          user_id: user.id,
          is_active: true
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      result = {
        type: 'user_interests',
        userId: user.id,
        interests: userInterests.map(ui => ({
          categoryId: ui.category_id,
          categoryName: ui.category?.name || 'غير محدد',
          createdAt: ui.created_at
        })),
        totalInterests: userInterests.length
      };

    } else if (testType === 'category_users') {
      // اختبار المستخدمين المهتمين بتصنيف محدد
      if (!categoryId) {
        return NextResponse.json({
          success: false,
          error: 'معرف التصنيف مطلوب لهذا الاختبار',
          code: 'MISSING_CATEGORY_ID'
        }, { status: 400 });
      }

      console.log('📊 اختبار المستخدمين المهتمين بالتصنيف...');
      
      // استخدام نفس المنطق من SmartNotificationEngine
      const userIds = new Set<string>();

      // المهتمون من user_interests
      const userInterests = await prisma.user_interests.findMany({
        where: {
          category_id: categoryId,
          is_active: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      userInterests.forEach(ui => userIds.add(ui.user_id));

      // المهتمون من التفاعلات
      const interactions = await prisma.interactions.findMany({
        where: {
          articles: {
            categories: {
              some: { id: categoryId }
            }
          },
          type: { in: ['like', 'save'] },
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        distinct: ['user_id'],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        take: 50
      });

      interactions.forEach(i => userIds.add(i.user_id));

      const allUsers = [...userInterests.map(ui => ui.user), ...interactions.map(i => i.user)]
        .filter((user, index, self) => user && self.findIndex(u => u.id === user.id) === index);

      result = {
        type: 'category_users',
        categoryId,
        interestedUsers: allUsers,
        fromInterests: userInterests.length,
        fromInteractions: interactions.length,
        totalUnique: userIds.size
      };

    } else {
      return NextResponse.json({
        success: false,
        error: 'نوع اختبار غير صحيح. الأنواع المدعومة: specific, user_interests, category_users',
        code: 'INVALID_TEST_TYPE'
      }, { status: 400 });
    }

    // إحصائيات إضافية
    const stats = await prisma.user_interests.groupBy({
      by: ['category_id'],
      _count: {
        user_id: true
      },
      orderBy: {
        _count: {
          user_id: 'desc'
        }
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: result,
      stats: {
        topCategories: stats,
        testTime: new Date().toISOString(),
        tester: {
          id: user.id,
          name: user.name || user.email
        }
      },
      message: 'تم تنفيذ الاختبار بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في اختبار الإشعارات:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في تنفيذ الاختبار',
      code: 'TEST_ERROR',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    // إحصائيات سريعة عن النظام
    const [totalUsers, totalInterests, totalNotifications, activeCategories] = await Promise.all([
      prisma.users.count(),
      prisma.user_interests.count({ where: { is_active: true } }),
      prisma.smartNotifications.count(),
      prisma.categories.count({ where: { is_active: true } })
    ]);

    // أحدث الإشعارات المرسلة
    const recentNotifications = await prisma.smartNotifications.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        created_at: true,
        read_at: true,
        user_id: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        systemStats: {
          totalUsers,
          totalInterests,
          totalNotifications,
          activeCategories
        },
        recentNotifications,
        testEndpoints: {
          testSpecific: 'POST /api/test/notifications-interests { "articleId": "xxx", "categoryId": "xxx", "testType": "specific" }',
          testUserInterests: 'POST /api/test/notifications-interests { "testType": "user_interests" }',
          testCategoryUsers: 'POST /api/test/notifications-interests { "categoryId": "xxx", "testType": "category_users" }'
        }
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الاختبار:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب الإحصائيات',
      code: 'STATS_ERROR'
    }, { status: 500 });
  }
}
