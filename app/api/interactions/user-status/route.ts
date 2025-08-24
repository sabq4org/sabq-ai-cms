import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthFromRequest } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId' }, { status: 400 });
    }

    // جلب عدادات المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { likes: true, saves: true },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // محاولة الحصول على المستخدم
    let userId: string | null = null;
    try {
      const user = await requireAuthFromRequest(req);
      userId = user.id;
    } catch {}

    if (!userId) {
      // غير مسجل الدخول: أعد العدادات فقط
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        liked: false,
        saved: false,
        likesCount: article.likes || 0,
        savesCount: article.saves || 0,
      });
    }

    const [likeInteraction, saveInteraction] = await Promise.all([
      prisma.interactions.findUnique({
        where: { user_id_article_id_type: { user_id: userId, article_id: articleId, type: 'like' } },
        select: { id: true },
      }),
      prisma.interactions.findUnique({
        where: { user_id_article_id_type: { user_id: userId, article_id: articleId, type: 'save' } },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      liked: Boolean(likeInteraction),
      saved: Boolean(saveInteraction),
      likesCount: article.likes || 0,
      savesCount: article.saves || 0,
    });
  } catch (e: any) {
    console.error('/api/interactions/user-status error:', e);
    return NextResponse.json({ error: 'Failed to fetch user status' }, { status: 500 });
  }
}
