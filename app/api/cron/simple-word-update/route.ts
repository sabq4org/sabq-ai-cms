import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient();

// نسخة مبسطة من المهمة المجدولة لاختبار النظام
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // التحقق من الصلاحية
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    console.log("🔧 بدء المهمة المبسطة لحساب شعبية الكلمات...");

    let processedTags = 0;
    let errors = 0;

    try {
      // جلب العلامات النشطة
      const tags = await prisma.tags.findMany({
        where: { is_active: true },
        take: 50 // حد أقصى للاختبار
      });

      console.log(`📊 وجدت ${tags.length} علامة نشطة`);

      // تحديث كل علامة بقيم عشوائية للاختبار
      for (const tag of tags) {
        try {
          const randomPopularity = Math.random() * 100;
          const randomGrowth = (Math.random() - 0.5) * 50; // -25 إلى +25
          const randomUsage = Math.floor(Math.random() * 100) + 1;
          const randomViews = Math.floor(Math.random() * 10000) + 500;

          await prisma.tags.update({
            where: { id: tag.id },
            data: {
              popularity_score: Math.round(randomPopularity * 100) / 100,
              growth_rate: Math.round(randomGrowth * 100) / 100,
              total_usage_count: randomUsage,
              views_count: randomViews,
              last_used_at: new Date(),
              updated_at: new Date()
            }
          });

          processedTags++;
          console.log(`✅ تم تحديث العلامة: ${tag.name} (${randomPopularity.toFixed(1)})`);

        } catch (tagError: any) {
          console.error(`❌ خطأ في تحديث ${tag.name}:`, tagError.message);
          errors++;
        }
      }

      console.log(`✅ تمت المهمة المبسطة. معالج: ${processedTags}, أخطاء: ${errors}`);

      return NextResponse.json({
        success: true,
        message: `تم تحديث ${processedTags} علامة بنجاح`,
        data: {
          processedTags,
          errors,
          timestamp: new Date().toISOString()
        }
      });

    } catch (dbError: any) {
      console.error("❌ خطأ في قاعدة البيانات:", dbError.message);
      
      return NextResponse.json({
        error: "خطأ في قاعدة البيانات",
        details: dbError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ خطأ عام في المهمة:", error.message);
    
    return NextResponse.json({
      error: "خطأ في تنفيذ المهمة المبسطة",
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// نفس المنطق للـ POST
export async function POST(request: NextRequest) {
  return await GET(request);
}
