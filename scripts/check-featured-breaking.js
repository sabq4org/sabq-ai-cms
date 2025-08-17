const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkFeaturedAndBreaking() {
  try {
    console.log("🔍 فحص المقالات المميزة والعاجلة...\n");

    // فحص الأخبار العاجلة
    const breakingNews = await prisma.articles.findMany({
      where: {
        breaking: true,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        published_at: true,
        breaking: true,
        featured: true,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    console.log(`🚨 الأخبار العاجلة: ${breakingNews.length} مقال`);
    breakingNews.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      ID: ${article.id}`);
      console.log(`      تاريخ النشر: ${article.published_at}\n`);
    });

    // فحص الأخبار المميزة
    const featuredNews = await prisma.articles.findMany({
      where: {
        featured: true,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        published_at: true,
        breaking: true,
        featured: true,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    console.log(`⭐ الأخبار المميزة: ${featuredNews.length} مقال`);
    featuredNews.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      ID: ${article.id}`);
      console.log(`      تاريخ النشر: ${article.published_at}\n`);
    });

    // إذا لم توجد أخبار عاجلة أو مميزة، نجعل بعض المقالات مميزة وعاجلة
    if (breakingNews.length === 0 && featuredNews.length === 0) {
      console.log(
        "📝 لا توجد أخبار مميزة أو عاجلة. سأجعل بعض المقالات مميزة وعاجلة...\n"
      );

      // أحدث المقالات
      const latestArticles = await prisma.articles.findMany({
        where: {
          status: "published",
        },
        orderBy: {
          published_at: "desc",
        },
        take: 5,
      });

      if (latestArticles.length >= 3) {
        // اجعل أول مقال عاجل
        await prisma.articles.update({
          where: { id: latestArticles[0].id },
          data: { breaking: true },
        });
        console.log(`✅ تم جعل المقال "${latestArticles[0].title}" عاجل`);

        // اجعل أول 3 مقالات مميزة
        for (let i = 0; i < 3; i++) {
          await prisma.articles.update({
            where: { id: latestArticles[i].id },
            data: { featured: true },
          });
          console.log(`⭐ تم جعل المقال "${latestArticles[i].title}" مميز`);
        }
      }
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedAndBreaking();
