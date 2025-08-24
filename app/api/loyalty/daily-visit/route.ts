/**
 * API لمنح نقاط الزيارة اليومية
 * POST /api/loyalty/daily-visit
 */

import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/services/loyalty-system';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // منح نقاط الزيارة اليومية
    const result = await loyaltySystem.awardDailyVisit(userId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('خطأ في API الزيارة اليومية:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
