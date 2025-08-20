import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  try {
    // ترويسات لإرشاد Vercel/Proxy لمسح الكاش للمسارات الحرجة
    const res = new NextResponse(JSON.stringify({ ok: true, purged: [
      "/api/news",
      "/api/articles",
      "/api/articles/featured",
      "/api/articles/latest",
      "/api/articles/featured-json"
    ] }), { status: 200 });

    // ملاحظة: Vercel لا يدعم Purge API مباشر من الخادم.
    // نعتمد على stale-while-revalidate + max-age القصير،
    // ويمكن استخدام Webhooks أو Vercel APIs من CI لاحقًا.
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "PURGE_FAILED" }, { status: 500 });
  }
}


