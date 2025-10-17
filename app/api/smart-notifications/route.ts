/**
 * 🔔 API: إدارة الإشعارات الذكية الجديدة
 * 
 * GET /api/smart-notifications - جلب الإشعارات
 * POST /api/smart-notifications - إنشاء إشعار جديد
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // جلب الإشعارات
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: [
        { isRead: 'asc' }, // غير المقروءة أولاً
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

