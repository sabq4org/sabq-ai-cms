import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// كاش في الذاكرة للزوايا
let cornersCache: any = null;
let cornersCacheTimestamp = 0;
const CACHE_DURATION = 120000; // دقيقتين للزوايا (تتغير أقل)

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [Super Fast Corners] بدء جلب الزوايا...");

    // تحقق من الكاش
    const now = Date.now();
    if (cornersCache && now - cornersCacheTimestamp < CACHE_DURATION) {
      console.log("⚡ [Corners Cache] إرجاع الزوايا من الكاش");
      const res = NextResponse.json(cornersCache);
      res.headers.set("X-Cache", "HIT");
      return res;
    }

    const startTime = Date.now();

    // استعلام محسن جداً للزوايا
    const corners = await prisma.muqtarabCorner.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        cover_image: true,
        theme_color: true,
        is_featured: true,
        author_name: true,
        author_bio: true,
        created_at: true,
        // عد مبسط للمقالات
        _count: {
          select: {
            articles: {
              where: { status: "published" },
            },
          },
        },
      },
      orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
      take: 50, // حد أقصى معقول
    });

    const queryTime = Date.now() - startTime;
    console.log(`⚡ استعلام الزوايا: ${queryTime}ms`);

    // تحويل سريع للبيانات
    const formattedCorners = corners.map((corner) => ({
      id: corner.id,
      title: corner.name,
      slug: corner.slug,
      description: corner.description,
      coverImage: corner.cover_image,
      themeColor: corner.theme_color || "#3B82F6",
      isFeatured: corner.is_featured || false,
      articlesCount: corner._count.articles,
      createdAt: corner.created_at,
      author: {
        name: corner.author_name || "مؤلف",
        bio: corner.author_bio,
      },
      link: `/muqtarab/corners/${corner.slug}`,
    }));

    const responseData = {
      success: true,
      corners: formattedCorners,
      stats: {
        totalCorners: formattedCorners.length,
        featuredCorners: formattedCorners.filter((c) => c.isFeatured).length,
        totalArticles: formattedCorners.reduce(
          (sum, c) => sum + c.articlesCount,
          0
        ),
        responseTime: Date.now() - now,
        queryTime,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // حفظ في الكاش
    cornersCache = responseData;
    cornersCacheTimestamp = now;

    console.log(
      `✅ [Super Fast Corners] تم جلب ${formattedCorners.length} زاوية في ${
        Date.now() - now
      }ms`
    );

    const res = NextResponse.json(responseData);

    // تحسين headers للكاش
    res.headers.set(
      "Cache-Control",
      "public, max-age=120, stale-while-revalidate=300"
    );
    res.headers.set("CDN-Cache-Control", "public, s-maxage=600"); // 10 دقائق
    res.headers.set("X-Cache", "MISS");
    res.headers.set("X-Response-Time", `${Date.now() - now}ms`);

    return res;
  } catch (error: any) {
    console.error("❌ [Super Fast Corners] خطأ:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الزوايا",
        corners: [],
        stats: {
          totalCorners: 0,
          featuredCorners: 0,
          totalArticles: 0,
          responseTime: 0,
          queryTime: 0,
        },
      },
      { status: 500 }
    );
  }
}
