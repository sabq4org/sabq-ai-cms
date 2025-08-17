import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cron-safe endpoint: ينشر المقالات المجدولة التي حان وقتها
export const runtime = "nodejs";

async function runScheduler(): Promise<NextResponse> {
  const now = new Date();
  const dueArticles = await prisma.articles.findMany({
    where: {
      status: "scheduled",
      scheduled_for: { lte: now },
    },
    take: 100,
    orderBy: { scheduled_for: "asc" },
    select: { id: true },
  });

  if (dueArticles.length === 0) {
    return NextResponse.json({ success: true, published: 0, message: "No due articles" });
  }

  const ids = dueArticles.map((a) => a.id);

  await prisma.articles.updateMany({
    where: { id: { in: ids } },
    data: { status: "published", published_at: now, scheduled_for: null },
  });

  try {
    const { cache } = await import("@/lib/redis");
    await cache.clearPattern("articles:*");
  } catch {}

  return NextResponse.json({ success: true, published: ids.length, ids });
}

function isAuthorized(req: NextRequest): boolean {
  const cronKey = process.env.CRON_SECRET_KEY;
  if (!cronKey) return true; // إذا لم يُحدد مفتاح، اسمح بالتنفيذ لتفادي تعطيل الكرون
  const authHeader = req.headers.get("x-cron-key") || req.headers.get("authorization") || "";
  return authHeader.includes(cronKey);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runScheduler();
  } catch (error: any) {
    console.error("❌ Scheduler error:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}

// دعم GET للتشغيل اليدوي (مثلاً من المتصفح) مع تفويض اختياري
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await runScheduler();
  } catch (error: any) {
    console.error("❌ Scheduler GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}


