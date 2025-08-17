// تحديث صورة المراسل علي الحازمي
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateReporterAvatar() {
  try {
    console.log("🔍 البحث عن مراسل علي الحازمي...");

    // البحث عن المراسل
    const reporter = await prisma.reporters.findFirst({
      where: {
        full_name: "علي الحازمي",
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
          "https://res.cloudinary.com/dybhezmvb/image/upload/v1754038138/sabq-cms/avatars/1754038138013_untitleddesign.jpg_gpcb50.jpg",
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
