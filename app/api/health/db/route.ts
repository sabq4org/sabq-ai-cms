import { NextResponse } from 'next/server'
import dbConnectionManager from '@/lib/db-connection-manager'
import { getCacheInfo } from '@/lib/services/categoriesCache'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('🏥 فحص صحة قاعدة البيانات...')
  
  try {
    // فحص الاتصال المباشر
    const startTime = Date.now()
    let dbConnected = false
    let queryTime = 0
    
    try {
      await prisma.$queryRaw`SELECT 1 as health_check`
      dbConnected = true
      queryTime = Date.now() - startTime
    } catch (error) {
      console.error('❌ فشل فحص الاتصال المباشر:', error)
    }
    
    // جلب إحصائيات الاتصال
    const connectionStats = dbConnectionManager.getStats()
    
    // جلب معلومات cache التصنيفات
    const categoriesCache = getCacheInfo()
    
    // تحديد الحالة الصحية العامة
    const isHealthy = dbConnected && connectionStats.currentStatus === 'connected'
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        responseTime: queryTime,
        connectionStatus: connectionStats.currentStatus,
        lastCheck: connectionStats.lastCheck,
        lastSuccess: connectionStats.lastSuccess,
        lastError: connectionStats.lastError,
        successCount: connectionStats.successCount,
        errorCount: connectionStats.errorCount,
        uptimePercent: connectionStats.uptimePercent,
        errorDetails: connectionStats.errorDetails
      },
      cache: {
        categories: {
          count: categoriesCache.count,
          lastUpdated: categoriesCache.lastUpdated,
          ageInSeconds: categoriesCache.ageInSeconds,
          isStale: categoriesCache.isStale,
          isExpired: categoriesCache.isExpired,
          isInGracePeriod: categoriesCache.isInGracePeriod
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? '✅ محدد' : '❌ غير محدد',
        memory: process.memoryUsage()
      }
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy'
      }
    })
  } catch (error: any) {
    console.error('❌ خطأ في فحص الصحة:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error',
      database: {
        connected: false,
        connectionStatus: 'error'
      }
    }, { status: 500 })
  }
} 