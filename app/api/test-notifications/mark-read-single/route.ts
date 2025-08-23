// API لتحديد إشعار واحد كمقروء - نسخة تجريبية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 [TEST MARK SINGLE] بدء تحديد إشعار كمقروء...');
    
    const body = await req.json();
    const { notificationId } = body;
    
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب معرف الإشعار',
        code: 'MISSING_NOTIFICATION_ID'
      }, { status: 400 });
    }
    
    console.log(`🧪 [TEST MARK SINGLE] تحديد إشعار: ${notificationId}`);
    
    // تحديد الإشعار كمقروء
    const updatedNotification = await prisma.smartNotifications.update({
      where: {
        id: notificationId
      },
      data: {
        read_at: new Date(),
        status: 'read'
      },
      select: {
        id: true,
        title: true,
        read_at: true,
        user_id: true
      }
    });
    
    // حساب العدد المحدث للإشعارات غير المقروءة
    const remainingUnread = await prisma.smartNotifications.count({
      where: {
        user_id: updatedNotification.user_id,
        read_at: null
      }
    });
    
    console.log(`✅ [TEST MARK SINGLE] تم تحديد الإشعار، متبقي ${remainingUnread} غير مقروءة`);
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: {
        notification: {
          id: updatedNotification.id,
          title: updatedNotification.title,
          read_at: updatedNotification.read_at,
          markedAt: new Date().toISOString()
        },
        remainingUnread: remainingUnread,
        stats: {
          processed: 1,
          remaining: remainingUnread
        },
        performance: {
          timestamp: new Date().toISOString(),
          source: 'test-mark-single-api'
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ [TEST MARK SINGLE] خطأ:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'الإشعار غير موجود',
        details: 'لم يتم العثور على إشعار بهذا المعرف',
        code: 'NOTIFICATION_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحديد الإشعار',
      details: error.message,
      code: 'MARK_SINGLE_ERROR'
    }, { status: 500 });
  }
}
