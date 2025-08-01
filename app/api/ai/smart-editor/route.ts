import { NextRequest, NextResponse } from 'next/server';
import { generateAllAIContent } from '@/lib/services/ai-content-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 بدء المحرر الذكي...');
    
    const body = await request.json();
    const { action, content, title } = body;
    
    // التحقق من البيانات المطلوبة
    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'المحتوى مطلوب'
        },
        { status: 400 }
      );
    }
    
    // التحقق من الحد الأدنى لطول المحتوى
    if (content.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'المحتوى قصير جداً للمعالجة الذكية'
        },
        { status: 400 }
      );
    }
    
    console.log(`📝 معالجة المحتوى: ${content.length} حرف`);
    console.log(`🎯 الإجراءات المطلوبة: ${action.join(', ')}`);
    
    // توليد المحتوى الذكي الكامل
    const aiContent = await generateAllAIContent({
      title: title || 'مقال جديد',
      content: content
    });
    
    // تحضير النتيجة حسب الإجراءات المطلوبة
    const result: any = {
      success: true,
      generated_at: new Date().toISOString(),
      processing_time: Date.now()
    };
    
    // توليد العنوان إذا لم يكن موجوداً أو تم طلبه
    if (action.includes('generate_title') || !title) {
      result.title = await generateSmartTitle(content);
    }
    
    // إضافة الملخص
    if (action.includes('create_summary')) {
      result.summary = aiContent.summary;
    }
    
    // إضافة الكلمات المفتاحية
    if (action.includes('generate_keywords')) {
      result.keywords = aiContent.tags;
    }
    
    // إضافة الاقتباسات
    if (action.includes('generate_quotes')) {
      result.quotes = aiContent.quotes;
    }
    
    // إضافة معلومات إضافية مفيدة
    result.reading_time = aiContent.readingTime;
    result.ai_score = aiContent.aiScore;
    result.word_count = content.split(/\s+/).filter(word => word.length > 0).length;
    
    // حساب وقت المعالجة
    result.processing_time = Date.now() - result.processing_time;
    
    console.log(`✅ تم توليد المحتوى الذكي بنجاح في ${result.processing_time}ms`);
    console.log(`📊 النتائج: عنوان=${!!result.title}, ملخص=${!!result.summary}, كلمات=${result.keywords?.length || 0}, اقتباسات=${result.quotes?.length || 0}`);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ خطأ في المحرر الذكي:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ في معالجة المحتوى الذكي',
        details: error?.message || 'خطأ غير معروف',
        fallback: {
          title: 'مقال جديد',
          summary: 'ملخص تلقائي للمقال',
          keywords: ['عام', 'مقال'],
          quotes: [],
          reading_time: Math.ceil((request.body ? JSON.parse(await request.text()).content : '').split(' ').length / 225) || 1,
          ai_score: 50
        }
      },
      { status: 500 }
    );
  }
}

/**
 * توليد عنوان ذكي للمقال
 */
async function generateSmartTitle(content: string): Promise<string> {
  try {
    // استخراج أول جملة أو فقرة للعنوان
    const firstSentence = content
      .replace(/<[^>]*>/g, ' ') // إزالة HTML
      .split(/[.!?؟]/)
      .filter(s => s.trim().length > 10)
      [0]?.trim();
    
    if (firstSentence && firstSentence.length < 100) {
      return firstSentence;
    }
    
    // إذا كان النص طويل، خذ أول 50 كلمة
    const words = content
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .slice(0, 15)
      .join(' ');
    
    return words + (words.length < content.length ? '...' : '');
    
  } catch (error) {
    console.error('خطأ في توليد العنوان:', error);
    return 'مقال جديد';
  }
}