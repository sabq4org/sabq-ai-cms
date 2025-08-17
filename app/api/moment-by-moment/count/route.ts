import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    // عدد المقالات الجديدة (خلال آخر ساعة) مع توافق لأنواع المحتوى وكتابة مختلفة
    const articlesCount = await prisma.articles.count({
      where: {
        status: 'published',
        OR: [
          { published_at: { gte: oneHourAgo } },
          { created_at: { gte: oneHourAgo } },
        ],
        OR: [
          // المعيار القياسي
          { content_type: 'NEWS' as any },
          // توافق مع الحقول/القيم القديمة (String)
          { article_type: { in: ['news','article','breaking','NEWS','ARTICLE','BREAKING'] } as any },
        ],
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
  } catch (error: any) {
    console.error("خطأ في جلب عدد الأحداث:", error);
    return NextResponse.json(
      {
        count: 0,
        error: "خطأ في جلب البيانات",
        details: process.env.NODE_ENV !== 'production' ? String(error?.message || error) : undefined,
      },
      { status: 500 }
    );
  }
}
