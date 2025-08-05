import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestArticle() {
  try {
    // إنشاء تصنيف إذا لم يكن موجود
    let category = await prisma.categories.findFirst({
      where: { slug: "politics" },
    });

    if (!category) {
      category = await prisma.categories.create({
        data: {
          id: "cat_politics_001",
          name: "سياسة",
          slug: "politics",
          color: "#1e40af",
          is_active: true,
          updated_at: new Date(),
        },
      });
      console.log("✅ تم إنشاء التصنيف:", category.name);
    }

    // إنشاء مقال للمراسل
    const article = await prisma.articles.create({
      data: {
        id: "article_test_" + Date.now(),
        title: "تحليل سياسي: تطورات الأحداث الجارية في المنطقة",
        slug: "political-analysis-current-events",
        content:
          "هذا نص تجريبي لمقال سياسي يتحدث عن تطورات الأحداث الجارية في المنطقة والتحليل السياسي للموضوع...",
        excerpt: "تحليل شامل للأحداث السياسية الجارية وتأثيرها على المنطقة",
        featured_image: "https://via.placeholder.com/800x400",
        status: "published",
        article_type: "news",
        category_id: category.id,
        author_id: "user_abdullah_test", // المستخدم الذي أنشأناه
        published_at: new Date(),
        updated_at: new Date(),
        views: 120,
        tags: ["سياسة", "تحليل", "أخبار"],
      },
    });

    console.log("✅ تم إنشاء المقال:", article.title);
    console.log(
      "🔗 رابط المقال:",
      `http://localhost:3002/article/${article.id}`
    );
  } catch (error) {
    console.error("❌ خطأ في إنشاء المقال:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestArticle();
