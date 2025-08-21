import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "معرف المراسل مطلوب",
        },
        { status: 400 }
      );
    }

    // معاملات البحث
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "date";
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(`📚 جلب مقالات المراسل: ${slug}`, {
      search,
      category,
      sort,
      limit,
    });

    // البحث عن المراسل
    const reporter = await prisma.reporters.findFirst({
      where: {
        slug: slug,
        is_active: true,
      },
      select: {
        id: true,
        user_id: true,
        full_name: true,
      },
    });

    if (!reporter) {
      return NextResponse.json(
        {
          success: false,
          error: "المراسل غير موجود",
        },
        { status: 404 }
      );
    }

    // بناء شروط البحث
    const whereClause: any = {
      author_id: reporter.user_id,
      status: "published",
      is_deleted: false,
    };

    // إضافة البحث في العنوان
    if (search) {
      whereClause.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    // إضافة فلترة التصنيف
    if (category !== "all") {
      whereClause.category_id = parseInt(category);
    }

    // ترتيب النتائج - استخدام الحقول الصحيحة
    let orderBy: any = { published_at: "desc" };
    if (sort === "views") {
      orderBy = { views: "desc" };
    } else if (sort === "likes") {
      orderBy = { likes: "desc" };
    } else if (sort === "engagement") {
      orderBy = [
        { likes: "desc" },
        { views: "desc" },
        { shares: "desc" }
      ];
    }

    // البحث عن المراسل في جدول article_authors
    const articleAuthor = await prisma.article_authors.findFirst({
      where: {
        full_name: reporter.full_name,
        is_active: true,
      },
      select: { id: true },
    });

    // بناء شروط البحث الكاملة مع دعم النظامين
    const baseWhere = {
      OR: [
        { author_id: reporter.user_id },
        ...(articleAuthor ? [{ article_author_id: articleAuthor.id }] : []),
      ],
      status: "published",
    };

    // إضافة شروط البحث والفلترة
    const finalWhere: any = { ...baseWhere };

    if (search) {
      finalWhere.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category !== "all") {
      finalWhere.category_id = parseInt(category);
    }

    // جلب المقالات الحقيقية للمراسل (دعم النظامين القديم والجديد)
    const articles = await prisma.articles.findMany({
      where: finalWhere,
      orderBy: orderBy as any,
      take: limit,
      select: {
        id: true,
        title: true,
        excerpt: true,
        featured_image: true,
        slug: true,
        views: true,
        likes: true,
        shares: true,
        reading_time: true,
        published_at: true,
        created_at: true,
        category_id: true,
      },
    });

    console.log(
      `✅ تم جلب ${articles.length} مقال للمراسل ${reporter.full_name}`
    );

    return NextResponse.json({
      success: true,
      articles: articles,
      total: articles.length,
      reporter: {
        id: reporter.id,
        name: reporter.full_name,
      },
    });
  } catch (error: any) {
    console.error("خطأ في جلب مقالات المراسل:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقالات",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
