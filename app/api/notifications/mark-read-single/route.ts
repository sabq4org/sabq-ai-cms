import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

// يقبل جسم الطلب بالشكل التالي:
// { "notificationId": "id" }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    let body: { notificationId?: string } = {} as any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'جسم الطلب مطلوب' }, { status: 400 });
    }

    const notificationId = body.notificationId;
    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'معرف الإشعار مطلوب' }, { status: 400 });
    }

    // التحقق من أن الإشعار يخص المستخدم
    const notification = await prisma.smartNotifications.findFirst({
      where: {
        id: notificationId,
        user_id: user.id
      }
    });

    if (!notification) {
      return NextResponse.json({ success: false, message: 'الإشعار غير موجود' }, { status: 404 });
    }

    // تحديد الإشعار كمقروء
    const updatedNotification = await prisma.smartNotifications.update({
      where: { id: notificationId },
      data: {
        read_at: new Date(),
        status: 'read'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: updatedNotification.id,
        read_at: updatedNotification.read_at,
        status: updatedNotification.status
      }
    });

  } catch (error) {
    console.error('notifications/mark-read-single error:', error);
    return NextResponse.json({ success: false, message: 'خطأ غير متوقع' }, { status: 500 });
  }
}
