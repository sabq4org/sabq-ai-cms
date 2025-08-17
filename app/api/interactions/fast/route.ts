import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// كاش بسيط في الذاكرة مع انتهاء صلاحية
const cache = new Map();
const CACHE_TTL = 30000; // 30 ثانية

function getCachedResult(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedResult(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // تنظيف الكاش كل دقيقة
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
}

// التحقق من المصادقة
function getUserFromRequest(request: NextRequest): string | null {
  // في بيئة التطوير، استخدام الهيدر
  if (process.env.NODE_ENV === 'development') {
    return request.headers.get('user-id');
  }
  
  // في الإنتاج، استخدام المصادقة الفعلية
  // TODO: تنفيذ المصادقة الفعلية هنا
  return request.headers.get('user-id');
}

// مخطط التحقق
const getQuerySchema = z.object({
  articleId: z.string().min(1),
});

const postBodySchema = z.object({
  articleId: z.string().min(1),
  action: z.enum(['toggle']),
  type: z.enum(['like', 'save']),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // التحقق من المعاملات
    const { searchParams } = new URL(request.url);
    const parseResult = getQuerySchema.safeParse({
      articleId: searchParams.get('articleId'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid parameters',
        details: parseResult.error.issues,
        requestId,
        responseTime: Date.now() - startTime
      }, { status: 400 });
    }

    const { articleId } = parseResult.data;
    const userId = getUserFromRequest(request);

    // التحقق من الكاش
    const cacheKey = `${articleId}_${userId || 'anonymous'}`;
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        requestId,
        responseTime: Date.now() - startTime
      });
    }

    // استعلام محسن واحد
    const queryStart = Date.now();
    const [result] = await prisma.$queryRaw`
      SELECT 
        a.id as article_id,
        a.title,
        (SELECT COUNT(*) FROM "interactions" i1 WHERE i1.article_id = a.id AND i1.type = 'like') as likes_count,
        (SELECT COUNT(*) FROM "interactions" i2 WHERE i2.article_id = a.id AND i2.type = 'save') as saves_count,
        CASE WHEN ${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i3 
          WHERE i3.article_id = a.id 
          AND i3.user_id = ${userId}
          AND i3.type = 'like'
        ) THEN true ELSE false END as user_liked,
        CASE WHEN ${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i4 
          WHERE i4.article_id = a.id 
          AND i4.user_id = ${userId}
          AND i4.type = 'save'
        ) THEN true ELSE false END as user_saved
      FROM "articles" a
      WHERE a.id = ${articleId} AND a.status = 'published'
      LIMIT 1;
    ` as any[];
    const queryTime = Date.now() - queryStart;

    if (!result) {
      return NextResponse.json({
        error: 'Article not found or not published',
        requestId,
        responseTime: Date.now() - startTime
      }, { status: 404 });
    }

    const responseData = {
      articleId: result.article_id,
      title: result.title,
      likes: Number(result.likes_count) || 0,
      saves: Number(result.saves_count) || 0,
      userLiked: Boolean(result.user_liked),
      userSaved: Boolean(result.user_saved),
      hasUser: !!userId,
      queryTime,
      requestId,
      responseTime: Date.now() - startTime
    };

    // حفظ في الكاش
    setCachedResult(cacheKey, responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`[FAST-API-GET-${requestId}] Database error:`, error);
    return NextResponse.json({
      error: 'Internal server error',
      requestId,
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // التحقق من المصادقة
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        requestId,
        responseTime: Date.now() - startTime
      }, { status: 401 });
    }

    // التحقق من البيانات
    const body = await request.json();
    const parseResult = postBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: parseResult.error.issues,
        requestId,
        responseTime: Date.now() - startTime
      }, { status: 400 });
    }

    const { articleId, action, type } = parseResult.data;

    if (action !== 'toggle') {
      return NextResponse.json({
        error: 'Only toggle action is supported',
        requestId,
        responseTime: Date.now() - startTime
      }, { status: 400 });
    }

    // تنفيذ العملية في معاملة
    const transactionStart = Date.now();
    const result = await prisma.$transaction(async (tx) => {
      // التحقق من وجود المقال
      const article = await tx.articles.findUnique({
        where: { id: articleId },
        select: { id: true, status: true }
      });

      if (!article || article.status !== 'published') {
        throw new Error('Article not found or not published');
      }

      // التحقق من وجود التفاعل
      const existing = await tx.interactions.findFirst({
        where: { 
          article_id: articleId, 
          user_id: userId, 
          type: type 
        }
      });

      let newState: boolean;
      if (existing) {
        // إزالة التفاعل
        await tx.interactions.delete({ 
          where: { id: existing.id } 
        });
        newState = false;
      } else {
        // إضافة التفاعل
        await tx.interactions.create({
          data: {
            id: `interaction_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            article_id: articleId,
            user_id: userId,
            type: type
          }
        });
        newState = true;
      }

      return { newState };
    });
    
    const transactionTime = Date.now() - transactionStart;

    // مسح الكاش للمقال
    const cacheKeysToDelete = Array.from(cache.keys()).filter(key => key.startsWith(articleId));
    cacheKeysToDelete.forEach(key => cache.delete(key));

    return NextResponse.json({
      success: true,
      newState: result.newState,
      type,
      transactionTime,
      requestId,
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error(`[FAST-API-POST-${requestId}] Transaction error:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json({
      error: errorMessage,
      requestId,
      responseTime: Date.now() - startTime
    }, { status: statusCode });
  }
}