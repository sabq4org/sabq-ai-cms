/**
 * 🔔 تحديث حالة الإشعار إلى "مقروء"
 * 
 * PATCH /api/smart-notifications/[id]/mark-read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { SmartNotificationService } from '@/lib/services/smartNotificationService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;

    // تحديث الإشعار
    const notification = await SmartNotificationService.updateNotificationStatus(
      id,
      'read'
    );

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإشعار:', error);

    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
