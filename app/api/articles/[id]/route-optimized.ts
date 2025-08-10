import prisma, { ensureConnection } from "@/lib/prisma";
import { cache as redis } from "@/lib/redis";
import { NextResponse } from "next/server";

// Cache مُحسن لتفاصيل المقال
async function getCachedArticle(id: string, fetcher: () => Promise<any>) {
  const cacheKey = `article:${id}`;

  try {
    // محاولة جلب من cache أولاً
    const cached = await redis.get(cacheKey);
    if (cached && cached !== "null") {
      console.log(`✅ تم جلب المقال ${id} من Redis cache - سرعة فائقة!`);
      return { data: cached, fromCache: true };
    }
  } catch (error) {
    console.warn("⚠️ خطأ في Redis cache:", error);
  }

  // جلب من قاعدة البيانات
  const data = await fetcher();

  // حفظ في cache لمدة 5 دقائق
  try {
    await redis.set(cacheKey, data, 300);
  } catch (error) {
    console.warn("⚠️ فشل في حفظ المقال في cache:", error);
  }

  return { data, fromCache: false };
}

// GET - جلب مقال واحد محسن
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();

  try {
    await ensureConnection();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "معرف المقال مطلوب",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 جلب تفاصيل المقال: ${id}`);

    const { data: article, fromCache } = await getCachedArticle(
      id,
      async () => {
        console.time("⚡ جلب المقال من قاعدة البيانات");

        // استخدام findFirst مع OR للبحث بـ ID أو slug
        const dbArticle = await prisma.articles.findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
          select: {
            // Select محددة للسرعة
            id: true,
            title: true,
            content: true,
            excerpt: true,
            slug: true,
            published_at: true,
            created_at: true,
            updated_at: true,
            featured_image: true,
            views: true,
            likes: true,
            shares: true,
            saves: true,
            featured: true,
            breaking: true,
            reading_time: true,
            status: true,
            // علاقات محدودة
            categories: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true,
              },
            },
          },
        });

        console.timeEnd("⚡ جلب المقال من قاعدة البيانات");

        if (!dbArticle) {
          return null;
        }

        // تحويل البيانات للصيغة المطلوبة
        return {
          id: dbArticle.id,
          title: dbArticle.title,
          content: dbArticle.content,
          excerpt: dbArticle.excerpt,
          slug: dbArticle.slug,
          published_at: dbArticle.published_at,
          created_at: dbArticle.created_at,
          updated_at: dbArticle.updated_at,
          featured_image: dbArticle.featured_image,
          reading_time: dbArticle.reading_time,
          is_breaking: dbArticle.breaking || false,
          is_featured: dbArticle.featured || false,
          status: dbArticle.status,
          category: dbArticle.categories,
          stats: {
            views: dbArticle.views || 0,
            likes: dbArticle.likes || 0,
            shares: dbArticle.shares || 0,
            saves: dbArticle.saves || 0,
            comments: 0, // سيتم جلبها لاحقاً إذا احتجناها
          },
        };
      }
    );

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "المقال غير موجود",
          article_id: id,
        },
        { status: 404 }
      );
    }

    // زيادة عدد المشاهدات بشكل غير متزامن (لا نُبطئ الاستجابة)
    if (!fromCache) {
      prisma.articles
        .updateMany({
          where: {
            OR: [{ id }, { slug: id }],
          },
          data: { views: { increment: 1 } },
        })
        .catch((error: any) => {
          console.warn("⚠️ خطأ في تحديث عدد المشاهدات:", error);
        });
    }

    console.log(`✅ تم جلب المقال في ${processingTime}ms`);

    // إنشاء الاستجابة مع headers محسنة
    const response = NextResponse.json({
      success: true,
      article,
      meta: {
        processingTime,
        cached: fromCache,
      },
    });

    // Cache headers
    if (fromCache) {
      response.headers.set("X-Cached", "HIT");
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
    } else {
      response.headers.set("X-Cached", "MISS");
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
    }

    // CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  } catch (error: any) {
    console.error("❌ خطأ في جلب تفاصيل المقال:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقال",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - إزالة مقال من cache
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `article:${id}`;

    await redis.del(cacheKey);

    return NextResponse.json({
      success: true,
      message: `تم مسح cache للمقال: ${id}`,
      article_id: id,
    });
  } catch (error: any) {
    console.error("❌ خطأ في مسح cache المقال:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل في مسح cache المقال",
      },
      { status: 500 }
    );
  }
}
