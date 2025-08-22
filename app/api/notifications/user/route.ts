import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // استخراج التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      // استجابة صامتة عند عدم وجود جلسة
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0, total: 0 });
    }

    // التحقق من صحة التوكن
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (error) {
      // استجابة صامتة عند توكن غير صالح
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0, total: 0 });
    }

    // جلب الإشعارات للمستخدم
    const notifications = await prisma.smartNotifications.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50 // أحدث 50 إشعار
    });

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = notifications.filter(n => !n.read_at).length;

    // تحويل التواريخ لـ ISO strings
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      created_at: notification.created_at.toISOString(),
      updated_at: notification.updated_at.toISOString(),
      read_at: notification.read_at?.toISOString() || null,
      data: notification.data || {}
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount,
      total: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإشعارات' },
      { status: 500 }
    );
  }
}