import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const publishedCount = await prisma.articles.count({
      where: { status: "published" },
    });
    const totalViews = await prisma.articles.aggregate({
      _sum: { views: true },
      where: { status: "published" },
    });

    const stats = {
      total: await prisma.articles.count(),
      published: publishedCount,
      totalViews: totalViews._sum.views || 0,
    };

    return NextResponse.json({
      success: true,
      stats: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch article stats",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
