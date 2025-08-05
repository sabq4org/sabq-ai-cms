import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: جلب إحصائيات عامة لمقترب
export async function GET(request: NextRequest) {
  try {
    console.log("📊 [Muqtarab Stats] جاري جلب الإحصائيات العامة...");

    // جلب إحصائيات شاملة
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT a.id) as total_angles,
        COUNT(CASE WHEN a.is_published = true THEN 1 END) as published_angles,
        COUNT(CASE WHEN a.is_featured = true THEN 1 END) as featured_angles,
        COUNT(DISTINCT aa.id) as total_articles,
        COUNT(CASE WHEN aa.is_published = true THEN 1 END) as published_articles,
        SUM(CASE WHEN aa.is_published = true THEN aa.views ELSE 0 END) as total_views,
        AVG(CASE WHEN aa.is_published = true THEN aa.reading_time ELSE NULL END) as avg_reading_time,
        COUNT(DISTINCT aa.author_id) as unique_authors
      FROM angles a
      LEFT JOIN angle_articles aa ON a.id = aa.angle_id
    `;

    console.log("📋 [Muqtarab Stats] تشغيل الاستعلام:", statsQuery);

    const statsResult = (await prisma.$queryRawUnsafe(statsQuery)) as any[];
    
    if (!statsResult || statsResult.length === 0) {
      console.log("❌ [Muqtarab Stats] لا توجد إحصائيات");
      return NextResponse.json(
        { success: false, error: "لا توجد إحصائيات متاحة" },
        { status: 404 }
      );
    }

    const stats = statsResult[0];

    // جلب أحدث المقالات للتحقق من النشاط
    const recentArticlesQuery = `
      SELECT 
        COUNT(*) as recent_articles_count
      FROM angle_articles aa
      WHERE aa.is_published = true 
        AND aa.created_at >= NOW() - INTERVAL '7 days'
    `;

    const recentResult = (await prisma.$queryRawUnsafe(recentArticlesQuery)) as any[];

    // تنسيق البيانات
    const formattedStats = {
      totalAngles: Number(stats.total_angles) || 0,
      publishedAngles: Number(stats.published_angles) || 0,
      featuredAngles: Number(stats.featured_angles) || 0,
      totalArticles: Number(stats.total_articles) || 0,
      publishedArticles: Number(stats.published_articles) || 0,
      totalViews: Number(stats.total_views) || 0,
      averageReadingTime: Number(stats.avg_reading_time) || 0,
      uniqueAuthors: Number(stats.unique_authors) || 0,
      recentArticles: Number(recentResult[0]?.recent_articles_count) || 0,
      
      // إحصائيات مفيدة
      averageViewsPerArticle: stats.published_articles > 0 
        ? Math.round(Number(stats.total_views) / Number(stats.published_articles)) 
        : 0,
      averageArticlesPerAngle: stats.published_angles > 0 
        ? Math.round(Number(stats.published_articles) / Number(stats.published_angles)) 
        : 0,

      // معلومات إضافية للعرض
      displayViews: {
        raw: Number(stats.total_views) || 0,
        formatted: Number(stats.total_views) >= 1000 
          ? `${(Number(stats.total_views) / 1000).toFixed(1)}K`
          : String(Number(stats.total_views) || 0)
      }
    };

    console.log("✅ [Muqtarab Stats] الإحصائيات:", {
      زوايا: formattedStats.publishedAngles,
      مقالات: formattedStats.publishedArticles,
      مشاهدات: formattedStats.totalViews,
      مؤلفون: formattedStats.uniqueAuthors
    });

    return NextResponse.json({
      success: true,
      stats: formattedStats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ [Muqtarab Stats] خطأ في جلب الإحصائيات:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في جلب الإحصائيات",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}