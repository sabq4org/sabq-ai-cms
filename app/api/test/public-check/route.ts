import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // البحث عن قسم المحليات
    const localCategory = await prisma.categories.findFirst({
      where: {
        OR: [
          { slug: 'local' },
          { slug: 'محليات' },
          { name: { contains: 'محليات' } },
          { name: { contains: 'local', mode: 'insensitive' } }
        ]
      }
    });

    // عدد المستخدمين المهتمين بالمحليات
    const interestedUsersCount = await prisma.user_interests.count({
      where: {
        category_id: localCategory?.id,
        is_active: true
      }
    });

    // آخر 5 مقالات منشورة في المحليات
    const recentLocalArticles = localCategory ? await prisma.articles.findMany({
      where: {
        category_id: localCategory.id,
        status: 'published'
      },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        created_at: true,
        slug: true
      }
    }) : [];

    // آخر الإشعارات في النظام (بدون تفاصيل خاصة)
    const recentNotificationsCount = await prisma.smartNotifications.count({
      where: {
        type: 'new_article',
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      }
    });

    // إحصائيات عامة
    const stats = {
      totalArticlesPublishedToday: await prisma.articles.count({
        where: {
          status: 'published',
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      totalActiveUsers: await prisma.users.count({
        where: {
          status: 'active'
        }
      })
    };

    const response = NextResponse.json({
      success: true,
      localCategory: localCategory ? {
        id: localCategory.id,
        name: localCategory.name,
        slug: localCategory.slug
      } : null,
      interestedUsersCount,
      recentLocalArticles: recentLocalArticles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: article.created_at,
        url: `https://www.sabq.io/article/${article.slug}`
      })),
      notificationStats: {
        newArticleNotificationsLast24h: recentNotificationsCount,
        message: recentNotificationsCount > 0 ? 
          'النظام يرسل إشعارات حقيقية ✅' : 
          'لا توجد إشعارات مقالات جديدة في آخر 24 ساعة ⚠️'
      },
      generalStats: stats,
      timestamp: new Date().toISOString()
    });
    
    // تعيين ترميز UTF-8 الصحيح
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    
    return response;

  } catch (error) {
    console.error('خطأ في الفحص العام:', error);
    const errorResponse = NextResponse.json({ 
      error: 'خطأ في الخادم',
      details: (error as Error).message 
    }, { status: 500 });
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return errorResponse;
  }
}
