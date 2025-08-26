import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";

// كاش بالذاكرة لمدة قصيرة لتخفيف الحمل
type CacheEntry = { data: any[]; ts: number };
let MEMORY_CACHE: CacheEntry | null = null;
const TTL_MS = 60 * 1000; // 60 ثانية

function withCloudinaryThumb(src: string): string {
  try {
    if (!src || typeof src !== "string") return src;
    if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) return src;
    const [prefix, rest] = src.split("/upload/");
    if (/^(c_|w_|h_|f_|q_)/.test(rest)) return `${prefix}/upload/${rest}`;
    const t = "c_fill,w_400,h_225,q_auto,f_auto";
    return `${prefix}/upload/${t}/${rest}`;
  } catch {
    return src;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 30);

    // إرجاع من الكاش إذا صالح
    if (MEMORY_CACHE && Date.now() - MEMORY_CACHE.ts < TTL_MS) {
      const sliced = MEMORY_CACHE.data.slice(0, limit);
      const res = NextResponse.json({ ok: true, articles: sliced, cached: true });
      res.headers.set("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
      return res;
    }

    await ensureDbConnected();
    const now = new Date();

    const rows = await retryWithConnection(async () =>
      prisma.articles.findMany({
        where: {
          status: "published",
          OR: [
            { published_at: { lte: now } },
            { published_at: null },
          ],
        },
        orderBy: { published_at: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          published_at: true,
        },
      })
    );

    const articles = (rows || []).map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      featured_image: a.featured_image ? withCloudinaryThumb(a.featured_image) : null,
      published_at: a.published_at,
    }));

    MEMORY_CACHE = { data: articles, ts: Date.now() };

    const res = NextResponse.json({ ok: true, articles, cached: false });
    res.headers.set("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
    return res;
  } catch (error: any) {
    console.error("❌ [light/news] error:", error);
    return NextResponse.json({ ok: true, articles: [], fallback: true }, { status: 200 });
  }
}


