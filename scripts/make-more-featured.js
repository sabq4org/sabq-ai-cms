const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function makeMoreFeatured() {
  try {
    console.log("⭐ جعل المزيد من المقالات مميزة...\n");

    // أحدث المقالات المنشورة
    const latestArticles = await prisma.articles.findMany({
      where: {
        status: "published",
        featured: false, // فقط المقالات غير المميزة
      },
      orderBy: {
        published_at: "desc",
      },
      take: 3,
      select: {
        id: true,
        title: true,
        published_at: true,
      },
    });

    console.log(`📋 المقالات التي ستصبح مميزة:`);

    for (let i = 0; i < latestArticles.length; i++) {
      const article = latestArticles[i];

      await prisma.articles.update({
        where: { id: article.id },
        data: { featured: true },
      });

      console.log(`   ${i + 1}. ${article.title}`);
      console.log(`      ID: ${article.id}`);
      console.log(`      تاريخ النشر: ${article.published_at}\n`);
    }

    // عدد المقالات المميزة الآن
    const featuredCount = await prisma.articles.count({
      where: {
        featured: true,
        status: "published",
      },
    });

    console.log(`✅ إجمالي المقالات المميزة الآن: ${featuredCount} مقال`);
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeMoreFeatured();
