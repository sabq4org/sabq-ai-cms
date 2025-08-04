const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * إصلاح مشكلة اختفاء الاهتمامات - إضافة اهتمامات تجريبية للمستخدمين المفقودين
 */
async function fixMissingUserInterests() {
  try {
    console.log("🔧 بدء إصلاح اهتمامات المستخدمين المفقودين...\n");

    // قائمة المستخدمين الذين يحتاجون لاهتمامات
    const missingUsers = [
      "user_1754148330655_467u0ilbk",
      // يمكن إضافة المزيد هنا
    ];

    // اهتمامات افتراضية
    const defaultInterests = [
      "cat-001",
      "cat-002",
      "cat-003",
      "cat-004",
      "cat-005",
    ];

    for (const userId of missingUsers) {
      console.log(`👤 معالجة المستخدم: ${userId}`);

      // التحقق من وجود المستخدم
      let user = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log(`  📝 إنشاء المستخدم...`);
        user = await prisma.users.create({
          data: {
            id: userId,
            email: `${userId}@sabq.me`,
            name: "مستخدم تجريبي",
            password_hash: "temp",
            role: "user",
            is_verified: true,
            updated_at: new Date(),
          },
        });
        console.log(`  ✅ تم إنشاء المستخدم`);
      } else {
        console.log(`  ✅ المستخدم موجود مسبقاً`);
      }

      // إضافة الاهتمامات
      console.log(`  📌 إضافة الاهتمامات...`);
      let addedCount = 0;

      for (const categoryId of defaultInterests) {
        try {
          await prisma.user_interests.create({
            data: {
              user_id: userId,
              category_id: categoryId,
              is_active: true,
            },
          });
          addedCount++;
          console.log(`    ✅ أضيف: ${categoryId}`);
        } catch (e) {
          console.log(`    ⚠️ موجود مسبقاً: ${categoryId}`);
        }
      }

      // التحقق النهائي
      const totalInterests = await prisma.user_interests.count({
        where: { user_id: userId, is_active: true },
      });

      console.log(`  📊 إجمالي الاهتمامات للمستخدم: ${totalInterests}`);
      console.log(`  🆕 الاهتمامات المُضافة: ${addedCount}\n`);
    }

    // إحصائيات نهائية
    console.log("📈 إحصائيات نهائية:");
    const totalUsers = await prisma.users.count();
    const totalInterests = await prisma.user_interests.count();
    const usersWithInterests = await prisma.user_interests.groupBy({
      by: ["user_id"],
      _count: true,
    });

    console.log(`  👥 إجمالي المستخدمين: ${totalUsers}`);
    console.log(`  📋 إجمالي الاهتمامات: ${totalInterests}`);
    console.log(`  🎯 المستخدمون مع اهتمامات: ${usersWithInterests.length}`);

    console.log("\n✅ اكتمل إصلاح اهتمامات المستخدمين بنجاح!");
  } catch (error) {
    console.error("❌ خطأ في إصلاح الاهتمامات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  fixMissingUserInterests();
}

module.exports = { fixMissingUserInterests };
