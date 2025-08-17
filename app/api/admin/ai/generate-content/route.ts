import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import { generateAllAIContent } from '@/lib/services/ai-content-service';
import { getOpenAIKey } from '@/lib/openai-config';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await requireAuthFromRequest(request);
    
    if (!authResult || authResult.error) {
      console.error('🚫 محاولة وصول غير مصرح بها للتوليد التلقائي');
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون محرر أو أدمن)
    if (!user.roles?.includes('admin') && !user.roles?.includes('editor') && !user.roles?.includes('author')) {
      console.error('🚫 المستخدم ليس لديه صلاحيات التوليد:', user.email);
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لاستخدام التوليد التلقائي' },
        { status: 403 }
      );
    }

    console.log('🤖 بدء التوليد التلقائي للمستخدم:', user.email);
    
    const body = await request.json();
    const { content } = body;
    
    // التحقق من وجود المحتوى
    if (!content) {
      return NextResponse.json(
        { error: 'المحتوى مطلوب للتوليد التلقائي' },
        { status: 400 }
      );
    }
    
    // التحقق من طول المحتوى
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'المحتوى قصير جداً. يجب أن يكون 50 حرفاً على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من وجود مفتاح OpenAI
    const apiKey = await getOpenAIKey();
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { 
          error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً',
          details: 'يرجى التواصل مع المسؤول لتفعيل خدمة OpenAI'
        },
        { status: 503 }
      );
    }

    console.log('📝 محتوى للتوليد:', { 
      length: content.length, 
      preview: content.substring(0, 100) + '...' 
    });
    
    try {
      // توليد المحتوى الذكي
      const aiContent = await generateAllAIContent({
        title: 'عنوان مؤقت', // سيتم استبداله بعنوان مولد
        content: content
      });
      
      console.log('✅ تم التوليد بنجاح:', {
        title: aiContent.title || 'لم يتم توليد عنوان',
        excerptLength: aiContent.summary?.length || 0,
        keywordsCount: aiContent.tags?.length || 0
      });
      
      // إرجاع البيانات المولدة
      return NextResponse.json({
        title: aiContent.title || '',
        subtitle: aiContent.subtitle || '',
        excerpt: aiContent.summary || '',
        keywords: aiContent.tags || [],
        seoTitle: aiContent.seoTitle || aiContent.title || '',
        seoDescription: aiContent.seoDescription || aiContent.summary || '',
        quotes: aiContent.quotes || [],
        readingTime: aiContent.readingTime || Math.ceil(content.length / 1000),
        aiScore: aiContent.aiScore || 0
      });
      
    } catch (aiError: any) {
      console.error('❌ خطأ في توليد المحتوى:', aiError);
      
      // إذا فشل التوليد، نرجع محتوى افتراضي
      const fallbackKeywords = extractKeywords(content);
      const fallbackExcerpt = content.substring(0, 200) + '...';
      
      return NextResponse.json({
        title: '',
        subtitle: '',
        excerpt: fallbackExcerpt,
        keywords: fallbackKeywords,
        seoTitle: '',
        seoDescription: fallbackExcerpt,
        quotes: [],
        readingTime: Math.ceil(content.length / 1000),
        aiScore: 0,
        warning: 'تم استخدام التوليد الاحتياطي بسبب خطأ في خدمة AI'
      });
    }
    
  } catch (error: any) {
    console.error('❌ خطأ في معالجة طلب التوليد:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في معالجة الطلب',
        details: error.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// دالة مساعدة لاستخراج كلمات مفتاحية بسيطة من النص
function extractKeywords(text: string): string[] {
  // إزالة علامات الترقيم والأرقام
  const cleanText = text.replace(/[^\u0600-\u06FF\s]/g, ' ');
  
  // تقسيم إلى كلمات
  const words = cleanText.split(/\s+/).filter(word => word.length > 3);
  
  // حساب تكرار الكلمات
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // ترتيب حسب التكرار وأخذ أعلى 5
  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}