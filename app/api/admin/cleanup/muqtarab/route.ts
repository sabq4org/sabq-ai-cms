import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * DELETE ALL MUQTARAB DATA — ADMIN-ONLY
 *
 * Endpoint: DELETE /api/admin/cleanup/muqtarab
 * Body: { confirm: "DELETE_ALL_MUQTARAB_DATA" }
 *
 * This endpoint removes all Muqtarab corners and related articles
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log("🧹 [Muqtarab Cleanup] بدء عملية حذف جميع بيانات المقترب...");

    // التحقق من التأكيد
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== "DELETE_ALL_MUQTARAB_DATA") {
      return NextResponse.json(
        {
          success: false,
          error: "مطلوب تأكيد العملية",
          details: "يجب إرسال confirm=DELETE_ALL_MUQTARAB_DATA لتأكيد العملية",
        },
        { status: 400 }
      );
    }

    console.log("✅ [Muqtarab Cleanup] تم تأكيد العملية، بدء التنظيف...");

    // حساب العدد قبل الحذف
    const cornersCount = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_corners
    `) as any[];

    const articlesCount = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_articles
    `) as any[];

    const totalCorners = Number(cornersCount[0]?.count || 0);
    const totalArticles = Number(articlesCount[0]?.count || 0);

    console.log(
      `📊 [Muqtarab Cleanup] العدد الحالي: ${totalCorners} زاوية، ${totalArticles} مقال`
    );

    // حذف جميع مقالات المقترب أولاً
    console.log("🗑️ [Muqtarab Cleanup] حذف جميع مقالات المقترب...");
    await prisma.$queryRaw`
      DELETE FROM muqtarab_articles
    `;
    console.log(
      `✅ [Muqtarab Cleanup] تم حذف ${totalArticles} مقال من المقترب`
    );

    // حذف جميع متابعي الزوايا
    console.log("🗑️ [Muqtarab Cleanup] حذف جميع متابعي الزوايا...");
    await prisma.$queryRaw`
      DELETE FROM muqtarab_followers
    `;
    console.log("✅ [Muqtarab Cleanup] تم حذف جميع متابعي الزوايا");

    // حذف جميع تحليلات المقترب
    console.log("🗑️ [Muqtarab Cleanup] حذف جميع تحليلات المقترب...");
    await prisma.$queryRaw`
      DELETE FROM muqtarab_analytics
    `;
    console.log("✅ [Muqtarab Cleanup] تم حذف جميع تحليلات المقترب");

    // حذف جميع إشعارات المقترب
    console.log("🗑️ [Muqtarab Cleanup] حذف جميع إشعارات المقترب...");
    await prisma.$queryRaw`
      DELETE FROM muqtarab_notifications
    `;
    console.log("✅ [Muqtarab Cleanup] تم حذف جميع إشعارات المقترب");

    // أخيراً، حذف جميع زوايا المقترب
    console.log("🗑️ [Muqtarab Cleanup] حذف جميع زوايا المقترب...");
    await prisma.$queryRaw`
      DELETE FROM muqtarab_corners
    `;
    console.log(
      `✅ [Muqtarab Cleanup] تم حذف ${totalCorners} زاوية من المقترب`
    );

    // التحقق من التنظيف
    const remainingCorners = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_corners
    `) as any[];

    const remainingArticles = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_articles
    `) as any[];

    const finalCornersCount = Number(remainingCorners[0]?.count || 0);
    const finalArticlesCount = Number(remainingArticles[0]?.count || 0);

    console.log("✅ [Muqtarab Cleanup] تم الانتهاء من تنظيف بيانات المقترب");
    console.log(
      `📊 [Muqtarab Cleanup] النتيجة النهائية: ${finalCornersCount} زاوية، ${finalArticlesCount} مقال متبقي`
    );

    return NextResponse.json({
      success: true,
      message: `تم حذف جميع بيانات المقترب بنجاح`,
      details: {
        deletedCorners: totalCorners,
        deletedArticles: totalArticles,
        remainingCorners: finalCornersCount,
        remainingArticles: finalArticlesCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ [Muqtarab Cleanup] خطأ في حذف بيانات المقترب:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في حذف بيانات المقترب",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
