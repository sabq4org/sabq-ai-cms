import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateReporterSlug() {
  try {
    const reporter = await prisma.reporters.update({
      where: { id: "reporter_test_abdullah" },
      data: {
        slug: "عبدالله-البرقاوي", // Arabic slug
      },
    });

    console.log("✅ تم تحديث slug المراسل:", reporter.slug);
  } catch (error) {
    console.error("❌ خطأ في تحديث المراسل:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReporterSlug();
