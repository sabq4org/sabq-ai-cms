import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const decodedSlug = decodeURIComponent(slug);

    const category = await prisma.categories.findFirst({
      where: {
        OR: [{ slug: decodedSlug }, { name: decodedSlug }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
