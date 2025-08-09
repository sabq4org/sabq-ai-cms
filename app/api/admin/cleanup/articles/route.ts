import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getEffectiveUserRoleById } from "@/app/lib/auth";

export const runtime = "nodejs";

/**
 * DELETE ALL ARTICLES (NEWS + OPINION) — ADMIN-ONLY
 *
 * POST /api/admin/cleanup/articles
 * Body: { confirm: "DELETE_ALL_ARTICLES_AND_OPINIONS", hard?: boolean }
 *
 * - hard = true: TRUNCATE articles/opinion_articles CASCADE (يحذف فعلياً كل العلاقات التابعة)
 * - hard = false: Soft-delete (articles.status='deleted', opinion_articles.isActive=false, status='archived')
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const role = await getEffectiveUserRoleById(user.id);
    const isSuperAdmin =
      user.email === "admin@sabq.ai" || user.is_admin === true || role === "admin" || role === "superadmin";
    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: "صلاحيات غير كافية" },
        { status: 403 }
      );
    }

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

    const [articlesCount, opinionCount] = await Promise.all([
      prisma.articles.count(),
      prisma.opinion_articles.count().catch(() => 0),
    ]);

    if (hard) {
      // حذف فعلي شامل — نستخدم TRUNCATE CASCADE لضمان حذف المراجع المرتبطة
      try {
        await prisma.$executeRawUnsafe("TRUNCATE TABLE articles CASCADE");
      } catch (e) {
        console.error("TRUNCATE articles CASCADE failed:", e);
        // Fallback: حذف جماعي
        await prisma.comments.deleteMany({});
        await prisma.interactions.deleteMany({});
        await prisma.article_quotes.deleteMany({}).catch(() => undefined);
        await prisma.articles.deleteMany({});
      }

      try {
        await prisma.$executeRawUnsafe("TRUNCATE TABLE opinion_articles CASCADE");
      } catch (e) {
        console.error("TRUNCATE opinion_articles CASCADE failed:", e);
        await prisma.opinion_articles.deleteMany({}).catch(() => undefined);
      }
    } else {
      // حذف منطقي — أسلم إن أردنا الإبقاء على السجلات لأغراض التدقيق
      await prisma.articles.updateMany({
        data: { status: "deleted", updated_at: new Date() },
      });
      await prisma.opinion_articles
        .updateMany({ data: { isActive: false, status: "archived" as any } })
        .catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      mode: hard ? "hard" : "soft",
      deleted:
        hard
          ? { articlesApprox: articlesCount, opinionApprox: opinionCount }
          : { articlesUpdated: articlesCount, opinionUpdated: opinionCount },
      message: hard
        ? "تم حذف كل الأخبار ومقالات الرأي وجميع العلاقات التابعة (فعلياً)"
        : "تم تعليم كل الأخبار كمحذوفة وتعطيل مقالات الرأي (Soft Delete)",
    });
  } catch (error: any) {
    console.error("❌ خطأ في تنظيف المقالات:", error);
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


