/**
 * 🔔 API: عدد الإشعارات غير المقروءة
 * 
 * GET /api/smart-notifications/unread-count
 * 
 * Response: { count: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error('Error counting unread notifications:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

