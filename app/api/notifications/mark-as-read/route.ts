import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// تحديد إشعار كمقروء
export async function POST(request: NextRequest) {
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

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json({ error: 'معرف الإشعار مطلوب' }, { status: 400 });
    }

    // تحديث حالة الإشعار
    const notification = await prisma.smartNotifications.update({
      where: {
        id: notificationId,
        user_id: userId // التأكد من ملكية الإشعار
      },
      data: {
        read_at: new Date(),
        status: 'read'
      }
    });

    return NextResponse.json({ 
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإشعار' },
      { status: 500 }
    );
  }
}

// تحديد جميع الإشعارات كمقروءة
export async function PUT(request: NextRequest) {
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

    // تحديث جميع الإشعارات غير المقروءة
    const result = await prisma.smartNotifications.updateMany({
      where: {
        user_id: userId,
        read_at: null,
        status: 'delivered'
      },
      data: {
        read_at: new Date(),
        status: 'read'
      }
    });

    return NextResponse.json({ 
      success: true,
      updated: result.count
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإشعارات' },
      { status: 500 }
    );
  }
}