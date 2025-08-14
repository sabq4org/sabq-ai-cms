import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET: جلب الأخبار (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status") || "all";
    const category_id = searchParams.get("category_id");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    const skip = (page - 1) * limit;

    // Start with an empty where clause
    const where: any = {};

    if (status !== "all") {
      where.status = status;
    }

    if (category_id && category_id !== "all") {
      where.category_id = category_id;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // ترتيب النتائج
    const orderBy: any = {};
    orderBy[sort] = order;

    // جلب الأخبار مع العد
    const [articles, totalCount] = await Promise.all([
      prisma.articles.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),

      prisma.articles.count({ where }),
    ]);

    // إنشاء الاستجابة مع headers صريحة
    // إحصائيات شاملة بما فيها المجدولة
    const statsAgg = await prisma.articles.groupBy({
      by: ["status"],
      _count: { _all: true },
    }).catch(() => [] as any[]);

    const stats = {
      total: totalCount,
      published: statsAgg.find((s: any) => s.status === "published")?._count?._all || 0,
      draft: statsAgg.find((s: any) => s.status === "draft")?._count?._all || 0,
      archived: statsAgg.find((s: any) => s.status === "archived")?._count?._all || 0,
      scheduled: statsAgg.find((s: any) => s.status === "scheduled")?._count?._all || 0,
      deleted: statsAgg.find((s: any) => s.status === "deleted")?._count?._all || 0,
      breaking: articles.filter((a) => a.breaking).length,
    };

    const response = NextResponse.json({
      success: true,
      articles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount,
      stats,
    });

    // إضافة headers لمنع مشاكل الترميز
    response.headers.set("Content-Type", "application/json; charset=utf-8");
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");

    return response;
  } catch (error: any) {
    console.error("❌ خطأ في جلب الأخبار:", error);

    // إنشاء استجابة الخطأ مع headers صريحة
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الأخبار",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );

    // إضافة headers لمنع مشاكل الترميز
    errorResponse.headers.set(
      "Content-Type",
      "application/json; charset=utf-8"
    );
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return errorResponse;
  } finally {
  }
}
