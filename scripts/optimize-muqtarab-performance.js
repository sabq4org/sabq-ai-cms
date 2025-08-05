#!/usr/bin/env node

/**
 * سكريپت تحسين شامل لأداء مقترب
 * يُطبق فهارس قاعدة البيانات المُحسّنة وتحسينات أخرى
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function optimizeMuqtarabPerformance() {
  console.log("🚀 بدء تحسين أداء مقترب...\n");

  try {
    // 1. إضافة فهارس للزوايا
    console.log("📊 1. إضافة فهارس الزوايا...");

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angles_published_slug
      ON angles(is_published, slug)
      WHERE is_published = true;
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angles_featured_published
      ON angles(is_featured, is_published, created_at DESC)
      WHERE is_published = true;
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angles_author_published
      ON angles(author_id, is_published, created_at DESC)
      WHERE is_published = true;
    `;

    console.log("✅ تم إضافة فهارس الزوايا");

    // 2. إضافة فهارس مقالات الزوايا
    console.log("📊 2. إضافة فهارس مقالات الزوايا...");

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angle_articles_published_angle
      ON angle_articles(angle_id, is_published, publish_date DESC)
      WHERE is_published = true;
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angle_articles_views_published
      ON angle_articles(views DESC, is_published)
      WHERE is_published = true;
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angle_articles_recent_published
      ON angle_articles(publish_date DESC, is_published)
      WHERE is_published = true;
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angle_articles_author_published
      ON angle_articles(author_id, is_published, created_at DESC)
      WHERE is_published = true;
    `;

    console.log("✅ تم إضافة فهارس مقالات الزوايا");

    // 3. فهرس للـ slug lookup المُحسّن (فهرس بسيط)
    console.log("📊 3. إضافة فهرس slug المُحسّن...");

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angles_slug_simple
      ON angles(slug, is_published)
      WHERE is_published = true;
    `;

    // فهرس إضافي للبيانات الأساسية
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_angles_basic_data
      ON angles(id, title, author_id)
      WHERE is_published = true;
    `;

    console.log("✅ تم إضافة فهرس slug المُحسّن");

    // 4. فهرس للتوصيات العابرة للزوايا
    console.log("📊 4. إضافة فهرس التوصيات العابرة...");

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_cross_angle_recommendations
      ON angle_articles(is_published, views DESC, created_at DESC, angle_id)
      WHERE is_published = true;
    `;

    console.log("✅ تم إضافة فهرس التوصيات العابرة");

    // 5. فهرس للمقالات المميزة
    console.log("📊 5. إضافة فهرس المقالات المميزة...");

    // PostgreSQL specific: فهرس للمقالات التي تحتوي على تاج "مميز"
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_angle_articles_featured_gin
        ON angle_articles USING gin(tags)
        WHERE is_published = true;
      `;
      console.log("✅ تم إضافة فهرس GIN للمقالات المميزة");
    } catch (error) {
      console.log("⚠️ فهرس GIN غير متاح، استخدام فهرس بديل...");
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_angle_articles_featured_btree
        ON angle_articles(is_published, views DESC)
        WHERE is_published = true AND tags::text LIKE '%مميز%';
      `;
      console.log("✅ تم إضافة فهرس B-tree للمقالات المميزة");
    }

    // 6. تحديث إحصائيات الجداول
    console.log("📊 6. تحديث إحصائيات قاعدة البيانات...");

    await prisma.$executeRaw`ANALYZE angles;`;
    await prisma.$executeRaw`ANALYZE angle_articles;`;
    await prisma.$executeRaw`ANALYZE users;`;

    console.log("✅ تم تحديث إحصائيات قاعدة البيانات");

    // 7. قياس تحسن الأداء
    console.log("📊 7. قياس الأداء بعد التحسين...");

    const startTime = Date.now();

    // اختبار استعلام الزوايا
    const anglesTest = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM angles
      WHERE is_published = true;
    `;

    // اختبار استعلام المقالات
    const articlesTest = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM angle_articles aa
      JOIN angles a ON aa.angle_id = a.id
      WHERE aa.is_published = true AND a.is_published = true;
    `;

    const endTime = Date.now();

    console.log(`✅ اختبار الأداء مكتمل في ${endTime - startTime}ms`);
    console.log(`📊 الزوايا المنشورة: ${anglesTest[0].count}`);
    console.log(`📊 المقالات المنشورة: ${articlesTest[0].count}`);

    console.log("\n🎉 تم تحسين أداء مقترب بنجاح!");
    console.log("\n📈 التحسينات المُطبقة:");
    console.log("- فهارس محسّنة للزوايا والمقالات");
    console.log("- فهرس مركب لـ slug lookup");
    console.log("- فهرس التوصيات العابرة للزوايا");
    console.log("- فهرس للمقالات المميزة");
    console.log("- تحديث إحصائيات قاعدة البيانات");
  } catch (error) {
    console.error("❌ خطأ في تحسين الأداء:", error);
    throw error;
  }
}

// تشغيل التحسين
optimizeMuqtarabPerformance()
  .then(() => {
    console.log("\n✅ تم الانتهاء من تحسين الأداء");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل في تحسين الأداء:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
