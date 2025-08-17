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
    });

    if (!corner) {
      return NextResponse.json(
        { success: false, error: "Corner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, corner });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch corner",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Delete related articles first to maintain referential integrity
    const corner = await prisma.muqtarabCorner.findUnique({ where: { slug }, select: { id: true } });
    if (corner) {
      await prisma.muqtarabArticle.deleteMany({ where: { corner_id: corner.id } });
    }

    // Delete the corner
    await prisma.muqtarabCorner.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true, message: 'Corner and its articles deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete corner', details: error.message }, { status: 500 });
  }
}
