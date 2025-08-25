import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const interests = await prisma.user_interests.findMany({
      where: { user_id: user.id },
      select: { id: true, category_id: true, is_active: true, created_at: true },
      orderBy: { created_at: "desc" }
    });
    // Removed: $disconnect() - causes connection issues
    return NextResponse.json({ interests, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const categoryIds: string[] = body?.interests?.categoryIds || [];
    const terms: string[] = body?.interests?.terms || [];

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$transaction(async (tx) => {
      await tx.user_interests.deleteMany({ where: { user_id: user.id } });
      const data: any[] = [];
      for (const cid of categoryIds) {
        data.push({ user_id: user.id, category_id: cid });
      }
      for (const term of terms) {
        if (term && term.trim()) data.push({ user_id: user.id, category_id: undefined });
      }
      if (data.length) {
        await tx.user_interests.createMany({ data, skipDuplicates: true });
      }
    });
    // Removed: $disconnect() - causes connection issues
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
} 