import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getConnectionStats } from '@/lib/database-monitoring';

export const runtime = 'nodejs';

async function getDatabasePoolInfo() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        count(*)::int as total_connections,
        count(*) FILTER (WHERE state = 'active')::int as active_connections,
        count(*) FILTER (WHERE state = 'idle')::int as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction')::int as idle_in_transaction
      FROM pg_stat_activity 
      WHERE datname = current_database()
    ` as any[];
    
    return result[0];
  } catch (error) {
    return { error: 'فشل في جلب معلومات Pool' };
  }
}

export async function GET() {
  const startTime = Date.now();

  try {
    console.log('🏥 فحص شامل لحالة النظام...');

    // فحص الاتصال بقاعدة البيانات
    await prisma.$queryRaw`SELECT 1`;
    const queryTime = Date.now() - startTime;
    
    const poolInfo = await getDatabasePoolInfo();
    const connectionStats = getConnectionStats();
    
    // تحديد حالة النظام
    const isHealthy = connectionStats.successRate > 95 && connectionStats.averageResponseTime < 2000;
    const status = isHealthy ? 'healthy' : 'degraded';
    
    const healthData = {
      timestamp: new Date().toISOString(),
      status,
      services: {
        database: {
          status: 'connected',
          query_time: `${queryTime}ms`,
          pool_info: poolInfo,
          connection_stats: {
            total_requests: connectionStats.totalRequests,
            successful: connectionStats.successful,
            failed: connectionStats.failed,
            success_rate: connectionStats.successRate,
            avg_response_time: connectionStats.averageResponseTime,
            last_success: connectionStats.lastSuccess,
            last_error: connectionStats.lastError,
            slow_queries: connectionStats.slowQueries,
            recent_slow_queries: connectionStats.recentSlowQueries
          }
        },
        api: {
          status: 'operational',
          version: process.env.APP_VERSION || '1.0.0'
        }
      },
      system: {
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        uptime: `${Math.round(process.uptime())}s`,
        environment: process.env.NODE_ENV || 'development'
      },
      recommendations: [] as string[],
      response_time: `${Date.now() - startTime}ms`
    };

    // إضافة التوصيات بناءً على الأداء
    if (queryTime > 1000) {
      healthData.recommendations.push('Database query time is high - consider optimization');
    }
    
    if (poolInfo.active_connections && poolInfo.active_connections > 15) {
      healthData.recommendations.push('High number of active connections - monitor for leaks');
    }
    
    if (connectionStats.failed > 0) {
      healthData.recommendations.push(`${connectionStats.failed} database errors detected - check logs`);
    }

    if (connectionStats.slowQueries > 10) {
      healthData.recommendations.push(`${connectionStats.slowQueries} slow queries detected - optimize database`);
    }

    if (connectionStats.successRate < 95) {
      healthData.recommendations.push('Database success rate is below 95% - investigate connection issues');
    }

    console.log(`✅ فحص الصحة مكتمل في ${Date.now() - startTime}ms`);
    
    return NextResponse.json(healthData);
    
  } catch (error) {
    console.error('❌ خطأ في فحص الصحة:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      services: {
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      system: {
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        uptime: `${Math.round(process.uptime())}s`,
        environment: process.env.NODE_ENV || 'development'
      },
      response_time: `${Date.now() - startTime}ms`
    }, { status: 503 });
  }
}