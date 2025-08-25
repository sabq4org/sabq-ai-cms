import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const row = await prisma.UserSettings.findFirst({
      where: { user_id: user.id, module: "personalization", key: "enabled" },
      select: { value: true }
    });
    // Removed: $disconnect() - causes connection issues
    const enabled = row?.value?.enabled !== false;
    return NextResponse.json({ enabled });
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const enabled = body?.enabled !== false;
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.UserSettings.upsert({
      where: { user_id_module_key: { user_id: user.id, module: "personalization", key: "enabled" } as any },
      update: { value: { enabled } },
      create: { user_id: user.id, module: "personalization", key: "enabled", value: { enabled } }
    });
    // Removed: $disconnect() - causes connection issues
    return NextResponse.json({ enabled });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


