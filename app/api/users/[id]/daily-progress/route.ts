import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب التقدم اليومي للمستخدم
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = {
      commentsGoal: 3,
      readingGoal: 5,
      engagementGoal: 10,
      currentComments: 0,
      currentReading: 0,
      currentEngagement: 0
    };

    // محاولة جلب البيانات الفعلية
    try {
      // عدد التعليقات اليوم
      const todayComments = await prisma.comments.count({
        where: {
          user_id: userId,
          created_at: {
            gte: today
          }
        }
      });

      // عدد المقالات المقروءة اليوم (التفاعلات)
      const todayReading = await prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'view',
          created_at: {
            gte: today
          }
        }
      });

      // إجمالي التفاعلات اليوم
      const todayEngagement = await prisma.interactions.count({
        where: {
          user_id: userId,
          created_at: {
            gte: today
          }
        }
      });

      progress = {
        ...progress,
        currentComments: todayComments,
        currentReading: todayReading,
        currentEngagement: todayEngagement + todayComments
      };

    } catch (dbError) {
      console.log('استخدام القيم الافتراضية للتقدم اليومي');
    }

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('خطأ في جلب التقدم اليومي:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التقدم اليومي' },
      { status: 500 }
    );
  }
}
