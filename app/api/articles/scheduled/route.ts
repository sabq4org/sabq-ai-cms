import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cron-safe endpoint: ينشر المقالات المجدولة التي حان وقتها
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-cron-key") || request.headers.get("authorization");
  const cronKey = process.env.CRON_SECRET_KEY;
  if (!cronKey || !authHeader || !authHeader.includes(cronKey)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const dueArticles = await prisma.articles.findMany({
      where: {
        status: "scheduled",
        scheduled_for: { lte: now },
      },
      take: 50,
      orderBy: { scheduled_for: "asc" },
      select: { id: true },
    });

    if (dueArticles.length === 0) {
      return NextResponse.json({ success: true, published: 0 });
    }

    const ids = dueArticles.map((a) => a.id);

    await prisma.articles.updateMany({
      where: { id: { in: ids } },
      data: { status: "published", published_at: now, scheduled_for: null },
    });

    // إبطال كاش الأخبار الأساسية
    try {
      const { cache } = await import("@/lib/redis");
      await cache.clearPattern("articles:*");
    } catch {}

    return NextResponse.json({ success: true, published: ids.length, ids });
  } catch (error: any) {
    console.error("❌ Scheduler error:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}


