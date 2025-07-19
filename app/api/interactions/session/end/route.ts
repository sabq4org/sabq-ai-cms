import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const {
      sessionId,
      articleId,
      exitTime,
      duration,
      readingSpeed,
      maxScrollDepth,
      interactions,
    } = body;

    if (!sessionId || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // تحديث جلسة القراءة
    await prisma.user_reading_sessions.updateMany({
      where: {
        user_id: userId,
        article_id: articleId,
      },
      data: {
        end_time: new Date(exitTime),
        total_time: Math.floor(duration / 1000), // تحويل من ميلي ثانية إلى ثانية
        scroll_depth: maxScrollDepth || 0,
        is_completed: maxScrollDepth > 0.9,
        last_active: new Date(),
      },
    });

    // حفظ ملخص التفاعلات
    if (interactions) {
      // تحديث نقاط الولاء بناءً على التفاعلات
      let loyaltyPoints = 0;
      
      // نقاط القراءة
      if (maxScrollDepth > 0.9) {
        loyaltyPoints += 10; // قراءة كاملة
      } else if (maxScrollDepth > 0.7) {
        loyaltyPoints += 7; // قراءة جيدة
      } else if (maxScrollDepth > 0.5) {
        loyaltyPoints += 5; // قراءة متوسطة
      } else if (maxScrollDepth > 0.3) {
        loyaltyPoints += 3; // قراءة سريعة
      }

      // نقاط التفاعل
      if (interactions.liked) loyaltyPoints += 2;
      if (interactions.saved) loyaltyPoints += 3;
      if (interactions.shared) loyaltyPoints += 5;
      if (interactions.commented) loyaltyPoints += 10;

      // تحديث نقاط الولاء للمستخدم
      await prisma.user_loyalty_points.create({
        data: {
          user_id: userId,
          points: loyaltyPoints,
          points_type: 'article_interaction',
          description: `تفاعل مع مقال: ${articleId}`,
          metadata: {
            articleId,
            sessionId,
            duration,
            scrollDepth: maxScrollDepth,
            interactions,
          },
        },
      });

      // تحديث إجمالي النقاط
      await prisma.users.update({
        where: { id: userId },
        data: {
          total_points: {
            increment: loyaltyPoints,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reading session ended successfully',
      stats: {
        duration: Math.floor(duration / 1000),
        scrollDepth: maxScrollDepth,
        readingSpeed,
      },
    });
  } catch (error) {
    console.error('Error ending reading session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 