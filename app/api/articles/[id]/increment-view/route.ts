import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "معرف المقال مطلوب" }, { status: 400 });
    }

    // زيادة عدد المشاهدات
    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({
      success: true,
      views: updatedArticle.views,
    });
  } catch (error) {
    console.error("خطأ في زيادة عدد المشاهدات:", error);
    return NextResponse.json(
      { error: "فشل في زيادة عدد المشاهدات" },
      { status: 500 }
    );
  }
}
