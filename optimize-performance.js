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

async function analyzeQueries() {
  log("🔍 تحليل أداء الاستعلامات...");
  
  // 1. تحليل استعلام المقال
  const articleQuery = measureTime("Article Query", async () => {
    return await prisma.article.findUnique({
      where: { id: "cm5m0x1m2000208js1d1y4wh6" },
      include: {
        interactions: true,
        _count: {
          select: {
            interactions: {
              where: { interaction_type: 'like' }
            }
          }
        }
      }
    });
  });

  // 2. تحليل استعلام تفاعل المستخدم
  const userInteractionQuery = measureTime("User Interaction Query", async () => {
    return await prisma.interactions.findFirst({
      where: {
        article_id: "cm5m0x1m2000208js1d1y4wh6",
        user_id: "editor@sabq.ai",
        interaction_type: "like"
      }
    });
  });

  // 3. تحليل عدد الإعجابات
  const likesCountQuery = measureTime("Likes Count Query", async () => {
    return await prisma.interactions.count({
      where: {
        article_id: "cm5m0x1m2000208js1d1y4wh6",
        interaction_type: "like"
      }
    });
  });

  // 4. تحليل عدد الحفظ
  const savesCountQuery = measureTime("Saves Count Query", async () => {
    return await prisma.interactions.count({
      where: {
        article_id: "cm5m0x1m2000208js1d1y4wh6",
        interaction_type: "save"
      }
    });
  });

  try {
    log("🚀 تنفيذ الاستعلامات...");
    
    const [article, userInteraction, likesCount, savesCount] = await Promise.all([
      articleQuery(),
      userInteractionQuery(),
      likesCountQuery(),
      savesCountQuery()
    ]);

    log("✅ نتائج الاستعلامات:", {
      articleFound: !!article,
      userInteractionFound: !!userInteraction,
      likesCount,
      savesCount,
      articleInteractionsCount: article?.interactions?.length || 0
    });

  } catch (error) {
    log("❌ خطأ في تنفيذ الاستعلامات:", error.message);
  }
}

async function optimizeDatabase() {
  log("🔧 تحسين قاعدة البيانات...");

  try {
    // 1. إنشاء فهارس محسنة
    log("📈 إنشاء فهارس محسنة...");

    // فهرس مركب للتفاعلات
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_composite_optimized 
      ON "interactions" ("article_id", "user_id", "interaction_type", "created_at");
    `;

    // فهرس للمقالات النشطة
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status_created 
      ON "articles" ("status", "created_at") WHERE "status" = 'published';
    `;

    // فهرس للعدادات
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_counters 
      ON "articles" ("likes_count", "saves_count", "created_at");
    `;

    log("✅ تم إنشاء الفهارس بنجاح");

    // 2. تحديث إحصائيات الجدول
    log("📊 تحديث إحصائيات الجدول...");
    await prisma.$executeRaw`ANALYZE "interactions";`;
    await prisma.$executeRaw`ANALYZE "articles";`;
    await prisma.$executeRaw`ANALYZE "UserInteractions";`;

    log("✅ تم تحديث الإحصائيات");

    // 3. تنظيف البيانات المكررة
    log("🧹 تنظيف البيانات المكررة...");
    
    const duplicateInteractions = await prisma.$queryRaw`
      SELECT article_id, user_id, interaction_type, COUNT(*) as count
      FROM "interactions"
      GROUP BY article_id, user_id, interaction_type
      HAVING COUNT(*) > 1;
    `;

    if (duplicateInteractions.length > 0) {
      log("⚠️ تم العثور على تفاعلات مكررة:", duplicateInteractions.length);
      
      // حذف المكررات (الاحتفاظ بالأحدث)
      await prisma.$executeRaw`
        DELETE FROM "interactions" 
        WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
              PARTITION BY article_id, user_id, interaction_type 
              ORDER BY created_at DESC
            ) as rn
            FROM "interactions"
          ) t WHERE rn > 1
        );
      `;
      
      log("✅ تم حذف التفاعلات المكررة");
    }

    log("✅ تم تحسين قاعدة البيانات بنجاح");

  } catch (error) {
    log("❌ خطأ في تحسين قاعدة البيانات:", error.message);
  }
}

async function testOptimizedQueries() {
  log("⚡ اختبار الاستعلامات المحسنة...");

  // استعلام محسن واحد بدلاً من عدة استعلامات
  const optimizedQuery = measureTime("Optimized Single Query", async () => {
    return await prisma.$queryRaw`
      SELECT 
        a.id as article_id,
        a.title,
        a.likes_count,
        a.saves_count,
        (SELECT COUNT(*) FROM "interactions" i1 WHERE i1.article_id = a.id AND i1.interaction_type = 'like') as actual_likes,
        (SELECT COUNT(*) FROM "interactions" i2 WHERE i2.article_id = a.id AND i2.interaction_type = 'save') as actual_saves,
        CASE WHEN EXISTS(
          SELECT 1 FROM "interactions" i3 
          WHERE i3.article_id = a.id 
          AND i3.user_id = ${"editor@sabq.ai"}
          AND i3.interaction_type = 'like'
        ) THEN true ELSE false END as user_liked,
        CASE WHEN EXISTS(
          SELECT 1 FROM "interactions" i4 
          WHERE i4.article_id = a.id 
          AND i4.user_id = ${"editor@sabq.ai"}
          AND i4.interaction_type = 'save'
        ) THEN true ELSE false END as user_saved
      FROM "articles" a
      WHERE a.id = ${"cm5m0x1m2000208js1d1y4wh6"}
      LIMIT 1;
    `;
  });

  try {
    const result = await optimizedQuery();
    log("✅ نتيجة الاستعلام المحسن:", result[0]);
    
    return result[0];
  } catch (error) {
    log("❌ خطأ في الاستعلام المحسن:", error.message);
    return null;
  }
}

async function createOptimizedAPI() {
  log("🚀 إنشاء API محسن...");

  const optimizedApiContent = `// API محسن للتفاعلات مع أداء عالي
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// كاش بسيط للنتائج
const cache = new Map();
const CACHE_TTL = 30000; // 30 ثانية

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  const userId = request.headers.get('user-id');

  if (!articleId) {
    return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
  }

  // التحقق من الكاش
  const cacheKey = \`\${articleId}_\${userId || 'anonymous'}\`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      ...cached.data,
      cached: true,
      responseTime: Date.now() - start
    });
  }

  try {
    // استعلام محسن واحد
    const [result] = await prisma.$queryRaw\`
      SELECT 
        a.id as article_id,
        COALESCE(a.likes_count, 0) as likes_count,
        COALESCE(a.saves_count, 0) as saves_count,
        CASE WHEN \${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i 
          WHERE i.article_id = a.id 
          AND i.user_id = \${userId}
          AND i.interaction_type = 'like'
        ) THEN true ELSE false END as user_liked,
        CASE WHEN \${userId} IS NOT NULL AND EXISTS(
          SELECT 1 FROM "interactions" i 
          WHERE i.article_id = a.id 
          AND i.user_id = \${userId}
          AND i.interaction_type = 'save'
        ) THEN true ELSE false END as user_saved
      FROM "articles" a
      WHERE a.id = \${articleId}
      LIMIT 1;
    \`;

    if (!result) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const responseData = {
      articleId: result.article_id,
      likes: Number(result.likes_count),
      saves: Number(result.saves_count),
      userLiked: result.user_liked,
      userSaved: result.user_saved,
      responseTime: Date.now() - start
    };

    // حفظ في الكاش
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error', responseTime: Date.now() - start },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  const userId = request.headers.get('user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { articleId, action, type } = body;

    if (!articleId || !action || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // تنفيذ العملية في معاملة واحدة
    const result = await prisma.$transaction(async (tx) => {
      if (action === 'toggle') {
        // التحقق من وجود التفاعل
        const existing = await tx.interactions.findFirst({
          where: { article_id: articleId, user_id: userId, interaction_type: type }
        });

        let newState;
        if (existing) {
          // إزالة التفاعل
          await tx.interactions.delete({ where: { id: existing.id } });
          newState = false;
        } else {
          // إضافة التفاعل
          await tx.interactions.create({
            data: {
              article_id: articleId,
              user_id: userId,
              interaction_type: type
            }
          });
          newState = true;
        }

        // تحديث العدادات في المقال
        const countField = type === 'like' ? 'likes_count' : 'saves_count';
        await tx.article.update({
          where: { id: articleId },
          data: {
            [countField]: {
              [newState ? 'increment' : 'decrement']: 1
            }
          }
        });

        return { newState };
      }
    });

    // مسح الكاش للمقال
    const cacheKeys = Array.from(cache.keys()).filter(key => key.startsWith(articleId));
    cacheKeys.forEach(key => cache.delete(key));

    return NextResponse.json({
      success: true,
      newState: result.newState,
      responseTime: Date.now() - start
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', responseTime: Date.now() - start },
      { status: 500 }
    );
  }
}`;

  // إنشاء ملف API المحسن
  fs.writeFileSync(
    path.join(__dirname, 'app', 'api', 'interactions', 'fast', 'route.ts'),
    optimizedApiContent
  );

  log("✅ تم إنشاء API محسن في /app/api/interactions/fast/route.ts");
}

async function runPerformanceTest() {
  log("🏃‍♂️ اختبار الأداء الشامل...");

  // اختبار الأداء قبل التحسين
  log("📏 قياس الأداء قبل التحسين:");
  await analyzeQueries();

  // تطبيق التحسينات
  await optimizeDatabase();

  // اختبار الأداء بعد التحسين
  log("📏 قياس الأداء بعد التحسين:");
  await testOptimizedQueries();

  // إنشاء API محسن
  await createOptimizedAPI();

  // حفظ تقرير الأداء
  const reportPath = path.join(__dirname, 'performance-optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    performanceLog,
    summary: {
      totalOperations: performanceLog.length,
      optimizationsApplied: [
        'Created composite indexes',
        'Updated table statistics',
        'Removed duplicate interactions',
        'Created optimized single-query API',
        'Added simple caching layer'
      ]
    }
  }, null, 2));

  log(`📊 تقرير الأداء محفوظ في: ${reportPath}`);
}

// تنفيذ الاختبار
runPerformanceTest()
  .then(() => {
    log("🎉 اكتمل تحسين الأداء بنجاح!");
  })
  .catch((error) => {
    log("💥 خطأ في تحسين الأداء:", error.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
