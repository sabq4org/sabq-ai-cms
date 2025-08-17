import { getUserFromCookie } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

// اختبار المصادقة
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        {
          error: "غير مصرح",
          cookies: request.cookies.getAll(),
          message: "لم يتم العثور على المستخدم في الكوكيز",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: "المصادقة نجحت",
      cookies: request.cookies.getAll(),
    });
  } catch (error) {
    console.error("خطأ في اختبار المصادقة:", error);
    return NextResponse.json(
      {
        error: "خطأ داخلي",
        details: error,
      },
      { status: 500 }
    );
  }
}
