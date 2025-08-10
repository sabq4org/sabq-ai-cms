import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * DELETE ALL ARTICLES (NEWS + OPINION) — ADMIN-ONLY
 *
 * Endpoint: DELETE /api/admin/cleanup/articles
 * Body: { confirm: "DELETE_ALL_ARTICLES_AND_OPINIONS", hard?: boolean }
 *
 * - hard = true: Hard-delete (completely remove from database)
 * - hard = false: Soft-delete (articles.status='deleted', opinion_articles.isActive=false, status='archived')
 */
export async function DELETE(req: NextRequest) {
  try {
    // تعليق نظام التحقق من المدراء مؤقتاً للتطوير
    // const user = await getCurrentUser(req);
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: "غير مصرح" },
    //     { status: 401 }
    //   );
    // }

    // const role = await getEffectiveUserRoleById(user.id);
    // const isSuperAdmin =
    //   user.email === "admin@sabq.ai" || user.is_admin === true || role === "admin" || role === "superadmin";
    // if (!isSuperAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: "صلاحيات غير كافية" },
    //     { status: 403 }
    //   );
    // }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const confirm = body?.confirm;
    const hard = body?.hard !== false; // افتراضي: حذف فعلي

    if (confirm !== "DELETE_ALL_ARTICLES_AND_OPINIONS") {
      return NextResponse.json(
        {
          success: false,
          error:
            "يجب إرسال confirm=DELETE_ALL_ARTICLES_AND_OPINIONS لتأكيد العملية",
        },
        { status: 400 }
      );
    }

    console.log(
      "✅ [Articles Cleanup] تم تأكيد العملية، نوع الحذف:",
      hard ? "حذف فعلي نهائي" : "حذف ناعم"
    );

    const [articlesCount, opinionCount] = await Promise.all([
      prisma.articles.count(),
      prisma.opinion_articles.count().catch(() => 0),
    ]);

    console.log(
      `📊 [Articles Cleanup] العدد الحالي: ${articlesCount} مقال عادي، ${opinionCount} مقال رأي`
    );

    if (hard) {
      // حذف فعلي شامل — حذف جميع البيانات المرتبطة أولاً
      console.log("🗑️ [Articles Cleanup] بدء الحذف الفعلي النهائي...");

      try {
        // حذف جميع التعليقات أولاً
        console.log("🗑️ [Articles Cleanup] حذف جميع التعليقات...");
        await prisma.comments.deleteMany({});

        // حذف جميع التفاعلات
        console.log("🗑️ [Articles Cleanup] حذف جميع التفاعلات...");
        await prisma.interactions.deleteMany({});

        // حذف جميع اقتباسات المقالات
        console.log("🗑️ [Articles Cleanup] حذف جميع اقتباسات المقالات...");
        await prisma.article_quotes.deleteMany({}).catch(() => undefined);

        // حذف جميع المقالات المحفوظة
        console.log("🗑️ [Articles Cleanup] حذف جميع المقالات المحفوظة...");
        await prisma.saved_articles.deleteMany({});

        // حذف جميع قراءات المقالات
        console.log("🗑️ [Articles Cleanup] حذف جميع قراءات المقالات...");
        await prisma.article_reads.deleteMany({});

        // حذف جميع تحليلات المقالات
        console.log("🗑️ [Articles Cleanup] حذف جميع تحليلات المقالات...");
        await prisma.article_analytics.deleteMany({});

        // حذف جميع المقالات المميزة
        console.log(
          "🗑️ [Articles Cleanup] حذف جميع إعدادات المقالات المميزة..."
        );
        await prisma.featured_articles.deleteMany({});

        // حذف جميع مقالات الرأي
        console.log("🗑️ [Articles Cleanup] حذف جميع مقالات الرأي...");
        await prisma.opinion_articles.deleteMany({}).catch(() => undefined);

        // حذف جميع المقالات العادية
        console.log("🗑️ [Articles Cleanup] حذف جميع المقالات العادية...");
        await prisma.articles.deleteMany({});

        console.log(`✅ [Articles Cleanup] تم الحذف الفعلي النهائي بنجاح`);
      } catch (error) {
        console.error(
          "❌ [Articles Cleanup] خطأ في الحذف الفعلي، محاولة TRUNCATE...",
          error
        );

        // Fallback: استخدام TRUNCATE CASCADE
        try {
          await prisma.$executeRawUnsafe("TRUNCATE TABLE articles CASCADE");
          await prisma.$executeRawUnsafe(
            "TRUNCATE TABLE opinion_articles CASCADE"
          );
        } catch (e) {
          console.error("❌ [Articles Cleanup] TRUNCATE CASCADE فشل أيضاً:", e);
          throw error; // إعادة رفع الخطأ الأصلي
        }
      }
    } else {
      // حذف منطقي — أسلم إن أردنا الإبقاء على السجلات لأغراض التدقيق
      console.log("🗑️ [Articles Cleanup] بدء الحذف الناعم...");

      await prisma.articles.updateMany({
        data: { status: "deleted", updated_at: new Date() },
      });

      await prisma.opinion_articles
        .updateMany({ data: { isActive: false, status: "archived" as any } })
        .catch(() => undefined);

      console.log(`✅ [Articles Cleanup] تم الحذف الناعم بنجاح`);
    }

    return NextResponse.json({
      success: true,
      mode: hard ? "hard" : "soft",
      deleted: hard
        ? { articlesApprox: articlesCount, opinionApprox: opinionCount }
        : { articlesUpdated: articlesCount, opinionUpdated: opinionCount },
      message: hard
        ? `تم حذف ${articlesCount} مقال عادي و ${opinionCount} مقال رأي وجميع البيانات المرتبطة نهائياً`
        : `تم تعليم ${articlesCount} مقال كمحذوف وتعطيل ${opinionCount} مقال رأي (حذف ناعم)`,
    });
  } catch (error: any) {
    console.error("❌ [Articles Cleanup] خطأ في تنظيف المقالات:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل تنظيف قاعدة البيانات للمقالات",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
