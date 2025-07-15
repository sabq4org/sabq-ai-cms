import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// POST: إنشاء جلسة قراءة جديدة
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await request.json();
    const { articleId, deviceType, timeOfDay } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    // إنشاء جلسة القراءة
    const session = await prisma.user_reading_sessions.create({
      data: {
        id: `session-${userId}-${Date.now()}`,
        user_id: userId,
        article_id: articleId,
        device_type: deviceType || 'unknown',
        time_of_day: timeOfDay || new Date().getHours(),
        started_at: new Date()
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      message: 'تم بدء جلسة القراءة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إنشاء جلسة القراءة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء جلسة القراءة' },
      { status: 500 }
    );
  }
} 