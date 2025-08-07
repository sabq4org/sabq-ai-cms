import { getUserFromCookie } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// جلب إعلان محدد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    const ad = await prisma.ads.findUnique({
      where: { id: params.id },
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
    });

    if (!ad) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    // حساب الإحصائيات
    const [viewsCount, clicksCount] = await Promise.all([
      prisma.ad_analytics.count({
        where: { ad_id: ad.id, event_type: "view" },
      }),
      prisma.ad_analytics.count({
        where: { ad_id: ad.id, event_type: "click" },
      }),
    ]);

    const ctr = viewsCount > 0 ? (clicksCount / viewsCount) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...ad,
        stats: {
          views: viewsCount,
          clicks: clicksCount,
          ctr: Number(ctr.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإعلان:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// تعديل إعلان
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const {
      title,
      image_url,
      target_url,
      placement,
      start_date,
      end_date,
      is_active,
    } = body;

    // التحقق من وجود الإعلان
    const existingAd = await prisma.ads.findUnique({
      where: { id: params.id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    // التحقق من صحة التواريخ إذا تم تمريرها
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" },
          { status: 400 }
        );
      }
    }

    const updatedAd = await prisma.ads.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(image_url && { image_url }),
        ...(target_url && { target_url }),
        ...(placement && { placement }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAd,
      message: "تم تحديث الإعلان بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث الإعلان:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// حذف إعلان
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    // التحقق من أن المستخدم أدمين
    const userRecord = await prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!userRecord || !userRecord.is_admin) {
      return NextResponse.json(
        { error: "غير مخول للوصول - مطلوب صلاحيات أدمين" },
        { status: 403 }
      );
    }

    // التحقق من وجود الإعلان
    const existingAd = await prisma.ads.findUnique({
      where: { id: params.id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    // حذف الإعلان (سيتم حذف الإحصائيات تلقائياً بسبب CASCADE)
    await prisma.ads.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الإعلان بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الإعلان:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
