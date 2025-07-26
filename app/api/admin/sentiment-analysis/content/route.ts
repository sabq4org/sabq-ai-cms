/**
 * API تحليل مشاعر المحتوى
 * Content Sentiment Analysis API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import ArabicSentimentAnalysisService from '@/lib/modules/sentiment-analysis/service';

const sentimentService = new ArabicSentimentAnalysisService();

/**
 * تحليل مشاعر المحتوى (مقال، تعليق، إلخ)
 * POST /api/admin/sentiment-analysis/content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // التحقق من صحة البيانات
    if (!body.content_id) {
      return NextResponse.json(
        { error: 'معرف المحتوى مطلوب' },
        { status: 400 }
      );
    }

    if (!body.content_type) {
      return NextResponse.json(
        { error: 'نوع المحتوى مطلوب' },
        { status: 400 }
      );
    }

    if (!body.body && !body.title) {
      return NextResponse.json(
        { error: 'العنوان أو المحتوى مطلوب للتحليل' },
        { status: 400 }
      );
    }

    // تحليل مشاعر المحتوى
    const result = await sentimentService.analyzeContentSentiment(
      body.content_id,
      body.content_type,
      body.title,
      body.body
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'تم تحليل مشاعر المحتوى بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تحليل مشاعر المحتوى:', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في تحليل مشاعر المحتوى',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

/**
 * الحصول على تحليل مشاعر المحتوى
 * GET /api/admin/sentiment-analysis/content?content_id=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('content_id');

    if (!contentId) {
      return NextResponse.json(
        { error: 'معرف المحتوى مطلوب' },
        { status: 400 }
      );
    }

    // جلب تحليل المشاعر من قاعدة البيانات
    // هنا يمكن إضافة استعلام للحصول على التحليل المحفوظ
    
    return NextResponse.json({
      success: true,
      data: {
        message: `سيتم جلب تحليل مشاعر المحتوى ${contentId}`
      },
      message: 'تم العثور على تحليل المشاعر'
    });

  } catch (error) {
    console.error('خطأ في جلب تحليل مشاعر المحتوى:', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في جلب تحليل مشاعر المحتوى',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
