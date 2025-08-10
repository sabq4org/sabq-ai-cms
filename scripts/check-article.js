const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkArticle(slugOrId) {
  console.log(`\n🔍 البحث عن المقال: ${slugOrId}\n`);

  try {
    // البحث بالـ slug و ID
    const article = await prisma.articles.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        content_type: true,
        article_type: true,
        published_at: true,
        created_at: true,
      },
    });

    if (article) {
      console.log("✅ تم العثور على المقال:");
      console.log("-------------------");
      console.log(`ID: ${article.id}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`Title: ${article.title}`);
      console.log(`Status: ${article.status}`);
      console.log(`Content Type: ${article.content_type}`);
      console.log(`Article Type: ${article.article_type}`);
      console.log(`Published: ${article.published_at}`);
      console.log("-------------------\n");

      if (article.status !== "published") {
        console.log("⚠️  تحذير: المقال غير منشور!");
        console.log(`الحالة الحالية: ${article.status}`);
      }

      const effectiveType =
        article.content_type ||
        (article.article_type === "news" ? "NEWS" : "OPINION");
      console.log(`نوع المحتوى الفعلي: ${effectiveType}`);

      if (effectiveType === "NEWS") {
        console.log(
          `📰 الرابط الصحيح: https://sabq.io/news/${article.slug || article.id}`
        );
      } else {
        console.log(
          `📝 الرابط الصحيح: https://sabq.io/article/${
            article.slug || article.id
          }`
        );
      }
    } else {
      console.log("❌ لم يتم العثور على المقال");
      console.log("الرجاء التأكد من:");
      console.log("1. صحة المعرف أو الـ slug");
      console.log("2. وجود المقال في قاعدة البيانات");
    }
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
const slugOrId = process.argv[2] || "yYIm6uLX";
checkArticle(slugOrId);
