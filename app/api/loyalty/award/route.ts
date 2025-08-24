/**
 * API لمنح نقاط الولاء
 * POST /api/loyalty/award
 */

import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem, LoyaltyActionType } from '@/lib/services/loyalty-system';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, actionType, contentId, metadata } = body;

    // التحقق من صحة البيانات
    if (!userId || !actionType) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم ونوع النشاط مطلوبان' },
        { status: 400 }
      );
    }

    // إضافة معلومات إضافية للبيانات الوصفية
    const headersList = headers();
    const enrichedMetadata = {
      ...metadata,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    };

    // منح النقاط
    const result = await loyaltySystem.awardPoints(
      userId,
      actionType as LoyaltyActionType,
      contentId,
      enrichedMetadata
    );

    // إضافة معلومات إضافية للاستجابة الناجحة
    if (result.success) {
      // الحصول على إحصائيات المستخدم المحدثة
      const userStats = await loyaltySystem.getUserStats(userId);
      
      return NextResponse.json({
        ...result,
        userStats
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('خطأ في API منح نقاط الولاء:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// معلومات API
export async function GET() {
  return NextResponse.json({
    name: 'Loyalty Points Award API',
    description: 'منح نقاط الولاء للمستخدمين',
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'منح نقاط الولاء',
        parameters: {
          userId: 'string (required) - معرف المستخدم',
          actionType: 'string (required) - نوع النشاط',
          contentId: 'string (optional) - معرف المحتوى',
          metadata: 'object (optional) - بيانات إضافية'
        }
      }
    },
    supportedActions: Object.keys(loyaltySystem.constructor.prototype.constructor.LOYALTY_ACTIONS || {})
  });
}
