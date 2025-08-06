import { executeQuery } from "@/lib/prisma-fixed";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");

    console.log("🏷️ [Categories API] بدء جلب التصنيفات...");

    // جلب التصنيفات باستخدام النظام الآمن
    const categories = await executeQuery(async (prisma) => {
      const whereCondition = isActive ? { is_active: true } : {};
      
      return await prisma.categories.findMany({
        where: whereCondition,
        orderBy: [
          { is_active: 'desc' },
          { name: 'asc' }
        ]
      });
    });

    console.log(`✅ [Categories API] تم جلب ${categories.length} تصنيف`);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("❌ [Categories API] خطأ في جلب التصنيفات:", error);
    return NextResponse.json(
      { 
        error: "فشل في جلب التصنيفات", 
        details: error instanceof Error ? error.message : "خطأ غير معروف" 
      },
      { status: 500 }
    );
  }
}
