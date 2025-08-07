import { getUserFromCookie } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// نظام التحقق من صحة البيانات
const createAdSchema = z.object({
  title: z.string().max(255).optional(),
  image_url: z.string().url(),
  target_url: z.string().url(),
  placement: z.enum([
    "below_featured",
    "below_custom_block",
    "article_detail_header",
    "sidebar_top",
    "sidebar_bottom",
    "footer_banner",
  ]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

// إنشاء إعلان جديد
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validationResult = createAdSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "بيانات غير صحيحة",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { title, image_url, target_url, placement, start_date, end_date } =
      validationResult.data;

    // التحقق من صحة التواريخ
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" },
        { status: 400 }
      );
    }

    const ad = await prisma.ads.create({
      data: {
        title,
        image_url,
        target_url,
        placement,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: ad,
      message: "تم إنشاء الإعلان بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء الإعلان:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// جلب جميع الإعلانات (للإدارة)
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const placement = searchParams.get("placement");
    const status = searchParams.get("status"); // active, expired, upcoming

    const skip = (page - 1) * limit;
    const now = new Date();

    // بناء فلاتر الاستعلام
    let whereClause: any = {};

    if (placement) {
      whereClause.placement = placement;
    }

    if (status) {
      switch (status) {
        case "active":
          whereClause.start_date = { lte: now };
          whereClause.end_date = { gte: now };
          whereClause.is_active = true;
          break;
        case "expired":
          whereClause.end_date = { lt: now };
          break;
        case "upcoming":
          whereClause.start_date = { gt: now };
          break;
      }
    }

    const [ads, total] = await Promise.all([
      prisma.ads.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              analytics: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.ads.count({ where: whereClause }),
    ]);

    // حساب الإحصائيات لكل إعلان
    const adsWithStats = await Promise.all(
      ads.map(async (ad: any) => {
        const [viewsCount, clicksCount] = await Promise.all([
          prisma.ad_analytics.count({
            where: { ad_id: ad.id, event_type: "view" },
          }),
          prisma.ad_analytics.count({
            where: { ad_id: ad.id, event_type: "click" },
          }),
        ]);

        const ctr = viewsCount > 0 ? (clicksCount / viewsCount) * 100 : 0;

        return {
          ...ad,
          stats: {
            views: viewsCount,
            clicks: clicksCount,
            ctr: Number(ctr.toFixed(2)),
          },
          status: getAdStatus(ad.start_date, ad.end_date, ad.is_active),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: adsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإعلانات:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// دالة مساعدة لتحديد حالة الإعلان
function getAdStatus(
  startDate: Date,
  endDate: Date,
  isActive: boolean
): string {
  const now = new Date();

  if (!isActive) return "disabled";
  if (now < startDate) return "upcoming";
  if (now > endDate) return "expired";
  return "active";
}
