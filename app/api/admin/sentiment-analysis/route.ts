/**
 * API نظام التحليل العاطفي للنصوص العربية
 * Arabic Sentiment Analysis API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import ArabicSentimentAnalysisService from '@/lib/modules/sentiment-analysis/service';
import { SentimentAnalysisRequest } from '@/lib/modules/sentiment-analysis/types';

const sentimentService = new ArabicSentimentAnalysisService();

/**
 * تحليل مشاعر النص
 * POST /api/admin/sentiment-analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body: SentimentAnalysisRequest = await request.json();

    // التحقق من صحة البيانات
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'النص مطلوب للتحليل' },
        { status: 400 }
      );
    }

    if (body.text.length > 5000) {
      return NextResponse.json(
        { error: 'النص طويل جداً. الحد الأقصى 5000 حرف' },
        { status: 400 }
      );
    }

    // تعيين القيم الافتراضية
    const analysisRequest: SentimentAnalysisRequest = {
      text: body.text.trim(),
      language: body.language || 'ar',
      context: body.context || {},
      options: {
        include_emotions: body.options?.include_emotions ?? true,
        include_keywords: body.options?.include_keywords ?? true,
        detailed_analysis: body.options?.detailed_analysis ?? false,
        language_detection: body.options?.language_detection ?? false,
        context_awareness: body.options?.context_awareness ?? false,
        real_time: body.options?.real_time ?? false,
        ...body.options
      }
    };

    // إجراء التحليل
    const result = await sentimentService.analyzeSentiment(analysisRequest);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'تم تحليل المشاعر بنجاح'
    });

  } catch (error) {
    console.error('خطأ في API تحليل المشاعر:', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في تحليل المشاعر',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

/**
 * الحصول على إحصائيات المشاعر
 * GET /api/admin/sentiment-analysis?action=statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'statistics') {
      const startDate = searchParams.get('start_date') 
        ? new Date(searchParams.get('start_date')!) 
        : undefined;
      
      const endDate = searchParams.get('end_date') 
        ? new Date(searchParams.get('end_date')!) 
        : undefined;
      
      const contentType = searchParams.get('content_type') || undefined;

      const statistics = await sentimentService.getSentimentStatistics(
        startDate,
        endDate,
        contentType
      );

      return NextResponse.json({
        success: true,
        data: statistics,
        message: 'تم جلب الإحصائيات بنجاح'
      });
    }

    // إذا لم يكن هناك action محدد، إرجاع معلومات عامة
    return NextResponse.json({
      success: true,
      data: {
        service_name: 'نظام التحليل العاطفي للنصوص العربية',
        version: '2.0.0',
        supported_languages: ['ar', 'ar-SA', 'ar-EG', 'ar-AE'],
        features: [
          'تحليل المشاعر الأساسي',
          'تحليل المشاعر التفصيلية',
          'استخراج الكلمات المفتاحية',
          'توقع استجابة القراء',
          'تحليل المحتوى الطويل',
          'الإحصائيات والتحليلات'
        ],
        supported_emotions: [
          'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
          'trust', 'anticipation', 'love', 'hate', 'pride', 'shame',
          'guilt', 'hope', 'despair', 'excitement', 'boredom',
          'confusion', 'relief', 'nostalgia'
        ]
      },
      message: 'نظام التحليل العاطفي جاهز للاستخدام'
    });

  } catch (error) {
    console.error('خطأ في API إحصائيات المشاعر:', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في جلب البيانات',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
