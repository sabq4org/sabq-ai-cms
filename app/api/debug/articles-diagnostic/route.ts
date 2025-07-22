import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 تشخيص سريع لمشكلة عدم ظهور الأخبار...');

    // تشخيص شامل لقاعدة البيانات
    const diagnostics = await Promise.allSettled([
      // العدد الإجمالي
      prisma.articles.count(),
      
      // تجميع حسب الحالة
      prisma.articles.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // آخر 10 مقالات مع جميع البيانات
      prisma.articles.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          published_at: true,
          created_at: true,
          category_id: true,
          author_id: true,
          featured: true,
          breaking: true,
          categories: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // فحص المقالات بدون حالة صحيحة
      prisma.articles.count({
        where: {
          status: ''
        }
      }),
      
      // فحص المقالات غير المنشورة
      prisma.articles.count({
        where: {
          status: {
            not: 'published'
          }
        }
      }),
      
      // فحص المقالات بدون تصنيف
      prisma.articles.count({
        where: {
          category_id: null
        }
      })
    ]);

    // معالجة النتائج
    const [
      totalResult,
      statusGroupResult,
      recentArticlesResult,
      noStatusResult,
      unpublishedResult,
      noCategoryResult
    ] = diagnostics;

    const total = totalResult.status === 'fulfilled' ? totalResult.value : 0;
    const statusGroups = statusGroupResult.status === 'fulfilled' ? statusGroupResult.value : [];
    const recentArticles = recentArticlesResult.status === 'fulfilled' ? recentArticlesResult.value : [];
    const noStatusCount = noStatusResult.status === 'fulfilled' ? noStatusResult.value : 0;
    const unpublishedCount = unpublishedResult.status === 'fulfilled' ? unpublishedResult.value : 0;
    const noCategoryCount = noCategoryResult.status === 'fulfilled' ? noCategoryResult.value : 0;

    // إحصائيات مفصلة
    const statusBreakdown = statusGroups.reduce((acc, group) => {
      acc[group.status || 'null'] = group._count.id;
      return acc;
    }, {} as Record<string, number>);

    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      database: {
        totalArticles: total,
        statusBreakdown,
        issues: {
          noStatus: noStatusCount,
          unpublished: unpublishedCount,
          noCategory: noCategoryCount
        }
      },
      recentArticles: recentArticles.map(article => ({
        id: article.id,
        title: article.title,
        status: article.status,
        published_at: article.published_at,
        created_at: article.created_at,
        has_category: !!article.category_id,
        category_name: article.categories?.name,
        has_author: !!article.author_id,
        is_featured: article.featured,
        is_breaking: article.breaking
      })),
      recommendations: [] as string[]
    };

    // توصيات بناءً على التشخيص
    if (total === 0) {
      diagnosticReport.recommendations.push('❌ لا توجد مقالات في قاعدة البيانات - يجب إنشاء مقالات أولاً');
    } else {
      if (statusBreakdown.published === 0 || !statusBreakdown.published) {
        diagnosticReport.recommendations.push('⚠️ لا توجد مقالات منشورة - تحقق من حالة المقالات');
      }
      
      if (noStatusCount > 0) {
        diagnosticReport.recommendations.push(`⚠️ ${noStatusCount} مقال بدون حالة محددة - يجب تحديد حالة`);
      }
      
      if (unpublishedCount > 0) {
        diagnosticReport.recommendations.push(`� ${unpublishedCount} مقال غير منشور - تحقق من الحالة`);
      }
      
      if (noCategoryCount > 0) {
        diagnosticReport.recommendations.push(`📁 ${noCategoryCount} مقال بدون تصنيف - قد يؤثر على العرض`);
      }

      // تحليل الحالات الشائعة
      const publishedCount = statusBreakdown.published || 0;
      const draftCount = statusBreakdown.draft || 0;
      const pendingCount = statusBreakdown.pending || 0;

      if (draftCount > publishedCount) {
        diagnosticReport.recommendations.push(`📝 ${draftCount} مقال في المسودات - قد تحتاج إلى نشرها`);
      }
      
      if (pendingCount > 0) {
        diagnosticReport.recommendations.push(`⏳ ${pendingCount} مقال في انتظار المراجعة`);
      }
    }

    console.log('✅ تم الانتهاء من التشخيص');

    return NextResponse.json({
      success: true,
      diagnostic: diagnosticReport,
      quickFixes: {
        dashboardApiCall: '/api/articles?status=all&limit=100',
        publicApiCall: '/api/articles?status=published&limit=16',
        debugQueries: [
          'SELECT status, COUNT(*) FROM articles GROUP BY status',
          'SELECT * FROM articles WHERE status IS NULL',
          'SELECT * FROM articles WHERE category_id IS NULL'
        ]
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في التشخيص:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تشخيص المشكلة',
      details: error.message
    }, { status: 500 });
  }
}
