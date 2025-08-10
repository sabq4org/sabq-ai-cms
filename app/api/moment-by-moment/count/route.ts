import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache للأداء
let cache: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 ثانية

export async function GET(request: NextRequest) {
  try {
    // التحقق من الكاش
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        count: cache.count,
        cached: true,
      });
    }

    // حساب الأحداث الجديدة خلال آخر ساعة
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [newsCount, articlesCount] = await Promise.all([
      // عدد الأخبار الجديدة
      prisma.news.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
          published: true,
        },
      }),

      // عدد المقالات الجديدة
      prisma.article.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
          published: true,
        },
      }),
    ]);

    const totalCount = newsCount + articlesCount;

    // تحديث الكاش
    cache = {
      count: totalCount,
      timestamp: now,
    };

    return NextResponse.json({
      count: totalCount,
      breakdown: {
        news: newsCount,
        articles: articlesCount,
      },
      cached: false,
    });
  } catch (error) {
    console.error("خطأ في جلب عدد الأحداث:", error);
    return NextResponse.json(
      {
        count: 0,
        error: "خطأ في جلب البيانات",
      },
      { status: 500 }
    );
  }
}
