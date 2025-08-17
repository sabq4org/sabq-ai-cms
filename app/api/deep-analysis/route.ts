import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const deepAnalyses = await prisma.deep_analyses.findMany({
      orderBy: {
        analyzed_at: "desc",
      },
      take: 10, // Limit to a reasonable number for the homepage
    });

    return NextResponse.json({
      success: true,
      data: deepAnalyses,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch deep analyses",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
