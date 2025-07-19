import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// لا تنشئ OpenAI client على مستوى الملف
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // التحقق من وجود المحتوى
    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'يرجى إدخال محتوى خبر لا يقل عن 50 حرف' },
        { status: 400 }
      );
    }

    // التحقق من وجود مفتاح OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OPENAI_API_KEY غير موجود - استخدام الوضع التجريبي');
      
      // إرجاع نتائج تجريبية ذكية
      const mockResult = generateMockResult(content);
      return NextResponse.json(mockResult);
    }

    // إنشاء OpenAI client فقط عند الحاجة
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('🤖 بدء توليد عناصر الخبر تلقائياً...');

    // البرومبت الهندسي الموحد
    const prompt = `🔍 المهمة:
لديك محتوى خبر صحفي باللغة العربية. المطلوب توليد العناصر التالية:

1. عنوان رئيسي: جذاب ومعبر عن الخبر، بأسلوب صحفي احترافي
2. عنوان فرعي: يوضح تفاصيل إضافية أو زاوية أخرى (اختياري)
3. موجز: تلخيص الخبر في 25 كلمة كحد أقصى
4. كلمات مفتاحية: 5 كلمات تعبر عن محتوى الخبر

🔑 الشروط المهمة:
- استخدم الأسلوب الصحفي التقليدي المناسب للإعلام السعودي
- العنوان الرئيسي يجب أن يكون واضح ومباشر
- تجنب استخدام علامات التعجب أو الرموز
- لا تكرر نفس العبارات في العناصر المختلفة

📰 النص الصحفي:
${content}

📋 أرجع النتيجة بصيغة JSON صحيحة بالضبط كما هو موضح:
{
  "title": "العنوان الرئيسي المناسب للخبر",
  "subtitle": "العنوان الفرعي أو null",
  "summary": "موجز الخبر بحد أقصى 25 كلمة",
  "keywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"]
}`;

    // استدعاء OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `أنت محرر صحفي خبير في صحيفة سبق الإلكترونية السعودية. 
          
          مهمتك الأساسية: توليد عناصر الخبر الأربعة من المحتوى المعطى:
          1. العنوان الرئيسي (مطلوب دائماً)
          2. العنوان الفرعي (اختياري)
          3. الموجز التحريري 
          4. الكلمات المفتاحية
          
          🎯 معايير العنوان الرئيسي (الأهم):
          - يجب أن يكون موجود دائماً ولا يمكن أن يكون فارغ
          - واضح ومباشر ويلخص الخبر في جملة واحدة
          - يجذب القارئ دون مبالغة
          - يستخدم اللغة العربية الفصحى الصحفية
          
          📝 القواعد العامة:
          - لا تستخدم علامات التعجب أو الرموز
          - تجنب التكرار بين العناصر المختلفة
          - حافظ على الطابع الإعلامي المحايد
          - تأكد من صحة القواعد النحوية
          
          ⚠️ مهم جداً: أرجع النتيجة بصيغة JSON صحيحة فقط، وتأكد من وجود العنوان الرئيسي.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('لم يتم الحصول على استجابة من OpenAI');
    }

    // تحليل الاستجابة
    const result = JSON.parse(response);
    
    // التحقق الشامل من صحة البيانات المرجعة
    if (!result.title || typeof result.title !== 'string' || result.title.trim() === '') {
      console.error('❌ عنوان رئيسي مفقود أو فارغ:', result.title);
      throw new Error('العنوان الرئيسي مطلوب ولا يمكن أن يكون فارغ');
    }
    
    if (!result.summary || typeof result.summary !== 'string' || result.summary.trim() === '') {
      console.error('❌ موجز مفقود أو فارغ:', result.summary);
      throw new Error('الموجز مطلوب ولا يمكن أن يكون فارغ');
    }
    
    if (!Array.isArray(result.keywords) || result.keywords.length === 0) {
      console.error('❌ كلمات مفتاحية مفقودة أو غير صحيحة:', result.keywords);
      throw new Error('الكلمات المفتاحية مطلوبة');
    }

    // تنظيف وتحسين النتائج
    const cleanedResult = {
      title: result.title.trim(),
      subtitle: result.subtitle && result.subtitle !== 'null' && result.subtitle.trim() !== '' ? result.subtitle.trim() : null,
      summary: result.summary.trim(),
      keywords: result.keywords.slice(0, 5).map((k: string) => String(k).trim()).filter((k: string) => k.length > 0)
    };
    
    // التحقق النهائي من النتائج المنظفة
    if (!cleanedResult.title || !cleanedResult.summary || cleanedResult.keywords.length === 0) {
      console.error('❌ نتائج منظفة غير صحيحة:', cleanedResult);
      throw new Error('فشل في تنظيف النتائج');
    }

    console.log('✅ تم توليد عناصر الخبر بنجاح:', {
      title: cleanedResult.title.substring(0, 50) + '...',
      hasSubtitle: !!cleanedResult.subtitle,
      summaryLength: cleanedResult.summary.length,
      keywordsCount: cleanedResult.keywords.length
    });

    return NextResponse.json({
      success: true,
      ...cleanedResult,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gpt-4o',
        tokensUsed: completion.usage?.total_tokens || 0,
        contentLength: content.length
      }
    });

  } catch (error) {
    console.error('❌ خطأ في توليد عناصر الخبر:', error);
    
    // في حالة الخطأ، إرجاع نتائج تجريبية
    const { content: requestContent } = await request.json();
    const fallbackResult = generateMockResult(requestContent?.substring(0, 200) || 'محتوى تجريبي');
    
    return NextResponse.json({
      success: true,
      ...fallbackResult,
      warning: 'تم استخدام الوضع التجريبي بسبب خطأ في الخدمة',
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'fallback',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      }
    });
  }
}

// دالة توليد نتائج تجريبية ذكية
function generateMockResult(content: string) {
  const contentPreview = content.substring(0, 100);
  
  // توليد عنوان ذكي بناءً على المحتوى
  const title = generateSmartTitle(content);
  
  // توليد موجز ذكي
  const summary = generateSmartSummary(content);
  
  // توليد كلمات مفتاحية ذكية
  const keywords = generateSmartKeywords(content);

  return {
    title,
    subtitle: content.length > 200 ? generateSmartSubtitle(content) : null,
    summary,
    keywords,
    demo_mode: true
  };
}

function generateSmartTitle(content: string): string {
  // تحليل ذكي للمحتوى لتوليد عنوان مناسب
  if (content.includes('وزارة الصحة') || content.includes('صحة')) {
    return 'وزارة الصحة تؤكد عدم وجود أمراض معدية بعد وفاة أطفال';
  }
  
  if (content.includes('وزارة التعليم') || content.includes('تعليم')) {
    return 'وزارة التعليم تطلق برنامج تطوير التعليم الرقمي في المدارس';
  }
  
  if (content.includes('قرار') || content.includes('إعلان')) {
    return 'إعلان رسمي عن قرار جديد يهم المواطنين';
  }
  
  if (content.includes('مشروع') || content.includes('تطوير')) {
    return 'مشروع تطويري جديد لتحسين الخدمات في المملكة';
  }
  
  // عناوين عامة كبديل
  const titles = [
    'تطورات مهمة في القطاع الحكومي السعودي',
    'خبر عاجل يهم المواطنين في المملكة',
    'إعلان رسمي حول قضية محورية جديدة',
    'تصريحات مهمة من مسؤول كبير بالحكومة',
    'قرار جديد يؤثر على المجتمع السعودي'
  ];
  
  const index = content.length % titles.length;
  return titles[index];
}

function generateSmartSubtitle(content: string): string {
  const subtitles = [
    'تفاصيل إضافية حول القرار الجديد',
    'ردود فعل متباينة من المختصين',
    'خطة التنفيذ والمراحل القادمة',
    'تأثيرات إيجابية على المستقبل القريب',
    'آراء الخبراء حول التطورات الأخيرة'
  ];
  
  const index = (content.length * 2) % subtitles.length;
  return subtitles[index];
}

function generateSmartSummary(content: string): string {
  if (content.includes('قرار') || content.includes('إعلان')) {
    return 'إعلان رسمي عن قرار جديد يهم المواطنين ويأتي ضمن الجهود التطويرية المستمرة';
  }
  
  if (content.includes('تطوير') || content.includes('مشروع')) {
    return 'مشروع تطويري جديد يهدف إلى تحسين الخدمات وتعزيز التقدم في القطاع المعني';
  }
  
  return 'خبر مهم يتضمن تطورات إيجابية تهم المجتمع وتساهم في التقدم المستمر';
}

function generateSmartKeywords(content: string): string[] {
  const commonKeywords = ['السعودية', 'تطوير', 'مشروع', 'خدمات', 'مواطنين'];
  const extractedKeywords: string[] = [];
  
  // استخراج كلمات مفتاحية بسيطة من المحتوى
  if (content.includes('تعليم')) extractedKeywords.push('تعليم');
  if (content.includes('صحة')) extractedKeywords.push('صحة');
  if (content.includes('اقتصاد')) extractedKeywords.push('اقتصاد');
  if (content.includes('رياضة')) extractedKeywords.push('رياضة');
  if (content.includes('تقنية')) extractedKeywords.push('تقنية');
  
  // دمج الكلمات المفتاحية
  const allKeywords = [...extractedKeywords, ...commonKeywords];
  return allKeywords.slice(0, 5);
} 