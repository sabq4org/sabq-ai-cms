import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Ultra-fast environment check
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      RUNTIME: 'nodejs',
      REGION: process.env.VERCEL_REGION || 'unknown'
    };
    
    // Simple health check without database connection
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      runtime: 'nodejs',
      environment,
      performance: {
        responseTime: `${responseTime}ms`,
        cached: false
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Response-Time': `${responseTime}ms`,
        'X-Runtime': 'nodejs'
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Health check failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'unhealthy',
      error: errorMessage,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL
      },
      performance: {
        responseTime: `${responseTime}ms`
      },
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  }
}