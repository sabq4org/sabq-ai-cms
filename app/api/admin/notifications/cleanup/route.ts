import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export async function DELETE(req: NextRequest) {
  try {
    // التحقق من صلاحيات المدير
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // حذف الإشعارات التجريبية
    const testNotificationTypes = [
      'welcome',
      'daily_summary',
      'trending_topic',
      'achievement',
      'content_recommendation'
    ];

    const result = await prisma.smartNotifications.deleteMany({
      where: {
        OR: [
          // حذف الإشعارات بالأنواع التجريبية
          { type: { in: testNotificationTypes } },
          // حذف الإشعارات التي تحتوي على كلمات تجريبية
          { title: { contains: 'تجريبي' } },
          { message: { contains: 'تجريبي' } },
          { title: { contains: 'اختبار' } },
          { message: { contains: 'اختبار' } }
        ]
      }
    });

    console.log(`🗑️ تم حذف ${result.count} إشعار تجريبي`);

    return NextResponse.json({
      success: true,
      message: `تم حذف ${result.count} إشعار تجريبي`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('خطأ في حذف الإشعارات التجريبية:', error);
    return NextResponse.json({ 
      error: 'خطأ في الخادم',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
