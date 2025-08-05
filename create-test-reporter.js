import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestReporter() {
  try {
    // التحقق من وجود user أو إنشاء واحد
    let user = await prisma.users.findFirst({
      where: { email: "abdullah@test.com" },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          id: "user_abdullah_test",
          email: "abdullah@test.com",
          name: "عبدالله البرقاوي",
          role: "reporter",
          updated_at: new Date(),
        },
      });
      console.log("✅ تم إنشاء المستخدم:", user.id);
    }

    const reporter = await prisma.reporters.create({
      data: {
        id: "reporter_test_abdullah",
        user_id: user.id,
        full_name: "عبدالله البرقاوي",
        slug: "abdullah-barqawi",
        bio: "مراسل متخصص في الأخبار السياسية والاقتصادية",
        avatar_url: "https://via.placeholder.com/150",
        specializations: ["سياسة", "اقتصاد"],
        is_verified: true,
        is_active: true,
      },
    });

    console.log("✅ تم إنشاء المراسل:", reporter);
  } catch (error) {
    console.error("❌ خطأ في إنشاء المراسل:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReporter();
