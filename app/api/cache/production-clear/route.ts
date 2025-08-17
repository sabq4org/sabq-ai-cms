import { cache } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة (للأمان)
    const authHeader = request.headers.get("authorization");
    if (
      !authHeader ||
      authHeader !==
        `Bearer ${process.env.CACHE_CLEAR_SECRET || "sabq-cache-clear-2025"}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type = "all", url } = body;

    let clearedActions = [];

    try {
      // مسح Redis cache
      await cache.clearPattern("articles:*");
      await cache.clearPattern("article:*");
      clearedActions.push("Redis cache cleared");
    } catch (error) {
      console.log("Redis cache clear failed:", error);
      clearedActions.push("Redis cache failed");
    }

    // مسح Vercel Edge Cache عبر revalidate
    if (url) {
      try {
        const { revalidateTag, revalidatePath } = await import("next/cache");

        // مسح tags
        revalidateTag("articles");
        revalidateTag("article");

        // مسح paths محددة
        revalidatePath("/");
        revalidatePath("/api/articles");
        if (url.includes("/article/")) {
          revalidatePath(url);
        }

        clearedActions.push("Vercel cache revalidated");
      } catch (error) {
        console.log("Vercel revalidate failed:", error);
        clearedActions.push("Vercel revalidate failed");
      }
    }

    // مسح browser cache بـ headers
    const response = NextResponse.json({
      success: true,
      message: "تم مسح الكاش بنجاح",
      actions: clearedActions,
      timestamp: new Date().toISOString(),
    });

    // إضافة headers لمنع الكاش
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("❌ خطأ في مسح كاش الإنتاج:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل مسح الكاش",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}

// GET method للاختبار
export async function GET() {
  return NextResponse.json({
    status: "Cache clear API ready",
    usage: "POST with Bearer token",
  });
}
