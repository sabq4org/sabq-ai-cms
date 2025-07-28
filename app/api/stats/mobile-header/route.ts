import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // حساب التواريخ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // جلب الإحصائيات بشكل متوازي
    const [
      totalArticles,
      totalCategories,
      articlesToday,
      articlesYesterday,
      activeAuthors,
      totalViews,
      trendinArticles
    ] = await Promise.all([
      // إجمالي المقالات المنشورة
      prisma.articles.count({
        where: { status: 'published' }
      }),
      
      // إجمالي التصنيفات النشطة
      prisma.categories.count({
        where: { is_active: true }
      }),
      
      // مقالات اليوم
      prisma.articles.count({
        where: {
          status: 'published',
          published_at: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // مقالات الأمس
      prisma.articles.count({
        where: {
          status: 'published',
          published_at: {
            gte: yesterday,
            lt: today
          }
        }
      }),
      
      // عدد الكتاب النشطين (نشروا مقالاً في آخر 7 أيام)
      prisma.articles.findMany({
        where: {
          status: 'published',
          published_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: { author_id: true },
        distinct: ['author_id']
      }).then(authors => authors.length),
      
      // إجمالي المشاهدات
      prisma.articles.aggregate({
        _sum: { views: true },
        where: { status: 'published' }
      }).then(result => result._sum.views || 0),
      
      // المقالات الأكثر تداولاً اليوم (حسب المشاهدات)
      prisma.articles.count({
        where: {
          status: 'published',
          published_at: {
            gte: today,
            lt: tomorrow
          },
          views: { gt: 100 } // مقالات تزيد مشاهداتها عن 100
        }
      })
    ]);

    // حساب التغيير من الأمس
    const todayVsYesterday = articlesToday - articlesYesterday;
    const changePercentage = articlesYesterday > 0 
      ? Math.round((todayVsYesterday / articlesYesterday) * 100) 
      : 0;

    // تحديد اتجاه التغيير
    const changeDirection = todayVsYesterday > 0 ? 'up' : 
                           todayVsYesterday < 0 ? 'down' : 'same';
    
    const changeIcon = changeDirection === 'up' ? '⬆️' : 
                      changeDirection === 'down' ? '⬇️' : '➡️';

    return NextResponse.json({
      success: true,
      stats: {
        // الإحصائيات الرئيسية
        total_articles: totalArticles,
        total_categories: totalCategories,
        articles_today: articlesToday,
        active_authors: activeAuthors,
        total_views: totalViews,
        trending_articles: trendinArticles,
        
        // مقارنة مع الأمس
        articles_yesterday: articlesYesterday,
        daily_change: {
          count: todayVsYesterday,
          percentage: changePercentage,
          direction: changeDirection,
          icon: changeIcon,
          text: changeDirection === 'up' ? `+${todayVsYesterday}` :
                changeDirection === 'down' ? `${todayVsYesterday}` : '0'
        },
        
        // معلومات إضافية للعرض
        display: {
          articles_today_text: `${articlesToday} مقال اليوم ${changeIcon}`,
          total_articles_text: `${totalArticles.toLocaleString('ar-SA')} مقال إجمالي`,
          categories_text: `${totalCategories} تصنيف`,
          authors_text: `${activeAuthors} كاتب نشط`,
          views_text: `${totalViews.toLocaleString('ar-SA')} مشاهدة`
        }
      },
      
      // الوقت والتاريخ
      timestamp: new Date().toISOString(),
      cache_duration: 300 // 5 دقائق
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات الهيدر المحمول:', error);
    
    // إرجاع قيم افتراضية في حالة الخطأ
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الإحصائيات',
      stats: {
        total_articles: 0,
        total_categories: 0,
        articles_today: 0,
        active_authors: 0,
        total_views: 0,
        trending_articles: 0,
        daily_change: {
          count: 0,
          percentage: 0,
          direction: 'same',
          icon: '➡️',
          text: '0'
        },
        display: {
          articles_today_text: '0 مقال اليوم ➡️',
          total_articles_text: '0 مقال إجمالي',
          categories_text: '0 تصنيف',
          authors_text: '0 كاتب نشط',
          views_text: '0 مشاهدة'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 