import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // جلب آخر 10 مقالات منشورة
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        seo_keywords: true,
        keywords: true,
        metadata: true,
        created_at: true
      }
    });

    // تحليل البيانات
    const articlesWithKeywords = articles.map(article => {
      const metadata = article.metadata as any || {};
      
      return {
        id: article.id,
        title: article.title,
        created_at: article.created_at,
        seo_keywords: article.seo_keywords,
        keywords_field: (article as any).keywords || null,
        metadata_keywords: metadata.keywords || null,
        has_seo_keywords: !!article.seo_keywords,
        has_metadata_keywords: !!(metadata.keywords && metadata.keywords.length > 0),
        seo_keywords_array: article.seo_keywords ? 
          article.seo_keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        all_keywords: [
          ...(article.seo_keywords ? article.seo_keywords.split(',').map(k => k.trim()).filter(Boolean) : []),
          ...(metadata.keywords || [])
        ]
      };
    });

    // إحصائيات
    const stats = {
      total_articles: articles.length,
      articles_with_seo_keywords: articlesWithKeywords.filter(a => a.has_seo_keywords).length,
      articles_with_metadata_keywords: articlesWithKeywords.filter(a => a.has_metadata_keywords).length,
      articles_without_any_keywords: articlesWithKeywords.filter(a => !a.has_seo_keywords && !a.has_metadata_keywords).length
    };

    return NextResponse.json({
      success: true,
      stats,
      articles: articlesWithKeywords
    });

  } catch (error) {
    console.error('خطأ في فحص الكلمات المفتاحية:', error);
    return NextResponse.json({ 
      error: 'خطأ في الخادم',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
