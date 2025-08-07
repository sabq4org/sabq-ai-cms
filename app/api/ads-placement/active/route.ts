import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// جلب الإعلانات الفعالة لموضع معين (للعرض العام)
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
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

    // جلب الإعلانات الفعالة لهذا الموضع
    const ads = await prisma.ads.findMany({
      where: {
        placement: placement as any,
        is_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      orderBy: { created_at: "desc" },
      take: 1, // إعلان واحد فقط لكل موضع
    });

    if (ads.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "لا توجد إعلانات فعالة لهذا الموضع",
      });
    }

    const ad = ads[0];

    return NextResponse.json({
      success: true,
      data: {
        id: ad.id,
        title: ad.title,
        image_url: ad.image_url,
        target_url: ad.target_url,
        placement: ad.placement,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإعلانات للموضع:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
