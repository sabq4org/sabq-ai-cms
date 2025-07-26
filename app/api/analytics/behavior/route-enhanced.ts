import { NextRequest, NextResponse } from 'next/server';

// استيراد آمن لـ Prisma مع معالجة شاملة للأخطاء
let prisma: any = null;
let prismaImportError: any = null;

try {
  const prismaModule = require('@/lib/prisma');
  prisma = prismaModule.prisma;
  console.log('✅ [Analytics Behavior API] تم تحميل Prisma بنجاح');
} catch (importError) {
  console.error('❌ [Analytics Behavior API] فشل في استيراد Prisma:', importError);
  prismaImportError = importError;
}

// بيانات احتياطية للتحليلات
const FALLBACK_ANALYTICS = {
  overview: {
    totalImpressions: 150,
    totalInteractions: 45,
    uniqueArticlesRead: 12
  },
  interactionBreakdown: {
    like: 20,
    save: 8,
    share: 12,
    comment: 5,
    view: 150
  },
  categoryInsights: [
    { category: 'محليات', impressions: 45, uniqueArticles: 8 },
    { category: 'تقنية', impressions: 32, uniqueArticles: 6 },
    { category: 'اقتصاد', impressions: 28, uniqueArticles: 5 },
    { category: 'رياضة', impressions: 25, uniqueArticles: 4 },
    { category: 'عالمية', impressions: 20, uniqueArticles: 3 }
  ]
};

// جلب تحليلات سلوك المستخدم
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔍 [Analytics Behavior API] بدء معالجة طلب تحليلات السلوك...');

  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      console.warn('⚠️ [Analytics Behavior API] URL غير صحيح');
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all
    
    console.log(`📊 [Analytics Behavior API] طلب تحليلات للمستخدم: ${userId}, الفترة: ${period}`);
    
    if (!userId) {
      console.warn('⚠️ [Analytics Behavior API] معرف المستخدم مطلوب');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // التحقق من Prisma
    if (!prisma || prismaImportError) {
      console.warn('⚠️ [Analytics Behavior API] Prisma غير متاح، استخدام البيانات الاحتياطية');
      const fallbackResponse = {
        success: true,
        analytics: FALLBACK_ANALYTICS,
        period,
        startDate: new Date(Date.now() - (period === '30d' ? 30 : 7) * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        source: 'fallback',
        message: 'تم استخدام بيانات تجريبية نظراً لعدم توفر قاعدة البيانات'
      };
      
      return NextResponse.json(fallbackResponse);
    }

    // التحقق من اتصال قاعدة البيانات
    try {
      await prisma.$connect();
      console.log('✅ [Analytics Behavior API] تم الاتصال بقاعدة البيانات بنجاح');
    } catch (connectionError) {
      console.error('❌ [Analytics Behavior API] فشل الاتصال بقاعدة البيانات:', connectionError);
      const fallbackResponse = {
        success: true,
        analytics: FALLBACK_ANALYTICS,
        period,
        startDate: new Date(Date.now() - (period === '30d' ? 30 : 7) * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        source: 'fallback',
        message: 'تم استخدام بيانات تجريبية بسبب مشكلة في الاتصال بقاعدة البيانات'
      };
      
      return NextResponse.json(fallbackResponse);
    }

    // حساب تاريخ البداية بناءً على الفترة
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    console.log(`📅 [Analytics Behavior API] جلب البيانات من ${startDate.toISOString()}`);

    // جلب البيانات من قاعدة البيانات
    let impressions = [];
    let interactions = [];

    try {
      // جلب البيانات بشكل متوازي
      [impressions, interactions] = await Promise.all([
        // الانطباعات - استخدام Interaction بدلاً من impression
        prisma.interactions.findMany({
          where: {
            user_id: userId,
            type: 'view',
            created_at: { gte: startDate }
          },
          include: {
            articles: {
              include: {
                categories: true
              }
            }
          }
        }),
        
        // التفاعلات
        prisma.interactions.findMany({
          where: {
            user_id: userId,
            created_at: { gte: startDate }
          }
        })
      ]);

      console.log(`📈 [Analytics Behavior API] تم جلب ${impressions.length} انطباع و ${interactions.length} تفاعل`);

    } catch (queryError) {
      console.error('❌ [Analytics Behavior API] خطأ في جلب البيانات:', queryError);
      
      // إرجاع بيانات احتياطية في حالة خطأ الاستعلام
      const fallbackResponse = {
        success: true,
        analytics: FALLBACK_ANALYTICS,
        period,
        startDate,
        endDate: new Date(),
        source: 'fallback',
        message: 'تم استخدام بيانات تجريبية بسبب خطأ في استعلام قاعدة البيانات'
      };
      
      return NextResponse.json(fallbackResponse);
    }
    
    // تحليل البيانات
    const analytics = {
      overview: {
        totalImpressions: impressions.length,
        totalInteractions: interactions.length,
        uniqueArticlesRead: new Set(impressions.map((i: any) => i.article_id)).size
      },
      
      interactionBreakdown: analyzeInteractions(interactions),
      
      categoryInsights: analyzeCategoryPreferences(impressions)
    };

    const responseTime = Date.now() - startTime;
    console.log(`⚡ [Analytics Behavior API] تم إكمال التحليل في ${responseTime}ms`);

    const response = {
      success: true,
      analytics,
      period,
      startDate,
      endDate: new Date(),
      source: 'database',
      responseTime
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ [Analytics Behavior API] خطأ عام:', error);
    
    // إرجاع بيانات احتياطية مع رسالة خطأ
    const fallbackResponse = {
      success: true,
      analytics: FALLBACK_ANALYTICS,
      period: '7d',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      source: 'fallback',
      message: 'تم استخدام بيانات تجريبية بسبب خطأ في النظام',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    };
    
    return NextResponse.json(fallbackResponse);
  } finally {
    // قطع اتصال آمن
    if (prisma) {
      try {
        await prisma.$disconnect();
        console.log('🔌 [Analytics Behavior API] تم قطع الاتصال بقاعدة البيانات');
      } catch (disconnectError) {
        console.warn('⚠️ [Analytics Behavior API] تعذر قطع الاتصال:', disconnectError);
      }
    }
  }
}

// دوال التحليل

function analyzeInteractions(interactions: any[]) {
  const breakdown = {
    like: 0,
    save: 0,
    share: 0,
    comment: 0,
    view: 0
  };
  
  interactions.forEach(interaction => {
    if (breakdown.hasOwnProperty(interaction.type)) {
      breakdown[interaction.type as keyof typeof breakdown]++;
    }
  });
  
  return breakdown;
}

function analyzeCategoryPreferences(impressions: any[]) {
  const categoryStats: Record<string, {
    impressions: number;
    articles: Set<string>;
  }> = {};
  
  impressions.forEach(impression => {
    const category = impression.article?.category;
    if (!category) return;
    
    if (!categoryStats[category.slug]) {
      categoryStats[category.slug] = {
        impressions: 0,
        articles: new Set()
      };
    }
    
    const stats = categoryStats[category.slug];
    stats.impressions++;
    stats.articles.add(impression.article_id);
  });
  
  // تحويل Set إلى عدد
  const result = Object.entries(categoryStats).map(([slug, stats]) => ({
    category: slug,
    impressions: stats.impressions,
    uniqueArticles: stats.articles.size
  }));
  
  return result.sort((a, b) => b.impressions - a.impressions);
}
