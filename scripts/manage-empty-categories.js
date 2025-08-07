#!/usr/bin/env node

/**
 * سكريبت للتحقق من وحذف التصنيفات الفارغة من سطر الأوامر
 * يمكن للمديرين استخدامه للحصول على تقرير مفصل أو حذف التصنيفات الفارغة
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkEmptyCategories() {
  console.log("🔍 فحص التصنيفات الفارغة...\n");

  try {
    // جلب جميع التصنيفات مع عدد المقالات
    const categories = await prisma.categories.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: "published",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`📊 إجمالي التصنيفات: ${categories.length}`);

    // تصنيف التصنيفات إلى فارغة ومليئة
    const emptyCategories = categories.filter(
      (cat) => cat._count.articles === 0
    );
    const categoriesWithArticles = categories.filter(
      (cat) => cat._count.articles > 0
    );

    console.log(
      `✅ تصنيفات تحتوي على مقالات: ${categoriesWithArticles.length}`
    );
    console.log(`⚠️ تصنيفات فارغة: ${emptyCategories.length}\n`);

    if (emptyCategories.length > 0) {
      console.log("📋 قائمة التصنيفات الفارغة:");
      console.log("─".repeat(60));

      emptyCategories.forEach((cat, index) => {
        const isActive = cat.is_active ? "✅ نشط" : "❌ غير نشط";
        console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${isActive}`);
        if (cat.description) {
          console.log(`   📝 ${cat.description.substring(0, 50)}...`);
        }
        console.log(`   🆔 ID: ${cat.id}`);
        console.log("");
      });

      // فصل التصنيفات النشطة والغير نشطة
      const activeEmpty = emptyCategories.filter((cat) => cat.is_active);
      const inactiveEmpty = emptyCategories.filter((cat) => !cat.is_active);

      if (activeEmpty.length > 0) {
        console.log(
          `🔴 تصنيفات فارغة ونشطة (يُنصح بحذفها): ${activeEmpty.length}`
        );
        activeEmpty.forEach((cat) => {
          console.log(`   • ${cat.name} (${cat.slug})`);
        });
        console.log("");
      }

      if (inactiveEmpty.length > 0) {
        console.log(`⭕ تصنيفات فارغة وغير نشطة: ${inactiveEmpty.length}`);
        inactiveEmpty.forEach((cat) => {
          console.log(`   • ${cat.name} (${cat.slug})`);
        });
        console.log("");
      }
    } else {
      console.log("🎉 ممتاز! لا توجد تصنيفات فارغة.");
    }

    // عرض إحصائيات التصنيفات التي تحتوي على مقالات
    if (categoriesWithArticles.length > 0) {
      console.log("\n📈 التصنيفات حسب عدد المقالات (أعلى 10):");
      console.log("─".repeat(60));

      const topCategories = categoriesWithArticles
        .sort((a, b) => b._count.articles - a._count.articles)
        .slice(0, 10);

      topCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}: ${cat._count.articles} مقال`);
      });
    }
  } catch (error) {
    console.error("❌ خطأ في فحص التصنيفات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteEmptyCategories(forceDelete = false) {
  console.log("🗑️ حذف التصنيفات الفارغة...\n");

  try {
    // جلب التصنيفات الفارغة
    const emptyCategories = await prisma.categories.findMany({
      where: {
        articles: {
          none: {
            status: "published",
          },
        },
      },
    });

    if (emptyCategories.length === 0) {
      console.log("✅ لا توجد تصنيفات فارغة للحذف.");
      return;
    }

    console.log(`⚠️ تم العثور على ${emptyCategories.length} تصنيف فارغ:`);
    emptyCategories.forEach((cat) => {
      console.log(`   • ${cat.name} (${cat.slug})`);
    });

    if (!forceDelete) {
      console.log(
        "\n🛑 للحذف الفعلي، استخدم: npm run delete-empty-categories -- --force"
      );
      return;
    }

    console.log("\n🔥 بدء الحذف...");

    let deletedCount = 0;
    let failedCount = 0;

    for (const category of emptyCategories) {
      try {
        await prisma.categories.delete({
          where: { id: category.id },
        });

        console.log(`✅ تم حذف: ${category.name}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ فشل حذف ${category.name}:`, error.message);
        failedCount++;
      }
    }

    console.log("\n📊 نتائج العملية:");
    console.log(`✅ تم حذف: ${deletedCount} تصنيف`);
    console.log(`❌ فشل في حذف: ${failedCount} تصنيف`);

    if (deletedCount > 0) {
      console.log("\n🎉 تم تنظيف التصنيفات الفارغة بنجاح!");
    }
  } catch (error) {
    console.error("❌ خطأ في حذف التصنيفات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// معالجة معاملات سطر الأوامر
const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1);

async function main() {
  console.log("🏷️ أداة إدارة التصنيفات الفارغة\n");

  switch (command) {
    case "check":
      await checkEmptyCategories();
      break;

    case "delete":
      const forceDelete = flags.includes("--force");
      await deleteEmptyCategories(forceDelete);
      break;

    default:
      console.log("📖 الاستخدام:");
      console.log(
        "  npm run check-empty-categories        # فحص التصنيفات الفارغة"
      );
      console.log(
        "  npm run delete-empty-categories       # عرض التصنيفات الفارغة فقط"
      );
      console.log(
        "  npm run delete-empty-categories --force  # حذف فعلي للتصنيفات الفارغة"
      );
      console.log("");
      console.log("📝 أمثلة:");
      console.log("  node scripts/manage-empty-categories.js check");
      console.log("  node scripts/manage-empty-categories.js delete");
      console.log("  node scripts/manage-empty-categories.js delete --force");
      break;
  }
}

main().catch(console.error);
