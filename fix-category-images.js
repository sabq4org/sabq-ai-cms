const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixCategoryImages() {
  try {
    console.log("🖼️ إضافة صورة لتصنيف السياسة...");

    // إضافة صورة لتصنيف السياسة
    const politicsCategory = await prisma.categories.update({
      where: {
        id: "cat_politics_001",
      },
      data: {
        metadata: {
          cover_image:
            "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
        },
      },
    });

    console.log("✅ تم إضافة صورة غلاف لتصنيف السياسة");
    console.log("الصورة:", politicsCategory.metadata.cover_image);
  } catch (error) {
    console.error("❌ خطأ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryImages();
