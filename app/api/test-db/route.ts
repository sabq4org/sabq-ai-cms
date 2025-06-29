import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // اختبار الاتصال بقاعدة البيانات
    await prisma.$connect();
    
    // اختبار بسيط للتأكد من عمل Prisma
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // محاولة جلب عدد الجداول (إن وجدت)
    let tablesInfo = {};
    try {
      const categoryCount = await prisma.category.count();
      const articleCount = await prisma.article.count();
      const userCount = await prisma.user.count();
      
      tablesInfo = {
        categories: categoryCount,
        articles: articleCount,
        users: userCount
      };
    } catch (tableError) {
      tablesInfo = {
        error: 'الجداول غير موجودة - تحتاج إلى migration',
        details: tableError instanceof Error ? tableError.message : 'خطأ غير معروف'
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم الاتصال بقاعدة البيانات بنجاح',
      database: {
        connected: true,
        query_test: result,
        tables: tablesInfo
      },
      environment: {
        node_env: process.env.NODE_ENV,
        has_database_url: !!process.env.DATABASE_URL,
        database_url_preview: process.env.DATABASE_URL?.substring(0, 20) + '...'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('خطأ في اختبار قاعدة البيانات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل الاتصال بقاعدة البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      environment: {
        node_env: process.env.NODE_ENV,
        has_database_url: !!process.env.DATABASE_URL,
        database_url_preview: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'غير موجود'
      },
      suggestions: [
        'تأكد من إعداد DATABASE_URL في متغيرات البيئة',
        'تأكد من صحة connection string',
        'تشغيل migration إذا لم تكن الجداول موجودة',
        'تحقق من Vercel Function Logs للمزيد من التفاصيل'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 