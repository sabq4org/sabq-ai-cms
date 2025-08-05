import { withCache, createCacheKey } from "@/lib/cache";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: جلب زاوية بالـ slug مُحسّن مع cache
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("🔍 البحث عن الزاوية بالـ slug:", slug);

    if (!slug) {
      return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
    }

    // إنشاء cache key
    const cacheKey = createCacheKey("angle:by-slug", { slug });
    const cacheManager = withCache(cacheKey, 15, true); // 15 دقيقة cache

    // التحقق من الـ cache
    const cachedData = cacheManager.get();
    if (cachedData) {
      console.log("⚡ [Cache HIT] Angle by slug:", slug);
      return NextResponse.json(cachedData, {
        headers: cacheManager.getCacheHeaders(),
      });
    }

    // استعلام محسّن باستخدام الفهارس الجديدة
    const result = await prisma.$queryRaw`
      SELECT
        a.id,
        a.title,
        a.slug,
        a.description,
        a.icon,
        a.theme_color,
        a.cover_image,
        a.is_featured,
        a.is_published,
        a.created_at,
        a.updated_at,
        a.author_id,
        u.name as author_name,
        u.email as author_email,
        u.avatar as author_image,
        COUNT(aa.id)::int as articles_count
      FROM angles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN angle_articles aa ON a.id = aa.angle_id AND aa.is_published = true
      WHERE a.slug = ${slug} AND a.is_published = true
      GROUP BY a.id, u.name, u.email, u.avatar
    `;

    if (!Array.isArray(result) || result.length === 0) {
      console.log("❌ لم يتم العثور على الزاوية");
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const angleRow = result[0] as any;

    // تحويل البيانات إلى الشكل المطلوب
    const angle = {
      id: angleRow.id,
      title: angleRow.title,
      slug: angleRow.slug,
      description: angleRow.description,
      icon: angleRow.icon,
      themeColor: angleRow.theme_color,
      coverImage: angleRow.cover_image,
      isFeatured: angleRow.is_featured,
      isPublished: angleRow.is_published,
      createdAt: angleRow.created_at,
      updatedAt: angleRow.updated_at,
      authorId: angleRow.author_id,
      articlesCount: angleRow.articles_count,
      author: angleRow.author_name
        ? {
            id: angleRow.author_id,
            name: angleRow.author_name,
            email: angleRow.author_email,
            image: angleRow.author_image,
          }
        : null,
    };

    const responseData = {
      success: true,
      angle,
      cached: false,
    };

    // حفظ في الـ cache
    cacheManager.set(responseData);

    console.log("✅ تم تحويل بيانات الزاوية:", angle.title);

    return NextResponse.json(responseData, {
      headers: cacheManager.getCacheHeaders(),
    });
  } catch (error) {
    console.error("❌ خطأ في جلب الزاوية بالـ slug:", error);

    return NextResponse.json(
      {
        error: "حدث خطأ في جلب بيانات الزاوية",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
