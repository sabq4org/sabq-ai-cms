import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 فحص حالة الأخبار العاجلة...');
    
    // البحث عن جميع الأخبار المحددة كعاجلة
    const breakingNewsArticles = await prisma.articles.findMany({
      where: {
        AND: [
          { status: 'published' },
          { published_at: { not: null } },
          {
            OR: [
              { metadata: { path: ['isBreakingNews'], equals: true } },
              { metadata: { path: ['breaking'], equals: true } },
              { metadata: { path: ['is_breaking'], equals: true } }
            ]
          }
        ]
      },
      orderBy: {
        published_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        published_at: true,
        metadata: true,
        created_at: true
      },
      take: 10 // أحدث 10 أخبار عاجلة
    });

    console.log(`📊 تم العثور على ${breakingNewsArticles.length} خبر عاجل`);

    // تحليل البيانات
    const analysis = {
      total: breakingNewsArticles.length,
      published: breakingNewsArticles.filter(article => article.status === 'published').length,
      last24Hours: breakingNewsArticles.filter(article => {
        const publishedAt = new Date(article.published_at!);
        const now = new Date();
        const diffHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      }).length,
      metadata_analysis: analyzeMetadata(breakingNewsArticles)
    };

    return NextResponse.json({
      success: true,
      current_breaking: breakingNewsArticles[0] || null,
      analysis,
      articles: breakingNewsArticles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        published_at: article.published_at,
        metadata_flags: extractBreakingFlags(article.metadata as any),
        time_ago: getTimeAgo(article.published_at!)
      })),
      recommendations: getRecommendations(analysis),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ في فحص الأخبار العاجلة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في فحص حالة الأخبار العاجلة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

function analyzeMetadata(articles: any[]) {
  const analysis = {
    using_isBreakingNews: 0,
    using_breaking: 0,
    using_is_breaking: 0,
    no_metadata: 0,
    multiple_flags: 0
  };

  articles.forEach(article => {
    const metadata = article.metadata as any || {};
    const flags = [];

    if (metadata.isBreakingNews === true) {
      analysis.using_isBreakingNews++;
      flags.push('isBreakingNews');
    }
    if (metadata.breaking === true) {
      analysis.using_breaking++;
      flags.push('breaking');
    }
    if (metadata.is_breaking === true) {
      analysis.using_is_breaking++;
      flags.push('is_breaking');
    }

    if (flags.length === 0) {
      analysis.no_metadata++;
    } else if (flags.length > 1) {
      analysis.multiple_flags++;
    }
  });

  return analysis;
}

function extractBreakingFlags(metadata: any) {
  const flags = [];
  if (metadata?.isBreakingNews === true) flags.push('isBreakingNews');
  if (metadata?.breaking === true) flags.push('breaking');
  if (metadata?.is_breaking === true) flags.push('is_breaking');
  return flags;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  } else if (diffInMinutes < 1440) { // أقل من يوم
    const hours = Math.floor(diffInMinutes / 60);
    return `منذ ${hours} ساعة`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `منذ ${days} يوم`;
  }
}

function getRecommendations(analysis: any): string[] {
  const recommendations = [];
  
  if (analysis.total === 0) {
    recommendations.push('لا توجد أخبار عاجلة حالياً');
    recommendations.push('تأكد من وضع علامة "خبر عاجل" عند إنشاء الأخبار المهمة');
  } else {
    recommendations.push(`يوجد ${analysis.total} خبر عاجل في النظام`);
    
    if (analysis.last24Hours > 0) {
      recommendations.push(`${analysis.last24Hours} خبر عاجل في آخر 24 ساعة`);
    } else {
      recommendations.push('لا توجد أخبار عاجلة جديدة في آخر 24 ساعة');
    }
  }
  
  if (analysis.metadata_analysis.multiple_flags > 0) {
    recommendations.push('بعض الأخبار تحتوي على أعلام متعددة - يفضل توحيد الطريقة');
  }
  
  if (analysis.metadata_analysis.no_metadata > 0) {
    recommendations.push('بعض الأخبار لا تحتوي على metadata صحيح');
  }
  
  return recommendations;
}
