import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [AI Titles] بدء توليد العناوين الاحترافية...');
    
    const body = await request.json();
    const { content, currentTitle } = body;
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'المحتوى مطلوب لتوليد العنوان'
      }, { status: 400 });
    }
    
    const startTime = Date.now();
    
    const prompt = `
أنت محرر صحفي محترف في صحيفة سبق الإلكترونية. مهمتك توليد عناوين جذابة واحترافية للمقالات.

المحتوى:
${content}

العنوان الحالي: ${currentTitle || 'لا يوجد'}

اكتب 5 عناوين بديلة مختلفة، كل عنوان يجب أن يكون:
1. جذاب ويثير اهتمام القارئ
2. يعكس المحتوى بدقة
3. مناسب للصحافة الإلكترونية
4. بين 8-15 كلمة
5. يحتوي على كلمات قوية ومؤثرة

أرجع النتيجة كـ JSON array فقط، مثال:
["العنوان الأول", "العنوان الثاني", "العنوان الثالث", "العنوان الرابع", "العنوان الخامس"]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنت محرر صحفي خبير في صحيفة سبق، متخصص في كتابة العناوين الجذابة والاحترافية باللغة العربية."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('لم يتم الحصول على استجابة من الذكاء الاصطناعي');
    }

    // محاولة تحليل JSON
    let titles: string[] = [];
    try {
      titles = JSON.parse(aiResponse);
    } catch (parseError) {
      // إذا فشل التحليل، استخرج العناوين من النص
      const lines = aiResponse.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/^"/, '').replace(/"$/, ''))
        .filter(line => line.length > 5);
      
      titles = lines.slice(0, 5);
    }

    // التأكد من وجود عناوين صالحة
    if (!titles || titles.length === 0) {
      throw new Error('فشل في تحليل العناوين المولدة');
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ [AI Titles] تم توليد ${titles.length} عناوين في ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      titles: titles,
      processing_time: processingTime,
      generated_at: new Date().toISOString(),
      message: `تم توليد ${titles.length} عناوين احترافية`
    });

  } catch (error: any) {
    console.error('❌ [AI Titles] خطأ في توليد العناوين:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في توليد العناوين',
      details: error.message,
      code: 'TITLE_GENERATION_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة توليد العناوين الذكية جاهزة',
    version: '1.0',
    model: 'gpt-4o',
    features: ['توليد 5 عناوين', 'عناوين احترافية', 'تحليل المحتوى', 'كلمات مؤثرة']
  });
}