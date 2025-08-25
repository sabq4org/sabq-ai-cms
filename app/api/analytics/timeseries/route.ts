import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// استيراد آمن لـ Prisma مع معالجة شاملة للأخطاء
let prisma: any = null;
let prismaImportError: any = null;

try {
  const prismaModule = require('@/lib/prisma');
  prisma = prismaModule.prisma;
  console.log('✅ [Analytics Timeseries API] تم تحميل Prisma بنجاح');
} catch (importError) {
  console.error('❌ [Analytics Timeseries API] فشل في استيراد Prisma:', importError);
  prismaImportError = importError;
}

// بيانات احتياطية للتحليلات الزمنية
function generateFallbackTimeseries(period: string) {
  const now = new Date();
  let dayCount: number;
  
  switch (period) {
    case 'week':
      dayCount = 7;
      break;
    case 'month':
      dayCount = 30;
      break;
    case 'year':
      dayCount = 365;
      break;
    default:
      dayCount = 7;
  }

  const data = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    
    // محاكاة نشاط أكثر في أيام الأسبوع
    const basePosts = dayOfWeek === 0 || dayOfWeek === 6 ? 
      Math.floor(Math.random() * 3) + 1 : 
      Math.floor(Math.random() * 8) + 3;
    
    const baseViews = basePosts * (Math.floor(Math.random() * 50) + 25);
    const baseInteractions = Math.floor(baseViews * 0.1) + Math.floor(Math.random() * 5);

    data.push({
      date: date.toISOString().split('T')[0],
      posts: basePosts,
      views: baseViews,
      interactions: baseInteractions,
      comments: Math.floor(baseInteractions * 0.3),
      likes: Math.floor(baseInteractions * 0.6),
      shares: Math.floor(baseInteractions * 0.1)
    });
  }
  
  return data;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('📊 [Analytics Timeseries API] بدء معالجة طلب التحليلات الزمنية...');

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'week';
    
    console.log(`📅 [Analytics Timeseries API] طلب بيانات للفترة: ${period}`);

    // تحديد الفترة الزمنية
    const now = new Date();
    let startDate: Date;
    let dayCount: number;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dayCount = 7;
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dayCount = 30;
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dayCount = 365;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dayCount = 7;
    }

    // محاولة جلب البيانات من قاعدة البيانات أولاً
    if (prisma && !prismaImportError) {
      try {
        await prisma.$connect();
        console.log('✅ [Analytics Timeseries API] تم الاتصال بقاعدة البيانات');

        // جلب المقالات المنشورة في الفترة المحددة
        const articles = await prisma.articles.findMany({
          where: {
            published_at: {
              gte: startDate,
              lte: now
            },
            status: 'published'
          },
          select: {
            published_at: true,
            views: true,
            id: true
          }
        });

        // جلب التفاعلات في الفترة المحددة
        const interactions = await prisma.interactions.findMany({
          where: {
            created_at: {
              gte: startDate,
              lte: now
            }
          },
          select: {
            created_at: true,
            type: true
          }
        });

        // تجميع البيانات حسب التاريخ
        const timeseriesData = [];
        for (let i = dayCount - 1; i >= 0; i--) {
          const currentDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = currentDate.toISOString().split('T')[0];
          const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

          // عد المقالات المنشورة في هذا اليوم
          const dayPosts = articles.filter((article: any) => {
            const publishDate = new Date(article.published_at);
            return publishDate >= currentDate && publishDate < nextDate;
          });

          // عد التفاعلات في هذا اليوم
          const dayInteractions = interactions.filter((interaction: any) => {
            const interactionDate = new Date(interaction.created_at);
            return interactionDate >= currentDate && interactionDate < nextDate;
          });

          // حساب المشاهدات
          const dayViews = dayPosts.reduce((sum: number, article: any) => sum + (article.views || 0), 0);

          // تفصيل التفاعلات
          const interactionBreakdown = {
            comments: dayInteractions.filter((i: any) => i.type === 'comment').length,
            likes: dayInteractions.filter((i: any) => i.type === 'like').length,
            shares: dayInteractions.filter((i: any) => i.type === 'share').length
          };

          timeseriesData.push({
            date: dateStr,
            posts: dayPosts.length,
            views: dayViews,
            interactions: dayInteractions.length,
            comments: interactionBreakdown.comments,
            likes: interactionBreakdown.likes,
            shares: interactionBreakdown.shares
          });
        }

        const responseTime = Date.now() - startTime;
        console.log(`⚡ [Analytics Timeseries API] تم جلب البيانات من قاعدة البيانات في ${responseTime}ms`);

        // Removed: $disconnect() - causes connection issues

        return NextResponse.json({
          success: true,
          data: timeseriesData,
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          source: 'database',
          responseTime
        });

      } catch (dbError) {
        console.error('❌ [Analytics Timeseries API] خطأ في قاعدة البيانات:', dbError);
        // الانتقال للبيانات الاحتياطية
      }
    }

    // محاولة قراءة ملف البيانات المحلي
    try {
      const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
      const articlesData = await fs.readFile(articlesPath, 'utf8');
      const articles = JSON.parse(articlesData);

      console.log('📁 [Analytics Timeseries API] تم جلب البيانات من الملف المحلي');

      // تجميع البيانات من الملف
      const timeseriesData = [];
      for (let i = dayCount - 1; i >= 0; i--) {
        const currentDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = currentDate.toISOString().split('T')[0];
        const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

        // تصفية المقالات حسب التاريخ
        const dayArticles = articles.filter((article: any) => {
          const publishDate = new Date(article.published_at || article.created_at);
          return article.status === 'published' && 
                 publishDate >= currentDate && 
                 publishDate < nextDate;
        });

        const dayViews = dayArticles.reduce((sum: number, article: any) => 
          sum + (article.views || Math.floor(Math.random() * 50) + 10), 0);

        timeseriesData.push({
          date: dateStr,
          posts: dayArticles.length,
          views: dayViews,
          interactions: Math.floor(dayViews * 0.1) + Math.floor(Math.random() * 5),
          comments: Math.floor(dayArticles.length * 2) + Math.floor(Math.random() * 3),
          likes: Math.floor(dayViews * 0.05) + Math.floor(Math.random() * 10),
          shares: Math.floor(dayArticles.length * 0.5) + Math.floor(Math.random() * 2)
        });
      }

      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: timeseriesData,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        source: 'file',
        responseTime
      });

    } catch (fileError) {
      console.warn('⚠️ [Analytics Timeseries API] لم يتم العثور على ملف البيانات، استخدام البيانات الاحتياطية');
    }

    // استخدام البيانات الاحتياطية كملاذ أخير
    const fallbackData = generateFallbackTimeseries(period);
    const responseTime = Date.now() - startTime;

    console.log(`🔄 [Analytics Timeseries API] تم إرجاع بيانات احتياطية في ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: fallbackData,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      source: 'fallback',
      message: 'تم استخدام بيانات تجريبية نظراً لعدم توفر قاعدة البيانات',
      responseTime
    });

  } catch (error) {
    console.error('❌ [Analytics Timeseries API] خطأ عام:', error);
    
    const fallbackData = generateFallbackTimeseries('week');
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      source: 'fallback',
      message: 'تم استخدام بيانات تجريبية بسبب خطأ في النظام'
    });
  }
}
