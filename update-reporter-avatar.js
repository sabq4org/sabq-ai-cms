// تحديث صورة المراسل عبدالله البرقاوي
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateReporterAvatar() {
  try {
    console.log("🔍 البحث عن المراسل: عبدالله البرقاوي...");

    // البحث عن المراسل
    const reporter = await prisma.reporters.findFirst({
      where: {
        full_name: "عبدالله البرقاوي",
      },
    });

    if (!reporter) {
      console.log("❌ لم يتم العثور على المراسل");
      return;
    }

    console.log("✅ تم العثور على المراسل:", reporter.id);

    // تحديث صورة المراسل
    const updatedReporter = await prisma.reporters.update({
      where: {
        id: reporter.id,
      },
      data: {
        avatar_url:
          process.env.BARQAWI_AVATAR_URL || "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
    });

    console.log("🎉 تم تحديث صورة المراسل بنجاح!");
    console.log("الصورة الجديدة:", updatedReporter.avatar_url);
  } catch (error) {
    console.error("❌ خطأ في تحديث الصورة:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReporterAvatar();
