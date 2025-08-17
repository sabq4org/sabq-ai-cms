import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// PATCH: تحديث جلسة القراءة
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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
    const { sessionId } = await params;
    const body = await request.json();
    const { duration, readPercentage, scrollDepth } = body;

    // التحقق من وجود الجلسة وأنها تخص المستخدم الحالي
    const session = await prisma.user_reading_sessions.findFirst({
      where: {
        id: sessionId,
        user_id: userId
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'جلسة القراءة غير موجودة' }, { status: 404 });
    }

    // تحديث جلسة القراءة
    const updatedSession = await prisma.user_reading_sessions.update({
      where: { id: sessionId },
      data: {
        ended_at: new Date(),
        duration_seconds: duration,
        read_percentage: readPercentage,
        scroll_depth: scrollDepth
      }
    });

    return NextResponse.json({
      message: 'تم تحديث جلسة القراءة بنجاح',
      session: updatedSession
    });

  } catch (error) {
    console.error('خطأ في تحديث جلسة القراءة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث جلسة القراءة' },
      { status: 500 }
    );
  }
} 