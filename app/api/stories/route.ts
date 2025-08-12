import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, tags = [], metadata } = body || {};

    if (!title) {
      return NextResponse.json(
        { success: false, error: "العنوان مطلوب" },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        title,
        description,
        category,
        tags,
        metadata,
      },
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل إنشاء القصة" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: any = {};
    if (q) where.title = { contains: q, mode: "insensitive" };
    if (category) where.category = category;

    const stories = await prisma.story.findMany({
      where,
      orderBy: { updated_at: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل جلب القصص" },
      { status: 500 }
    );
  }
}


