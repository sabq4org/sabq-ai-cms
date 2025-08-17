import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // الحصول على المستخدم الحالي
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

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

    // جلب اهتمامات المستخدم
    const userInterests = await prisma.user_interests.findMany({
      where: {
        user_id: user.id,
        is_active: true
      },
      include: {
        category: true
      }
    });

    // جلب تفضيلات المستخدم
    const userPreferences = await prisma.user_preferences.findUnique({
      where: { user_id: user.id }
    });

    // جلب آخر 5 مقالات منشورة في المحليات
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
        created_at: true
      }
    }) : [];

    // جلب الإشعارات الأخيرة للمستخدم
    const recentNotifications = await prisma.smartNotifications.findMany({
      where: {
        user_id: user.id
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        created_at: true,
        data: true
      }
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      localCategory: localCategory ? {
        id: localCategory.id,
        name: localCategory.name,
        slug: localCategory.slug
      } : null,
      userInterests: userInterests.map(ui => ({
        category_id: ui.category_id,
        category_name: ui.category?.name,
        is_active: ui.is_active
      })),
      userPreferences: userPreferences ? {
        preferences: userPreferences.preferences,
        interests: (userPreferences.preferences as any)?.interests || []
      } : null,
      recentLocalArticles,
      recentNotifications,
      isInterestedInLocal: userInterests.some(ui => ui.category_id === localCategory?.id)
    });
    
    // تعيين ترميز UTF-8 الصحيح
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    
    return response;
  } catch (error) {
    console.error('خطأ في فحص الاهتمامات:', error);
    return NextResponse.json({ 
      error: 'خطأ في الخادم',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
