import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    if (!token) {
      const c = request.cookies;
      token = c.get('auth-token')?.value || c.get('sabq_at')?.value || c.get('access_token')?.value || c.get('token')?.value || c.get('jwt')?.value || null;
    }
    if (!token) return null;
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
    return userId ? String(userId) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    // أفضلية لاستخراج المستخدم من التوكن إذا كان متاحاً
    const userIdFromToken = getUserIdFromRequest(request);
    const userIdParam = searchParams.get('userId');
    const userId = userIdFromToken || userIdParam;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف المستخدم مطلوب' 
      }, { status: 400 });
    }

    if (userId === 'anonymous') {
      return NextResponse.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          page,
          totalPages: 0
        }
      });
    }

    const skip = (page - 1) * limit;

    // محاولة القراءة من جدول bookmarks إن وُجد وإلا fallback إلى interactions
    let articleIds: string[] = [];
    let savedMap: Record<string, Date> = {};

    try {
      const rows: Array<{ article_id: string; created_at: Date }> = await prisma.$queryRawUnsafe(
        `SELECT article_id, created_at FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3`,
        userId,
        skip,
        limit
      );
      articleIds = rows.map(r => r.article_id).filter(Boolean);
      rows.forEach(r => { savedMap[r.article_id] = r.created_at; });
    } catch {
      const savedInteractions = await prisma.interactions.findMany({
        where: { user_id: userId, type: 'save' },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      });
      articleIds = savedInteractions.map(i => i.article_id).filter(Boolean);
      savedInteractions.forEach(i => { savedMap[i.article_id] = i.created_at as unknown as Date; });
    }

    // جلب تفاصيل المقالات
    const articles = await prisma.articles.findMany({
      where: {
        id: { in: articleIds },
        status: 'published'
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      }
    });

    // ترتيب المقالات حسب ترتيب التفاعلات
    const sortedArticles = articleIds.map(id => articles.find(article => article.id === id)).filter(Boolean);

    // إضافة معلومات التفاعل
    const articlesWithInteraction = sortedArticles.map(article => {
      if (!article) return null;
      return {
        ...article,
        saved_at: savedMap[article.id] || (article as any).saved_at
      };
    }).filter(Boolean);

    // حساب العدد الإجمالي
    let totalSaved = 0;
    try {
      const rows: Array<{ count: bigint }> = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::bigint as count FROM bookmarks WHERE user_id = $1`,
        userId
      );
      totalSaved = Number(rows?.[0]?.count || 0);
    } catch {
      totalSaved = await prisma.interactions.count({ where: { user_id: userId, type: 'save' } });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          articles: articlesWithInteraction,
          total: totalSaved,
          page,
          totalPages: Math.ceil(totalSaved / limit),
          hasMore: page * limit < totalSaved
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'حدث خطأ في جلب المقالات المحفوظة' 
    }, { status: 500 });
  }
} 