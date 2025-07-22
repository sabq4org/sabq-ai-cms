import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // التحقق من المستخدم عبر JWT
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ hasLiked: false, hasSaved: false });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ hasLiked: false, hasSaved: false });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // جلب تفاعلات المستخدم مع المقال
    const interactions = await prisma.interactions.findMany({
      where: {
        userId,
        targetId: articleId,
        targetType: 'article',
        type: {
          in: ['like', 'save'],
        },
      },
      select: {
        type: true,
      },
    });

    const hasLiked = interactions.some((i: { type: string }) => i.type === 'like');
    const hasSaved = interactions.some((i: { type: string }) => i.type === 'save');

    return NextResponse.json({
      hasLiked,
      hasSaved,
      userId,
      articleId,
    });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 