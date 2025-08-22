import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    // تحديد جميع الإشعارات كمقروءة
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
        updated: result.count
      }
    });

  } catch (error) {
    console.error('notifications/mark-all-read-header error:', error);
    return NextResponse.json({ success: false, message: 'خطأ غير متوقع' }, { status: 500 });
  }
}
