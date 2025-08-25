import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "معرف المراسل مطلوب",
        },
        { status: 400 }
      );
    }

    console.log(`📊 جلب إحصائيات المراسل: ${slug}`);

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
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
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

    // إحصائيات بسيطة من البيانات المحفوظة
    const stats = {
      totalArticles: reporter.total_articles || 0,
      totalViews: reporter.total_views || 0,
      totalLikes: reporter.total_likes || 0,
      totalShares: reporter.total_shares || 0,
      avgViewsPerArticle:
        reporter.total_articles > 0
          ? Math.round((reporter.total_views || 0) / reporter.total_articles)
          : 0,
      engagementRate:
        reporter.total_views > 0
          ? Math.round(
              (((reporter.total_likes || 0) + (reporter.total_shares || 0)) /
                (reporter.total_views || 1)) *
                100 *
                100
            ) / 100
          : 0,
      // إحصائيات شهرية (تقديرية)
      monthlyArticles:
        Math.round(((reporter.total_articles || 0) / 12) * 100) / 100,
      popularityScore: Math.min(
        100,
        Math.round(
          (reporter.total_views || 0) / 1000 +
            (reporter.total_likes || 0) / 100 +
            (reporter.total_shares || 0) / 50
        )
      ),
    };

    console.log(`✅ إحصائيات ${reporter.full_name}:`, stats);

    return NextResponse.json({
      success: true,
      stats: stats,
    });
  } catch (error: any) {
    console.error("خطأ في جلب إحصائيات المراسل:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الإحصائيات",
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
