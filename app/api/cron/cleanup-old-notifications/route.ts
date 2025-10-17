/**
 * 🧹 تنظيف الإشعارات القديمة
 * 
 * CRON: يعمل كل ساعة لحذف الإشعارات التي مضى عليها أكثر من 30 يوماً
 */

import { NextRequest, NextResponse } from 'next/server';
import { SmartNotificationService } from '@/lib/services/smartNotificationService';

export async function POST(request: NextRequest) {
  try {
    // التحقق من الـ cron secret
    const cronSecret = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'default-cron-secret';

    if (cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('🧹 جاري حذف الإشعارات القديمة...');

    const result = await SmartNotificationService.deleteOldNotifications(30);

    return NextResponse.json({
      success: true,
      message: `تم حذف ${result.count} إشعار قديم`,
      data: result
    });

  } catch (error) {
    console.error('❌ خطأ في تنظيف الإشعارات:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'خطأ في التنظيف',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
