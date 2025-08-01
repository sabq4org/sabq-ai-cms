import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { articleId, sessionId, deviceType } = body;

    if (!articleId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // إنشاء جلسة قراءة جديدة
    const readingSession = await prisma.user_reading_sessions.create({
      data: {
        session_id: sessionId,
        user_id: userId,
        article_id: articleId,
        start_time: new Date(),
        device_type: deviceType || 'desktop',
        scroll_depth: 0,
        max_scroll_depth: 0,
        total_time: 0,
        is_completed: false,
      },
    });

    // تسجيل تفاعل "view"
    await prisma.interactions.create({
      data: {
        user_id: userId,
        target_id: articleId,
        target_type: 'article',
        type: 'view',
        metadata: {
          sessionId,
          deviceType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: readingSession.session_id,
      message: 'Reading session started',
    });
  } catch (error) {
    console.error('Error starting reading session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 