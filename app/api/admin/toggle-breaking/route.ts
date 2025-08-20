import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// يقبل كلا الشكلين من الجسم: { id, breaking } أو { articleId, isBreaking }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id: string | undefined = body?.id || body?.articleId;
    const breaking: boolean = Boolean(
      body?.breaking !== undefined ? body.breaking : body?.isBreaking
    );

    if (!id) {
      return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });
    }

    const updated = await prisma.articles.update({
      where: { id },
      data: { breaking, updated_at: new Date() },
    });

    return NextResponse.json(
      { ok: true, data: { id: updated.id, breaking: updated.breaking } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "UPDATE_FAILED" },
      { status: 500 }
    );
  }
}
