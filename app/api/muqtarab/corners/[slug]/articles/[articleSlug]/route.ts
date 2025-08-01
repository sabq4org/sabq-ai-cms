import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب مقال محدد من زاوية محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; articleSlug: string } }
) {
  try {
    const { slug, articleSlug } = params;
    
    // جلب المقال مع بيانات الزاوية
    const articleData = await prisma.$queryRaw`
      SELECT 
        ma.*,
        mc.name as corner_name,
        mc.slug as corner_slug,
        mc.author_name as corner_author_name,
        (SELECT COUNT(*) FROM muqtarab_followers mf WHERE mf.corner_id = mc.id) as corner_followers_count,
        (SELECT COUNT(*) FROM muqtarab_article_likes mal WHERE mal.article_id = ma.id) as likes,
        (SELECT COUNT(*) FROM muqtarab_article_views mav WHERE mav.article_id = ma.id) as views,
        (SELECT COUNT(*) FROM muqtarab_article_shares mas WHERE mas.article_id = ma.id) as shares
      FROM muqtarab_articles ma
      INNER JOIN muqtarab_corners mc ON ma.corner_id = mc.id
      WHERE mc.slug = ${slug} 
        AND ma.slug = ${articleSlug} 
        AND ma.status = 'published'
        AND mc.is_active = true
      LIMIT 1;
    `;
    
    if (!(articleData as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404 }
      );
    }
    
    const article = (articleData as any[])[0];
    
    // تنسيق البيانات
    const formattedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      cover_image: article.cover_image,
      author_name: article.author_name,
      published_at: article.published_at,
      read_time: article.read_time,
      views: Number(article.views) || 0,
      likes: Number(article.likes) || 0,
      shares: Number(article.shares) || 0,
      ai_summary: article.ai_summary,
      ai_compatibility_score: article.ai_compatibility_score,
      ai_sentiment: article.ai_sentiment,
      ai_keywords: article.ai_keywords || [],
      tags: article.tags || [],
      corner: {
        id: article.corner_id,
        name: article.corner_name,
        slug: article.corner_slug,
        author_name: article.corner_author_name,
        followers_count: Number(article.corner_followers_count) || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      article: formattedArticle
    });
    
  } catch (error) {
    console.error('خطأ في جلب المقال:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب المقال' },
      { status: 500 }
    );
  }
}