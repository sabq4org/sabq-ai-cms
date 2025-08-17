import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const corner = await prisma.muqtarabCorner.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!corner) {
      return NextResponse.json(
        { success: false, error: "Corner not found" },
        { status: 404 }
      );
    }

    const articles = await prisma.muqtarabArticle.findMany({
      where: { corner_id: corner.id },
      orderBy: { publish_at: "desc" },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch articles",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
