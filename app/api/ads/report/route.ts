import { getUserFromCookie } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// تقرير شامل عن الإعلانات
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    // التحقق من أن المستخدم محرر أو أدمين
    const userRecord = await prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!userRecord || (!userRecord.is_admin && userRecord.role !== "editor")) {
      return NextResponse.json({ error: "غير مخول للوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // آخر 30 يوم افتراضياً
    const adId = searchParams.get("ad_id");

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // بناء فلتر للإعلانات
    let whereClause: any = {
      created_at: { gte: startDate },
    };

    if (adId) {
      whereClause.id = adId;
    }

    // جلب الإعلانات مع الإحصائيات
    const ads = await prisma.ads.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // حساب الإحصائيات التفصيلية لكل إعلان
    const reportData = await Promise.all(
      ads.map(async (ad) => {
        // إحصائيات عامة
        const [totalViews, totalClicks] = await Promise.all([
          prisma.ad_analytics.count({
            where: {
              ad_id: ad.id,
              event_type: "view",
              created_at: { gte: startDate },
            },
          }),
          prisma.ad_analytics.count({
            where: {
              ad_id: ad.id,
              event_type: "click",
              created_at: { gte: startDate },
            },
          }),
        ]);

        // إحصائيات يومية
        const dailyStats = await prisma.$queryRaw`
          SELECT
            DATE(created_at) as date,
            event_type,
            COUNT(*) as count
          FROM ad_analytics
          WHERE ad_id = ${ad.id}
            AND created_at >= ${startDate}
          GROUP BY DATE(created_at), event_type
          ORDER BY date DESC
        `;

        // إحصائيات حسب نوع الجهاز
        const deviceStats = await prisma.ad_analytics.groupBy({
          by: ["device_type"],
          where: {
            ad_id: ad.id,
            created_at: { gte: startDate },
          },
          _count: {
            device_type: true,
          },
        });

        // إحصائيات حسب المتصفح
        const browserStats = await prisma.ad_analytics.groupBy({
          by: ["browser_type"],
          where: {
            ad_id: ad.id,
            created_at: { gte: startDate },
          },
          _count: {
            browser_type: true,
          },
        });

        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        // حساب أداء الإعلان مقارنة بالمتوسط
        const averageCtr = await calculateAverageCtr(startDate);
        const performance =
          ctr > averageCtr
            ? "above_average"
            : ctr === averageCtr
            ? "average"
            : "below_average";

        return {
          ad: {
            id: ad.id,
            title: ad.title,
            placement: ad.placement,
            start_date: ad.start_date,
            end_date: ad.end_date,
            is_active: ad.is_active,
            creator: ad.creator,
          },
          stats: {
            total_views: totalViews,
            total_clicks: totalClicks,
            ctr: Number(ctr.toFixed(2)),
            performance,
            daily_stats: dailyStats,
            device_breakdown: deviceStats,
            browser_breakdown: browserStats,
          },
        };
      })
    );

    // إحصائيات عامة للتقرير
    const totalViews = reportData.reduce(
      (sum, item) => sum + item.stats.total_views,
      0
    );
    const totalClicks = reportData.reduce(
      (sum, item) => sum + item.stats.total_clicks,
      0
    );
    const overallCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          period_days: periodDays,
          total_ads: ads.length,
          total_views: totalViews,
          total_clicks: totalClicks,
          overall_ctr: Number(overallCtr.toFixed(2)),
          generated_at: new Date(),
        },
        ads: reportData,
      },
    });
  } catch (error) {
    console.error("خطأ في إنشاء تقرير الإعلانات:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// دالة مساعدة لحساب متوسط CTR
async function calculateAverageCtr(startDate: Date): Promise<number> {
  try {
    const stats = await prisma.$queryRaw<
      { event_type: string; count: bigint }[]
    >`
      SELECT
        event_type,
        COUNT(*) as count
      FROM ad_analytics
      WHERE created_at >= ${startDate}
      GROUP BY event_type
    `;

    const views =
      stats.find((s) => s.event_type === "view")?.count || BigInt(0);
    const clicks =
      stats.find((s) => s.event_type === "click")?.count || BigInt(0);

    if (views > 0) {
      return (Number(clicks) / Number(views)) * 100;
    }
    return 0;
  } catch (error) {
    console.error("خطأ في حساب متوسط CTR:", error);
    return 0;
  }
}
