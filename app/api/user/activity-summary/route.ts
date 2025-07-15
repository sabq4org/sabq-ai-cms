import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // إذا كان المستخدم مجهول، نرجع قيم افتراضية
    if (userId === 'anonymous') {
      return NextResponse.json({
        success: true,
        data: {
          likes: { count: 0 },
          saves: { count: 0 },
          shares: { count: 0 },
          reads: { count: 0 },
          total_points: 0
        }
      });
    }

    // جلب إحصائيات التفاعلات
    const [likesCount, savesCount, sharesCount, viewsCount] = await Promise.all([
      prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'like'
        }
      }),
      prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'save'
        }
      }),
      prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'share'
        }
      }),
      prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'view'
        }
      })
    ]);

    // جلب مجموع نقاط الولاء
    const loyaltyPoints = await prisma.loyalty_points.aggregate({
      where: {
        user_id: userId
      },
      _sum: {
        points: true
      }
    });

    // جلب آخر التفاعلات
    const recentInteractions = await prisma.interactions.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5,
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        likes: { 
          count: likesCount,
          label: 'إعجاب'
        },
        saves: { 
          count: savesCount,
          label: 'محفوظ'
        },
        shares: { 
          count: sharesCount,
          label: 'مشاركة'
        },
        reads: { 
          count: viewsCount,
          label: 'مقروء'
        },
        total_points: loyaltyPoints._sum.points || 0,
        recent_interactions: recentInteractions
      }
    });

  } catch (error) {
    console.error('Error fetching activity summary:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب إحصائيات النشاط' },
      { status: 500 }
    );
  }
} 