import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth-utils';
import SmartNotificationsService from '@/lib/modules/smart-notifications/service';

type MarkReadRequest = {
  notification_ids?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    let body: MarkReadRequest = {};
    try {
      body = await request.json();
    } catch (_) {
      // تجاهل في حال عدم وجود جسم
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

// API تعليم الإشعارات كمقروءة - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll = false } = body;

    if (markAll) {
      // تعليم جميع الإشعارات كمقروءة
      const result = await prisma.smartNotifications.updateMany({
        where: {
          user_id: user.id,
          read_at: null
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          markedCount: result.count,
          action: 'mark_all_read'
        },
        message: `تم تعليم ${result.count} إشعار كمقروء`
      });
    }

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'معرف الإشعار مطلوب',
        code: 'MISSING_NOTIFICATION_ID'
      }, { status: 400 });
    }

    // التحقق من وجود الإشعار وأنه ينتمي للمستخدم
    const notification = await prisma.smartNotifications.findFirst({
      where: {
        id: notificationId,
        user_id: user.id
      }
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'الإشعار غير موجود أو غير مصرح بالوصول إليه',
        code: 'NOTIFICATION_NOT_FOUND'
      }, { status: 404 });
    }

    if (notification.read_at) {
      return NextResponse.json({
        success: true,
        data: {
          notification: {
            id: notification.id,
            read_at: notification.read_at,
            already_read: true
          }
        },
        message: 'الإشعار مقروء مسبقاً'
      });
    }

    // تعليم الإشعار كمقروء
    const updatedNotification = await prisma.smartNotifications.update({
      where: { id: notificationId },
      data: {
        read_at: new Date(),
        status: 'read'
      },
      select: {
        id: true,
        type: true,
        title: true,
        read_at: true,
        status: true,
        created_at: true
      }
    });

    // تحديث إحصائيات المستخدم
    const remainingUnread = await prisma.smartNotifications.count({
      where: {
        user_id: user.id,
        read_at: null
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        notification: updatedNotification,
        remainingUnread,
        totalUnread: remainingUnread,
        action: 'mark_read'
      },
      message: 'تم تعليم الإشعار كمقروء'
    });

  } catch (error) {
    console.error('❌ خطأ في تعليم الإشعار كمقروء:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في تعليم الإشعار كمقروء',
      code: 'MARK_READ_ERROR'
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const body = await req.json();
    const { notificationIds, action = 'read' } = body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'قائمة معرفات الإشعارات مطلوبة',
        code: 'MISSING_NOTIFICATION_IDS'
      }, { status: 400 });
    }

    // التحقق من وجود الإشعارات
    const notifications = await prisma.smartNotifications.findMany({
      where: {
        id: { in: notificationIds },
        user_id: user.id
      },
      select: { id: true, read_at: true }
    });

    if (notifications.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على إشعارات صحيحة',
        code: 'NO_VALID_NOTIFICATIONS'
      }, { status: 404 });
    }

    let updateData: any = {};
    let actionMessage = '';

    switch (action) {
      case 'read':
        updateData = {
          read_at: new Date(),
          status: 'read'
        };
        actionMessage = 'مقروءة';
        break;
      case 'unread':
        updateData = {
          read_at: null,
          status: 'sent'
        };
        actionMessage = 'غير مقروءة';
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'نوع العملية غير صحيح',
          code: 'INVALID_ACTION'
        }, { status: 400 });
    }

    // تحديث الإشعارات
    const result = await prisma.smartNotifications.updateMany({
      where: {
        id: { in: notifications.map(n => n.id) },
        user_id: user.id
      },
      data: updateData
    });

    // إحصائيات محدثة
    const totalUnread = await prisma.smartNotifications.count({
      where: {
        user_id: user.id,
        read_at: null
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count,
        totalUnread,
        action,
        processedIds: notifications.map(n => n.id)
      },
      message: `تم تعليم ${result.count} إشعار كـ${actionMessage}`
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإشعارات:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحديث الإشعارات',
      code: 'BATCH_UPDATE_ERROR'
    }, { status: 500 });
  }
}
