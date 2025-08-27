import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: "معرف المقال مطلوب" },
        { status: 400 }
      );
    }

    // عد التعليقات المنشورة فقط
    const count = await prisma.comments.count({
      where: {
        article_id: articleId,
        status: 'approved'
      }
    });

    return NextResponse.json({ 
      success: true, 
      count 
    });
  } catch (error) {
    console.error("Error counting comments:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في جلب عدد التعليقات" },
      { status: 500 }
    );
  }
}
