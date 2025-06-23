import { NextRequest, NextResponse } from 'next/server';
import { generateDeepAnalysis, initializeOpenAI } from '@/lib/services/deepAnalysisService';
import { GenerateAnalysisRequest, GenerateAnalysisResponse } from '@/types/deep-analysis';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // محاولة الحصول على API key من عدة مصادر
    let apiKey = process.env.OPENAI_API_KEY;
    
    // طباعة معلومات تشخيصية (احذفها بعد حل المشكلة)
    console.log('Environment API Key exists:', !!apiKey);
    console.log('Environment API Key length:', apiKey?.length);
    console.log('API Key starts with:', apiKey?.substring(0, 10));
    
    // إذا لم يكن موجوداً في البيئة، نحاول من الإعدادات المحفوظة
    if (!apiKey && body.openaiKey) {
      apiKey = body.openaiKey;
      console.log('Using API Key from request body');
    }
    
    // إذا لم يكن موجوداً، نحاول من localStorage (يُرسل من الواجهة)
    if (!apiKey && body.settings?.openaiKey) {
      apiKey = body.settings.openaiKey;
      console.log('Using API Key from settings');
    }
    
    // التحقق من وجود API key
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'مفتاح OpenAI API غير موجود. يرجى إضافته من إعدادات الذكاء الاصطناعي.',
          debug: {
            envExists: !!process.env.OPENAI_API_KEY,
            bodyKeyExists: !!body.openaiKey,
            settingsKeyExists: !!body.settings?.openaiKey
          }
        },
        { status: 401 }
      );
    }
    
    // التحقق من أن المفتاح كامل وليس مختصراً
    if (apiKey === 'sk-...' || apiKey.length < 20) {
      return NextResponse.json(
        { 
          error: 'مفتاح OpenAI API غير كامل. يرجى نسخ المفتاح الكامل من https://platform.openai.com/api-keys',
          debug: {
            keyLength: apiKey.length,
            keyPreview: apiKey.substring(0, 10) + '...'
          }
        },
        { status: 401 }
      );
    }
    
    // تهيئة OpenAI
    initializeOpenAI(apiKey);
    
    // تحضير طلب التوليد
    const generateRequest: GenerateAnalysisRequest = {
      sourceType: body.creationType === 'from_article' ? 'article' : 
                  body.creationType === 'external_link' ? 'external' : 'topic',
      topic: body.title,
      category: body.categories?.[0],
      customPrompt: body.prompt,
      language: 'ar',
      tone: 'professional',
      length: 'long',
      externalUrl: body.externalLink,
      sourceId: body.articleUrl
    };

    // توليد التحليل
    const result = await generateDeepAnalysis(generateRequest);

    if (result.success && result.analysis) {
      return NextResponse.json({
        title: result.analysis.title,
        summary: result.analysis.summary,
        content: JSON.stringify(result.analysis.content),
        tags: extractTagsFromContent(result.analysis.content),
        categories: body.categories || [body.category].filter(Boolean),
        qualityScore: result.analysis.qualityScore,
        readingTime: result.analysis.estimatedReadingTime
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'فشل في توليد التحليل' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error generating analysis:', error);
    
    // معالجة أخطاء OpenAI المحددة
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'مفتاح OpenAI API غير صحيح. يرجى التحقق من المفتاح في الإعدادات.' },
          { status: 401 }
        );
      }
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// استخراج الوسوم من المحتوى
function extractTagsFromContent(content: any): string[] {
  const tags: string[] = [];
  
  // استخراج الكلمات المفتاحية من الأقسام
  if (content.sections) {
    content.sections.forEach((section: any) => {
      // استخراج كلمات مهمة من العناوين
      const titleWords = section.title.split(' ')
        .filter((word: string) => word.length > 3)
        .slice(0, 2);
      tags.push(...titleWords);
    });
  }
  
  // استخراج من التوصيات
  if (content.recommendations) {
    tags.push(...content.recommendations
      .map((rec: string) => rec.split(' ')[0])
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
    );
  }
  
  // إزالة التكرارات
  return [...new Set(tags)].slice(0, 10);
} 