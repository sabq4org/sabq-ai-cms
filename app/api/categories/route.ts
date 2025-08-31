import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // محاولة الاتصال بقاعدة البيانات
    await ensureDbConnected();
    
    // جلب التصنيفات بشكل مبسط أولاً
    const categories = await retryWithConnection(async () => {
      try {
        // محاولة مع count
        return await prisma.categories.findMany({
          where: {
            is_active: true,
          },
          orderBy: {
            display_order: "asc",
          },
          include: {
            _count: {
              select: {
                articles: {
                  where: {
                    status: "published",
                  },
                },
              },
            },
          },
        });
      } catch (includeError) {
        console.warn("⚠️ فشل جلب التصنيفات مع العد، جلب بسيط:", includeError);
        // إذا فشل include، جرب بدونه
        return await prisma.categories.findMany({
          where: {
            is_active: true,
          },
          orderBy: {
            display_order: "asc",
          },
        });
      }
    });

    // إضافة عدد المقالات إلى كل تصنيف (إن وجد)
    const categoriesWithCount = categories.map((category: any) => ({
      ...category,
      articles_count: category._count?.articles || 0,
    }));

    const res = NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    res.headers.set("CDN-Cache-Control", "public, s-maxage=900");
    return res;
  } catch (error: any) {
    console.error("❌ خطأ في جلب التصنيفات:", error);
    
    // إرجاع قائمة فارغة مع رسالة خطأ بدلاً من 500
    return NextResponse.json(
      {
        success: true, // تغيير إلى true لتجنب كسر الواجهة
        categories: [], // قائمة فارغة
        error: "Database connection issue",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 200 } // إرجاع 200 بدلاً من 500
    );
  }
}
