import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

interface SystemMetrics {
  timestamp: string;
  database: {
    query_performance: any;
    connection_pool: any;
    error_rates: any;
  };
  application: {
    memory_usage: any;
    response_times: any;
    uptime: number;
  };
  recommendations: string[];
}

class AutoReportGenerator {
  private metricsHistory: SystemMetrics[] = [];
  
  async generateDashboardData() {
    const now = new Date();
    const metrics = await this.collectMetrics();
    
    // إضافة للتاريخ
    this.metricsHistory.push(metrics);
    
    // الاحتفاظ بآخر 100 قياس فقط
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }
    
    return {
      current: metrics,
      trends: this.analyzeTrends(),
      alerts: this.generateAlerts(metrics),
      summary: this.generateSummary()
    };
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const startTime = Date.now();
    
    try {
      // قياس أداء قاعدة البيانات
      const dbMetrics = await this.measureDatabasePerformance();
      
      // معلومات التطبيق
      const appMetrics = this.measureApplicationPerformance();
      
      return {
        timestamp: new Date().toISOString(),
        database: dbMetrics,
        application: appMetrics,
        recommendations: await this.generateRecommendations(dbMetrics, appMetrics)
      };
      
    } catch (error) {
      console.error('❌ خطأ في جمع المؤشرات:', error);
      throw error;
    }
  }

  async measureDatabasePerformance() {
    const startTime = Date.now();
    
    // اختبار استعلام بسيط
    await prisma.$queryRaw`SELECT 1`;
    const queryTime = Date.now() - startTime;
    
    // معلومات Connection Pool
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*)::int as total_connections,
        count(*) FILTER (WHERE state = 'active')::int as active_connections,
        count(*) FILTER (WHERE state = 'idle')::int as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction')::int as idle_in_transaction,
        ROUND(AVG(EXTRACT(EPOCH FROM (now() - state_change))) * 1000)::int as avg_connection_age_ms
      FROM pg_stat_activity 
      WHERE datname = current_database()
    ` as any[];

    // اختبار استعلامات مختلفة
    const complexQueryStart = Date.now();
    try {
      await prisma.articles.findMany({
        take: 5,
        include: {
          category: true,
          author: true
        }
      });
    } catch (error) {
      console.warn('تحذير: فشل في الاستعلام المعقد');
    }
    const complexQueryTime = Date.now() - complexQueryStart;

    return {
      query_performance: {
        simple_query_time: queryTime,
        complex_query_time: complexQueryTime,
        avg_query_time: (queryTime + complexQueryTime) / 2
      },
      connection_pool: poolInfo[0] || {},
      error_rates: {
        connection_errors: 0, // سنتتبع هذا لاحقاً
        query_errors: 0,
        timeout_errors: 0
      }
    };
  }

  measureApplicationPerformance() {
    const memUsage = process.memoryUsage();
    
    return {
      memory_usage: {
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss_mb: Math.round(memUsage.rss / 1024 / 1024),
        external_mb: Math.round(memUsage.external / 1024 / 1024)
      },
      response_times: {
        // سنضيف هذا لاحقاً
        avg_response_time: 0,
        p95_response_time: 0,
        p99_response_time: 0
      },
      uptime: Math.round(process.uptime())
    };
  }

  async generateRecommendations(dbMetrics: any, appMetrics: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    // تحليل أداء قاعدة البيانات
    if (dbMetrics.query_performance.simple_query_time > 500) {
      recommendations.push('⚠️ أوقات الاستعلام مرتفعة - فحص الفهارس');
    }
    
    if (dbMetrics.connection_pool.active_connections > 15) {
      recommendations.push('🔗 عدد كبير من الاتصالات النشطة - مراجعة Connection Pool');
    }
    
    if (dbMetrics.connection_pool.idle_in_transaction > 0) {
      recommendations.push('⏱️ اتصالات معلقة في معاملات - فحص Transaction handling');
    }
    
    // تحليل أداء التطبيق
    if (appMetrics.memory_usage.heap_used_mb > 200) {
      recommendations.push('💾 استخدام ذاكرة مرتفع - مراجعة Memory leaks');
    }
    
    if (appMetrics.uptime < 3600) { // أقل من ساعة
      recommendations.push('🔄 إعادة تشغيل حديثة - راقب الاستقرار');
    }
    
    // توصيات عامة
    if (recommendations.length === 0) {
      recommendations.push('✅ الأداء جيد - استمر في المراقبة');
    }
    
    return recommendations;
  }

  analyzeTrends() {
    if (this.metricsHistory.length < 5) {
      return { status: 'insufficient_data', message: 'حاجة لمزيد من البيانات' };
    }
    
    const recent = this.metricsHistory.slice(-5);
    const queryTimes = recent.map(m => m.database.query_performance.simple_query_time);
    const memoryUsage = recent.map(m => m.application.memory_usage.heap_used_mb);
    
    // تحليل الاتجاه
    const queryTrend = this.calculateTrend(queryTimes);
    const memoryTrend = this.calculateTrend(memoryUsage);
    
    return {
      query_performance: {
        trend: queryTrend > 0 ? 'increasing' : queryTrend < 0 ? 'decreasing' : 'stable',
        change_percentage: Math.abs(queryTrend * 100)
      },
      memory_usage: {
        trend: memoryTrend > 0 ? 'increasing' : memoryTrend < 0 ? 'decreasing' : 'stable',
        change_percentage: Math.abs(memoryTrend * 100)
      }
    };
  }

  calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return (last - first) / first;
  }

  generateAlerts(metrics: SystemMetrics) {
    const alerts = [];
    
    // تنبيهات أداء قاعدة البيانات
    if (metrics.database.query_performance.simple_query_time > 1000) {
      alerts.push({
        level: 'critical',
        message: 'أوقات الاستعلام بطيئة جداً',
        value: `${metrics.database.query_performance.simple_query_time}ms`
      });
    }
    
    if (metrics.database.connection_pool.active_connections > 20) {
      alerts.push({
        level: 'warning',
        message: 'عدد كبير من الاتصالات النشطة',
        value: metrics.database.connection_pool.active_connections
      });
    }
    
    // تنبيهات أداء التطبيق
    if (metrics.application.memory_usage.heap_used_mb > 300) {
      alerts.push({
        level: 'warning',
        message: 'استخدام ذاكرة مرتفع',
        value: `${metrics.application.memory_usage.heap_used_mb}MB`
      });
    }
    
    return alerts;
  }

  generateSummary() {
    if (this.metricsHistory.length === 0) {
      return { status: 'no_data' };
    }
    
    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const healthScore = this.calculateHealthScore(latest);
    
    return {
      health_score: healthScore,
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'poor',
      total_checks: this.metricsHistory.length,
      last_check: latest.timestamp,
      uptime: latest.application.uptime
    };
  }

  calculateHealthScore(metrics: SystemMetrics): number {
    let score = 100;
    
    // خصم نقاط بناءً على الأداء
    if (metrics.database.query_performance.simple_query_time > 500) score -= 20;
    if (metrics.database.query_performance.simple_query_time > 1000) score -= 20;
    if (metrics.database.connection_pool.active_connections > 15) score -= 15;
    if (metrics.application.memory_usage.heap_used_mb > 200) score -= 15;
    if (metrics.application.memory_usage.heap_used_mb > 300) score -= 15;
    
    return Math.max(0, score);
  }

  async saveReport(data: any) {
    const reportsDir = path.join(process.cwd(), 'reports');
    
    try {
      await fs.mkdir(reportsDir, { recursive: true });
      
      const filename = `system-report-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(reportsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      
      console.log(`📊 تقرير محفوظ: ${filepath}`);
    } catch (error) {
      console.error('❌ فشل في حفظ التقرير:', error);
    }
  }
}

const reportGenerator = new AutoReportGenerator();

export async function GET() {
  try {
    console.log('📊 إنشاء تقرير شامل للنظام...');
    
    const dashboardData = await reportGenerator.generateDashboardData();
    
    // حفظ التقرير
    await reportGenerator.saveReport(dashboardData);
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    
    switch (type) {
      case 'performance_analysis':
        // تشغيل تحليل أداء مفصل
        const analysis = await reportGenerator.generateDashboardData();
        return NextResponse.json({ type: 'performance', data: analysis });
        
      case 'health_check':
        // فحص صحة سريع
        const health = await reportGenerator.collectMetrics();
        return NextResponse.json({ type: 'health', data: health });
        
      default:
        return NextResponse.json({ error: 'نوع تقرير غير مدعوم' }, { status: 400 });
    }
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}
