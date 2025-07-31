import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // جلب الإحصائيات العامة
    const [
      cornersStats,
      articlesStats,
      interactionsStats,
      viewsStats
    ] = await Promise.all([
      // إحصائيات الزوايا
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_corners,
          COUNT(*) FILTER (WHERE is_active = true) as active_corners,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_corners
        FROM muqtarab_corners;
      `,
      
      // إحصائيات المقالات
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_articles,
          COUNT(*) FILTER (WHERE status = 'published') as published_articles,
          COUNT(*) FILTER (WHERE status = 'draft') as draft_articles,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_articles,
          AVG(read_time) as avg_read_time,
          SUM(view_count) as total_article_views
        FROM muqtarab_articles;
      `,
      
      // إحصائيات التفاعلات
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(*) FILTER (WHERE interaction_type = 'like') as total_likes,
          COUNT(*) FILTER (WHERE interaction_type = 'share') as total_shares,
          COUNT(*) FILTER (WHERE interaction_type = 'save') as total_saves,
          COUNT(DISTINCT user_id) as unique_users
        FROM muqtarab_interactions;
      `,
      
      // إحصائيات المشاهدات والتحليلات
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_views,
          AVG(view_duration) as avg_view_duration,
          AVG(scroll_depth) as avg_scroll_depth,
          AVG(completion_rate) as avg_completion_rate,
          COUNT(DISTINCT user_id) as unique_viewers
        FROM muqtarab_analytics;
      `
    ]);

    // استخراج البيانات
    const corners = (cornersStats as any[])[0];
    const articles = (articlesStats as any[])[0];
    const interactions = (interactionsStats as any[])[0];
    const views = (viewsStats as any[])[0];

    const stats = {
      // الزوايا
      total_corners: Number(corners.total_corners) || 0,
      active_corners: Number(corners.active_corners) || 0,
      featured_corners: Number(corners.featured_corners) || 0,
      
      // المقالات
      total_articles: Number(articles.total_articles) || 0,
      published_articles: Number(articles.published_articles) || 0,
      draft_articles: Number(articles.draft_articles) || 0,
      featured_articles: Number(articles.featured_articles) || 0,
      avg_read_time: Math.round(Number(articles.avg_read_time) || 0),
      total_article_views: Number(articles.total_article_views) || 0,
      
      // التفاعلات
      total_interactions: Number(interactions.total_interactions) || 0,
      total_likes: Number(interactions.total_likes) || 0,
      total_shares: Number(interactions.total_shares) || 0,
      total_saves: Number(interactions.total_saves) || 0,
      unique_interacting_users: Number(interactions.unique_users) || 0,
      
      // المشاهدات والتحليلات
      total_views: Number(views.total_views) || 0,
      avg_view_duration: Math.round(Number(views.avg_view_duration) || 0),
      avg_scroll_depth: Math.round((Number(views.avg_scroll_depth) || 0) * 100) / 100,
      avg_completion_rate: Math.round((Number(views.avg_completion_rate) || 0) * 100) / 100,
      unique_viewers: Number(views.unique_viewers) || 0
    };

    // إحصائيات إضافية لآخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM muqtarab_articles WHERE created_at >= ${thirtyDaysAgo}) as new_articles_30d,
        (SELECT COUNT(*) FROM muqtarab_interactions WHERE created_at >= ${thirtyDaysAgo}) as new_interactions_30d,
        (SELECT COUNT(*) FROM muqtarab_analytics WHERE created_at >= ${thirtyDaysAgo}) as new_views_30d
    `;

    const recent = (recentStats as any[])[0];
    stats.new_articles_30d = Number(recent.new_articles_30d) || 0;
    stats.new_interactions_30d = Number(recent.new_interactions_30d) || 0;
    stats.new_views_30d = Number(recent.new_views_30d) || 0;

    // إحصائيات التوزيع حسب النوع
    const sentimentDistribution = await prisma.$queryRaw`
      SELECT 
        ai_sentiment,
        COUNT(*) as count
      FROM muqtarab_articles 
      WHERE ai_sentiment IS NOT NULL
      GROUP BY ai_sentiment
      ORDER BY count DESC;
    `;

    stats.sentiment_distribution = sentimentDistribution;

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}