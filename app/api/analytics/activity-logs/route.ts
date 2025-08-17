import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// استيراد آمن لـ Prisma مع معالجة شاملة للأخطاء
let prisma: any = null;
let prismaImportError: any = null;

try {
  const prismaModule = require('@/lib/prisma');
  prisma = prismaModule.prisma;
  console.log('✅ [Analytics Activity Logs API] تم تحميل Prisma بنجاح');
} catch (importError) {
  console.error('❌ [Analytics Activity Logs API] فشل في استيراد Prisma:', importError);
  prismaImportError = importError;
}

// بيانات احتياطية لسجلات النشاطات
const FALLBACK_ACTIVITY_LOGS = [
  {
    id: 'activity-1',
    user: 'أحمد محمد',
    action: 'نشر',
    type: 'article',
    articleTitle: 'تطورات جديدة في قطاع التكنولوجيا',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: 'تم نشر مقال جديد بنجاح'
  },
  {
    id: 'activity-2',
    user: 'فاطمة الزهراء',
    action: 'تعديل',
    type: 'article',
    articleTitle: 'الوضع الاقتصادي الحالي',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    details: 'تم تعديل محتوى المقال'
  },
  {
    id: 'activity-3',
    user: 'محمد علي',
    action: 'حذف',
    type: 'comment',
    articleTitle: 'أخبار الرياضة اليوم',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    details: 'تم حذف تعليق غير مناسب'
  },
  {
    id: 'activity-4',
    user: 'سارة أحمد',
    action: 'إنشاء',
    type: 'category',
    articleTitle: null,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    details: 'تم إنشاء تصنيف جديد: التعليم'
  },
  {
    id: 'activity-5',
    user: 'خالد سالم',
    action: 'نشر',
    type: 'article',
    articleTitle: 'تحليل شامل للأحداث السياسية',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    details: 'تم نشر تحليل مفصل'
  }
];

export async function GET() {
  const startTime = Date.now();
  console.log('📊 [Analytics Activity Logs API] بدء معالجة طلب سجلات النشاطات...');

  try {
    // محاولة جلب البيانات من قاعدة البيانات أولاً
    if (prisma && !prismaImportError) {
      try {
        await prisma.$connect();
        console.log('✅ [Analytics Activity Logs API] تم الاتصال بقاعدة البيانات');

        const activityLogs: any[] = [];

        // جلب أحدث المقالات المنشورة
        const recentArticles = await prisma.articles.findMany({
          where: { status: 'published' },
          select: {
            id: true,
            title: true,
            published_at: true,
            updated_at: true,
            created_at: true,
            author: {
              select: { name: true }
            }
          },
          orderBy: { published_at: 'desc' },
          take: 20
        });

        // إضافة نشاطات النشر
        recentArticles.forEach((article: any) => {
          if (article.published_at) {
            activityLogs.push({
              id: `publish-${article.id}`,
              user: article.author?.name || 'محرر غير معروف',
              action: 'نشر',
              type: 'article',
              articleTitle: article.title,
              timestamp: article.published_at,
              details: 'تم نشر مقال جديد'
            });
          }

          // إضافة نشاطات التعديل إذا كان هناك تعديل بعد النشر
          if (article.updated_at && 
              article.published_at && 
              new Date(article.updated_at) > new Date(article.published_at)) {
            activityLogs.push({
              id: `edit-${article.id}`,
              user: article.author?.name || 'محرر غير معروف',
              action: 'تعديل',
              type: 'article',
              articleTitle: article.title,
              timestamp: article.updated_at,
              details: 'تم تعديل المقال'
            });
          }
        });

        // جلب أحدث التعليقات
        try {
          const recentComments = await prisma.comments.findMany({
            select: {
              id: true,
              created_at: true,
              articles: {
                select: { title: true }
              },
              users: {
                select: { name: true }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 10
          });

          recentComments.forEach((comment: any) => {
            activityLogs.push({
              id: `comment-${comment.id}`,
              user: comment.users?.name || 'مستخدم غير معروف',
              action: 'تعليق',
              type: 'comment',
              articleTitle: comment.articles?.title || 'مقال غير معروف',
              timestamp: comment.created_at,
              details: 'تم إضافة تعليق جديد'
            });
          });
        } catch (commentError) {
          console.log('📝 [Analytics Activity Logs API] لا توجد تعليقات أو خطأ في الجدول');
        }

        // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
        const sortedLogs = activityLogs
          .sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50); // أحدث 50 نشاط

        const responseTime = Date.now() - startTime;
        console.log(`⚡ [Analytics Activity Logs API] تم جلب ${sortedLogs.length} نشاط من قاعدة البيانات في ${responseTime}ms`);

        await prisma.$disconnect();

        return NextResponse.json({
          success: true,
          activities: sortedLogs,
          count: sortedLogs.length,
          source: 'database',
          responseTime,
          timestamp: new Date().toISOString()
        });

      } catch (dbError) {
        console.error('❌ [Analytics Activity Logs API] خطأ في قاعدة البيانات:', dbError);
        // الانتقال للبيانات الاحتياطية
      }
    }

    // محاولة قراءة ملف البيانات المحلي
    try {
      const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
      const articlesData = await fs.readFile(articlesPath, 'utf8');
      const articles = JSON.parse(articlesData);

      console.log('📁 [Analytics Activity Logs API] تم جلب البيانات من الملف المحلي');

      const activityLogs: any[] = [];

      // إضافة نشاطات النشر والتعديل من ملف المقالات
      articles.forEach((article: any) => {
        // نشاط النشر
        if (article.status === 'published' && article.published_at) {
          activityLogs.push({
            id: `publish-${article.id}`,
            user: article.author_name || 'محرر غير معروف',
            action: 'نشر',
            type: 'article',
            articleTitle: article.title,
            timestamp: article.published_at,
            details: 'تم نشر مقال جديد'
          });
        }

        // نشاط التعديل
        if (article.updated_at && article.updated_at !== article.created_at) {
          activityLogs.push({
            id: `edit-${article.id}`,
            user: article.editor_name || article.author_name || 'محرر غير معروف',
            action: 'تعديل',
            type: 'article',
            articleTitle: article.title,
            timestamp: article.updated_at,
            details: 'تم تعديل المقال'
          });
        }

        // نشاط إنشاء المسودة
        if (article.status === 'draft') {
          activityLogs.push({
            id: `draft-${article.id}`,
            user: article.author_name || 'محرر غير معروف',
            action: 'إنشاء مسودة',
            type: 'article',
            articleTitle: article.title,
            timestamp: article.created_at,
            details: 'تم إنشاء مسودة جديدة'
          });
        }
      });

      // محاولة قراءة سجل التعليقات
      try {
        const commentsPath = path.join(process.cwd(), 'data', 'comments.json');
        const commentsData = await fs.readFile(commentsPath, 'utf8');
        const comments = JSON.parse(commentsData);

        comments.forEach((comment: any, index: number) => {
          const article = articles.find((a: any) => a.id === comment.article_id);
          activityLogs.push({
            id: `comment-${comment.id || index}`,
            user: comment.author_name || 'مستخدم غير معروف',
            action: 'تعليق',
            type: 'comment',
            articleTitle: article?.title || 'مقال غير معروف',
            timestamp: comment.created_at || new Date().toISOString(),
            details: 'تم إضافة تعليق جديد'
          });
        });
      } catch (commentError) {
        console.log('📝 [Analytics Activity Logs API] لا يوجد ملف تعليقات');
      }

      // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
      const sortedLogs = activityLogs
        .sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);

      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        activities: sortedLogs,
        count: sortedLogs.length,
        source: 'file',
        responseTime,
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      console.warn('⚠️ [Analytics Activity Logs API] لم يتم العثور على ملف البيانات، استخدام البيانات الاحتياطية');
    }

    // استخدام البيانات الاحتياطية كملاذ أخير
    const responseTime = Date.now() - startTime;
    console.log(`🔄 [Analytics Activity Logs API] تم إرجاع بيانات احتياطية في ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      activities: FALLBACK_ACTIVITY_LOGS,
      count: FALLBACK_ACTIVITY_LOGS.length,
      source: 'fallback',
      message: 'تم استخدام بيانات تجريبية نظراً لعدم توفر قاعدة البيانات',
      responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Analytics Activity Logs API] خطأ عام:', error);
    
    return NextResponse.json({
      success: false,
      activities: FALLBACK_ACTIVITY_LOGS,
      count: FALLBACK_ACTIVITY_LOGS.length,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      source: 'fallback',
      message: 'تم استخدام بيانات تجريبية بسبب خطأ في النظام',
      timestamp: new Date().toISOString()
    });
  }
}
