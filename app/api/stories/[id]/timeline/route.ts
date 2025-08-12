import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const events = await prisma.event.findMany({
      where: { story_id: id },
      orderBy: { event_date: "asc" },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل جلب الخط الزمني" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, source, event_date, importanceScore = 5.0 } = body || {};

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "العنوان والمحتوى مطلوبان" },
        { status: 400 }
      );
    }

    const created = await prisma.event.create({
      data: {
        story_id: id,
        title,
        content,
        source,
        event_date: event_date ? new Date(event_date) : new Date(),
        importanceScore,
      },
    });

    return NextResponse.json({ success: true, event: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل إنشاء الحدث" },
      { status: 500 }
    );
  }
}


