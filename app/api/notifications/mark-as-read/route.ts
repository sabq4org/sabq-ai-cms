// API محسّن لتحديد الإشعارات كمقروءة - حل مشكلة الثبات
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export const runtime = "nodejs";

// تحديد إشعار واحد أو عدة إشعارات كمقروءة
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
    const { notificationId, notificationIds, markAll = false } = body;

    let result;
    let action;

    if (markAll) {
      // تحديد جميع الإشعارات غير المقروءة كمقروءة
      result = await prisma.smartNotifications.updateMany({
        where: {
          user_id: user.id,
          read_at: null
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });
      action = 'mark_all_read';
      
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // تحديد عدة إشعارات كمقروءة
      result = await prisma.smartNotifications.updateMany({
        where: {
          id: { in: notificationIds },
          user_id: user.id,
          read_at: null
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });
      action = 'mark_multiple_read';
      
    } else if (notificationId) {
      // تحديد إشعار واحد كمقروء
      result = await prisma.smartNotifications.updateMany({
        where: {
          id: notificationId,
          user_id: user.id
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });
      action = 'mark_single_read';
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'مطلوب معرف الإشعار أو تحديد العملية',
        code: 'INVALID_REQUEST'
      }, { status: 400 });
    }

    // جلب عدد الإشعارات غير المقروءة المحدث
    const unreadCount = await prisma.smartNotifications.count({
      where: {
        user_id: user.id,
        read_at: null
      }
    });

    console.log(`✅ تم تحديد ${result.count} إشعار كمقروء للمستخدم ${user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count,
        unreadCount,
        action,
        timestamp: new Date().toISOString()
      },
      message: result.count > 0 
        ? `تم تحديد ${result.count} إشعار كمقروء` 
        : 'لا توجد إشعارات جديدة للتحديد'
    });

  } catch (error) {
    console.error('❌ خطأ في تحديد الإشعارات كمقروءة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// جلب حالة الإشعارات
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (notificationId) {
      // التحقق من حالة إشعار محدد
      const notification = await prisma.smartNotifications.findFirst({
        where: {
          id: notificationId,
          user_id: user.id
        },
        select: {
          id: true,
          read_at: true,
          status: true,
          clicked_at: true
        }
      });

      if (!notification) {
        return NextResponse.json({
          success: false,
          error: 'الإشعار غير موجود',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          isRead: !!notification.read_at,
          status: notification.status,
          isClicked: !!notification.clicked_at,
          readAt: notification.read_at
        }
      });

    } else {
      // جلب إحصائيات عامة
      const [totalCount, unreadCount, readCount] = await Promise.all([
        prisma.smartNotifications.count({
          where: { user_id: user.id }
        }),
        prisma.smartNotifications.count({
          where: { user_id: user.id, read_at: null }
        }),
        prisma.smartNotifications.count({
          where: { user_id: user.id, read_at: { not: null } }
        })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          total: totalCount,
          unread: unreadCount,
          read: readCount,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('❌ خطأ في جلب حالة الإشعارات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}
