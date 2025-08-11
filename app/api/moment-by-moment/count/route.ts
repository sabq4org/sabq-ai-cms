import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // عدد المقالات الجديدة (الأخبار والمقالات في نفس الجدول)
    const articlesCount = await prisma.articles.count({
      where: {
        created_at: {
          gte: oneHourAgo,
        },
        status: 'published',
        article_type: {
          in: ['news', 'article', 'breaking']
        }
      },
    });

    // تحديث الكاش
    cache = {
      count: articlesCount,
      timestamp: now,
    };

    return NextResponse.json({
      count: articlesCount,
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
