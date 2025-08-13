/**
 * API لتسجيل تفاعلات Word Cloud
 * Word Cloud Analytics Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { WordAnalytics } from '@/types/word-cloud';

// قاعدة بيانات مؤقتة في الذاكرة (يفضل استخدام قاعدة بيانات حقيقية)
const analyticsStore: WordAnalytics[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من صحة البيانات
    if (!body.wordId || !body.clickedAt) {
      return NextResponse.json(
        { error: 'مطلوب wordId و clickedAt' },
        { status: 400 }
      );
    }

    const analytics: WordAnalytics = {
      wordId: body.wordId,
      clickedAt: body.clickedAt,
      userAgent: body.userAgent || request.headers.get('user-agent') || '',
      source: body.source || 'word-cloud'
    };

    // حفظ البيانات (في قاعدة بيانات حقيقية)
    analyticsStore.push(analytics);
    
    // يمكن أيضاً إرسال البيانات لـ Google Analytics أو أي أداة تحليل أخرى
    // await sendToGoogleAnalytics(analytics);

    console.log('Word click tracked:', analytics);

    return NextResponse.json(
      { success: true, message: 'تم تسجيل التفاعل بنجاح' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('خطأ في تسجيل تفاعل الكلمة:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('wordId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let results = analyticsStore;

    // تصفية حسب الكلمة إذا تم تحديدها
    if (wordId) {
      results = results.filter(item => item.wordId === wordId);
    }

    // ترتيب حسب الوقت (الأحدث أولاً)
    results = results
      .sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length
    });

  } catch (error) {
    console.error('خطأ في استرجاع تحليلات الكلمات:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// دالة مساعدة لإرسال البيانات لـ Google Analytics (اختيارية)
async function sendToGoogleAnalytics(analytics: WordAnalytics) {
  // تنفيذ إرسال البيانات لـ Google Analytics
  // يمكن استخدام gtag أو measurement protocol
  
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'word_cloud_click', {
        custom_parameter_1: analytics.wordId,
        custom_parameter_2: analytics.source,
      });
    }
  } catch (error) {
    console.warn('فشل في إرسال البيانات لـ Google Analytics:', error);
  }
}
