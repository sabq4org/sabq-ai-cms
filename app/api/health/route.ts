import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // فحص قاعدة البيانات
    const dbCheck = await prisma.$queryRaw`SELECT 1 as status`;
    const dbResponseTime = Date.now() - startTime;
    
    // فحص العمليات الأساسية
    const checks = {
      database: {
        status: 'healthy',
        responseTime: dbResponseTime,
        connection: 'active'
      },
      application: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      apis: {
        status: 'healthy',
        endpoints: [
          '/api/auth/login',
          '/api/articles',
          '/api/interactions',
          '/api/user/likes',
          '/api/user/saved'
        ]
      },
      smartSystems: {
        status: 'healthy',
        components: [
          'SimpleInteractionButtons',
          'SmartRecommendations', 
          'IntelligentNotifications',
          'UserProfileDashboard',
          'PersonalizationSettings',
          'AdminControlPanel',
          'AnalyticsDashboard',
          'ContentManagement',
          'RealTimeUpdates'
        ]
      }
    };

    // إحصائيات سريعة
    const stats = await getSystemStats();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      stats,
      responseTime: Date.now() - startTime
    };

    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: { status: 'error' },
        application: { status: 'error' }
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

async function getSystemStats() {
  try {
    // إحصائيات قاعدة البيانات
    const [
      articlesCount,
      usersCount,
      interactionsCount,
      commentsCount
    ] = await Promise.all([
      prisma.articles.count(),
      prisma.users.count(),
      prisma.interactions?.count() || 0,
      prisma.comments?.count() || 0
    ]);

    return {
      articles: articlesCount,
      users: usersCount,
      interactions: interactionsCount,
      comments: commentsCount,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      error: 'Unable to fetch stats'
    };
  }
}