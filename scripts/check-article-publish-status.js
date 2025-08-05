const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkArticlePublishStatus() {
  try {
    console.log("🔍 فحص حالة نشر المقالات في جميع الزوايا...\n");

    // جلب جميع الزوايا
    const angles = await prisma.angles.findMany({
      select: { id: true, title: true, is_published: true },
    });

    for (const angle of angles) {
      console.log(`📊 زاوية: "${angle.title}" (منشورة: ${angle.is_published})`);

      // جلب جميع المقالات في هذه الزاوية
      const articles = await prisma.angle_articles.findMany({
        where: { angle_id: angle.id },
        select: {
          id: true,
          title: true,
          is_published: true,
          views: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      });

      console.log(`  إجمالي المقالات: ${articles.length}`);

      const publishedCount = articles.filter((a) => a.is_published).length;
      const unpublishedCount = articles.filter((a) => !a.is_published).length;

      console.log(
        `  المنشورة: ${publishedCount} | غير المنشورة: ${unpublishedCount}`
      );

      if (articles.length > 0) {
        console.log("  تفاصيل المقالات:");
        articles.forEach((article, index) => {
          const status = article.is_published ? "✅ منشور" : "❌ غير منشور";
          console.log(
            `    ${index + 1}. ${article.title} - ${status} (views: ${
              article.views
            })`
          );
        });
      }
      console.log("");
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticlePublishStatus();
