import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';










export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    if (!userId || userId === 'anonymous') {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول لعرض نقاط الولاء'
      }, { status: 401 });
    }
    
    // جلب نقاط الولاء من قاعدة البيانات
    const loyaltyPoints = await prisma.loyalty_points.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    
    // حساب إجمالي النقاط
    const totalPoints = loyaltyPoints.reduce((sum: number, point: any) => sum + point.points, 0);
    const earnedPoints = loyaltyPoints.filter((p: any) => p.points > 0).reduce((sum: number, point: any) => sum + point.points, 0);
    const redeemedPoints = loyaltyPoints.filter((p: any) => p.points < 0).reduce((sum: number, point: any) => sum + Math.abs(point.points), 0);
    
    // تحديد المستوى
    let tier = 'bronze';
    if (totalPoints >= 2000) tier = 'platinum';
    else if (totalPoints >= 500) tier = 'gold';
    else if (totalPoints >= 100) tier = 'silver';
    
    // حساب النقاط المطلوبة للمستوى التالي
    const getNextTierPoints = (points: number) => {
      if (points < 100) return 100;
      if (points < 500) return 500;
      if (points < 2000) return 2000;
      return null; // بلاتيني - أعلى مستوى
    };
    
    const userRecord = {
      user_id: userId,
      total_points: totalPoints,
      earned_points: earnedPoints,
      redeemed_points: redeemedPoints,
      tier: tier,
      next_tier_points: getNextTierPoints(totalPoints),
      created_at: loyaltyPoints.length > 0 ? loyaltyPoints[loyaltyPoints.length - 1].created_at.toISOString() : new Date().toISOString(),
      last_updated: loyaltyPoints.length > 0 ? loyaltyPoints[0].created_at.toISOString() : new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: userRecord
    });
    
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في جلب نقاط الولاء'
    }, { status: 500 });
  }
}

// API لجلب تفاصيل نقاط المستخدم مع التاريخ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;
    
    if (!user_id || user_id === 'anonymous') {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول'
      }, { status: 401 });
    }
    
    // جلب نقاط الولاء من قاعدة البيانات
    const loyaltyPoints = await prisma.loyalty_points.findMany({
      where: { user_id: user_id },
      orderBy: { created_at: 'desc' },
      take: 50
    });
    
    // جلب التفاعلات من قاعدة البيانات
    const interactions = await prisma.interactions.findMany({
      where: { user_id: user_id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });
    
    // حساب إحصائيات النقاط
    const stats = {
      total_interactions: interactions.length,
      points_from_reading: loyaltyPoints.filter((p: any) => p.action === 'read' || p.action === 'view').reduce((sum: number, p: any) => sum + p.points, 0),
      points_from_likes: loyaltyPoints.filter((p: any) => p.action === 'like').reduce((sum: number, p: any) => sum + p.points, 0),
      points_from_shares: loyaltyPoints.filter((p: any) => p.action === 'share').reduce((sum: number, p: any) => sum + p.points, 0),
      points_from_saves: loyaltyPoints.filter((p: any) => p.action === 'save').reduce((sum: number, p: any) => sum + p.points, 0),
      recent_activities: loyaltyPoints.slice(0, 10).map((p: any) => ({
        type: p.action,
        points: p.points,
        article_id: p.reference_id,
        timestamp: p.created_at.toISOString()
      }))
    };
    
    const currentPoints = loyaltyPoints.reduce((sum: number, p: any) => sum + p.points, 0);
    
    // حساب النقاط المطلوبة للمستوى التالي
    const getNextTierPoints = (points: number) => {
      if (points < 100) return 100;
      if (points < 500) return 500;
      if (points < 2000) return 2000;
      return null; // بلاتيني - أعلى مستوى
    };
    
    return NextResponse.json({
      success: true,
      data: {
        current_points: currentPoints,
        stats,
        next_tier_points: getNextTierPoints(currentPoints)
      }
    });
    
  } catch (error) {
    console.error('Error fetching loyalty details:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في جلب تفاصيل النقاط'
    }, { status: 500 });
  }
} 