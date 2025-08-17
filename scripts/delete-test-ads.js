const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deleteTestAds() {
  try {
    console.log("🗑️ بدء حذف الإعلانات التجريبية...");

    // عرض الإعلانات الحالية
    const currentAds = await prisma.ads.findMany();
    console.log(`📊 عدد الإعلانات الحالية: ${currentAds.length}`);

    if (currentAds.length > 0) {
      console.log("📋 الإعلانات الموجودة:");
      currentAds.forEach((ad, index) => {
        console.log(
          `${index + 1}. العنوان: "${ad.title}" | الموضع: ${
            ad.placement
          } | حالة: ${ad.is_active ? "نشط" : "غير نشط"}`
        );
      });

      // حذف جميع الإعلانات
      const deleteResult = await prisma.ads.deleteMany({});
      console.log(`✅ تم حذف ${deleteResult.count} إعلان بنجاح`);
    } else {
      console.log("📭 لا توجد إعلانات للحذف");
    }

    // التحقق من النتيجة
    const remainingAds = await prisma.ads.findMany();
    console.log(`📊 عدد الإعلانات المتبقية: ${remainingAds.length}`);

    console.log("✅ تم الانتهاء من عملية الحذف");
  } catch (error) {
    console.error("❌ خطأ في حذف الإعلانات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestAds();
