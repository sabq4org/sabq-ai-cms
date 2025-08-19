// API محسّن لتحديد الإشعارات كمقروءة - حل مشكلة الثبات
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, requireAuthFromRequest } from '@/app/lib/auth';

export const runtime = "nodejs";

// إعدادات CORS للسماح بإرسال credentials
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// تحديد إشعار واحد أو عدة إشعارات كمقروءة
export async function POST(req: NextRequest) {
  try {
    // تجربة طرق مصادقة متعددة
    let user: any = null;
    
    // الطريقة الأولى: من الهيدر
    try {
      user = await requireAuthFromRequest(req);
    } catch (_) {
      // فشلت، نجرب الطريقة الثانية
    }
    
    // الطريقة الثانية: من الكوكيز
    if (!user) {
      try {
        user = await getCurrentUser();
      } catch (_) {
        // فشلت أيضاً
      }
    }
    
    if (!user) {
      console.log('❌ فشل في المصادقة في /api/notifications/mark-as-read');
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401, headers: corsHeaders });
    }

    console.log(`✅ نجحت المصادقة للمستخدم: ${user.email} (${user.id})`);

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
      }, { status: 400, headers: corsHeaders });
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
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ خطأ في تحديد الإشعارات كمقروءة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500, headers: corsHeaders });
  }
}

// جلب حالة الإشعارات
export async function GET(req: NextRequest) {
  try {
    // تجربة طرق مصادقة متعددة
    let user: any = null;
    
    try {
      user = await requireAuthFromRequest(req);
    } catch (_) {
      // فشلت، نجرب الطريقة الثانية
    }
    
    if (!user) {
      try {
        user = await getCurrentUser();
      } catch (_) {
        // فشلت أيضاً
      }
    }
    
    if (!user) {
      console.log('❌ فشل في المصادقة في GET /api/notifications/mark-as-read');
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401, headers: corsHeaders });
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
        }, { status: 404, headers: corsHeaders });
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
      }, { headers: corsHeaders });

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
      }, { headers: corsHeaders });
    }

  } catch (error) {
    console.error('❌ خطأ في جلب حالة الإشعارات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      code: 'SERVER_ERROR'
    }, { status: 500, headers: corsHeaders });
  }
}
