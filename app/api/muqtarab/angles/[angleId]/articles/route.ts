import { cache as redisCache } from "@/lib/redis-improved";
import { MuqtaribArticleForm } from "@/types/muqtarab";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// إنشاء مقال جديد في الزاوية
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const body: MuqtaribArticleForm = await request.json();

    // التحقق من البيانات المطلوبة
    if (!body.title?.trim() || !body.content?.trim() || !body.authorId) {
      return NextResponse.json(
        { error: "العنوان والمحتوى ومعرف المؤلف مطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من وجود الزاوية
    const angleExists = (await prisma.$queryRaw`
      SELECT id FROM angles WHERE id = ${angleId}::uuid
    `) as { id: string }[];

    if (angleExists.length === 0) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    // إنشاء المقال
    const result = (await prisma.$queryRawUnsafe(
      `
      INSERT INTO angle_articles (
        angle_id, title, content, excerpt, author_id,
        sentiment, tags, cover_image, is_published,
        publish_date, reading_time
      ) VALUES (
        $1::uuid, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11
      ) RETURNING *
    `,
      angleId,
      body.title,
      body.content,
      body.excerpt || null,
      body.authorId,
      body.sentiment || "neutral",
      body.tags || [],
      body.coverImage || null,
      body.isPublished,
      body.publishDate ? new Date(body.publishDate) : null,
      body.readingTime || 0
    )) as any[];

    const article = result[0];

    const json = {
      success: true,
      message: body.isPublished
        ? "تم نشر المقال بنجاح"
        : "تم حفظ المقال كمسودة",
      article: {
        id: article.id,
        angleId: article.angle_id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        authorId: article.author_id,
        sentiment: article.sentiment,
        tags: Array.isArray(article.tags) ? article.tags : [],
        coverImage: article.cover_image,
        isPublished: article.is_published,
        publishDate: article.publish_date,
        readingTime: article.reading_time,
        views: article.views,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
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
    let whereClause = `WHERE aa.angle_id = $1::uuid`;
    const queryParams: any[] = [angleId];
    let paramIndex = 2;

    // تطبيق فلتر النشر فقط إذا تم تحديده صراحة
    if (publishedParam === "true") {
      whereClause += ` AND aa.is_published = $${paramIndex}`;
      queryParams.push(true);
      paramIndex++;
    } else if (publishedParam === "false") {
      whereClause += ` AND aa.is_published = $${paramIndex}`;
      queryParams.push(false);
      paramIndex++;
    }
    // إذا لم يتم تحديد published، جلب كل المقالات (منشورة ومسودات)

    if (sentiment) {
      whereClause += ` AND aa.sentiment = $${paramIndex}`;
      queryParams.push(sentiment);
      paramIndex++;
    }

    // فلترة حسب الوقت
    if (timeRange !== "all") {
      const timeConditions = {
        week: "aa.created_at >= NOW() - INTERVAL '7 days'",
        month: "aa.created_at >= NOW() - INTERVAL '30 days'",
        year: "aa.created_at >= NOW() - INTERVAL '365 days'",
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
        orderClause = "ORDER BY aa.views DESC, aa.created_at DESC";
        break;
      case "trending":
        // ترتيب حسب التفاعل الأخير (views في آخر أسبوع)
        orderClause = "ORDER BY aa.views DESC, aa.created_at DESC";
        break;
      case "newest":
      default:
        orderClause = "ORDER BY aa.created_at DESC";
        break;
    }

    // جلب المقالات
    const articlesQuery = `
      SELECT
        aa.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      LEFT JOIN users u ON aa.author_id = u.id
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
      FROM angle_articles aa
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
      angleId: article.angle_id,
      title: article.title,
      slug: article.id, // استخدام ID كـ slug لأن العمود slug غير موجود
      content: article.content,
      excerpt: article.excerpt,
      authorId: article.author_id,
      author: {
        id: article.author_id,
        name: article.author_name,
        avatar: article.author_avatar,
      },
      sentiment: article.sentiment,
      tags:
        typeof article.tags === "string"
          ? JSON.parse(article.tags)
          : article.tags,
      coverImage: article.cover_image,
      isPublished: article.is_published,
      publishDate: article.publish_date,
      readingTime: Number(article.reading_time) || 0,
      views: Number(article.views) || 0,
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
  } catch (error) {
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
