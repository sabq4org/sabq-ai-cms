import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const parentId = new URL(request.url).searchParams.get("parentId") || new URL(request.url).searchParams.get("parent_id");
    if (!parentId) return NextResponse.json({ success: false, error: "parentId مطلوب" }, { status: 400 });

    const replies = await prisma.comments.findMany({
      where: { parent_id: parentId, status: "approved" },
      orderBy: { created_at: "asc" },
      take: 50,
      select: { id: true, content: true, created_at: true, likes: true, user_id: true, metadata: true },
    });

    const userIds = Array.from(new Set(replies.map((r) => r.user_id).filter(Boolean))) as string[];
    let userMap = new Map<string, { id: string; name: string | null; avatar: string | null }>();
    if (userIds.length) {
      const users = await prisma.users.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, avatar: true } });
      userMap = new Map(users.map((u) => [u.id, { id: u.id, name: u.name || null, avatar: u.avatar || null }]));
    }

    const items = replies.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      likesCount: r.likes,
      user: r.user_id ? userMap.get(r.user_id) || null : null,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("خطأ في GET /api/comments/replies:", error);
    return NextResponse.json({ success: false, error: "فشل في جلب الردود" }, { status: 500 });
  }
}


