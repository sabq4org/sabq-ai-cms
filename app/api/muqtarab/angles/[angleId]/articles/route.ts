import { cache as redisCache } from "@/lib/redis-improved";
import { MuqtarabArticleForm } from "@/types/muqtarab";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Helper to generate a unique short slug for Muqtarab articles
async function generateUniqueMuqtarabSlug(): Promise<string> {
  let slug = nanoid(8);
  while (true) {
    const exists = await prisma.muqtarabArticle.findUnique({ where: { slug } });
    if (!exists) {
      return slug;
    }
    slug = nanoid(8);
  }
}

// إنشاء مقال جديد في الزاوية
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const body: MuqtarabArticleForm = await request.json();

    // التحقق من البيانات المطلوبة
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "العنوان والمحتوى مطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من وجود الزاوية
    const angleExists = await prisma.muqtarabCorner.findUnique({
      where: { id: angleId },
    });

    if (!angleExists) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const slug = nanoid(8); // Generate a short random slug

    // إنشاء المقال using Prisma's ORM capabilities for better type safety and maintainability
    const newArticle = await prisma.muqtarabArticle.create({
      data: {
        corner: { connect: { id: angleId } },
        title: body.title,
        slug: slug, // Use the new short slug
        content: body.content,
        excerpt: body.excerpt || null,
        ...(body.authorId && { creator: { connect: { id: body.authorId } } }),
        tags: body.tags || [],
        cover_image: body.coverImage || null,
        status: body.isPublished ? "published" : "draft",
        publish_at: body.isPublished
          ? body.publishDate
            ? new Date(body.publishDate)
            : new Date()
          : null,
        read_time: body.readingTime || 0,
        // AI fields can be added here if available in the form
        ai_sentiment: body.sentiment || "neutral",
      },
    });

    const json = {
      success: true,
      message: body.isPublished
        ? "تم نشر المقال بنجاح"
        : "تم حفظ المقال كمسودة",
      article: {
        id: newArticle.id,
        angleId: newArticle.corner_id,
        title: newArticle.title,
        slug: newArticle.slug, // Return the new slug
        content: newArticle.content,
        excerpt: newArticle.excerpt,
        authorId: newArticle.created_by,
        sentiment: newArticle.ai_sentiment,
        tags: newArticle.tags,
        coverImage: newArticle.cover_image,
        isPublished: newArticle.status === "published",
        publishDate: newArticle.publish_at,
        readingTime: newArticle.read_time,
        views: newArticle.view_count,
        createdAt: newArticle.created_at,
        updatedAt: newArticle.updated_at,
      },
    };

    // تفريغ كاش الزاوية واللائحة ذات الصلة
    try {
      await redisCache.clearPattern(`muktarib:articles:*` as any);
      if (angleId) {
        await redisCache.del(`muktarib:angle:${angleId}` as any);
      }
    } catch (e) {
      console.warn("⚠️ فشل تفريغ كاش Redis بعد إنشاء/تحديث مقال الزاوية");
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error("خطأ في إنشاء المقال:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء المقال" },
      { status: 500 }
    );
  } finally {
    // إزالة $disconnect لتجنب مشاكل Concurrent Requests
  }
}

// جلب مقالات الزاوية
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const { searchParams } = new URL(request.url);

    console.log("🔍 [GET Articles] angleId:", angleId);
    console.log(
      "🔍 [GET Articles] searchParams:",
      Object.fromEntries(searchParams)
    );

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "newest";
    const timeRange = searchParams.get("timeRange") || "all";
    const sentiment = searchParams.get("sentiment");
    const publishedParam = searchParams.get("published");

    const offset = (page - 1) * limit;

    // بناء شروط الفلترة
    let whereClause = `WHERE ma.corner_id = $1`;
    const queryParams: any[] = [angleId];
    let paramIndex = 2;

    // تطبيق فلتر النشر فقط إذا تم تحديده صراحة
    if (publishedParam === "true") {
      whereClause += ` AND ma.status = 'published'`;
    } else if (publishedParam === "false") {
      whereClause += ` AND ma.status = 'draft'`;
    }
    // إذا لم يتم تحديد published، جلب كل المقالات (منشورة ومسودات)

    if (sentiment) {
      whereClause += ` AND ma.ai_sentiment = $${paramIndex}`;
      queryParams.push(sentiment);
      paramIndex++;
    }

    // فلترة حسب الوقت
    if (timeRange !== "all") {
      const timeConditions = {
        week: "ma.created_at >= NOW() - INTERVAL '7 days'",
        month: "ma.created_at >= NOW() - INTERVAL '30 days'",
        year: "ma.created_at >= NOW() - INTERVAL '365 days'",
      };

      if (timeConditions[timeRange as keyof typeof timeConditions]) {
        whereClause += ` AND ${
          timeConditions[timeRange as keyof typeof timeConditions]
        }`;
      }
    }

    // بناء شرط الترتيب
    let orderClause = "";
    switch (sortBy) {
      case "popular":
        orderClause = "ORDER BY ma.view_count DESC, ma.created_at DESC";
        break;
      case "trending":
        // ترتيب حسب التفاعل الأخير (views في آخر أسبوع)
        orderClause = "ORDER BY ma.view_count DESC, ma.created_at DESC";
        break;
      case "newest":
      default:
        orderClause = "ORDER BY ma.created_at DESC";
        break;
    }

    // جلب المقالات
    const articlesQuery = `
      SELECT
        ma.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM muqtarab_articles ma
      LEFT JOIN users u ON ma.created_by = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    console.log("📊 [GET Articles] SQL Query:", articlesQuery);
    console.log("📊 [GET Articles] Params:", queryParams);

    const articles = (await prisma.$queryRawUnsafe(
      articlesQuery,
      ...queryParams
    )) as any[];

    console.log("✅ [GET Articles] Found articles:", articles.length);

    // جلب العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) as total
      FROM muqtarab_articles ma
      ${whereClause}
    `;

    const countResult = (await prisma.$queryRawUnsafe(
      countQuery,
      ...queryParams.slice(0, -2)
    )) as { total: bigint }[];

    const total = Number(countResult[0].total);

    // تنسيق البيانات
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      angleId: article.corner_id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      authorId: article.created_by,
      author: {
        id: article.created_by,
        name: article.author_name,
        avatar: article.author_avatar,
      },
      sentiment: article.ai_sentiment,
      tags: article.tags,
      coverImage: article.cover_image,
      isPublished: article.status === "published",
      publishDate: article.publish_at,
      readingTime: Number(article.read_time) || 0,
      views: Number(article.view_count) || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
    }));

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("❌ [GET Articles] خطأ في جلب مقالات الزاوية:", error);
    console.error("❌ [GET Articles] Error details:", error?.message || error);

    return NextResponse.json(
      {
        error: "حدث خطأ في جلب المقالات",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    // إزالة $disconnect لتجنب مشاكل Concurrent Requests
  }
}
