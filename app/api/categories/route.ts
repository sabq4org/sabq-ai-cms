import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helper";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const categories = await withRetry(async () => prisma.categories.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        display_order: "asc",
      },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: "published",
              },
            },
          },
        },
      },
    }));

    // إضافة عدد المقالات إلى كل تصنيف
    const categoriesWithCount = categories.map((category) => ({
      ...category,
      articles_count: category._count.articles,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
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
