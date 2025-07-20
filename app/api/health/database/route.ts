import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    // اختبار الاتصال الأساسي
    await prisma.$connect();
    
    // اختبار الجداول الأساسية
    const checks = [];
    
    try {
      // فحص جدول المستخدمين
      const userCount = await prisma.user.count();
      checks.push({
        table: 'users',
        status: 'success',
        count: userCount,
        message: 'جدول المستخدمين متاح'
      });
    } catch (error) {
      checks.push({
        table: 'users',
        status: 'error',
        message: 'جدول المستخدمين غير متاح',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }

    try {
      // فحص جدول المقالات
      const articleCount = await prisma.article.count();
      checks.push({
        table: 'articles',
        status: 'success',
        count: articleCount,
        message: 'جدول المقالات متاح'
      });
    } catch (error) {
      checks.push({
        table: 'articles',
        status: 'error',
        message: 'جدول المقالات غير متاح',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }

    try {
      // فحص جدول التعليقات (إذا كان موجود)
      const commentCount = await prisma.comment?.count() || 0;
      checks.push({
        table: 'comments',
        status: 'success',
        count: commentCount,
        message: 'جدول التعليقات متاح'
      });
    } catch (error) {
      checks.push({
        table: 'comments',
        status: 'warning',
        message: 'جدول التعليقات غير متاح - قد يحتاج إنشاء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }

    try {
      // فحص الجداول الجديدة للتفاعل
      const activityCount = await prisma.userActivity?.count() || 0;
      checks.push({
        table: 'user_activities',
        status: 'success',
        count: activityCount,
        message: 'جدول أنشطة المستخدمين متاح'
      });
    } catch (error) {
      checks.push({
        table: 'user_activities',
        status: 'warning',
        message: 'جدول أنشطة المستخدمين غير متاح - يحتاج migration',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }

    // فحص الاتصال العام
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`;
    
    const hasErrors = checks.some(check => check.status === 'error');
    const hasWarnings = checks.some(check => check.status === 'warning');
    
    await prisma.$disconnect();

    return NextResponse.json({
      success: !hasErrors,
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
      message: hasErrors 
        ? 'هناك مشاكل في قاعدة البيانات تحتاج إصلاح'
        : hasWarnings
        ? 'قاعدة البيانات تعمل لكن بعض الجداول مفقودة'
        : 'قاعدة البيانات تعمل بشكل ممتاز',
      database: {
        connected: true,
        info: dbInfo,
        provider: 'postgresql'
      },
      tables: checks,
      timestamp: new Date().toISOString(),
      recommendations: getRecommendations(checks)
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'فشل في الاتصال بقاعدة البيانات',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      database: {
        connected: false,
        provider: 'postgresql'
      },
      timestamp: new Date().toISOString(),
      recommendations: [
        'تحقق من متغيرات البيئة DATABASE_URL',
        'تأكد من تشغيل خادم قاعدة البيانات',
        'راجع إعدادات Supabase'
      ]
    }, { status: 500 });
  }
}

function getRecommendations(checks: any[]) {
  const recommendations = [];
  
  const missingTables = checks.filter(check => 
    check.status === 'error' || check.status === 'warning'
  );
  
  if (missingTables.length > 0) {
    recommendations.push('قم بتشغيل ملف migration للجداول المفقودة');
    recommendations.push('استخدم الأمر: npx prisma db push لتحديث الجداول');
  }
  
  const hasComments = checks.find(check => 
    check.table === 'comments' && check.status === 'success'
  );
  
  if (!hasComments) {
    recommendations.push('قم بتطبيق ملف supabase_enhanced_interaction.sql');
  }
  
  const hasActivities = checks.find(check => 
    check.table === 'user_activities' && check.status === 'success'
  );
  
  if (!hasActivities) {
    recommendations.push('قم بإنشاء الجداول الجديدة لنظام التفاعل');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('قاعدة البيانات جاهزة للاستخدام!');
  }
  
  return recommendations;
}
