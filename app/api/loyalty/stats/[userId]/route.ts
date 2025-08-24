/**
 * API للحصول على إحصائيات الولاء للمستخدم
 * GET /api/loyalty/stats/[userId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/services/loyalty-system';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على إحصائيات المستخدم
    const userStats = await loyaltySystem.getUserStats(userId);

    if (!userStats) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // فحص الإنجازات التلقائية
    await loyaltySystem.checkAndAwardMilestones(userId);

    // الحصول على الإحصائيات المحدثة
    const updatedStats = await loyaltySystem.getUserStats(userId);

    return NextResponse.json({
      success: true,
      data: updatedStats
    });

  } catch (error) {
    console.error('خطأ في API إحصائيات الولاء:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
