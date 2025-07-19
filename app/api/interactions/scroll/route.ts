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
    const { sessionId, scrollDepth, maxScrollDepth, interactionType } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // تحديث جلسة القراءة
    const updatedSession = await prisma.user_reading_sessions.update({
      where: {
        session_id: sessionId,
      },
      data: {
        scroll_depth: scrollDepth,
        max_scroll_depth: maxScrollDepth,
        last_active: new Date(),
        is_completed: scrollDepth > 0.9,
      },
    });

    // إذا وصل لنوع تفاعل جديد، سجله
    if (interactionType && interactionType !== 'view') {
      const existingInteraction = await prisma.interactions.findFirst({
        where: {
          user_id: userId,
          target_id: updatedSession.article_id,
          target_type: 'article',
          type: 'reading_session',
        },
      });

      if (!existingInteraction) {
        await prisma.interactions.create({
          data: {
            user_id: userId,
            target_id: updatedSession.article_id,
            target_type: 'article',
            type: 'reading_session',
            metadata: {
              sessionId,
              interactionType,
              maxScrollDepth,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      scrollDepth,
      maxScrollDepth,
      interactionType,
    });
  } catch (error) {
    console.error('Error updating scroll progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 