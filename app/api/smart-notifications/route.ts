/**
 * 🔔 API: إدارة الإشعارات الذكية الجديدة
 * 
 * GET /api/smart-notifications - جلب الإشعارات
 * POST /api/smart-notifications - إنشاء إشعار جديد
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { SmartNotificationService } from '@/lib/services/smartNotificationService';

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // جلب الإشعارات بسرعة
    let notifications;
    if (unreadOnly) {
      notifications = await SmartNotificationService.getUnreadNotifications(user.id, limit);
    } else {
      notifications = await SmartNotificationService.getUserNotifications(user.id, {
        limit,
        offset
      });
    }

    return NextResponse.json({
      success: true,
      data: unreadOnly ? notifications : (notifications as any).data,
      ...(unreadOnly ? {} : { 
        total: (notifications as any).total,
        hasMore: (notifications as any).hasMore
      })
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإشعارات:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, priority, data } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'عنوان ورسالة ونوع مطلوبة' },
        { status: 400 }
      );
    }

    const notification = await SmartNotificationService.createNotification({
      user_id: user.id,
      title,
      message,
      type,
      priority: priority || 'medium',
      data
    });

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعار:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
