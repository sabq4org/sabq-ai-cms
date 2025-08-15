import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId") || searchParams.get("article_id");
    const cursor = searchParams.get("cursor") || undefined;
    const pageSize = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!articleId) {
      return NextResponse.json({ success: false, error: "articleId مطلوب" }, { status: 400 });
    }

    const roots = await prisma.comments.findMany({
      where: { article_id: articleId, parent_id: null, status: "approved" },
      orderBy: { created_at: "desc" },
      take: pageSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        content: true,
        created_at: true,
        likes: true,
        user_id: true,
        metadata: true,
      },
    });

    const rootIds = roots.map((r) => r.id);
    let countsMap = new Map<string, number>();
    if (rootIds.length) {
      const grouped = await prisma.comments.groupBy({
        by: ["parent_id"],
        where: { article_id: articleId, status: "approved", parent_id: { in: rootIds } },
        _count: { _all: true },
      } as any);
      countsMap = new Map(grouped.map((g: any) => [g.parent_id as string, g._count._all as number]));
    }

    // جلب بيانات المستخدمين
    const userIds = Array.from(new Set(roots.map((r) => r.user_id).filter(Boolean))) as string[];
    let userMap = new Map<string, { id: string; name: string | null; avatar: string | null }>();
    if (userIds.length) {
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, avatar: true },
      });
      userMap = new Map(users.map((u) => [u.id, { id: u.id, name: u.name || null, avatar: u.avatar || null }]));
    }

    const items = roots.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      likesCount: r.likes,
      user: r.user_id ? userMap.get(r.user_id) || null : null,
      repliesCount: countsMap.get(r.id) || 0,
    }));

    return NextResponse.json({ success: true, items, nextCursor: roots.length === pageSize ? roots[roots.length - 1].id : null });
  } catch (error) {
    console.error("خطأ في GET /api/comments/tree:", error);
    return NextResponse.json({ success: false, error: "فشل في جلب التعليقات" }, { status: 500 });
  }
}


