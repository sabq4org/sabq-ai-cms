import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // فحص الاتصال الأساسي
    const basicCheck = await prisma.$queryRaw`SELECT 1 as test`;
    const basicResponseTime = Date.now() - startTime;

    // فحص الجداول الأساسية
    const tablesCheckStart = Date.now();
    const tablesExist = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) FROM articles LIMIT 1`,
      prisma.$queryRaw`SELECT COUNT(*) FROM users LIMIT 1`,
      prisma.$queryRaw`SELECT COUNT(*) FROM categories LIMIT 1`
    ]);
    const tablesResponseTime = Date.now() - tablesCheckStart;

    // إحصائيات قاعدة البيانات
    const statsStart = Date.now();
    const [
      articlesCount,
      usersCount, 
      categoriesCount,
      interactionsCount
    ] = await Promise.all([
      prisma.articles.count(),
      prisma.users.count(),
      prisma.categories.count(),
      prisma.interactions?.count().catch(() => 0) || 0
    ]);
    const statsResponseTime = Date.now() - statsStart;

    // معلومات قاعدة البيانات
    const dbInfo = await prisma.$queryRaw`
      SELECT version() as version, 
             current_database() as database_name,
             current_user as current_user
    ` as any[];

    const totalResponseTime = Date.now() - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connection: {
        status: 'connected',
        responseTime: basicResponseTime
      },
      database: {
        name: dbInfo[0]?.database_name || 'unknown',
        version: dbInfo[0]?.version || 'unknown',
        user: dbInfo[0]?.current_user || 'unknown'
      },
      tables: {
        status: 'accessible',
        responseTime: tablesResponseTime,
        checked: ['articles', 'users', 'categories']
      },
      statistics: {
        articles: articlesCount,
        users: usersCount,
        categories: categoriesCount,
        interactions: interactionsCount,
        responseTime: statsResponseTime
      },
      performance: {
        totalResponseTime,
        status: totalResponseTime < 1000 ? 'good' : totalResponseTime < 3000 ? 'acceptable' : 'slow'
      }
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed',
      connection: {
        status: 'failed'
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  }
}
