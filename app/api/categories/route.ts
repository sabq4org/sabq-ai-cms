import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnected();

    // 1) Fetch active categories (avoid selecting columns that might not exist in prod)
    const categories = await retryWithConnection(() =>
      prisma.categories.findMany({
        where: { is_active: true },
        orderBy: { display_order: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          display_order: true,
          is_active: true,
          color: true,
          icon: true,
          // icon_url intentionally omitted for backward compatibility with DBs missing the column
          metadata: true,
          created_at: true,
          updated_at: true,
        },
      })
    );

    // 2) Compute published articles count per category using one groupBy query
    const categoryIds = categories.map((c) => c.id);
    let publishedCounts: Record<string, number> = {};

    if (categoryIds.length > 0) {
      const grouped = await retryWithConnection(() =>
        prisma.articles.groupBy({
          by: ["category_id"],
          where: {
            status: "published",
            category_id: { in: categoryIds },
          },
          _count: { _all: true },
        })
      );

      for (const g of grouped) {
        if (g.category_id) {
          publishedCounts[g.category_id] = g._count._all;
        }
      }
    }

    // 3) Merge counts and compute a safe icon_url for clients (fallback to icon)
    const categoriesWithCount = categories.map((category) => {
      const iconUrl = (category as any).icon_url ?? category.icon ?? null;
      return {
        ...category,
        icon_url: iconUrl,
        articles_count: publishedCounts[category.id] ?? 0,
      };
    });

    const res = NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    res.headers.set("CDN-Cache-Control", "public, s-maxage=900");
    return res;
  } catch (error: any) {
    console.error("/api/categories GET failed:", error?.message || error);
    const res = NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
