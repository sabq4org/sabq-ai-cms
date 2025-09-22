import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const idOrSlug = slug;
    if (!idOrSlug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

    // يمكن أن يكون القيمة ID أو SLUG
    const article = await prisma.articles.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: "published" },
      select: { id: true, views: true, likes: true, shares: true }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const [sessionsAgg, readsCompletedCount, commentsCount] = await Promise.all([
      prisma.user_reading_sessions.aggregate({
        _avg: { duration_seconds: true },
        where: { article_id: article.id }
      }),
      prisma.user_reading_sessions.count({
        where: {
          article_id: article.id,
          OR: [
            { read_percentage: { gte: 0.9 as any } },
            { duration_seconds: { gte: 60 } }
          ]
        }
      }),
      prisma.comments.count({ where: { article_id: article.id } })
    ]);

    const avgReadTimeSec = Math.max(0, Math.round((sessionsAgg._avg as any)?.duration_seconds || 0)) || 60;

    return NextResponse.json({
      views: article.views || 0,
      readsCompleted: readsCompletedCount || 0,
      avgReadTimeSec,
      interactions: { likes: article.likes || 0, comments: commentsCount || 0, shares: article.shares || 0 },
      ai: {
        shortSummary: "",
        sentiment: "محايد",
        topic: "أخبار",
        readerFitScore: 60,
        recommendations: [],
      },
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    return NextResponse.json({
      views: 0,
      readsCompleted: 0,
      avgReadTimeSec: 60,
      interactions: { likes: 0, comments: 0, shares: 0 },
      ai: { shortSummary: "", sentiment: "محايد", topic: "أخبار", readerFitScore: 60, recommendations: [] },
    }, { headers: { "Cache-Control": "no-store" } });
  }
}


