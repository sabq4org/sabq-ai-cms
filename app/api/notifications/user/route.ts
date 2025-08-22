import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// جلب إشعارات المستخدم
export async function GET(request: NextRequest) {
  try {
    // استخراج التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }

    // جلب آخر 50 إشعار للمستخدم
    const notifications = await prisma.smartNotifications.findMany({
      where: {
        user_id: userId,
        status: {
          in: ['delivered', 'read']
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        priority: true,
        category: true,
        data: true,
        read_at: true,
        created_at: true,
        clicked_at: true
      }
    });

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.smartNotifications.count({
      where: {
        user_id: userId,
        read_at: null,
        status: 'delivered'
      }
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإشعارات' },
      { status: 500 }
    );
  }
}
