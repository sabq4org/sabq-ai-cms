import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const [articleAgg, sessionsAgg, readsCompletedCount, commentsCount] = await Promise.all([
      prisma.articles.findFirst({
        where: { id },
        select: { views: true, likes: true, shares: true }
      }),
      prisma.user_reading_sessions.aggregate({
        _avg: { duration_seconds: true },
        where: { article_id: id }
      }),
      prisma.user_reading_sessions.count({
        where: {
          article_id: id,
          OR: [
            { read_percentage: { gte: 0.9 as any } },
            { duration_seconds: { gte: 60 } }
          ]
        }
      }),
      prisma.comments.count({ where: { article_id: id } })
    ]);

    const views = articleAgg?.views || 0;
    const likes = articleAgg?.likes || 0;
    const shares = articleAgg?.shares || 0;
    const avgReadTimeSec = Math.max(0, Math.round((sessionsAgg._avg as any)?.duration_seconds || 0)) || 60;

    return NextResponse.json({
      views,
      readsCompleted: readsCompletedCount || 0,
      avgReadTimeSec,
      interactions: { likes, comments: commentsCount || 0, shares },
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


