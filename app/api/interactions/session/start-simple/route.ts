import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// API مبسط للجلسات - لتجنب الأخطاء
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, sessionId, deviceType } = body;

    if (!articleId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`📖 بدء جلسة قراءة مبسطة: ${sessionId} للمقال: ${articleId}`);

    // إرجاع نجاح مبسط بدون قاعدة البيانات
    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: "Simple reading session started",
      simplified: true,
    });
  } catch (error) {
    console.error("Error in simple session start:", error);
    return NextResponse.json({
      success: true,
      sessionId: "fallback",
      message: "Fallback session created",
    });
  }
}
