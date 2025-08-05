const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugCrossAngleAPI() {
  try {
    console.log("🔍 تشخيص API للمقترحات المتقاطعة...\n");

    const currentAngleId = "f86ff880-7c24-4eef-9794-98e953d4268c";
    const currentArticleId = "da202992-99e2-473e-a876-272eccbed172";

    // 1. التحقق من الزوايا المنشورة
    console.log("📊 1. التحقق من الزوايا المنشورة:");
    const publishedAngles = await prisma.angles.findMany({
      where: { is_published: true },
      select: { id: true, title: true, is_published: true },
    });
    console.log("الزوايا المنشورة:", publishedAngles.length);
    publishedAngles.forEach((angle) => {
      console.log(`  - ${angle.title} (${angle.id})`);
    });

    // 2. التحقق من الزوايا الأخرى (غير الحالية)
    console.log("\n📊 2. الزوايا الأخرى (غير الحالية):");
    const otherAngles = await prisma.angles.findMany({
      where: {
        is_published: true,
        id: { not: currentAngleId },
      },
      select: { id: true, title: true },
    });
    console.log("الزوايا الأخرى:", otherAngles.length);
    otherAngles.forEach((angle) => {
      console.log(`  - ${angle.title} (${angle.id})`);
    });

    // 3. التحقق من المقالات المنشورة في الزوايا الأخرى
    console.log("\n📊 3. المقالات في الزوايا الأخرى:");
    for (const angle of otherAngles) {
      const articles = await prisma.angle_articles.findMany({
        where: {
          angle_id: angle.id,
          is_published: true,
        },
        select: {
          id: true,
          title: true,
          is_published: true,
          views: true,
        },
      });
      console.log(`  زاوية "${angle.title}": ${articles.length} مقال منشور`);
      articles.forEach((article) => {
        console.log(`    - ${article.title} (views: ${article.views})`);
      });
    }

    // 4. تشغيل SQL query نفسه
    console.log("\n📊 4. تشغيل SQL query:");
    const articlesQuery = `
      SELECT
        aa.*,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE a.is_published = true
        AND aa.is_published = true
        AND a.id != $1::uuid
        AND aa.id != $2::uuid
      ORDER BY
        aa.views DESC,
        aa.created_at DESC
      LIMIT $3
    `;

    console.log("SQL Query:", articlesQuery);
    console.log("Parameters:", [currentAngleId, currentArticleId, 3]);

    const results = await prisma.$queryRawUnsafe(
      articlesQuery,
      currentAngleId,
      currentArticleId,
      3
    );

    console.log(`النتائج من SQL: ${results.length} مقال`);
    results.forEach((article, index) => {
      console.log(
        `  ${index + 1}. ${article.title} (من زاوية: ${article.angle_title})`
      );
    });
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCrossAngleAPI();
