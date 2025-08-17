import { getSupportedEmergencyArticleIds } from "@/app/emergency-articles";
import { getEmergencySystemStatus } from "@/app/emergency-route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // الحصول على حالة نظام الطوارئ
    const systemStatus = getEmergencySystemStatus();

    // الحصول على قائمة المعرفات المدعومة
    const supportedIds = getSupportedEmergencyArticleIds();

    return NextResponse.json({
      success: true,
      systemStatus,
      supportedArticleIds: supportedIds,
      totalSupportedArticles: supportedIds.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("خطأ في مسار حالة الطوارئ:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء التحقق من حالة نظام الطوارئ",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
