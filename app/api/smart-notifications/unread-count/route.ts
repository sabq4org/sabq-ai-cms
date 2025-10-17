/**
 * 🔔 API: عدد الإشعارات غير المقروءة
 * 
 * GET /api/smart-notifications/unread-count
 * 
 * Response: { unreadCount: number }
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

    // عد الإشعارات غير المقروءة
    const count = await SmartNotificationService.getUnreadCount(user.id);

    return NextResponse.json({ 
      success: true,
      unreadCount: count 
    });

  } catch (error) {
    console.error('❌ خطأ في عد الإشعارات:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

