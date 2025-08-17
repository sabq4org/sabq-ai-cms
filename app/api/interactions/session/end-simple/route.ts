import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// API مبسط لإنهاء الجلسات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, articleId, duration, scrollDepth } = body;

    console.log(`📖 إنهاء جلسة قراءة مبسطة: ${sessionId}`);
    console.log(`⏱️ المدة: ${duration}ms، عمق التمرير: ${scrollDepth}%`);

    // إرجاع نجاح مبسط
    return NextResponse.json({
      success: true,
      message: "Simple reading session ended",
      stats: {
        duration: Math.floor((duration || 0) / 1000),
        scrollDepth: scrollDepth || 0,
      },
      simplified: true,
    });
  } catch (error) {
    console.error("Error in simple session end:", error);
    return NextResponse.json({
      success: true,
      message: "Session ended with fallback",
    });
  }
}
