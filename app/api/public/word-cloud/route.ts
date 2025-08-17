import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API سحابة الكلمات التفاعلية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // معاملات التخصيص
    const period = parseInt(searchParams.get("period") || "30"); // الفترة بالأيام
    const limit = parseInt(searchParams.get("limit") || "50"); // عدد الكلمات
    const minUsage = parseInt(searchParams.get("minUsage") || "1"); // الحد الأدنى للاستخدام
    const category = searchParams.get("category"); // فلتر التصنيف
    const sortBy = searchParams.get("sortBy") || "popularity"; // popularity, usage, growth
    const shape = searchParams.get("shape") || "cloud"; // cloud, circle, rectangle
    const colorScheme = searchParams.get("colorScheme") || "blue"; // blue, green, red, rainbow

    console.log("🎨 جلب بيانات سحابة الكلمات...");

    // تحديد الفترة الزمنية
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // بناء شروط الاستعلام
    const whereConditions: any = {
      is_active: true,
      total_usage_count: {
        gte: minUsage
      }
    };

    if (category) {
      whereConditions.category = category;
    }

        // جلب الكلمات المفتاحية مع معالجة الأخطاء
    let tags: any[] = [];
    
    try {
      tags = await prisma.tags.findMany({
        where: whereClause,
        orderBy: { popularity_score: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          popularity_score: true,
          growth_rate: true,
          color: true,
          category: true,
          total_usage_count: true,
          views_count: true,
          clicks_count: true,
          last_used_at: true
        }
      });
    } catch (error: any) {
      console.error("❌ خطأ في جلب العلامات:", error.message);
      // إرجاع بيانات افتراضية إذا فشل الاستعلام
      tags = [];
    }

    console.log(`📊 تم جلب ${tags.length} علامة`);

    // معالجة البيانات لسحابة الكلمات
    const cloudData = tags.map(tag => {
      // حساب الحجم بناءً على الشعبية (بين 12 و 48 بكسل)
      const maxScore = Math.max(...tags.map(t => t.popularity_score));
      const minScore = Math.min(...tags.map(t => t.popularity_score));
      const normalizedScore = maxScore > minScore 
        ? (tag.popularity_score - minScore) / (maxScore - minScore)
        : 0.5;
      
      const fontSize = Math.max(12, Math.min(48, 12 + (normalizedScore * 36)));
      
      // تحديد اللون بناءً على النمو ونظام الألوان
      let color = "#3B82F6"; // افتراضي أزرق
      
      if (colorScheme === "rainbow") {
        // ألوان قوس قزح بناءً على الترتيب
        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
        color = colors[Math.floor((normalizedScore * colors.length)) % colors.length];
      } else if (colorScheme === "growth") {
        // ألوان بناءً على النمو
        if (tag.growth_rate > 50) color = "#22c55e"; // أخضر للنمو العالي
        else if (tag.growth_rate > 0) color = "#3b82f6"; // أزرق للنمو الإيجابي
        else if (tag.growth_rate > -25) color = "#f59e0b"; // برتقالي للتراجع البسيط
        else color = "#ef4444"; // أحمر للتراجع الكبير
      } else {
        // ألوان بناءً على النظام المحدد مع تدرج الكثافة
        const baseColors = {
          blue: "#3b82f6",
          green: "#22c55e", 
          red: "#ef4444",
          purple: "#8b5cf6"
        };
        const baseColor = baseColors[colorScheme as keyof typeof baseColors] || baseColors.blue;
        
        // تطبيق الكثافة بناءً على الشعبية
        const intensity = 0.4 + (normalizedScore * 0.6); // بين 0.4 و 1.0
        color = baseColor + Math.round(intensity * 255).toString(16).padStart(2, '0');
      }

      // حساب الوزن للتموضع
      const weight = Math.max(1, Math.round(normalizedScore * 10));

      return {
        id: tag.id,
        text: tag.name,
        size: Math.round(fontSize),
        weight: weight,
        color: color,
        url: `/tags/${tag.slug}`,
        
        // بيانات إضافية للـ tooltip
        stats: {
          usageCount: tag.total_usage_count,
          viewsCount: tag.views_count,
          growthRate: Math.round(tag.growth_rate * 100) / 100,
          popularityScore: Math.round(tag.popularity_score * 100) / 100,
          articlesCount: tag.article_tags.length,
          category: tag.category,
          lastUsed: tag.last_used_at
        }
      };
    });

    // إحصائيات عامة
    const stats = {
      totalTags: cloudData.length,
      maxPopularity: Math.max(...tags.map(t => t.popularity_score)),
      avgGrowthRate: tags.length > 0 
        ? Math.round((tags.reduce((sum, t) => sum + t.growth_rate, 0) / tags.length) * 100) / 100
        : 0,
      totalUsage: tags.reduce((sum, t) => sum + t.total_usage_count, 0),
      period: period,
      generatedAt: new Date().toISOString()
    };

    // إعدادات العرض
    const displayConfig = {
      shape: shape,
      colorScheme: colorScheme,
      sortBy: sortBy,
      responsive: true,
      enableTooltips: true,
      enableClick: true,
      animation: {
        duration: 1000,
        easing: "ease-out"
      },
      layout: {
        padding: 20,
        spiralType: "rectangular", // أو "archimedean"
        fontFamily: "Cairo, sans-serif",
        fontWeight: "bold"
      }
    };

    console.log("✅ تم إنشاء بيانات سحابة الكلمات بنجاح");

    return NextResponse.json({
      success: true,
      data: cloudData,
      stats: stats,
      config: displayConfig,
      metadata: {
        filters: {
          period,
          category,
          minUsage,
          limit
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("❌ خطأ في جلب بيانات سحابة الكلمات:", error);
    return NextResponse.json(
      { 
        error: "خطأ في جلب البيانات", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// تسجيل النقرات والتفاعلات
export async function POST(request: NextRequest) {
  try {
    const { tagId, action = "click" } = await request.json();

    if (!tagId) {
      return NextResponse.json({ error: "معرف العلامة مطلوب" }, { status: 400 });
    }

    // تحديث عداد النقرات
    await prisma.tags.update({
      where: { id: tagId },
      data: {
        clicks_count: {
          increment: 1
        },
        updated_at: new Date()
      }
    });

    // تحديث الإحصائيات اليومية
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.tag_analytics.upsert({
      where: {
        tag_id_date: {
          tag_id: tagId,
          date: today
        }
      },
      update: {
        clicks_count: {
          increment: 1
        },
        interactions: {
          increment: 1
        }
      },
      create: {
        tag_id: tagId,
        date: today,
        clicks_count: 1,
        interactions: 1,
        usage_count: 0,
        article_count: 0,
        views_count: 0,
        growth_factor: 0,
        popularity_score: 0
      }
    });

    console.log(`📈 تم تسجيل ${action} للعلامة ${tagId}`);

    return NextResponse.json({
      success: true,
      message: "تم تسجيل التفاعل بنجاح"
    });

  } catch (error: any) {
    console.error("❌ خطأ في تسجيل التفاعل:", error);
    return NextResponse.json(
      { 
        error: "خطأ في تسجيل التفاعل", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
