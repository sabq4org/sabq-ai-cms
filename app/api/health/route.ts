import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export async function GET() {
  const start = Date.now();

  // معلومات النظام الأساسية
  const mem = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : ({} as any);
  const used = mem && mem.rss ? formatBytes(mem.rss) : 'n/a';
  const total = mem && mem.heapTotal ? formatBytes(mem.heapTotal) : 'n/a';
  const uptimeSec = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0;

  // حمولة افتراضية متوافقة مع لوحة الصحة
  const payload = {
    timestamp: new Date().toISOString(),
    status: 'healthy' as const,
    services: {
      database: {
        status: 'unknown',
        query_time: '0ms',
        pool_info: {
          total_connections: 0,
          active_connections: 0,
          idle_connections: 0,
          idle_in_transaction: 0,
        },
        connection_stats: {
          total_requests: 0,
          successful: 0,
          failed: 0,
          success_rate: 100,
          avg_response_time: 0,
          last_success: null as string | null,
          last_error: null as string | null,
          slow_queries: 0,
          recent_slow_queries: [] as any[],
        },
      },
      api: {
        status: 'ok',
        version: '1.0.0',
      },
    },
    system: {
      memory: {
        used,
        total,
      },
      uptime: `${Math.floor(uptimeSec)}s`,
      environment: process.env.NODE_ENV || 'production',
    },
    recommendations: [] as string[],
    response_time: `${Date.now() - start}ms`,
  };

  const res = NextResponse.json(payload);
  // لا تقم بتخزين فحص الصحة
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
}

// ملاحظة: تم توحيد الاستجابة أعلاه لتفادي التعارُض أثناء البناء