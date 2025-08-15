import { NextRequest, NextResponse } from "next/server";
import { cache as redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const metric = JSON.parse(body || "{}");
    const key = `webvitals:${metric?.name || "metric"}:${Date.now()}`;

    // احتفظ بالقياسات لفترة قصيرة لتحليل الاتجاه
    await redis.set(key, metric, 300);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 200 });
  }
}


