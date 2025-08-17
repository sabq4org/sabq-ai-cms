import { getUserFromCookie } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

// جلب إعدادات الإعلانات
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    // إعدادات افتراضية للإعلانات
    const settings = {
      max_ads_per_page: 3,
      ad_rotation_enabled: true,
      auto_approval: false,
      default_duration_days: 30,
      allowed_file_types: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
      max_file_size_mb: 5,
      placement_options: [
        { value: "below_featured", label: "أسفل المقال المميز" },
        { value: "below_custom_block", label: "أسفل البلوك المخصص" },
        { value: "article_detail_header", label: "رأس صفحة المقال" },
        { value: "sidebar_top", label: "أعلى الشريط الجانبي" },
        { value: "sidebar_bottom", label: "أسفل الشريط الجانبي" },
        { value: "footer_banner", label: "بانر أسفل الصفحة" },
      ],
    };

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("خطأ في جلب إعدادات الإعلانات:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

// تحديث إعدادات الإعلانات
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "المصادقة مطلوبة" }, { status: 401 });
    }

    const body = await request.json();

    // هنا يمكن حفظ الإعدادات في قاعدة البيانات
    // حالياً سنعيد رسالة نجاح فقط

    return NextResponse.json({
      success: true,
      message: "تم تحديث الإعدادات بنجاح",
      data: body,
    });
  } catch (error) {
    console.error("خطأ في تحديث إعدادات الإعلانات:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
