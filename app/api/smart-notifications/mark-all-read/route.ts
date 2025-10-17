/**
 * 🔔 تحديث جميع الإشعارات إلى "مقروء"
 * 
 * POST /api/smart-notifications/mark-all-read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { SmartNotificationService } from '@/lib/services/smartNotificationService';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const result = await SmartNotificationService.markAllAsRead(user.id);

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${result.count} إشعار`,
      data: result
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإشعارات:', error);

    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
