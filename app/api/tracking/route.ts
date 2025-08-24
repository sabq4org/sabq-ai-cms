import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // الحصول على المستخدم إن وجد
    const user = await getCurrentUser().catch(() => null);
    
    const data = await request.json();
    const {
      event,
      sessionId,
      articleId,
      interactionType,
      metadata = {}
    } = data;

    // التحقق من البيانات الأساسية
    if (!event || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // حفظ البيانات في نموذج موحد
    const activity = await prisma.user_activities.create({
      data: {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user?.id || 'anonymous',
        session_id: sessionId,
        activity_type: event,
        activity_data: {
          articleId,
          interactionType,
          ...metadata
        },
        created_at: new Date()
      }
    });

    // معالجة أحداث خاصة
    switch (event) {
      case 'article_read':
        // منح نقاط الولاء لإتمام القراءة
        if (user && articleId && metadata.scrollDepth >= 85 && metadata.timeSpent >= 30) {
          await awardReadingPoints(user.id, articleId);
        }
        break;

      case 'interaction':
        // التفاعلات يتم معالجتها في API routes الخاصة بها
        break;
    }

    return NextResponse.json({ 
      success: true, 
      activityId: activity.id 
    });

  } catch (error) {
    console.error('Tracking error:', error);
    // فشل التتبع لا يجب أن يعيد خطأ للمستخدم
    return NextResponse.json({ 
      success: true, 
      message: 'Tracking received' 
    });
  }
}

// معالجة sendBeacon
export async function PUT(request: NextRequest) {
  return POST(request);
}

/**
 * منح نقاط القراءة
 */
async function awardReadingPoints(userId: string, articleId: string) {
  try {
    // التحقق من عدم منح النقاط مسبقاً لنفس المقال
    const existingPoints = await prisma.loyalty_points.findFirst({
      where: {
        user_id: userId,
        reference_id: articleId,
        action: 'article_read',
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      }
    });

    if (!existingPoints) {
      await prisma.loyalty_points.create({
        data: {
          id: `lp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          points: 5, // 5 نقاط لإتمام قراءة مقال
          action: 'article_read',
          reference_id: articleId,
          reference_type: 'article',
          created_at: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error awarding reading points:', error);
  }
}
