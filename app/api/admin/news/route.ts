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

    // بناء شروط البحث - فقط الأخبار (استبعاد مقالات الرأي)
    const where: any = {
      article_type: {
        notIn: ["opinion", "analysis", "interview"],
      },
    };

    if (status !== "all") {
      where.status = status;
    }

    if (category_id && category_id !== "all") {
      where.category_id = category_id;
    }

    if (search) {
      where.AND = [
        { article_type: { notIn: ["opinion", "analysis", "interview"] } }, // الحفاظ على تصفية نوع المحتوى
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
      // إزالة article_type الأصلية لتجنب التعارض
      delete where.article_type;
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
    const response = NextResponse.json({
      success: true,
      articles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount,
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
