import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        display_order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      categories: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
