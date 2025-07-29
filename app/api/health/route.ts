import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // معلومات البيئة
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DIRECT_URL_SET: !!process.env.DIRECT_URL,
      VERCEL: !!process.env.VERCEL,
      DIGITAL_OCEAN: !!process.env.DIGITAL_OCEAN_APP_ID
    };
    
    // اختبار الاتصال الأساسي
    const dbTest = await prisma.$queryRaw<Array<{test: number, db: string, version: string}>>`SELECT 1 as test, current_database() as db, version() as version`;
    
    // اختبار استعلامات حقيقية
    const [articlesCount, usersCount, categoriesCount] = await Promise.all([
      prisma.articles.count().catch(() => 0),
      prisma.users.count().catch(() => 0),
      prisma.categories.count().catch(() => 0)
    ]);
    
    // حساب وقت الاستجابة
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        info: dbTest[0],
        responseTime: `${responseTime}ms`
      },
      data: {
        articles: articlesCount,
        users: usersCount,
        categories: categoriesCount
      },
      environment,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Health check failed:', error);
    
    // تحليل نوع الخطأ
    let errorType = 'UNKNOWN';
    let errorDetails = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      if ('code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === 'P2024') {
          errorType = 'POOL_TIMEOUT';
          errorDetails = 'Connection pool timeout - check your pooling settings';
        } else if (errorCode === 'P2010') {
          errorType = 'CONNECTION_FAILED';
          errorDetails = 'Failed to connect to database - check your DATABASE_URL';
        } else if (errorCode === 'ECONNREFUSED') {
          errorType = 'CONNECTION_REFUSED';
          errorDetails = 'Database connection refused - check if database is running';
        }
      }
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: errorType,
        details: errorDetails,
        responseTime: `${responseTime}ms`
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DIRECT_URL_SET: !!process.env.DIRECT_URL
      },
      timestamp: new Date().toISOString(),
      suggestion: getErrorSuggestion(errorType)
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  }
}

function getErrorSuggestion(errorType: string): string {
  switch (errorType) {
    case 'POOL_TIMEOUT':
      return 'Try adding ?pgbouncer=true&pool_timeout=60 to your DATABASE_URL';
    case 'CONNECTION_FAILED':
      return 'Check that DATABASE_URL is set correctly with port 6543 for pooling';
    case 'CONNECTION_REFUSED':
      return 'Ensure your database is running and accessible from Digital Ocean';
    default:
      return 'Check your database configuration and environment variables';
  }
}