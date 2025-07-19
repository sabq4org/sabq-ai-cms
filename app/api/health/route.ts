import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureConnection } from '@/lib/prisma';
import { corsResponse } from '@/lib/cors';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🏥 بدء فحص صحة النظام...');

    // فحص الاتصال بقاعدة البيانات مع قياس الوقت
    const dbStart = Date.now();
    const dbConnected = await ensureConnection();
    const dbLatency = Date.now() - dbStart;

    let dbTestResult = null;
    if (dbConnected) {
      try {
        dbTestResult = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
      } catch (error) {
        console.error('خطأ في اختبار قاعدة البيانات:', error);
      }
    }

    const healthCheck = {
      status: dbConnected ? 'صحي' : 'منخفض الأداء',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      checks: {
        api: true,
        database: dbConnected,
        database_latency: dbLatency,
        env_vars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
        }
      },
      performance: {
        total_response_time: Date.now() - startTime,
        database_response_time: dbLatency
      }
    };

    const statusCode = dbConnected ? 200 : 503;
    console.log(`🏥 فحص صحة النظام: ${healthCheck.status} (${Date.now() - startTime}ms)`);

    return corsResponse(healthCheck, statusCode);
    
  } catch (error) {
    console.error('❌ خطأ في فحص صحة النظام:', error);
    
    const errorCheck = {
      status: 'خطأ',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        type: error instanceof Error ? error.name : 'UnknownError'
      },
      performance: {
        total_response_time: Date.now() - startTime
      }
    };

    return corsResponse(errorCheck, 500);
  }
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return corsResponse(null, 200);
} 