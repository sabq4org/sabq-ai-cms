// API لحذف إشعار واحد نهائياً - نسخة تجريبية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ [TEST DELETE SINGLE] بدء حذف إشعار نهائياً...');
    
    const body = await req.json();
    const { notificationId } = body;
    
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب معرف الإشعار',
        code: 'MISSING_NOTIFICATION_ID'
      }, { status: 400 });
    }
    
    console.log(`🗑️ [TEST DELETE SINGLE] حذف إشعار: ${notificationId}`);
    
    // الحصول على معلومات الإشعار قبل الحذف
    const notificationInfo = await prisma.smartNotifications.findUnique({
      where: {
        id: notificationId
      },
      select: {
        id: true,
        title: true,
        user_id: true,
        read_at: true
      }
    });
    
    if (!notificationInfo) {
      return NextResponse.json({
        success: false,
        error: 'الإشعار غير موجود',
        code: 'NOTIFICATION_NOT_FOUND'
      }, { status: 404 });
    }
    
    // حذف الإشعار نهائياً
    await prisma.smartNotifications.delete({
      where: {
        id: notificationId
      }
    });
    
    // حساب العدد المحدث للإشعارات غير المقروءة
    const remainingUnread = await prisma.smartNotifications.count({
      where: {
        user_id: notificationInfo.user_id,
        read_at: null
      }
    });
    
    // حساب إجمالي الإشعارات المتبقية
    const totalRemaining = await prisma.smartNotifications.count({
      where: {
        user_id: notificationInfo.user_id
      }
    });
    
    console.log(`✅ [TEST DELETE SINGLE] تم حذف الإشعار نهائياً، متبقي ${remainingUnread} غير مقروءة من إجمالي ${totalRemaining}`);
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار نهائياً',
      data: {
        deletedNotification: {
          id: notificationInfo.id,
          title: notificationInfo.title,
          wasRead: !!notificationInfo.read_at,
          deletedAt: new Date().toISOString()
        },
        remainingUnread: remainingUnread,
        totalRemaining: totalRemaining,
        stats: {
          deleted: 1,
          remainingUnread: remainingUnread,
          totalRemaining: totalRemaining
        },
        performance: {
          timestamp: new Date().toISOString(),
          source: 'test-delete-single-api',
          action: 'permanent_delete'
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ [TEST DELETE SINGLE] خطأ:', error);
    
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
      error: 'خطأ في حذف الإشعار',
      details: error.message,
      code: 'DELETE_SINGLE_ERROR'
    }, { status: 500 });
  }
}
