import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * DELETE ALL TEST/DUMMY DATA — ADMIN-ONLY
 *
 * Endpoint: DELETE /api/admin/cleanup/test-data
 * Body: { confirm: "DELETE_ALL_TEST_DATA" }
 *
 * This endpoint removes test/dummy data that might have been created during development
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log("🧹 [Cleanup] بدء عملية حذف البيانات التجريبية...");

    // التحقق من التأكيد
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== "DELETE_ALL_TEST_DATA") {
      return NextResponse.json(
        {
          success: false,
          error: "مطلوب تأكيد العملية",
          details: "يجب إرسال confirm=DELETE_ALL_TEST_DATA لتأكيد العملية",
        },
        { status: 400 }
      );
    }

    console.log("✅ [Cleanup] تم تأكيد العملية، بدء التنظيف...");

    let deletedCount = {
      testArticles: 0,
      testCorners: 0,
      testUsers: 0,
      testComments: 0,
      total: 0,
    };

    // حذف المقالات التجريبية (التي تحتوي على كلمات مثل "تجريبي", "test", "dummy" في العنوان)
    console.log("🗑️ [Cleanup] حذف المقالات التجريبية...");
    const testArticles = await prisma.articles.deleteMany({
      where: {
        OR: [
          { title: { contains: "تجريبي", mode: "insensitive" } },
          { title: { contains: "test", mode: "insensitive" } },
          { title: { contains: "dummy", mode: "insensitive" } },
          { title: { contains: "مثال", mode: "insensitive" } },
          { title: { contains: "نموذج", mode: "insensitive" } },
          { title: { startsWith: "Test " } },
          { title: { startsWith: "تجربة " } },
          { title: { startsWith: "مقال تجريبي" } },
          { content: { contains: "هذا مقال تجريبي", mode: "insensitive" } },
          {
            content: {
              contains: "This is a test article",
              mode: "insensitive",
            },
          },
        ],
      },
    });
    deletedCount.testArticles = testArticles.count;
    console.log(`✅ [Cleanup] تم حذف ${testArticles.count} مقال تجريبي`);

    // حذف زوايا المقترب التجريبية
    console.log("🗑️ [Cleanup] حذف زوايا المقترب التجريبية...");
    const testCorners = await prisma.$queryRaw`
      DELETE FROM muqtarab_corners
      WHERE
        name ILIKE '%تجريبي%' OR
        name ILIKE '%test%' OR
        name ILIKE '%dummy%' OR
        name ILIKE '%مثال%' OR
        name ILIKE '%نموذج%' OR
        description ILIKE '%هذه زاوية تجريبية%'
    `;
    console.log(`✅ [Cleanup] تم حذف زوايا المقترب التجريبية`);

    // حذف المستخدمين التجريبيين (عدا النظام والمدراء)
    console.log("🗑️ [Cleanup] حذف المستخدمين التجريبيين...");
    const testUsers = await prisma.users.deleteMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: "test", mode: "insensitive" } },
              { name: { contains: "تجريبي", mode: "insensitive" } },
              { name: { contains: "dummy", mode: "insensitive" } },
              { email: { contains: "test@", mode: "insensitive" } },
              { email: { contains: "dummy@", mode: "insensitive" } },
              { email: { contains: "@test.", mode: "insensitive" } },
            ],
          },
          { role: { not: "admin" } }, // لا نحذف المدراء
          { email: { not: "system@sabq.ai" } }, // لا نحذف مستخدم النظام
        ],
      },
    });
    deletedCount.testUsers = testUsers.count;
    console.log(`✅ [Cleanup] تم حذف ${testUsers.count} مستخدم تجريبي`);

    // حذف التعليقات التجريبية
    console.log("🗑️ [Cleanup] حذف التعليقات التجريبية...");
    const testComments = await prisma.comments.deleteMany({
      where: {
        OR: [
          { content: { contains: "تعليق تجريبي", mode: "insensitive" } },
          { content: { contains: "test comment", mode: "insensitive" } },
          { content: { contains: "dummy comment", mode: "insensitive" } },
          { content: { startsWith: "Test:" } },
          { content: { startsWith: "تجربة:" } },
        ],
      },
    });
    deletedCount.testComments = testComments.count;
    console.log(`✅ [Cleanup] تم حذف ${testComments.count} تعليق تجريبي`);

    // حذف البيانات الإضافية التجريبية
    console.log("🗑️ [Cleanup] تنظيف البيانات الإضافية...");

    // تنظيف الجداول المرتبطة سيتم تلقائياً بسبب Foreign Key Constraints
    // أو يمكن استخدام raw queries إذا لزم الأمر

    // حساب إجمالي البيانات المحذوفة
    deletedCount.total =
      deletedCount.testArticles +
      deletedCount.testUsers +
      deletedCount.testComments;

    console.log("✅ [Cleanup] تم الانتهاء من تنظيف البيانات التجريبية");
    console.log("📊 [Cleanup] ملخص العملية:", deletedCount);

    return NextResponse.json({
      success: true,
      message: `تم حذف ${deletedCount.total} عنصر تجريبي بنجاح`,
      details: {
        deletedArticles: deletedCount.testArticles,
        deletedCorners: "متغير", // لأن queryRaw لا يرجع count
        deletedUsers: deletedCount.testUsers,
        deletedComments: deletedCount.testComments,
        totalDeleted: deletedCount.total,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ [Cleanup] خطأ في حذف البيانات التجريبية:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في حذف البيانات التجريبية",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
