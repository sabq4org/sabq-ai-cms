import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const take = Math.min(parseInt(url.searchParams.get("take") || "20"), 50);
    const cursor = url.searchParams.get("cursor") || undefined;

    // متابعات الأشخاص عبر user_preferences
    const prefs = await prisma.user_preferences.findMany({
      where: { user_id: user.id, key: { startsWith: "follow_person:" } as any },
      select: { key: true },
    } as any);
    const authorIds = prefs.map((p) => p.key.split(":")[1]).filter(Boolean);
    if (authorIds.length === 0) {
      return NextResponse.json({ success: true, items: [], nextCursor: null });
    }

    const rows = await prisma.smart_notifications.findMany({
      where: {
        type: "user_engagement" as any,
        data: { path: ["actor_id"], in: authorIds } as any,
      },
      orderBy: { created_at: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    } as any);

    const slice = rows.slice(0, take);
    const nextCursor = rows.length > take ? rows[rows.length - 1].id : null;

    const items = await Promise.all(
      slice.map(async (n: any) => {
        const actorId = n.data?.actor_id;
        const actor = actorId
          ? await prisma.users.findUnique({ where: { id: actorId }, select: { name: true } })
          : null;
        return {
          id: n.id,
          created_at: n.created_at,
          title: `${actor?.name || "مستخدم"} أضاف تعليقاً على خبر تتابعه`,
          link: n.data?.article_id ? `/article/${n.data.article_id}#${n.data.comment_id ? `comment-${n.data.comment_id}` : "comments"}` : "/",
        };
      })
    );

    return NextResponse.json({ success: true, items, nextCursor });
  } catch (e: any) {
    console.error("/api/notifications/feed error:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}


