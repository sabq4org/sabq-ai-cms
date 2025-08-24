/**
 * API للحصول على التوصيات المخصصة
 * GET /api/behavior/recommendations/[userId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { behaviorTracker } from '@/lib/services/behavior-tracker';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من صحة الحد الأقصى
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, message: 'الحد الأقصى يجب أن يكون بين 1 و 50' },
        { status: 400 }
      );
    }

    // الحصول على التوصيات المخصصة
    const recommendations = await behaviorTracker.generatePersonalizedRecommendations(userId, limit);

    // الحصول على اهتمامات المستخدم
    const userInterests = await behaviorTracker.getUserInterests(userId);

    // تحليل أنماط السلوك
    const behaviorPatterns = await behaviorTracker.analyzeBehaviorPatterns(userId);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        userInterests,
        behaviorPatterns,
        generatedAt: new Date().toISOString(),
        totalRecommendations: recommendations.length
      }
    });

  } catch (error) {
    console.error('خطأ في API التوصيات المخصصة:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
