import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 اختبار اتصال قاعدة البيانات...');

    // اختبار الاتصال الأساسي
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // اختبار عدد المستخدمين
    const usersCount = await prisma.users.count();
    console.log(`👥 عدد المستخدمين: ${usersCount}`);

    // اختبار عدد المقالات
    const articlesCount = await prisma.articles.count();
    console.log(`📚 عدد المقالات: ${articlesCount}`);

    // اختبار عدد التفاعلات
    const interactionsCount = await prisma.interactions.count();
    console.log(`💬 عدد التفاعلات: ${interactionsCount}`);

    // اختبار نقاط الولاء
    const loyaltyPointsCount = await prisma.loyalty_points.count();
    console.log(`🏆 عدد نقاط الولاء: ${loyaltyPointsCount}`);

    // جلب عينة من التفاعلات الحديثة
    const recentInteractions = await prisma.interactions.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        user_id: true,
        article_id: true,
        type: true,
        created_at: true
      }
    });

    console.log(`📊 آخر ${recentInteractions.length} تفاعلات:`, recentInteractions);

    // جلب عينة من المستخدمين
    const sampleUsers = await prisma.users.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });

    console.log(`👤 عينة من المستخدمين:`, sampleUsers);

    // جلب عينة من المقالات
    const sampleArticles = await prisma.articles.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        likes: true,
        saves: true,
        views: true
      }
    });

    console.log(`📖 عينة من المقالات:`, sampleArticles);

    const result = {
      success: true,
      message: 'اتصال قاعدة البيانات يعمل بنجاح',
      database_status: 'connected',
      tables: {
        users: usersCount,
        articles: articlesCount,
        interactions: interactionsCount,
        loyalty_points: loyaltyPointsCount
      },
      samples: {
        recent_interactions: recentInteractions,
        users: sampleUsers,
        articles: sampleArticles
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ خطأ في اختبار قاعدة البيانات:', error);

    const errorResult = {
      success: false,
      message: 'فشل في الاتصال بقاعدة البيانات',
      error: error.message,
      error_code: error.code,
      database_status: 'failed',
      timestamp: new Date().toISOString(),
      details: {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5) // أول 5 أسطر من stack trace
      }
    };

    return NextResponse.json(errorResult, { status: 500 });

  } finally {
    // التأكد من إغلاق الاتصال
    try {
      // Removed: $disconnect() - causes connection issues
      console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    } catch (disconnectError) {
      console.error('⚠️ خطأ في قطع الاتصال:', disconnectError);
    }
  }
} 