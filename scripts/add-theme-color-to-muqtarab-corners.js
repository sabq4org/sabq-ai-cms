const { PrismaClient } = require("@prisma/client");

async function addThemeColorColumn() {
  const prisma = new PrismaClient();

  try {
    console.log("🎨 إضافة عمود theme_color إلى جدول muqtarab_corners...");

    // إضافة عمود theme_color إلى الجدول
    await prisma.$executeRaw`
      ALTER TABLE muqtarab_corners
      ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7) DEFAULT '#3B82F6';
    `;

    console.log("✅ تم إضافة عمود theme_color بنجاح!");
    console.log("📝 تم تعيين اللون الافتراضي #3B82F6 لجميع الزوايا الموجودة");

    // التحقق من نجاح العملية
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'muqtarab_corners'
      AND column_name = 'theme_color';
    `;

    if (result.length > 0) {
      console.log("✅ تم التحقق من وجود العمود:", result[0]);
    } else {
      console.log("❌ فشل في إضافة العمود");
    }
  } catch (error) {
    console.error("❌ خطأ في إضافة عمود theme_color:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الـ migration
if (require.main === module) {
  addThemeColorColumn()
    .then(() => {
      console.log("🎉 اكتملت عملية إضافة عمود theme_color!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 فشلت عملية إضافة العمود:", error);
      process.exit(1);
    });
}

module.exports = { addThemeColorColumn };
