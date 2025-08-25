import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);

    // جلب بيانات المستخدم الأساسية
    const userProfile = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        created_at: true,
        loyalty_points: true,
        interests: true,
        city: true,
        country: true,
        preferred_language: true,
        profile_completed: true
      }
    });

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    // حساب إحصائيات التفاعلات
    const interactionStats = await Promise.all([
      // عدد الإعجابات
      prisma.interactions.count({
        where: { user_id: user.id, type: 'like' }
      }),
      // عدد المحفوظات
      prisma.interactions.count({
        where: { user_id: user.id, type: 'save' }
      }),
      // عدد المشاهدات
      prisma.interactions.count({
        where: { user_id: user.id, type: 'view' }
      }),
      // عدد التعليقات
      prisma.interactions.count({
        where: { user_id: user.id, type: 'comment' }
      }),
      // عدد المشاركات
      prisma.interactions.count({
        where: { user_id: user.id, type: 'share' }
      })
    ]);

    const [likesCount, savesCount, viewsCount, commentsCount, sharesCount] = interactionStats;

    // حساب الإحصائيات الشهرية
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const monthlyStats = await Promise.all([
      prisma.interactions.count({
        where: { 
          user_id: user.id, 
          type: 'like',
          created_at: { gte: thisMonthStart }
        }
      }),
      prisma.interactions.count({
        where: { 
          user_id: user.id, 
          type: 'save',
          created_at: { gte: thisMonthStart }
        }
      })
    ]);

    const [thisMonthLikes, thisMonthSaves] = monthlyStats;

    // جلب التصنيف المفضل
    const categoryInteractions = await prisma.$queryRaw`
      SELECT a.categories->>'$.name' as category_name, COUNT(*) as count
      FROM interactions i
      JOIN articles a ON i.article_id = a.id
      WHERE i.user_id = ${user.id} 
        AND i.type IN ('like', 'save')
        AND a.categories IS NOT NULL
      GROUP BY a.categories->>'$.name'
      ORDER BY count DESC
      LIMIT 1
    ` as any[];

    const favoriteCategory = categoryInteractions[0]?.category_name || 'غير محدد';

    // جلب آخر النشاطات
    const recentActivities = await prisma.interactions.findMany({
      where: { user_id: user.id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            featured_image: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // حساب مستوى العضوية
    const getMembershipLevel = (points: number) => {
      if (points < 100) return { name: 'مبتدئ', level: 1, nextLevel: 100 };
      if (points < 500) return { name: 'نشيط', level: 2, nextLevel: 500 };
      if (points < 1000) return { name: 'خبير', level: 3, nextLevel: 1000 };
      if (points < 2000) return { name: 'نخبة', level: 4, nextLevel: 2000 };
      return { name: 'أسطورة', level: 5, nextLevel: null };
    };

    const membershipLevel = getMembershipLevel(userProfile.loyalty_points);

    // حساب مدة العضوية
    const membershipDuration = Math.floor(
      (Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const response = {
      success: true,
      data: {
        profile: userProfile,
        stats: {
          totalLikes: likesCount,
          totalSaves: savesCount,
          totalViews: viewsCount,
          totalComments: commentsCount,
          totalShares: sharesCount,
          thisMonthLikes,
          thisMonthSaves,
          favoriteCategory,
          totalInteractions: likesCount + savesCount + viewsCount + commentsCount + sharesCount,
          loyaltyPoints: userProfile.loyalty_points,
          membershipDuration
        },
        membership: membershipLevel,
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          type: activity.type,
          created_at: activity.created_at,
          article: activity.articles ? {
            id: activity.articles.id,
            title: activity.articles.title,
            featured_image: activity.articles.featured_image
          } : null
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    if (String(error?.message || error).includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب بيانات الملف الشخصي'
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
