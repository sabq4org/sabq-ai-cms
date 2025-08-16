// API لتتبع جلسات القراءة - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { ReadingBehaviorAnalyzer, ReadingBehaviorSchema } from '@/lib/tracking/reading-behavior';
import { ContextDataCollector } from '@/lib/tracking/context-collector';
import { authMiddleware } from '@/lib/auth/middleware';
import { SecurityManager } from '@/lib/auth/user-management';
import { z } from 'zod';

// Schema للتحقق من بيانات جلسة القراءة
const ReadingSessionRequestSchema = z.object({
  reading_data: ReadingBehaviorSchema,
  context: z.any().optional(),
  metadata: z.object({
    article_word_count: z.number().optional(),
    article_category: z.string().optional(),
    content_language: z.string().optional(),
    reading_format: z.enum(['article', 'news', 'opinion', 'analysis']).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // التحقق من Rate Limiting
    const clientId = SecurityManager.cleanIpAddress(request as any);
    const isAllowed = checkReadingSessionRateLimit(clientId);
    
    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز الحد المسموح لجلسات القراءة',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '300' // 5 دقائق
          }
        }
      );
    }

    // قراءة وتحليل البيانات
    const body = await request.json();
    const validationResult = ReadingSessionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn('📚 بيانات جلسة قراءة غير صحيحة:', validationResult.error.format());
      
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات جلسة القراءة غير صحيحة',
          details: validationResult.error.format(),
          code: 'INVALID_READING_DATA'
        },
        { status: 400 }
      );
    }

    const { reading_data, context, metadata } = validationResult.data;

    // التحقق من المصادقة (اختياري)
    const authResult = await authMiddleware(request);
    const userId = authResult.success ? authResult.user?.id : null;

    // إضافة معرف المستخدم إلى بيانات القراءة
    if (userId) {
      reading_data.user_id = userId;
    }

    // جمع بيانات السياق
    const contextResult = await ContextDataCollector.collectContextData(
      request,
      reading_data.session_id,
      userId,
      context
    );

    // إثراء بيانات القراءة ببيانات السياق
    if (contextResult.success && contextResult.contextData) {
      const contextData = contextResult.contextData;
      
      // إضافة معلومات الجهاز
      if (contextData.device) {
        reading_data.device_orientation = contextData.device.orientation;
        
        if (!reading_data.reading_environment) {
          reading_data.reading_environment = {};
        }
      }

      // إضافة معلومات الأداء إذا كانت متوفرة
      if (contextData.performance) {
        reading_data.reading_environment = {
          ...reading_data.reading_environment,
          page_load_time: contextData.performance.page_load_time
        };
      }

      // إضافة تفضيلات المستخدم
      if (contextData.user_preferences) {
        reading_data.reading_environment = {
          ...reading_data.reading_environment,
          theme: contextData.user_preferences.theme,
          font_size: contextData.user_preferences.font_size
        };
      }
    }

    // تحليل وحفظ جلسة القراءة
    const analysisResult = await ReadingBehaviorAnalyzer.recordReadingSession(reading_data);

    if (!analysisResult.success) {
      console.error('❌ فشل في تسجيل جلسة القراءة:', analysisResult.error);
      
      return NextResponse.json(
        {
          success: false,
          error: analysisResult.error,
          code: 'RECORDING_FAILED'
        },
        { status: 500 }
      );
    }

    // إضافة تحليلات إضافية
    const additionalInsights = await generateAdditionalInsights(
      reading_data,
      analysisResult.insights,
      metadata
    );

    const processingTime = Date.now() - startTime;

    // تسجيل نشاط القراءة
    await logReadingActivity(userId, reading_data.session_id, {
      article_id: reading_data.article_id,
      duration: reading_data.duration_seconds,
      read_percentage: reading_data.read_percentage,
      quality_score: analysisResult.insights?.reading_quality?.quality_score,
      processing_time: processingTime,
      client_ip: clientId
    });

    console.log(`📖 تم تسجيل جلسة قراءة: ${reading_data.session_id} (${processingTime}ms)`);

    // الاستجابة مع التحليلات
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل جلسة القراءة بنجاح',
      session_id: reading_data.session_id,
      insights: {
        ...analysisResult.insights,
        ...additionalInsights
      },
      performance: {
        processing_time_ms: processingTime,
        data_points_processed: Object.keys(reading_data).length
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingTime.toString()
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ خطأ في API تتبع جلسة القراءة:', error);

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

// API للحصول على تحليل سلوك القراءة للمستخدم
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
    const timeRange = url.searchParams.get('time_range') || '7d';
    const includeDetails = url.searchParams.get('include_details') === 'true';

    // حساب النطاق الزمني
    const now = new Date();
    const timeRanges: Record<string, Date> = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };

    const fromDate = timeRanges[timeRange] || timeRanges['7d'];

    // الحصول على التحليل
    const analysisResult = await ReadingBehaviorAnalyzer.getUserReadingAnalysis(
      authResult.user!.id,
      { from: fromDate, to: now }
    );

    if (!analysisResult.success) {
      return NextResponse.json(
        { success: false, error: analysisResult.error },
        { status: 500 }
      );
    }

    // إضافة إحصائيات إضافية
    const enhancedAnalysis = {
      ...analysisResult.analysis,
      time_range: {
        from: fromDate.toISOString(),
        to: now.toISOString(),
        period: timeRange
      },
      user_profile: await getUserReadingProfile(authResult.user!.id),
      recommendations: await generateReadingRecommendations(analysisResult.analysis)
    };

    // إزالة التفاصيل الحساسة إذا لم يطلبها المستخدم
    if (!includeDetails) {
      delete enhancedAnalysis.detailed_sessions;
      delete enhancedAnalysis.raw_data;
    }

    return NextResponse.json({
      success: true,
      analysis: enhancedAnalysis,
      generated_at: now.toISOString()
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب تحليل سلوك القراءة:', error);
    
    return NextResponse.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

// Rate Limiting لجلسات القراءة
const readingSessionLimits = new Map<string, { count: number; resetTime: number }>();

function checkReadingSessionRateLimit(clientId: string, maxSessions: number = 20, windowMs: number = 300000): boolean {
  const now = Date.now();
  const clientData = readingSessionLimits.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    readingSessionLimits.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientData.count >= maxSessions) {
    return false;
  }

  clientData.count++;
  return true;
}

// توليد تحليلات إضافية
async function generateAdditionalInsights(
  readingData: any,
  baseInsights: any,
  metadata?: any
): Promise<any> {
  const insights: any = {};

  // تحليل جودة المحتوى بناءً على السلوك
  if (readingData.read_percentage > 80 && readingData.duration_seconds > 60) {
    insights.content_quality_indicator = 'high_engagement';
  } else if (readingData.read_percentage < 25 || readingData.duration_seconds < 15) {
    insights.content_quality_indicator = 'low_engagement';
  } else {
    insights.content_quality_indicator = 'medium_engagement';
  }

  // تحليل نمط القراءة المفضل
  const hour = new Date(readingData.started_at).getHours();
  insights.reading_time_preference = {
    hour: hour,
    period: getTimePeriod(hour),
    is_typical: isTypicalReadingTime(hour)
  };

  // تحليل مستوى التركيز
  if (readingData.pause_points && readingData.pause_points.length > 0) {
    const longPauses = readingData.pause_points.filter((p: any) => p.duration_ms > 3000);
    insights.focus_analysis = {
      pause_count: readingData.pause_points.length,
      long_pause_count: longPauses.length,
      focus_level: longPauses.length > 3 ? 'thoughtful' : longPauses.length > 0 ? 'focused' : 'quick'
    };
  }

  // مقارنة بالمتوسط العام (تقديري)
  insights.compared_to_average = {
    reading_speed: baseInsights?.reading_style?.reading_speed_wpm > 200 ? 'above_average' : 'below_average',
    engagement: baseInsights?.engagement_level?.engagement_score > 60 ? 'above_average' : 'below_average',
    thoroughness: readingData.read_percentage > 70 ? 'thorough' : 'skimming'
  };

  return insights;
}

// الحصول على ملف المستخدم القرائي
async function getUserReadingProfile(userId: string): Promise<any> {
  try {
    // يمكن توسيعه للحصول على بيانات أكثر تفصيلاً
    return {
      reader_type: 'متنوع', // يمكن حسابه من السجلات
      preferred_time: 'المساء',
      average_session_duration: 180, // ثانية
      reading_streak: 5, // أيام متتالية
      total_articles_read: 50
    };
  } catch (error) {
    console.error('⚠️ فشل في جلب ملف المستخدم القرائي:', error);
    return null;
  }
}

// توليد توصيات القراءة
async function generateReadingRecommendations(analysis: any): Promise<string[]> {
  const recommendations = [];

  if (analysis && analysis.average_read_percentage < 50) {
    recommendations.push('حاول قراءة المقالات كاملة للحصول على فهم أعمق');
  }

  if (analysis && analysis.average_session_duration < 60) {
    recommendations.push('امنح نفسك وقتاً أطول لتذوق المحتوى');
  }

  if (analysis && analysis.reading_consistency < 30) {
    recommendations.push('حاول القراءة بانتظام يومي لتطوير عادة القراءة');
  }

  if (recommendations.length === 0) {
    recommendations.push('أداءك في القراءة ممتاز! استمر على هذا المنوال');
  }

  return recommendations;
}

// تسجيل نشاط القراءة
async function logReadingActivity(
  userId: string | null,
  sessionId: string,
  metadata: any
): Promise<void> {
  try {
    console.log(`📚 نشاط قراءة: جلسة ${sessionId}, مقال ${metadata.article_id}, مدة ${metadata.duration}s`);
    
    // يمكن حفظ الإحصائيات في جدول منفصل للتحليل
    
  } catch (error) {
    console.error('⚠️ فشل في تسجيل نشاط القراءة:', error);
  }
}

// دوال مساعدة
function getTimePeriod(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function isTypicalReadingTime(hour: number): boolean {
  // أوقات القراءة الشائعة: صباحاً (8-11) أو مساءً (19-22)
  return (hour >= 8 && hour <= 11) || (hour >= 19 && hour <= 22);
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
