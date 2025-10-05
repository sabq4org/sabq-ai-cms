export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Ultra-fast environment check
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      EDGE_RUNTIME: true,
      REGION: process.env.CF_RAY?.split('-')[1] || 'unknown'
    };
    
    // Lightning-fast database test using Prisma
    const dbTest = await prisma.$queryRaw`SELECT 1 as test, version() as version`;
    
    // Fast count queries with optimized performance
    const [articlesResult, usersResult, categoriesResult] = await Promise.allSettled([
      prisma.articles.count(),
      prisma.users.count(),
      prisma.categories.count()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      edge: true,
      database: {
        connected: true,
        info: Array.isArray(dbTest) ? dbTest[0] : { test: 1 },
        responseTime: `${responseTime}ms`
      },
      data: {
        articles: articlesResult.status === 'fulfilled' ? articlesResult.value : 0,
        users: usersResult.status === 'fulfilled' ? usersResult.value : 0,
        categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : 0
      },
      environment,
      performance: {
        responseTime: `${responseTime}ms`,
        cached: false,
        edge: true
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Response-Time': `${responseTime}ms`,
        'X-Edge-Location': environment.REGION,
        'X-Runtime': 'edge'
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
      return 'Ensure your database is running and accessible';
    default:
      return 'Check your database configuration and environment variables';
  }
}