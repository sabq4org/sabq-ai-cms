import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const { action, entityType, entityId, metadata } = await req.json();

    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        action: action || "unknown",
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata || {},
        ip_address: undefined,
        user_agent: undefined,
      }
    });
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


