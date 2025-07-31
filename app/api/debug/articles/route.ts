import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - تشخيص حالة المقالات وقاعدة البيانات
export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        connectionTest: 'pending'
      },
      articles: {
        total: 0,
        published: 0,
        draft: 0,
        deleted: 0,
        withoutAuthor: 0,
        withoutCategory: 0
      },
      authors: {
        total: 0,
        orphanedArticles: []
      },
      categories: {
        total: 0,
        orphanedArticles: []
      },
      issues: []
    };

    // 1. اختبار الاتصال بقاعدة البيانات
    try {
      // اختبار الاتصال بتشغيل استعلام بسيط
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.database.connected = true;
      diagnostics.database.connectionTest = 'success';
    } catch (dbError) {
      diagnostics.database.connectionTest = 'error';
      diagnostics.database.error = dbError instanceof Error ? dbError.message : 'خطأ غير معروف';
      
      return NextResponse.json({
        success: false,
        diagnostics,
        summary: 'خطأ في الاتصال بقاعدة البيانات'
      }, { status: 503 });
    }

    // 2. إحصائيات المقالات
    try {
      const [
        totalArticles,
        publishedArticles, 
        draftArticles,
        deletedArticles
      ] = await Promise.all([
        prisma.articles.count(),
        prisma.articles.count({ where: { status: 'published' } }),
        prisma.articles.count({ where: { status: 'draft' } }),
        prisma.articles.count({ where: { status: 'deleted' } })
      ]);

      diagnostics.articles = {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        deleted: deletedArticles
      };
    } catch (articlesError) {
      diagnostics.issues.push({
        type: 'error',
        category: 'articles',
        message: 'فشل في جلب إحصائيات المقالات',
        details: articlesError instanceof Error ? articlesError.message : undefined
      });
    }

    // 3. البحث عن مقالات بدون مؤلف
    try {
      // استخدام raw query للبحث عن المقالات بدون مؤلف
      const articlesWithoutAuthorResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM articles 
        WHERE author_id IS NULL AND status != 'deleted'
      `;
      const articlesWithoutAuthor = Number((articlesWithoutAuthorResult as any[])[0]?.count || 0);
      
      diagnostics.articles.withoutAuthor = articlesWithoutAuthor;
      
      if (articlesWithoutAuthor > 0) {
        diagnostics.issues.push({
          type: 'warning',
          category: 'data_integrity',
          message: `${articlesWithoutAuthor} مقال بدون مؤلف`,
          suggestion: 'تعيين مؤلفين افتراضيين للمقالات'
        });
      }
    } catch (authorError) {
      diagnostics.issues.push({
        type: 'error',
        category: 'authors',
        message: 'فشل في فحص المؤلفين',
        details: authorError instanceof Error ? authorError.message : undefined
      });
    }

    // 4. البحث عن مقالات بدون تصنيف
    try {
      // استخدام raw query للبحث عن المقالات بدون تصنيف
      const articlesWithoutCategoryResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM articles 
        WHERE category_id IS NULL AND status != 'deleted'
      `;
      const articlesWithoutCategory = Number((articlesWithoutCategoryResult as any[])[0]?.count || 0);
      
      diagnostics.articles.withoutCategory = articlesWithoutCategory;
      
      if (articlesWithoutCategory > 0) {
        diagnostics.issues.push({
          type: 'warning',
          category: 'data_integrity',
          message: `${articlesWithoutCategory} مقال بدون تصنيف`,
          suggestion: 'تعيين تصنيفات للمقالات'
        });
      }
    } catch (categoryError) {
      diagnostics.issues.push({
        type: 'error',
        category: 'categories',
        message: 'فشل في فحص التصنيفات',
        details: categoryError instanceof Error ? categoryError.message : undefined
      });
    }

    // 5. فحص المؤلفين المحذوفين مع مقالات نشطة
    try {
      const authorsCount = await prisma.users.count();
      diagnostics.authors.total = authorsCount;

      // البحث عن مقالات لمؤلفين غير موجودين باستخدام raw query
      const orphanedArticlesResult = await prisma.$queryRaw`
        SELECT id, title, author_id, status FROM articles 
        WHERE author_id IS NOT NULL AND status != 'deleted'
      `;
      const orphanedArticles = orphanedArticlesResult as any[];

      // التحقق من وجود المؤلفين
      const authorIds = [...new Set(orphanedArticles.map(a => a.author_id).filter(Boolean))];
      const existingAuthors = await prisma.users.findMany({
        where: { id: { in: authorIds as string[] } },
        select: { id: true }
      });
      
      const existingAuthorIds = new Set(existingAuthors.map(a => a.id));
      const orphaned = orphanedArticles.filter(article => 
        article.author_id && !existingAuthorIds.has(article.author_id)
      );

      if (orphaned.length > 0) {
        diagnostics.authors.orphanedArticles = orphaned.slice(0, 10); // أول 10 فقط
        diagnostics.issues.push({
          type: 'error',
          category: 'data_integrity',
          message: `${orphaned.length} مقال مرتبط بمؤلفين محذوفين`,
          suggestion: 'إعادة تعيين المؤلفين أو تنظيف البيانات'
        });
      }
    } catch (orphanedError) {
      diagnostics.issues.push({
        type: 'error',
        category: 'orphaned_data',
        message: 'فشل في فحص المؤلفين المحذوفين',
        details: orphanedError instanceof Error ? orphanedError.message : undefined
      });
    }

    // 6. إحصائيات التصنيفات
    try {
      const categoriesCount = await prisma.categories.count();
      diagnostics.categories.total = categoriesCount;
    } catch (categoriesError) {
      diagnostics.issues.push({
        type: 'error',
        category: 'categories',
        message: 'فشل في فحص التصنيفات',
        details: categoriesError instanceof Error ? categoriesError.message : undefined
      });
    }

    // 7. تحديد مستوى الصحة العامة
    const criticalIssues = diagnostics.issues.filter((i: any) => i.type === 'critical').length;
    const errorIssues = diagnostics.issues.filter((i: any) => i.type === 'error').length;
    const warningIssues = diagnostics.issues.filter((i: any) => i.type === 'warning').length;

    let healthStatus = 'healthy';
    let healthMessage = 'النظام يعمل بشكل طبيعي';

    if (criticalIssues > 0) {
      healthStatus = 'critical';
      healthMessage = 'توجد مشاكل حرجة تحتاج لإصلاح فوري';
    } else if (errorIssues > 0) {
      healthStatus = 'degraded';
      healthMessage = 'توجد أخطاء تحتاج لمراجعة';
    } else if (warningIssues > 0) {
      healthStatus = 'warning';
      healthMessage = 'توجد تحذيرات يُنصح بمراجعتها';
    }

    return NextResponse.json({
      success: true,
      health: {
        status: healthStatus,
        message: healthMessage,
        score: Math.max(0, 100 - (criticalIssues * 40) - (errorIssues * 20) - (warningIssues * 10))
      },
      diagnostics,
      recommendations: [
        'تأكد من وجود نسخ احتياطية حديثة',
        'راقب استخدام قاعدة البيانات بانتظام',
        'نظف البيانات المهجورة دورياً',
        'تحقق من سلامة العلاقات بين الجداول'
      ]
    });

  } catch (error) {
    console.error('❌ خطأ في تشخيص النظام:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تشخيص النظام',
      message: 'حدث خطأ أثناء فحص حالة النظام',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 