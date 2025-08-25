import { NextRequest, NextResponse } from 'next/server';
import prisma, { ensureDbConnected, retryWithConnection } from '@/lib/prisma';
import { requireAuthFromRequest } from '@/app/lib/auth';

// تعيين runtime كـ nodejs لـ Prisma
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 بدء معالجة طلب حالة التفاعل...');
    
    // التأكد من الاتصال بقاعدة البيانات
    await ensureDbConnected();
    
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      console.error('❌ articleId مفقود');
      return NextResponse.json({ 
        success: false,
        error: 'Missing articleId' 
      }, { status: 400 });
    }

    // جلب عدادات المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { likes: true, saves: true },
    });
    if (!article) {
      console.error('❌ المقال غير موجود:', articleId);
      return NextResponse.json({ 
        success: false,
        error: 'Article not found' 
      }, { status: 404 });
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
    console.error('❌ خطأ في /api/interactions/user-status:', {
      error: e,
      message: e?.message,
      stack: e?.stack
    });
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch user status',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
