// API لتتبع تفاعلات المستخدم - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserInteractionTracker, InteractionEventSchema } from '@/lib/tracking/user-interactions';
import { ContextDataCollector } from '@/lib/tracking/context-collector';
import { authMiddleware } from '@/lib/auth/middleware';
import { SecurityManager } from '@/lib/auth/user-management';
import { z } from 'zod';

// Schema للتحقق من بيانات التفاعل
const TrackingRequestSchema = z.object({
  events: z.array(InteractionEventSchema).min(1, 'يجب تقديم حدث واحد على الأقل'),
  session_id: z.string().min(1, 'معرف الجلسة مطلوب'),
  context: z.any().optional(), // بيانات السياق الإضافية
  batch_id: z.string().optional() // معرف المجموعة للمعالجة المجمعة
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // التحقق من Rate Limiting للحماية من الإفراط
    const clientId = SecurityManager.cleanIpAddress(request as any);
    const isAllowed = checkRateLimit(clientId);
    
    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز الحد المسموح للطلبات',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    // قراءة وتحليل البيانات
    const body = await request.json();
    const validationResult = TrackingRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn('📝 بيانات تتبع غير صحيحة:', validationResult.error.format());
      
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: validationResult.error.format(),
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }

    const { events, session_id, context, batch_id } = validationResult.data;

    // التحقق من المصادقة (اختياري للتفاعلات المجهولة)
    const authResult = await authMiddleware(request);
    const userId = authResult.success ? authResult.user?.id : null;

    // جمع بيانات السياق
    const contextResult = await ContextDataCollector.collectContextData(
      request,
      session_id,
      userId,
      context
    );

    if (!contextResult.success) {
      console.warn('⚠️ فشل في جمع بيانات السياق:', contextResult.error);
    }

    // معالجة الأحداث
    const processingResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const event of events) {
      try {
        // إضافة بيانات السياق لكل حدث
        const enrichedEvent = {
          ...event,
          context: {
            ...event.context,
            ...contextResult.contextData?.app_context,
            device_type: contextResult.contextData?.device.type,
            ip_address: contextResult.contextData?.network?.ip_address,
            user_agent: request.headers.get('user-agent')
          }
        };

        // تتبع التفاعل
        const result = await UserInteractionTracker.trackInteraction(
          userId,
          enrichedEvent,
          request
        );

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ فشل في تتبع التفاعل: ${event.interaction_type}`, result.error);
        }

        processingResults.push({
          event_type: event.interaction_type,
          article_id: event.article_id,
          success: result.success,
          error: result.error
        });

      } catch (error: any) {
        errorCount++;
        console.error('❌ خطأ في معالجة حدث التفاعل:', error);
        
        processingResults.push({
          event_type: event.interaction_type,
          article_id: event.article_id,
          success: false,
          error: error.message
        });
      }
    }

    // إحصائيات الأداء
    const processingTime = Date.now() - startTime;

    // تسجيل نشاط التتبع
    await logTrackingActivity(userId, session_id, {
      events_count: events.length,
      success_count: successCount,
      error_count: errorCount,
      processing_time: processingTime,
      batch_id,
      client_ip: clientId,
      user_agent: request.headers.get('user-agent')
    });

    // الاستجابة
    const response = {
      success: true,
      message: `تم معالجة ${successCount} من ${events.length} حدث بنجاح`,
      summary: {
        total_events: events.length,
        successful: successCount,
        failed: errorCount,
        processing_time_ms: processingTime,
        session_id: session_id,
        batch_id: batch_id
      },
      results: processingResults.length <= 10 ? processingResults : undefined // إخفاء التفاصيل للمجموعات الكبيرة
    };

    console.log(`📊 تم معالجة ${events.length} حدث تفاعل في ${processingTime}ms`);

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingTime.toString()
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ خطأ في API تتبع التفاعلات:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم',
        code: 'INTERNAL_ERROR',
        processing_time_ms: processingTime
      },
      { status: 500 }
    );
  }
}

// API للحصول على إحصائيات التفاعل
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const articleId = url.searchParams.get('article_id');
    const timeRange = url.searchParams.get('time_range') || '24h';

    // حساب النطاق الزمني
    const now = new Date();
    const timeRanges: Record<string, Date> = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };

    const fromDate = timeRanges[timeRange] || timeRanges['24h'];

    // الحصول على الإحصائيات
    const stats = await UserInteractionTracker.getInteractionStats(
      articleId || undefined,
      authResult.user?.id,
      { from: fromDate, to: now }
    );

    if (!stats.success) {
      return NextResponse.json(
        { success: false, error: stats.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: stats.stats,
      time_range: timeRange,
      query_params: {
        article_id: articleId,
        user_id: authResult.user?.id,
        from: fromDate.toISOString(),
        to: now.toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب إحصائيات التفاعل:', error);
    
    return NextResponse.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

// Rate Limiting بسيط
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientData.count >= maxRequests) {
    return false;
  }

  clientData.count++;
  return true;
}

// تسجيل نشاط التتبع
async function logTrackingActivity(
  userId: string | null,
  sessionId: string,
  metadata: any
): Promise<void> {
  try {
    // يمكن تسجيل الأنشطة في جدول منفصل أو activity_logs
    console.log(`📝 نشاط تتبع: جلسة ${sessionId}, مستخدم ${userId || 'مجهول'}, ${metadata.events_count} حدث`);
    
  } catch (error) {
    console.error('⚠️ فشل في تسجيل نشاط التتبع:', error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    }
  });
}
