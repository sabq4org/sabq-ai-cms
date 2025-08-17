import { NextResponse } from "next/server";
import { getEmergencyArticle } from "../emergency-articles";

// مسار API طوارئ خاص للتعامل مع مشكلة Prisma Engine not connected
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🚨 EMERGENCY API ROUTE - جلب المقال: ${id}`);

    // الحصول على مقال طارئ من الوظيفة المساعدة
    const emergencyArticle = getEmergencyArticle(id);

    if (emergencyArticle) {
      console.log("✅ EMERGENCY API ROUTE - تم إرجاع بيانات طارئة للمقال");
      return NextResponse.json({
        success: true,
        ...emergencyArticle,
      });
    } else {
      // إذا لم يكن المقال موجودًا في قائمة المقالات الطارئة
      console.log(
        "⚠️ EMERGENCY API ROUTE - المقال غير موجود في البيانات الطارئة:",
        id
      );
      return NextResponse.json(
        {
          success: false,
          error: "المقال غير موجود في البيانات الطارئة",
          code: "EMERGENCY_ARTICLE_NOT_FOUND",
          details: "لا توجد بيانات طارئة للمقال المطلوب",
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("❌ EMERGENCY API ROUTE - خطأ:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطأ في مسار API الطارئ",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
