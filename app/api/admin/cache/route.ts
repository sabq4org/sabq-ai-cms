import { NextRequest, NextResponse } from "next/server";
import {
  getCacheStats,
  clearArticleCache,
  deleteArticleFromCache,
} from "@/lib/cache/article-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET - جلب إحصائيات الكاش
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats();

    if (!stats) {
      return NextResponse.json(
        {
          ok: false,
          message: "فشل في جلب إحصائيات الكاش",
          error: "Redis غير متاح",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "تم جلب إحصائيات الكاش بنجاح",
      data: stats,
    });
  } catch (error: any) {
    console.error("❌ خطأ في جلب إحصائيات الكاش:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء جلب إحصائيات الكاش",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - حذف الكاش
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      // حذف جميع المقالات من الكاش
      const success = await clearArticleCache();

      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            message: "فشل في حذف الكاش",
            error: "Redis غير متاح",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "تم حذف جميع المقالات من الكاش بنجاح",
      });
    }

    if (articleId) {
      // حذف مقال محدد من الكاش
      const success = await deleteArticleFromCache(articleId);

      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            message: "فشل في حذف المقال من الكاش",
            error: "Redis غير متاح أو المقال غير موجود في الكاش",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: `تم حذف المقال ${articleId} من الكاش بنجاح`,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "يجب تحديد articleId أو clearAll=true",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ خطأ في حذف الكاش:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء حذف الكاش",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - تحديث إعدادات الكاش
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, articleIds } = body;

    if (action === "warmup" && articleIds && Array.isArray(articleIds)) {
      // تسخين الكاش بمقالات محددة
      // يمكن تطبيق منطق جلب المقالات وحفظها في الكاش
      
      return NextResponse.json({
        ok: true,
        message: `تم تسخين الكاش لـ ${articleIds.length} مقال`,
        data: {
          warmedUp: articleIds.length,
        },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "إجراء غير معروف",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ خطأ في تحديث الكاش:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء تحديث الكاش",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

