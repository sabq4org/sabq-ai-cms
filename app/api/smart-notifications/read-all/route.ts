/**
 * 🔔 API: تعليم جميع الإشعارات كمقروءة
 * 
 * POST /api/smart-notifications/read-all
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // تحديث جميع الإشعارات غير المقروءة
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({
      success: true,
      count: result.count
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

