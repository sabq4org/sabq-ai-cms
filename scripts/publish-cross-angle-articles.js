const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function publishCrossAngleArticles() {
  try {
    console.log("🚀 نشر المقالات في الزوايا الأخرى...\n");

    // جلب جميع المقالات غير المنشورة
    const unpublishedArticles = await prisma.angle_articles.findMany({
      where: { is_published: false },
      include: {
        angles: {
          select: { title: true },
        },
      },
    });

    console.log(`📊 وجدت ${unpublishedArticles.length} مقال غير منشور`);

    for (const article of unpublishedArticles) {
      console.log(
        `📝 نشر: "${article.title}" في زاوية "${article.angles.title}"`
      );

      await prisma.angle_articles.update({
        where: { id: article.id },
        data: {
          is_published: true,
          publish_date: new Date(),
        },
      });

      console.log(`  ✅ تم النشر بنجاح`);
    }

    console.log("\n🎉 تم نشر جميع المقالات بنجاح!");

    // التحقق من النتائج
    console.log("\n📊 التحقق من النتائج:");
    const publishedCount = await prisma.angle_articles.count({
      where: { is_published: true },
    });

    console.log(`إجمالي المقالات المنشورة الآن: ${publishedCount}`);
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

publishCrossAngleArticles();
