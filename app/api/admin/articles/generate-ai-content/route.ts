import { NextRequest, NextResponse } from 'next/server';
import { generateAllAIContent } from '@/lib/services/ai-content-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 بدء توليد المحتوى الذكي للمقال...');
    
    const body = await request.json();
    const { title, content } = body;
    
    // التحقق من البيانات المطلوبة
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'العنوان والمحتوى مطلوبان'
        },
        { status: 400 }
      );
    }
    
    // التحقق من الحد الأدنى لطول المحتوى
    if (content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'المحتوى قصير جداً لتوليد محتوى ذكي مفيد'
        },
        { status: 400 }
      );
    }
    
    // توليد المحتوى الذكي
    const aiContent = await generateAllAIContent({
      title,
      content
    });
    
    console.log(`✅ تم توليد المحتوى الذكي بنجاح:
    - الملخص: ${aiContent.summary.length} حرف
    - الاقتباسات: ${aiContent.quotes.length} اقتباس
    - الكلمات المفتاحية: ${aiContent.tags.length} كلمة
    - وقت القراءة: ${aiContent.readingTime} دقيقة
    - النقاط: ${aiContent.aiScore}/100`);
    
    return NextResponse.json({
      success: true,
      content: aiContent,
      message: 'تم توليد المحتوى الذكي بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في توليد المحتوى الذكي:', error);
    
    // إرجاع محتوى افتراضي في حالة الخطأ
    const fallbackContent = {
      summary: `ملخص تلقائي: ${request.body ? JSON.parse(await request.text()).title : 'مقال جديد'}`,
      quotes: [],
      readingTime: 5,
      tags: [],
      aiScore: 50
    };
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ في توليد المحتوى الذكي',
        details: error?.message || 'خطأ غير معروف',
        fallback: fallbackContent
      },
      { status: 500 }
    );
  }
}