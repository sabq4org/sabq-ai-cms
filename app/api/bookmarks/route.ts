import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const { articleId, saved } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    if (saved) {
      await prisma.user_interests.findMany({ take: 1 }); // keep client warm
      await prisma.$transaction([
        prisma.user_reading_sessions.findMany({ take: 0 }), // noop
      ]);
      await prisma.$transaction([
        prisma.user_preferences.findMany({ take: 0 }),
      ]);
      await prisma.$transaction([
        prisma.user_interests.findMany({ take: 0 }),
      ]);
      await prisma.$transaction([
        prisma.user_insights.findMany({ take: 0 }),
      ]);
      await prisma.$transaction([
        prisma.UserInteractions.upsert({
          where: { uniq_user_article_type: { user_id: user.id, article_id: articleId, interaction_type: "save" } as any },
          update: {},
          create: { user_id: user.id, article_id: articleId, interaction_type: "save" }
        })
      ]);
    } else {
      await prisma.UserInteractions.deleteMany({ where: { user_id: user.id, article_id: articleId, interaction_type: "save" } });
    }

    await prisma.$disconnect();
    return NextResponse.json({ saved: !!saved });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// دالة مساعدة للتحقق من المستخدم
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// POST - إضافة مقال للمفضلة
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, itemType } = await request.json();
    
    if (!itemId || !itemType) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId and itemType' 
      }, { status: 400 });
    }

    const existingInteraction = await prisma.interactions.findFirst({
      where: {
        user_id: userId,
        article_id: itemId,
        type: 'save'
      }
    });

    if (existingInteraction) {
      return NextResponse.json({ 
        message: 'Already bookmarked',
        bookmarkId: existingInteraction.id 
      });
    }

    // إضافة التفاعل الجديد
    const interaction = await prisma.interactions.create({
      data: {
        user_id: userId,
        article_id: itemId,
        type: 'save',
        created_at: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Bookmark added successfully',
      bookmarkId: interaction.id 
    });

  } catch (error) {
    console.error('خطأ في إضافة المفضلة:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET - جلب قائمة المفضلة
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // جلب جميع المفضلة للمستخدم
    const bookmarks = await prisma.interactions.findMany({
      where: { 
        user_id: userId, 
        type: 'save'
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            content: true,
            created_at: true,
            categories: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id,
      articleId: bookmark.article_id,
      title: bookmark.articles?.title || 'Unknown',
      content: bookmark.articles?.content?.substring(0, 150) + '...' || '',
      createdAt: bookmark.created_at,
      category: bookmark.articles?.categories?.[0]?.name || 'عام'
    }));

    return NextResponse.json({
      bookmarks: formattedBookmarks,
      total: bookmarks.length
    });

  } catch (error) {
    console.error('خطأ في جلب المفضلة:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - حذف من المفضلة
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ 
        error: 'Missing articleId parameter' 
      }, { status: 400 });
    }

    // حذف التفاعل
    const deleted = await prisma.interactions.deleteMany({
      where: {
        user_id: userId,
        article_id: articleId,
        type: 'save'
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ 
        error: 'Bookmark not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Bookmark removed successfully' 
    });

  } catch (error) {
    console.error('خطأ في حذف المفضلة:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
