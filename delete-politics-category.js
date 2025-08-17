const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deletePoliticsCategory() {
  try {
    console.log("🏛️ البحث عن تصنيف السياسة...");

    const politicsCategory = await prisma.categories.findFirst({
      where: {
        OR: [{ name: "سياسة" }, { slug: "politics" }],
      },
    });

    if (!politicsCategory) {
      console.log("❌ لم يتم العثور على تصنيف السياسة");
      return;
    }

    console.log(
      `📋 تصنيف السياسة الموجود: ${politicsCategory.name} (${politicsCategory.id})`
    );

    // التحقق من المقالات المرتبطة
    const articlesCount = await prisma.articles.count({
      where: {
        category_id: politicsCategory.id,
      },
    });

    console.log(`📰 عدد المقالات في هذا التصنيف: ${articlesCount}`);

    if (articlesCount > 0) {
      console.log("⚠️ هناك مقالات مرتبطة بهذا التصنيف");

      // جلب أسماء المقالات
      const articles = await prisma.articles.findMany({
        where: {
          category_id: politicsCategory.id,
        },
        select: {
          id: true,
          title: true,
        },
      });

      console.log("📰 المقالات المرتبطة:");
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.id})`);
      });

      // نقل المقالات إلى تصنيف آخر (مثل "محليات" أو "العالم")
      const defaultCategory = await prisma.categories.findFirst({
        where: {
          name: "محليات",
        },
      });

      if (defaultCategory) {
        console.log(`🔄 نقل المقالات إلى تصنيف "${defaultCategory.name}"...`);

        await prisma.articles.updateMany({
          where: {
            category_id: politicsCategory.id,
          },
          data: {
            category_id: defaultCategory.id,
          },
        });

        console.log("✅ تم نقل المقالات بنجاح");
      }
    }

    // حذف التصنيف
    console.log("🗑️ حذف تصنيف السياسة...");

    await prisma.categories.delete({
      where: {
        id: politicsCategory.id,
      },
    });

    console.log("✅ تم حذف تصنيف السياسة بنجاح");

    // التحقق من النتيجة
    const remainingCategories = await prisma.categories.findMany({
      select: {
        name: true,
        slug: true,
      },
    });

    console.log(`📊 التصنيفات المتبقية (${remainingCategories.length}):`);
    remainingCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePoliticsCategory();
