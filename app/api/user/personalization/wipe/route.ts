import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";

export async function POST() {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$transaction([
      prisma.UserInteractions.deleteMany({ where: { user_id: user.id } }),
      prisma.user_interests.deleteMany({ where: { user_id: user.id } })
    ]);
    await prisma.$disconnect();
    const redis = getRedisClient();
    if (redis) await deleteKeysByPattern(redis, `user:feed:${user.id}:*`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


