import { shouldDisplayAd } from "@/lib/ad-utils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// جلب الإعلانات الفعالة لموضع معين (للعرض العام)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");

    if (!placement) {
      return NextResponse.json(
        { error: "موضع الإعلان مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من صحة الموضع
    const validPlacements = [
      "below_featured",
      "below_custom_block",
      "article_detail_header",
      "sidebar_top",
      "sidebar_bottom",
      "footer_banner",
    ];

    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: "موضع الإعلان غير صحيح" },
        { status: 400 }
      );
    }

    // جلب جميع الإعلانات النشطة لهذا الموضع
    const ads = await prisma.ads.findMany({
      where: {
        placement: placement as any,
        is_active: true,
      },
      orderBy: { created_at: "desc" },
    });

    // تطبيق المنطق الجديد لفلترة الإعلانات
    const validAds = ads.filter((ad) =>
      shouldDisplayAd({
        is_always_on: ad.is_always_on,
        start_date: ad.start_date,
        end_date: ad.end_date,
        max_views: ad.max_views,
        views_count: ad.views_count,
        is_active: ad.is_active,
      })
    );

    if (validAds.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "لا توجد إعلانات فعالة لهذا الموضع",
      });
    }

    // أخذ أول إعلان صالح
    const ad = validAds[0];

    return NextResponse.json({
      success: true,
      data: {
        id: ad.id,
        title: ad.title,
        image_url: ad.image_url,
        target_url: ad.target_url,
        placement: ad.placement,
        is_always_on: ad.is_always_on,
        max_views: ad.max_views,
        views_count: ad.views_count,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإعلانات للموضع:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
