import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updated = await prisma.users.update({
      where: { id: params.id },
      data: { status: "active", is_verified: true, updated_at: new Date() },
      select: { id: true, status: true, is_verified: true },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "خطأ" }, { status: 500 });
  }
}


