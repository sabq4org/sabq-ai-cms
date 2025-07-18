import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis-improved';

const CACHE_KEY = 'site:stats:summary';
const CACHE_TTL = 300; // 5 دقائق

export async function GET(request: NextRequest) {
  try {
    // محاولة جلب من الكاش أولاً
    const cachedStats = await cache.get(CACHE_KEY);
    if (cachedStats) {
      return NextResponse.json({
        success: true,
        cached: true,
        ...cachedStats
      });
    }

    // التواريخ المطلوبة
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // جلب جميع الإحصائيات بشكل متوازي
    const [
      totalArticles,
      totalCategories,
      todayArticles,
      yesterdayArticles,
      recentInteractions,
      activeUsers
    ] = await Promise.all([
      // إجمالي المقالات المنشورة
      prisma.articles.count({
        where: { status: 'published' }
      }),
      
      // إجمالي التصنيفات النشطة
      prisma.categories.count({
        where: {
          is_active: true
        }
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
      
      // التفاعلات خلال آخر 24 ساعة
      prisma.interactions.count({
        where: {
          created_at: {
            gte: yesterday
          }
        }
      }),
      
      // المستخدمين النشطين (آخر 30 دقيقة)
      prisma.users.count({
        where: {
          updated_at: {
            gte: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      })
    ]);

    // حساب التغيير اليومي
    const dailyChange = todayArticles - yesterdayArticles;
    const dailyChangePercentage = yesterdayArticles > 0 
      ? Math.round((dailyChange / yesterdayArticles) * 100)
      : 0;

    const stats = {
      // الإحصائيات الأساسية
      totalArticles,
      totalCategories,
      todayArticles,
      
      // مؤشرات الأداء
      dailyChange,
      dailyChangePercentage,
      trend: dailyChange > 0 ? 'up' : dailyChange < 0 ? 'down' : 'stable',
      
      // إحصائيات إضافية
      recentInteractions,
      activeUsers,
      
      // الوقت
      lastUpdated: new Date().toISOString(),
      
      // تفاصيل إضافية
      details: {
        yesterdayArticles,
        averageDaily: Math.round((totalArticles / 30)), // متوسط آخر 30 يوم تقريباً
        engagementRate: totalArticles > 0 
          ? Math.round((recentInteractions / totalArticles) * 100)
          : 0
      }
    };

    // حفظ في الكاش
    await cache.set(CACHE_KEY, stats, CACHE_TTL);

    return NextResponse.json({
      success: true,
      cached: false,
      ...stats
    });
    
  } catch (error) {
    console.error('Error fetching site statistics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'فشل في جلب الإحصائيات',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      },
      { status: 500 }
    );
  }
} 