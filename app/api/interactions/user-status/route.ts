import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDbConnected, retryWithConnection, isPrismaNotConnectedError } from '@/lib/prisma';
import { requireAuthFromRequest } from '@/app/lib/auth';

// تعيين runtime كـ nodejs لـ Prisma
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 بدء معالجة طلب حالة التفاعل...');
    
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      console.error('❌ articleId مفقود');
      return NextResponse.json({ 
        success: false,
        error: 'Missing articleId' 
      }, { status: 400 });
    }

    // محاولة الحصول على المستخدم
    let userId: string | null = null;
    try {
      const user = await requireAuthFromRequest(req);
      userId = user.id;
    } catch {}

    let article = null;
    let likeInteraction = null;
    let saveInteraction = null;
    let dbConnected = false;

    try {
      // محاولة الاتصال وجلب البيانات
      dbConnected = await ensureDbConnected();
      
      if (dbConnected) {
        // جلب عدادات المقال
        article = await retryWithConnection(async () => {
          return await prisma.articles.findUnique({
            where: { id: articleId },
            select: { likes: true, saves: true },
          });
        });

        if (!article) {
          console.error('❌ المقال غير موجود:', articleId);
          return NextResponse.json({ 
            success: false,
            error: 'Article not found' 
          }, { status: 404 });
        }

        // إذا كان المستخدم مسجل دخول، جلب حالة التفاعلات
        if (userId) {
          const interactions = await retryWithConnection(async () => {
            return await Promise.all([
              prisma.interactions.findUnique({
                where: { user_id_article_id_type: { user_id: userId, article_id: articleId, type: 'like' } },
                select: { id: true },
              }),
              prisma.interactions.findUnique({
                where: { user_id_article_id_type: { user_id: userId, article_id: articleId, type: 'save' } },
                select: { id: true },
              }),
            ]);
          });
          
          [likeInteraction, saveInteraction] = interactions;
        }
      }
    } catch (dbError: any) {
      console.warn('⚠️ [user-status] فشل الاتصال بقاعدة البيانات، استخدام القيم الافتراضية:', dbError.message);
      
      if (!isPrismaNotConnectedError(dbError)) {
        throw dbError; // إعادة رمي الخطأ إذا لم يكن مشكلة اتصال
      }
      
      // استخدام قيم افتراضية
      article = { likes: 0, saves: 0 };
      dbConnected = false;
    }

    // إذا لم نتمكن من الاتصال، استخدم قيم افتراضية
    if (!article) {
      article = { likes: 0, saves: 0 };
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: Boolean(userId),
      liked: Boolean(likeInteraction),
      saved: Boolean(saveInteraction),
      likesCount: article.likes || 0,
      savesCount: article.saves || 0,
      fallback: !dbConnected // إشارة للواجهة أن البيانات قد تكون افتراضية
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
