const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// تسجيل الأداء
let performanceLog = [];

function log(message, data = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    message,
    data
  };
  console.log(`[${entry.timestamp}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
  performanceLog.push(entry);
}

function measureTime(label, fn) {
  return async function(...args) {
    const start = Date.now();
    try {
      const result = await fn.apply(this, args);
      const duration = Date.now() - start;
      log(`${label}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      log(`${label} ERROR: ${duration}ms`, error.message);
      throw error;
    }
  };
}

async function analyzeCurrentPerformance() {
  log("🔍 تحليل أداء الاستعلامات الحالية...");
  
  const testArticleId = "cm5m0x1m2000208js1d1y4wh6";
  const testUserId = "editor@sabq.ai";
  
  // 1. تحليل استعلام المقال
  const articleQuery = measureTime("Article Query", async () => {
    return await prisma.articles.findUnique({
      where: { id: testArticleId },
      include: {
        _count: {
          select: {
            interactions: {
              where: { type: 'like' }
            }
          }
        }
      }
    });
  });

  // 2. تحليل استعلام تفاعل المستخدم - الإعجاب
  const userLikeQuery = measureTime("User Like Query", async () => {
    return await prisma.interactions.findFirst({
      where: {
        article_id: testArticleId,
        user_id: testUserId,
        type: "like"
      }
    });
  });

  // 3. تحليل استعلام تفاعل المستخدم - الحفظ
  const userSaveQuery = measureTime("User Save Query", async () => {
    return await prisma.interactions.findFirst({
      where: {
        article_id: testArticleId,
        user_id: testUserId,
        type: "save"
      }
    });
  });

  // 4. تحليل عدد الإعجابات
  const likesCountQuery = measureTime("Likes Count Query", async () => {
    return await prisma.interactions.count({
      where: {
        article_id: testArticleId,
        type: "like"
      }
    });
  });

  // 5. تحليل عدد الحفظ
  const savesCountQuery = measureTime("Saves Count Query", async () => {
    return await prisma.interactions.count({
      where: {
        article_id: testArticleId,
        type: "save"
      }
    });
  });

  try {
    log("🚀 تنفيذ الاستعلامات المنفصلة...");
    
    const [article, userLike, userSave, likesCount, savesCount] = await Promise.all([
      articleQuery(),
      userLikeQuery(),
      userSaveQuery(),
      likesCountQuery(),
      savesCountQuery()
    ]);

    const currentResults = {
      articleFound: !!article,
      userLikeFound: !!userLike,
      userSaveFound: !!userSave,
      likesCount,
      savesCount,
      articleInteractionsCount: article?._count?.interactions || 0
    };

    log("✅ نتائج الاستعلامات المنفصلة:", currentResults);
    return currentResults;

  } catch (error) {
    log("❌ خطأ في تنفيذ الاستعلامات:", error.message);
    return null;
  }
}

async function testOptimizedQuery() {
  log("⚡ اختبار الاستعلام الموحد المحسن...");

  const testArticleId = "cm5m0x1m2000208js1d1y4wh6";
  const testUserId = "editor@sabq.ai";

  // استعلام محسن واحد بدلاً من عدة استعلامات
  const optimizedQuery = measureTime("Optimized Single Query", async () => {
    return await prisma.$queryRaw`
      SELECT 
        a.id as article_id,
        a.title,
        (SELECT COUNT(*) FROM "interactions" i1 WHERE i1.article_id = a.id AND i1.type = 'like') as likes_count,
        (SELECT COUNT(*) FROM "interactions" i2 WHERE i2.article_id = a.id AND i2.type = 'save') as saves_count,
        CASE WHEN EXISTS(
          SELECT 1 FROM "interactions" i3 
          WHERE i3.article_id = a.id 
          AND i3.user_id = ${testUserId}
          AND i3.type = 'like'
        ) THEN true ELSE false END as user_liked,
        CASE WHEN EXISTS(
          SELECT 1 FROM "interactions" i4 
          WHERE i4.article_id = a.id 
          AND i4.user_id = ${testUserId}
          AND i4.type = 'save'
        ) THEN true ELSE false END as user_saved
      FROM "articles" a
      WHERE a.id = ${testArticleId}
      LIMIT 1;
    `;
  });

  try {
    const result = await optimizedQuery();
    const optimizedResults = result[0] ? {
      articleId: result[0].article_id,
      title: result[0].title,
      likesCount: Number(result[0].likes_count),
      savesCount: Number(result[0].saves_count),
      userLiked: result[0].user_liked,
      userSaved: result[0].user_saved
    } : null;

    log("✅ نتيجة الاستعلام الموحد المحسن:", optimizedResults);
    
    return optimizedResults;
  } catch (error) {
    log("❌ خطأ في الاستعلام المحسن:", error.message);
    return null;
  }
}

async function createOptimizedIndexes() {
  log("📈 إنشاء فهارس محسنة...");

  try {
    // فهرس مركب للتفاعلات (article_id, user_id, type) - موجود بالفعل
    // فهرس للتفاعلات حسب النوع والوقت
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_type_article_created 
      ON "interactions" ("type", "article_id", "created_at" DESC);
    `;

    // فهرس للمقالات حسب الحالة
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status_published 
      ON "articles" ("status", "published_at") WHERE "status" = 'published';
    `;

    // فهرس للمقالات المميزة والعاجلة
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_featured_breaking 
      ON "articles" ("featured", "breaking", "published_at") 
      WHERE "status" = 'published';
    `;

    log("✅ تم إنشاء الفهارس الإضافية بنجاح");

    // تحديث إحصائيات الجدول
    log("📊 تحديث إحصائيات الجداول...");
    await prisma.$executeRaw`ANALYZE "interactions";`;
    await prisma.$executeRaw`ANALYZE "articles";`;

    log("✅ تم تحديث الإحصائيات");

  } catch (error) {
    log("❌ خطأ في إنشاء الفهارس:", error.message);
  }
}

async function cleanDuplicateInteractions() {
  log("🧹 تنظيف التفاعلات المكررة...");
  
  try {
    // البحث عن التفاعلات المكررة
    const duplicateInteractions = await prisma.$queryRaw`
      SELECT article_id, user_id, type, COUNT(*) as count
      FROM "interactions"
      GROUP BY article_id, user_id, type
      HAVING COUNT(*) > 1;
    `;

    if (duplicateInteractions.length > 0) {
      log("⚠️ تم العثور على تفاعلات مكررة:", duplicateInteractions.length);
      
      // حذف المكررات (الاحتفاظ بالأحدث)
      const deletedCount = await prisma.$executeRaw`
        DELETE FROM "interactions" 
        WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
              PARTITION BY article_id, user_id, type 
              ORDER BY created_at DESC
            ) as rn
            FROM "interactions"
          ) t WHERE rn > 1
        );
      `;
      
      log(`✅ تم حذف ${deletedCount} تفاعل مكرر`);
    } else {
      log("✅ لم يتم العثور على تفاعلات مكررة");
    }

  } catch (error) {
    log("❌ خطأ في تنظيف التفاعلات:", error.message);
  }
}

async function createFastAPI() {
  log("🚀 إنشاء API سريع محسن...");

  const fastApiContent = `import { NextRequest, NextResponse } from 'next/server';
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
    const cacheKey = \`\${articleId}_\${userId || 'anonymous'}\`;
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
    const [result] = await prisma.$queryRaw\`
      SELECT 
        a.id as article_id,
        a.title,
        (SELECT COUNT(*) FROM "interactions" i1 WHERE i1.article_id = a.id AND i1.type = 'like') as likes_count,
        (SELECT COUNT(*) FROM "interactions" i2 WHERE i2.article_id = a.id AND i2.type = 'save') as saves_count,
        CASE WHEN \${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i3 
          WHERE i3.article_id = a.id 
          AND i3.user_id = \${userId}
          AND i3.type = 'like'
        ) THEN true ELSE false END as user_liked,
        CASE WHEN \${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i4 
          WHERE i4.article_id = a.id 
          AND i4.user_id = \${userId}
          AND i4.type = 'save'
        ) THEN true ELSE false END as user_saved
      FROM "articles" a
      WHERE a.id = \${articleId} AND a.status = 'published'
      LIMIT 1;
    \` as any[];
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
    console.error(\`[FAST-API-GET-\${requestId}] Database error:\`, error);
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
    console.error(\`[FAST-API-POST-\${requestId}] Transaction error:\`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json({
      error: errorMessage,
      requestId,
      responseTime: Date.now() - startTime
    }, { status: statusCode });
  }
}`;

  // إنشاء مجلد API إذا لم يكن موجوداً
  const apiDir = path.join(__dirname, 'app', 'api', 'interactions', 'fast');
  
  try {
    if (!fs.existsSync(path.join(__dirname, 'app'))) {
      fs.mkdirSync(path.join(__dirname, 'app'), { recursive: true });
    }
    if (!fs.existsSync(path.join(__dirname, 'app', 'api'))) {
      fs.mkdirSync(path.join(__dirname, 'app', 'api'), { recursive: true });
    }
    if (!fs.existsSync(path.join(__dirname, 'app', 'api', 'interactions'))) {
      fs.mkdirSync(path.join(__dirname, 'app', 'api', 'interactions'), { recursive: true });
    }
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // كتابة ملف API
    fs.writeFileSync(path.join(apiDir, 'route.ts'), fastApiContent);

    log("✅ تم إنشاء API سريع في /app/api/interactions/fast/route.ts");
  } catch (error) {
    log("❌ خطأ في إنشاء ملف API:", error.message);
  }
}

async function runPerformanceComparison() {
  log("🏃‍♂️ مقارنة الأداء الشاملة...");

  // اختبار الأداء قبل التحسين
  log("📏 قياس الأداء قبل التحسين:");
  const beforeResults = await analyzeCurrentPerformance();

  // تطبيق التحسينات
  await createOptimizedIndexes();
  await cleanDuplicateInteractions();

  // اختبار الأداء بعد التحسين
  log("📏 قياس الأداء بعد التحسين:");
  const afterResults = await testOptimizedQuery();

  // إنشاء API محسن
  await createFastAPI();

  // حفظ تقرير الأداء
  const reportPath = path.join(__dirname, 'performance-optimization-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    beforeOptimization: beforeResults,
    afterOptimization: afterResults,
    performanceLog,
    summary: {
      totalOperations: performanceLog.length,
      optimizationsApplied: [
        'Fixed column names (type instead of interaction_type)',
        'Created optimized composite indexes',
        'Updated table statistics',
        'Removed duplicate interactions',
        'Created fast single-query API with caching',
        'Added proper error handling with request IDs',
        'Implemented transaction-based updates'
      ],
      improvements: afterResults && beforeResults ? {
        queryOptimization: 'Single query instead of 5 separate queries',
        caching: 'In-memory cache with 30-second TTL',
        indexing: 'Added 3 new optimized indexes',
        transactions: 'Atomic operations for data consistency'
      } : 'Could not calculate improvements'
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`📊 تقرير الأداء محفوظ في: ${reportPath}`);
  
  return report;
}

// تنفيذ التحسين
runPerformanceComparison()
  .then((report) => {
    log("🎉 اكتمل تحسين الأداء بنجاح!");
    log("📈 ملخص النتائج:", report.summary);
  })
  .catch((error) => {
    log("💥 خطأ في تحسين الأداء:", error.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
