const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkArticle() {
  try {
    const articleId = "article_1754419941517_d75ingopj";

    console.log(`🔍 البحث عن المقال: ${articleId}`);

    const article = await prisma.articles.findFirst({
      where: {
        OR: [{ id: articleId }, { slug: articleId }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        content: true,
        published_at: true,
      },
    });

    if (!article) {
      console.log("❌ المقال غير موجود");

      // البحث عن مقالات مشابهة
      const similarArticles = await prisma.articles.findMany({
        where: {
          id: {
            contains: "1754419941517",
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
        },
        take: 5,
      });

      console.log(`📋 مقالات مشابهة (${similarArticles.length}):`);
      similarArticles.forEach((a) => {
        console.log(`- ID: ${a.id}`);
        console.log(`  Slug: ${a.slug}`);
        console.log(`  العنوان: ${a.title}`);
        console.log(`  الحالة: ${a.status}\n`);
      });
    } else {
      console.log("✅ المقال موجود:");
      console.log(`- ID: ${article.id}`);
      console.log(`- Slug: ${article.slug}`);
      console.log(`- العنوان: ${article.title}`);
      console.log(`- الحالة: ${article.status}`);
      console.log(`- تاريخ النشر: ${article.published_at}`);
      console.log(
        `- المحتوى: ${
          article.content
            ? article.content.substring(0, 100) + "..."
            : "غير متوفر"
        }`
      );
    }
  } catch (error) {
    console.error("❌ خطأ في البحث:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticle();
