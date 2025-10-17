// API لحذف إشعار واحد
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, requireAuthFromRequest } from '@/app/lib/auth';

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    // المصادقة
    let user: any = null;
    try {
      user = await requireAuthFromRequest(req);
    } catch (_) {
      user = null;
    }
    if (!user) {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول'
      }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'معرف الإشعار مطلوب'
      }, { status: 400 });
    }

    // التحقق من ملكية الإشعار
    const notification = await prisma.smartNotifications.findUnique({
      where: { id: notificationId },
      select: { user_id: true }
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'الإشعار غير موجود'
      }, { status: 404 });
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 403 });
    }

    // حذف الإشعار
    await prisma.smartNotifications.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في حذف الإشعار:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في حذف الإشعار'
    }, { status: 500 });
  }
}

