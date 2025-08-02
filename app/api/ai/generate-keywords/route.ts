import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🏷️ [AI Keywords] بدء توليد الكلمات المفتاحية...');
    
    const body = await request.json();
    const { content, title, currentKeywords = [] } = body;
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'المحتوى مطلوب لتوليد الكلمات المفتاحية'
      }, { status: 400 });
    }
    
    const startTime = Date.now();
    
    const prompt = `
أنت خبير SEO ومحلل محتوى عربي متخصص. مهمتك تحليل المقال واستخراج الكلمات المفتاحية الأكثر أهمية.

العنوان: ${title || 'غير محدد'}

المحتوى:
${content}

الكلمات الحالية: ${currentKeywords.join(', ') || 'لا توجد'}

استخرج 12-15 كلمة مفتاحية مهمة تشمل:
1. الكلمات الرئيسية المتعلقة بالموضوع (5-6 كلمات)
2. أسماء الأشخاص والمؤسسات المذكورة (2-3 كلمات)
3. المواقع والأماكن الجغرافية (1-2 كلمة)
4. المصطلحات التقنية أو المتخصصة (2-3 كلمات)
5. كلمات SEO قوية للبحث (2-3 كلمات)

شروط مهمة:
- كل كلمة مفتاحية كلمة واحدة أو عبارة قصيرة (2-3 كلمات كحد أقصى)
- تجنب الكلمات الشائعة جداً مثل "في" "من" "إلى"
- ركز على الكلمات ذات القيمة SEO العالية
- رتب الكلمات حسب الأهمية

أرجع النتيجة كـ JSON object بهذا التنسيق:
{
  "primary": ["الكلمات الأساسية"],
  "secondary": ["الكلمات الثانوية"], 
  "entities": ["الأشخاص والمؤسسات"],
  "locations": ["الأماكن"],
  "technical": ["المصطلحات التقنية"],
  "seo": ["كلمات SEO"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنت خبير SEO ومحلل محتوى عربي متخصص في استخراج الكلمات المفتاحية الأكثر فعالية للمحتوى الصحفي."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('لم يتم الحصول على استجابة من الذكاء الاصطناعي');
    }

    // محاولة تحليل JSON
    let keywordGroups: any = {};
    let allKeywords: string[] = [];
    
    try {
      keywordGroups = JSON.parse(aiResponse);
      
      // جمع جميع الكلمات من المجموعات المختلفة
      Object.values(keywordGroups).forEach((group: any) => {
        if (Array.isArray(group)) {
          allKeywords.push(...group);
        }
      });
      
    } catch (parseError) {
      // إذا فشل التحليل، استخرج الكلمات من النص
      const lines = aiResponse.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/^"/, '').replace(/"$/, ''))
        .filter(line => line.length > 1 && line.length < 30);
      
      allKeywords = lines.slice(0, 15);
      
      // تنظيم في مجموعات افتراضية
      keywordGroups = {
        primary: allKeywords.slice(0, 5),
        secondary: allKeywords.slice(5, 8),
        entities: allKeywords.slice(8, 10),
        locations: allKeywords.slice(10, 12),
        technical: allKeywords.slice(12, 14),
        seo: allKeywords.slice(14, 15)
      };
    }

    // تنظيف الكلمات المكررة
    const uniqueKeywords = [...new Set(allKeywords.filter(k => k && k.length > 1))];

    const processingTime = Date.now() - startTime;

    console.log(`✅ [AI Keywords] تم توليد ${uniqueKeywords.length} كلمة مفتاحية في ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      keywords: uniqueKeywords,
      grouped: keywordGroups,
      processing_time: processingTime,
      generated_at: new Date().toISOString(),
      message: `تم توليد ${uniqueKeywords.length} كلمة مفتاحية منظمة`
    });

  } catch (error: any) {
    console.error('❌ [AI Keywords] خطأ في توليد الكلمات المفتاحية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في توليد الكلمات المفتاحية',
      details: error.message,
      code: 'KEYWORDS_GENERATION_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة توليد الكلمات المفتاحية الذكية جاهزة',
    version: '1.0',
    model: 'gpt-4o',
    features: ['كلمات مجمعة', 'تحليل SEO', 'أشخاص ومؤسسات', 'مواقع جغرافية', 'مصطلحات تقنية']
  });
}