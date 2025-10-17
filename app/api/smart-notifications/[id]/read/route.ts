/**
 * 🔔 API: تعليم إشعار كمقروء
 * 
 * PATCH /api/smart-notifications/[id]/read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    // تحديث الإشعار
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id // التأكد من أن الإشعار يخص المستخدم
      },
      data: {
        isRead: true
      }
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

