import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const authorId = (body?.authorId || body?.author_id || "").toString();
    if (!authorId) return NextResponse.json({ success: false, error: "authorId مطلوب" }, { status: 400 });

    const key = `follow_person:${authorId}`;
    await prisma.user_preferences.delete({
      where: { user_id_key: { user_id: user.id, key } as any },
    } as any).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("/api/preferences/unfollow error:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}


