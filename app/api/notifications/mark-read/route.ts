import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth-utils';
import SmartNotificationsService from '@/lib/modules/smart-notifications/service';

export const runtime = 'nodejs';

// يقبل جسم الطلب بالشكل التالي:
// { "notification_ids": ["id1", "id2", ...] }
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    let body: { notification_ids?: string[] } = {} as any;
    try {
      body = await request.json();
    } catch {
      // تجاهل إذا لم يوجد جسم
    }

    const ids = Array.isArray(body.notification_ids) ? body.notification_ids : [];
    if (!ids.length) {
      return NextResponse.json({ success: false, message: 'قائمة الإشعارات مطلوبة' }, { status: 400 });
    }

    const service = new SmartNotificationsService();
    for (const id of ids) {
      await service.markAsRead(id, user.id);
    }

    return NextResponse.json({ success: true, updated: ids.length }, { status: 200 });
  } catch (error) {
    console.error('notifications/mark-read error:', error);
    return NextResponse.json({ success: false, message: 'خطأ غير متوقع' }, { status: 500 });
  }
}
