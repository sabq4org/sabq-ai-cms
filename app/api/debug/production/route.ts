import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      runtime: 'Node.js'
    };

    // فحص متغيرات البيئة المهمة (بدون كشف القيم)
    const envVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'REDIS_URL',
      'EMAIL_USER',
      'EMAIL_PASS'
    ];

    debugInfo.environment_variables = {};
    envVars.forEach(varName => {
      const value = process.env[varName];
      debugInfo.environment_variables[varName] = {
        exists: !!value,
        length: value ? value.length : 0,
        prefix: value ? value.substring(0, 10) + '...' : 'غير موجود'
      };
    });

    // اختبار الاتصال بقاعدة البيانات
    try {
      console.log('🔄 اختبار الاتصال بقاعدة البيانات...');
      
      // اختبار بسيط للاتصال
      const dbResult = await prisma.$queryRaw`SELECT 1 as test`;
      debugInfo.database = {
        status: 'connected',
        test_query: dbResult
      };

      // فحص جداول مهمة
      const tableChecks = await Promise.allSettled([
        prisma.categories.count(),
        prisma.articles.count(),
        prisma.users.count()
      ]);

      debugInfo.database.tables = {
        categories: tableChecks[0].status === 'fulfilled' ? 
          { status: 'ok', count: tableChecks[0].value } : 
          { status: 'error', error: (tableChecks[0] as any).reason?.message },
        articles: tableChecks[1].status === 'fulfilled' ? 
          { status: 'ok', count: tableChecks[1].value } : 
          { status: 'error', error: (tableChecks[1] as any).reason?.message },
        users: tableChecks[2].status === 'fulfilled' ? 
          { status: 'ok', count: tableChecks[2].value } : 
          { status: 'error', error: (tableChecks[2] as any).reason?.message }
      };

    } catch (dbError: any) {
      console.error('❌ خطأ في الاتصال بقاعدة البيانات:', dbError);
      debugInfo.database = {
        status: 'error',
        error: dbError.message,
        code: dbError.code
      };
    }

    // اختبار APIs داخلياً
    const apiTests = [];
    
    try {
      const categoriesTest = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      apiTests.push({
        endpoint: '/api/categories',
        status: categoriesTest.status,
        ok: categoriesTest.ok
      });
    } catch (e: any) {
      apiTests.push({
        endpoint: '/api/categories',
        status: 'error',
        error: e.message
      });
    }

    debugInfo.api_tests = apiTests;

    // معلومات النظام
    debugInfo.system = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd()
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'تشخيص النظام مكتمل'
    });

  } catch (error: any) {
    console.error('خطأ في التشخيص:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في التشخيص',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 