import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateArticleWithReporter() {
  try {
    // البحث عن المقال الأخير
    const article = await prisma.articles.findFirst({
      where: {
        title: {
          contains: "تحليل سياسي",
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!article) {
      console.log("❌ لم يتم العثور على المقال");
      return;
    }

    // ربط المقال بالمراسل عبر article_author table
    const articleAuthor = await prisma.article_authors.create({
      data: {
        id: "author_" + Date.now(),
        full_name: "عبدالله البرقاوي",
        slug: "abdullah-barqawi",
        bio: "مراسل متخصص في الأخبار السياسية",
        is_active: true,
        avatar_url: "https://via.placeholder.com/150",
      },
    });

    // تحديث المقال لربطه بالكاتب
    await prisma.articles.update({
      where: { id: article.id },
      data: {
        article_author_id: articleAuthor.id,
      },
    });

    console.log("✅ تم ربط المقال بالمراسل:", articleAuthor.full_name);
    console.log("📰 المقال:", article.title);
  } catch (error) {
    console.error("❌ خطأ في ربط المقال:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateArticleWithReporter();
