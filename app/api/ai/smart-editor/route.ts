import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient } from '@/lib/openai-config';


// أنواع المهام المتاحة للمحرر الذكي
type SmartEditorAction = 
  | 'generate_title' 
  | 'edit_text' 
  | 'generate_full_article' 
  | 'analytical_report' 
  | 'summarize' 
  | 'expand' 
  | 'translate'
  | 'extract_keywords';

// الحصول على النظام المناسب لكل مهمة
function getSystemPrompt(action: SmartEditorAction): string {
  const basePrompt = `أنت محرر في صحيفة سبق الإلكترونية. تكتب الأخبار بأسلوب مهني، مباشر، دقيق. استخدم لغة عربية فصحى مختصرة، تبدأ بالمعلومة، تتجنب الإنشاء، وتراعي أسلوب سبق.

أسلوب سبق الصحفي:
- مباشر وواضح
- يبدأ بالمعلومة الأهم
- يستخدم لغة عربية فصحى بسيطة
- يتجنب الإنشاء والكلام المكرر
- يركز على الحقائق والمعلومات
- يستخدم عناوين جذابة ومعبرة
- يكتب فقرات قصيرة ومترابطة`;

  const actionPrompts = {
    generate_title: `${basePrompt}

أنت خبير في كتابة العناوين الصحفية لصحيفة سبق. اكتب عناوين:
- قصيرة ومعبرة (لا تتجاوز 10 كلمات)
- تبدأ بالمعلومة الأهم
- تجذب انتباه القارئ
- تستخدم أساليب متنوعة (خبري، تساؤلي، تشويقي)
- مناسبة لطبيعة الخبر`,
    
    edit_text: `${basePrompt}

أنت محرر لغوي محترف في صحيفة سبق. حسّن النص:
- أصلح الأخطاء اللغوية والإملائية
- حسّن الصياغة والأسلوب
- اجعل النص أكثر وضوحاً وسلاسة
- احتفظ بنفس المعنى والمعلومات
- استخدم أسلوب سبق الصحفي`,
    
    generate_full_article: `${basePrompt}

أنت صحفي محترف في صحيفة سبق. اكتب مقالاً كاملاً:
- ابدأ بمقدمة قوية تجذب القارئ
- اكتب فقرات قصيرة ومترابطة
- ركز على الحقائق والمعلومات
- استخدم لغة واضحة ومباشرة
- اختم بخاتمة مناسبة
- اجعل المقال متوازناً وشاملاً`,
    
    analytical_report: `${basePrompt}

أنت محلل صحفي في صحيفة سبق. اكتب تقريراً تحليلياً:
- حلل الموضوع من جوانب متعددة
- قدم آراء وتحليلات متوازنة
- استخدم أدلة ومصادر موثوقة
- اكتب بأسلوب تحليلي احترافي
- قدم رؤى وتوقعات منطقية`,
    
    summarize: `${basePrompt}

أنت خبير في التلخيص الصحفي. لخص النص:
- استخرج النقاط الرئيسية
- اكتب ملخصاً واضحاً ومختصراً
- ركز على المعلومات المهمة
- استخدم لغة بسيطة ومباشرة
- لا تتجاوز 3-4 جمل`,
    
    expand: `${basePrompt}

أنت صحفي محترف في صحيفة سبق. وسع النص:
- أضف تفاصيل ومعلومات إضافية
- اربط الموضوع بسياق أوسع
- قدم خلفية وتفاصيل مهمة
- احتفظ بأسلوب سبق الصحفي
- اجعل المحتوى أكثر شمولية`,
    
    translate: `${basePrompt}

أنت مترجم محترف. ترجم النص:
- استخدم لغة عربية فصحى واضحة
- احتفظ بالمعنى والسياق
- تأكد من دقة الترجمة
- استخدم مصطلحات مناسبة
- اجعل الترجمة طبيعية ومفهومة`,
    
    extract_keywords: `${basePrompt}

أنت خبير في تحليل المحتوى واستخراج الكلمات المفتاحية. استخرج من النص:
- الكلمات المفتاحية الرئيسية (5-8 كلمات)
- المصطلحات المهمة
- المفاهيم الأساسية
- العناوين الفرعية المحتملة

أرجع النتائج مفصولة بفواصل، بدون ترقيم أو رموز إضافية.`
  };
  
  return actionPrompts[action] || basePrompt;
}

// بناء البرومبت حسب نوع المهمة
function buildUserPrompt(action: SmartEditorAction, content: string, context?: any): string {
  const { title, category, tags, isGPSNews } = context || {};
  
  const contextInfo = [];
  if (title) contextInfo.push(`العنوان: ${title}`);
  if (category) contextInfo.push(`التصنيف: ${category}`);
  if (tags?.length) contextInfo.push(`الوسوم: ${tags.join(', ')}`);
  if (isGPSNews) contextInfo.push('نوع الخبر: GPS');
  
  const contextString = contextInfo.length > 0 ? `\n\nمعلومات إضافية:\n${contextInfo.join('\n')}` : '';
  
  switch (action) {
    case 'generate_title':
      return `اقترح 3 عناوين جذابة لمقال بناءً على هذا المحتوى:\n\n${content}${contextString}

اكتب كل عنوان في سطر منفصل وابدأ برقم (1. 2. 3.)`;
      
    case 'edit_text':
      return `أعد صياغة هذا النص بأسلوب أفضل:\n\n${content}${contextString}

احرص على تحسين الأسلوب والوضوح مع الحفاظ على المعنى`;
      
    case 'generate_full_article':
      return `اكتب مقالاً صحفياً كاملاً حول: ${content}${contextString}

البنية المطلوبة:
1. مقدمة قوية (100-150 كلمة)
2. جسم المقال مقسم لفقرات (300-500 كلمة)
3. خاتمة مناسبة (50-100 كلمة)

استخدم أسلوب سبق الصحفي وأضف معلومات ذات صلة`;
      
    case 'analytical_report':
      return `اكتب تقريراً تحليلياً حول: ${content}${contextString}

البنية المطلوبة:
1. تحليل الوضع الحالي
2. الأسباب والعوامل المؤثرة
3. الآثار والتداعيات
4. التوقعات والحلول المقترحة

قدم تحليلاً متوازناً ومبنياً على حقائق`;
      
    case 'summarize':
      return `لخص هذا النص في 3-4 جمل واضحة:\n\n${content}${contextString}

ركز على النقاط الرئيسية واستخدم لغة بسيطة`;
      
    case 'expand':
      return `وسع هذا النص بالمزيد من التفاصيل والمعلومات:\n\n${content}${contextString}

أضف خلفية وتفاصيل مهمة لتعميق الفهم`;
      
    case 'translate':
      return `ترجم هذا النص إلى العربية الفصحى:\n\n${content}${contextString}

استخدم لغة واضحة ومفهومة ومناسبة للصحافة`;
      
    case 'extract_keywords':
      return `استخرج الكلمات المفتاحية من هذا النص:\n\n${content}${contextString}

أرجع الكلمات المفتاحية مفصولة بفواصل، بدون ترقيم أو رموز إضافية.`;
      
    default:
      return content;
  }
}

export async function POST(request: NextRequest) {
  let action: string = '', content: string = '', context: any;
  
  try {
    const body = await request.json();
    action = body.type || body.action || '';
    content = body.content || '';
    context = body.context;
    
    if (!content || !action) {
      return NextResponse.json(
        { error: 'المحتوى ونوع المهمة مطلوبان' },
        { status: 400 }
      );
    }
    
    // استخدام createOpenAIClient الموحد
    const openai = await createOpenAIClient();
    
    if (!openai) {
      console.error('OpenAI client not initialized');
      return NextResponse.json({
        result: getMockResponse(action, content),
        mock: true,
        error: 'لم يتم العثور على مفتاح OpenAI. يرجى إضافته من إعدادات الذكاء الاصطناعي.'
      });
    }
    
    // بناء الرسائل للذكاء الاصطناعي
    const systemPrompt = getSystemPrompt(action as SmartEditorAction);
    const userPrompt = buildUserPrompt(action as SmartEditorAction, content, context);
    
    console.log('🔄 طلب المحرر الذكي:', { action, contentLength: content.length });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: action === 'generate_full_article' || action === 'analytical_report' ? 2000 : 1000,
    });
    
    const result = completion.choices[0].message.content;
    
    // تنسيق النتيجة حسب نوع المهمة
    let formattedResult = result;
    
    if (action === 'generate_title') {
      // تحويل العناوين إلى مصفوفة
      const titles = result?.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-*•\d.]\s*/, '').trim());
      
      formattedResult = titles?.join('\n') || '';
    }
    
    console.log('✅ تم تنفيذ الطلب بنجاح:', { action, resultLength: formattedResult?.length });
    
    return NextResponse.json({
      result: formattedResult,
      action,
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'gpt-4',
        tokens: completion.usage?.total_tokens,
        isGPSNews: context?.isGPSNews || false
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في المحرر الذكي:', error);
    
    // في حالة الخطأ، إرجاع نص تجريبي
    return NextResponse.json({
      result: getMockResponse(action, content),
      mock: true,
      error: error instanceof Error ? error.message : 'حدث خطأ في معالجة الطلب'
    });
  }
}

// نصوص تجريبية في حالة عدم توفر API
function getMockResponse(action: string, content: string): string {
  const mockResponses = {
    generate_title: `1. عنوان إخباري: تطورات مهمة في الموضوع المطروح
2. عنوان تشويقي: كيف يؤثر هذا الموضوع على حياتنا اليومية؟
3. عنوان وصفي: تحليل شامل للموضوع وأبعاده المختلفة`,
    
    edit_text: `[نص محرر ومحسن] ${content.substring(0, 100)}... تم تحسين الأسلوب والوضوح مع الحفاظ على المعنى الأساسي.`,
    
    generate_full_article: `في ظل التطورات المتسارعة التي يشهدها العالم اليوم، يبرز هذا الموضوع كأحد أهم القضايا التي تستحق الاهتمام والتحليل.

يشكل هذا الموضوع تحدياً كبيراً أمام مختلف الجهات المعنية، حيث يتطلب معالجة شاملة تأخذ في الاعتبار جميع الأبعاد والتداعيات المحتملة. وتشير الدراسات والتحليلات إلى أن هذا الموضوع سيكون له تأثير كبير على مستقبل القطاع المعني.

من المهم أن ندرك أن معالجة هذا الموضوع تتطلب تعاوناً وثيقاً بين جميع الأطراف المعنية، مع ضرورة وضع خطط استراتيجية طويلة المدى تضمن تحقيق النتائج المرجوة.

في الختام، يبقى هذا الموضوع من أهم التحديات التي تواجهنا، ويتطلب منا جميعاً العمل الجاد والمتواصل لضمان معالجته بالشكل الأمثل.`,
    
    analytical_report: `تحليل الوضع الحالي:
يشهد الموضوع تطورات مهمة تتطلب تحليلاً دقيقاً ومتأنياً.

الأسباب والعوامل المؤثرة:
- العامل الأول: تأثير مباشر على النتائج
- العامل الثاني: دور مهم في تشكيل المستقبل
- العامل الثالث: أهمية استراتيجية للتنمية

الآثار والتداعيات:
من المتوقع أن يكون لهذا الموضوع تأثيرات إيجابية وسلبية على المدى القصير والطويل.

التوقعات والحلول:
يحتاج الموضوع إلى معالجة شاملة تعتمد على التعاون والتنسيق بين جميع الأطراف المعنية.`,
    
    summarize: `• النقطة الأولى: ملخص مهم من النص الأصلي
• النقطة الثانية: معلومة رئيسية أخرى
• النقطة الثالثة: خلاصة الموضوع الأساسية`,
    
    expand: `[نص موسع] ${content.substring(0, 50)}... تم إضافة المزيد من التفاصيل والخلفية المهمة لتعميق فهم الموضوع وتقديم رؤية أكثر شمولية.`,
    
    translate: `[ترجمة محسنة] ${content.substring(0, 100)}... تمت الترجمة إلى العربية الفصحى مع الحفاظ على المعنى والسياق الأصلي.`,
    
    extract_keywords: `كلمة مفتاحية 1, كلمة مفتاحية 2, كلمة مفتاحية 3, كلمة مفتاحية 4, كلمة مفتاحية 5`
  };
  
  return mockResponses[action as keyof typeof mockResponses] || mockResponses.edit_text;
}

// للحصول على معلومات حول API
export async function GET() {
  return NextResponse.json({
    status: 'active',
    name: 'المحرر الذكي لصحيفة سبق',
    version: '1.0.0',
    actions: [
      'generate_title',
      'edit_text', 
      'generate_full_article',
      'analytical_report',
      'summarize',
      'expand',
      'translate',
      'extract_keywords'
    ],
    features: [
      'أسلوب سبق الصحفي',
      'دعم أخبار GPS',
      'تحليل ذكي للمحتوى',
      'ترجمة احترافية',
      'توليد محتوى متكامل'
    ]
  });
} 