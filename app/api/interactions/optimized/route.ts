import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import { PrismaClient, interactions_type } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// مخطط التحقق من صحة البيانات
const InteractionSchema = z.object({
  articleId: z.string().min(1, 'معرف المقال مطلوب'),
  action: z.enum(['like', 'save'], {
    errorMap: () => ({ message: 'الإجراء يجب أن يكون like أو save' })
  }),
  toggle: z.boolean().optional().default(true) // true للتبديل، false للحالة المحددة
});

const CheckInteractionSchema = z.object({
  articleId: z.string().min(1, 'معرف المقال مطلوب')
});

// معالج الأخطاء مع كودات واضحة
class InteractionError extends Error {
  constructor(message: string, public code: number, public errorCode?: string) {
    super(message);
    this.name = 'InteractionError';
  }
}

// TypeScript type guards
function isPrismaError(error: any): error is { code: string; meta?: any } {
  return error && typeof error.code === 'string';
}

function hasMessage(error: any): error is { message: string } {
  return error && typeof error.message === 'string';
}

/**
 * POST /api/interactions/optimized
 * API محسن للتفاعلات مع معالجة شاملة للأخطاء وأداء عالي
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // التحقق من المصادقة
    const user = await requireAuthFromRequest(request);
    if (!user) {
      throw new InteractionError('المستخدم غير مصرح له', 401, 'UNAUTHORIZED');
    }

    // التحقق من صحة البيانات
    const body = await request.json();
    const validatedData = InteractionSchema.parse(body);
    const { articleId, action, toggle } = validatedData;

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, status: true, likes: true, saves: true }
    });

    if (!article) {
      throw new InteractionError('المقال غير موجود', 404, 'ARTICLE_NOT_FOUND');
    }

    if (article.status !== 'published') {
      throw new InteractionError('لا يمكن التفاعل مع مقال غير منشور', 403, 'ARTICLE_NOT_PUBLISHED');
    }

    // سجل العملية
    console.log(`🔄 [${requestId}] ${action} تفاعل من ${user.email} مع ${article.title?.substring(0, 30)}...`);

    let result;
    
    // تنفيذ العملية ضمن معاملة واحدة لضمان تناسق البيانات
    if (toggle) {
      result = await handleToggleInteraction(user.id, articleId, action, requestId);
    } else {
      result = await handleDirectInteraction(user.id, articleId, action, validatedData, requestId);
    }

    // حساب زمن الاستجابة
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // سجل النجاح
    console.log(`✅ [${requestId}] ${action} نجح في ${duration}ms - النتيجة: ${result.action}`);

    // رد مع البيانات المحدثة
    return NextResponse.json({
      success: true,
      action: result.action,
      data: {
        liked: result.liked,
        saved: result.saved,
        likesCount: result.likesCount,
        savesCount: result.savesCount
      },
      performance: {
        duration,
        server_processing: `${duration}ms`,
        request_id: requestId
      },
      timestamp: new Date().toISOString()
    }, { 
      status: 200,
      headers: {
        'X-Response-Time': `${duration}ms`,
        'X-Request-ID': requestId
      }
    });

  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // معالجة الأخطاء مع تسجيل مفصل
    if (error instanceof InteractionError) {
      console.error(`❌ [${requestId}] خطأ التفاعل: ${error.message} (${error.errorCode})`);
      return NextResponse.json({
        success: false,
        error: error.message,
        error_code: error.errorCode,
        request_id: requestId,
        duration: `${duration}ms`
      }, { status: error.code });
    }

    if (error instanceof z.ZodError) {
      console.error(`❌ [${requestId}] خطأ التحقق من البيانات:`, error.errors);
      return NextResponse.json({
        success: false,
        error: 'بيانات غير صحيحة',
        error_code: 'VALIDATION_ERROR',
        details: error.errors,
        request_id: requestId
      }, { status: 400 });
    }

    // أخطاء قاعدة البيانات
    if (isPrismaError(error)) {
      if (error.code === 'P2002') {
        console.error(`❌ [${requestId}] تضارب القيد الفريد:`, error.meta);
        return NextResponse.json({
          success: false,
          error: 'تضارب في التفاعل',
          error_code: 'CONFLICT',
          request_id: requestId
        }, { status: 409 });
      }

      if (error.code === 'P2025') {
        console.error(`❌ [${requestId}] سجل غير موجود:`, error.meta);
        return NextResponse.json({
          success: false,
          error: 'السجل غير موجود',
          error_code: 'NOT_FOUND',
          request_id: requestId
        }, { status: 404 });
      }
    }

    // خطأ عام
    const errorMessage = hasMessage(error) ? error.message : 'Unknown error';
    const errorCode = isPrismaError(error) ? error.code : 'UNKNOWN';
    const errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 5) : [];

    console.error(`❌ [${requestId}] خطأ خادم:`, {
      message: errorMessage,
      code: errorCode,
      stack: errorStack
    });

    return NextResponse.json({
      success: false,
      error: 'خطأ داخلي في الخادم',
      error_code: 'INTERNAL_SERVER_ERROR',
      request_id: requestId,
      duration: `${duration}ms`
    }, { status: 500 });

  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

/**
 * معالجة التبديل (toggle) للتفاعلات
 */
async function handleToggleInteraction(userId: string, articleId: string, action: string, requestId: string) {
  const interactionType = action as interactions_type;
  
  return await prisma.$transaction(async (tx) => {
    // البحث عن التفاعل الموجود
    const existingInteraction = await tx.interactions.findUnique({
      where: {
        user_id_article_id_type: {
          user_id: userId,
          article_id: articleId,
          type: interactionType
        }
      }
    });

    let actionResult: string;
    let interactionExists = !!existingInteraction;

    if (existingInteraction) {
      // إزالة التفاعل الموجود
      await tx.interactions.delete({
        where: { id: existingInteraction.id }
      });
      
      // تقليل العداد
      const decrementField = action === 'like' ? 'likes' : 'saves';
      await tx.articles.update({
        where: { id: articleId },
        data: { [decrementField]: { decrement: 1 } }
      });

      actionResult = 'removed';
      interactionExists = false;

      console.log(`➖ [${requestId}] إزالة ${action} - المستخدم: ${userId}`);
    } else {
      // إنشاء تفاعل جديد
      await tx.interactions.create({
        data: {
          id: `${action}_${userId}_${articleId}_${Date.now()}`,
          user_id: userId,
          article_id: articleId,
          type: interactionType,
          created_at: new Date()
        }
      });

      // زيادة العداد
      const incrementField = action === 'like' ? 'likes' : 'saves';
      await tx.articles.update({
        where: { id: articleId },
        data: { [incrementField]: { increment: 1 } }
      });

      actionResult = 'added';
      interactionExists = true;

      console.log(`➕ [${requestId}] إضافة ${action} - المستخدم: ${userId}`);
    }

    // تأكد من عدم وجود قيم سالبة
    await tx.articles.updateMany({
      where: { 
        id: articleId,
        OR: [
          { likes: { lt: 0 } },
          { saves: { lt: 0 } }
        ]
      },
      data: {
        likes: { set: 0 },
        saves: { set: 0 }
      }
    });

    // جلب البيانات المحدثة
    const updatedArticle = await tx.articles.findUnique({
      where: { id: articleId },
      select: { likes: true, saves: true }
    });

    // جلب حالة جميع التفاعلات للمستخدم مع هذا المقال
    const allInteractions = await tx.interactions.findMany({
      where: {
        user_id: userId,
        article_id: articleId,
        type: { in: ['like', 'save'] }
      },
      select: { type: true }
    });

    const hasLiked = allInteractions.some(i => i.type === 'like');
    const hasSaved = allInteractions.some(i => i.type === 'save');

    return {
      action: actionResult,
      liked: hasLiked,
      saved: hasSaved,
      likesCount: updatedArticle?.likes || 0,
      savesCount: updatedArticle?.saves || 0
    };
  });
}

/**
 * معالجة التفاعل المباشر (بدون تبديل)
 */
async function handleDirectInteraction(userId: string, articleId: string, action: string, data: any, requestId: string) {
  // للتنفيذ المستقبلي - حالياً نستخدم toggle فقط
  return await handleToggleInteraction(userId, articleId, action, requestId);
}

/**
 * GET /api/interactions/optimized
 * جلب حالة التفاعلات للمستخدم مع مقال محدد
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = `get_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // التحقق من المصادقة
    const user = await requireAuthFromRequest(request);
    if (!user) {
      throw new InteractionError('المستخدم غير مصرح له', 401, 'UNAUTHORIZED');
    }

    // التحقق من صحة المعاملات
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    
    if (!articleId) {
      throw new InteractionError('معرف المقال مطلوب', 400, 'MISSING_ARTICLE_ID');
    }

    const validatedData = CheckInteractionSchema.parse({ articleId });

    // جلب حالة التفاعلات والإحصائيات في استعلام واحد محسن
    const [interactions, article] = await Promise.all([
      prisma.interactions.findMany({
        where: {
          user_id: user.id,
          article_id: validatedData.articleId,
          type: { in: ['like', 'save'] }
        },
        select: { type: true, created_at: true }
      }),
      prisma.articles.findUnique({
        where: { id: validatedData.articleId },
        select: { 
          id: true, 
          likes: true, 
          saves: true, 
          title: true,
          status: true 
        }
      })
    ]);

    if (!article) {
      throw new InteractionError('المقال غير موجود', 404, 'ARTICLE_NOT_FOUND');
    }

    const hasLiked = interactions.some(i => i.type === 'like');
    const hasSaved = interactions.some(i => i.type === 'save');

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`📊 [${requestId}] جلب حالة التفاعل - ${user.email} - ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: {
        liked: hasLiked,
        saved: hasSaved,
        likesCount: article.likes || 0,
        savesCount: article.saves || 0,
        interactions: interactions.map(i => ({
          type: i.type,
          created_at: i.created_at
        }))
      },
      article: {
        id: article.id,
        title: article.title,
        status: article.status
      },
      performance: {
        duration: `${duration}ms`,
        request_id: requestId
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-Response-Time': `${duration}ms`,
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (error instanceof InteractionError) {
      console.error(`❌ [${requestId}] خطأ جلب التفاعل: ${error.message}`);
      return NextResponse.json({
        success: false,
        error: error.message,
        error_code: error.errorCode,
        request_id: requestId,
        duration: `${duration}ms`
      }, { status: error.code });
    }

    console.error(`❌ [${requestId}] خطأ خادم في جلب التفاعل:`, error);
    return NextResponse.json({
      success: false,
      error: 'خطأ داخلي في الخادم',
      error_code: 'INTERNAL_SERVER_ERROR',
      request_id: requestId,
      duration: `${duration}ms`
    }, { status: 500 });

  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
