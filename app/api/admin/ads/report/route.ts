import { getUserFromCookie } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// جلب تقارير الإعلانات
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // week, month, year
    const adId = searchParams.get("ad_id");

    // حساب التاريخ بناءً على الفترة
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    try {
      // إحصائيات الإعلانات
      const totalAds = await prisma.ads.count();
      const activeAds = await prisma.ads.count({
        where: {
          is_active: true,
          start_date: { lte: now },
          end_date: { gte: now },
        },
      });

      // إحصائيات النقرات والمشاهدات (إذا كان هناك جدول للإحصائيات)
      const report = {
        period,
        total_ads: totalAds,
        active_ads: activeAds,
        inactive_ads: totalAds - activeAds,
        stats: {
          total_views: 0,
          total_clicks: 0,
          click_through_rate: 0,
          revenue: 0,
        },
        top_performing_ads: [],
        placement_performance: {
          below_featured: { views: 0, clicks: 0 },
          article_detail_header: { views: 0, clicks: 0 },
          sidebar_top: { views: 0, clicks: 0 },
          sidebar_bottom: { views: 0, clicks: 0 },
          footer_banner: { views: 0, clicks: 0 },
        },
      };

      return NextResponse.json({
        success: true,
        data: report,
      });
    } catch (dbError) {
      console.error("خطأ في قاعدة البيانات:", dbError);

      // إرجاع بيانات افتراضية في حالة خطأ قاعدة البيانات
      const fallbackReport = {
        period,
        total_ads: 0,
        active_ads: 0,
        inactive_ads: 0,
        stats: {
          total_views: 0,
          total_clicks: 0,
          click_through_rate: 0,
          revenue: 0,
        },
        top_performing_ads: [],
        placement_performance: {},
      };

      return NextResponse.json({
        success: true,
        data: fallbackReport,
        note: "تم استخدام بيانات افتراضية بسبب مشكلة في قاعدة البيانات",
      });
    }
  } catch (error) {
    console.error("خطأ في جلب تقارير الإعلانات:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
