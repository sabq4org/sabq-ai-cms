import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// تسجيل نقرة على الإعلان وإعادة التوجيه
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // التحقق من وجود الإعلان
    const ad = await prisma.ads.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    // جمع معلومات الطلب
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "0.0.0.0";
    const referrer = request.headers.get("referer") || "";

    // تشفير IP للخصوصية
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // تحديد نوع الجهاز
    const deviceType = getDeviceType(userAgent);
    const browserType = getBrowserType(userAgent);

    // جلب session_id من الطلب إن وجد
    const body = await request.json().catch(() => ({}));
    const sessionId = body.session_id || null;

    // تسجيل النقرة
    await prisma.ad_analytics.create({
      data: {
        ad_id: id,
        event_type: "click",
        session_id: sessionId,
        ip_hash: ipHash,
        user_agent: userAgent,
        referrer,
        device_type: deviceType,
        browser_type: browserType,
      },
    });

    // تحديث عداد النقرات في جدول الإعلانات
    await prisma.ads.update({
      where: { id },
      data: {
        clicks_count: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      redirect_url: ad.target_url,
      message: "تم تسجيل النقرة",
    });
  } catch (error) {
    console.error("خطأ في تسجيل نقرة الإعلان:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// دوال مساعدة لتحديد نوع الجهاز والمتصفح
function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return "mobile";
  } else if (/Tablet/.test(userAgent)) {
    return "tablet";
  }
  return "desktop";
}

function getBrowserType(userAgent: string): string {
  if (/Chrome/.test(userAgent)) return "chrome";
  if (/Firefox/.test(userAgent)) return "firefox";
  if (/Safari/.test(userAgent)) return "safari";
  if (/Edge/.test(userAgent)) return "edge";
  return "other";
}
