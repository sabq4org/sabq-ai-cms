import OpenAI from 'openai';
import { 
  GenerateAnalysisRequest, 
  GenerateAnalysisResponse,
  AnalysisContent,
  ContentSection,
  DataPoint
} from '@/types/deep-analysis';

// إعداد OpenAI client
let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: false // سيتم استخدامه من الخادم فقط
  });
}

// برومبت أساسي يركز على النص المكتوب من المستخدم
const createUserFocusedPrompt = (userPrompt: string, context?: string) => {
  return `أنت كاتب ومحلل محترف متخصص في إنتاج المحتوى التحليلي عالي الجودة باللغة العربية.

مهمتك: إنتاج تحليل عميق مبني بشكل كامل على النص والطلب الذي كتبه المستخدم.

نص المستخدم (هذا هو الأساس الوحيد للتحليل):
"${userPrompt}"

${context ? `سياق إضافي: ${context}` : ''}

⚠️ قواعد مهمة جداً:
1. اكتب التحليل فقط حول الموضوع الذي ذكره المستخدم في نصه
2. لا تضيف مواضيع أخرى مثل "رؤية 2030" أو "الابتكار" إلا إذا ذكرها المستخدم بنفسه
3. ركز على المحتوى المطلوب وليس على قوالب جاهزة
4. إذا طلب المستخدم تحليلاً لموضوع معين، اكتب عنه فقط

متطلبات التحليل:
- تحليل عميق ومتخصص في الموضوع المحدد
- لغة عربية احترافية وصحفية
- منسق بعناوين وفقرات واضحة
- مدعوم بالمعلومات والتحليل المنطقي
- طول مناسب يتراوح بين 1200-2000 كلمة

شكل الإخراج المطلوب (JSON):
{
  "title": "عنوان دقيق يعكس موضوع المستخدم",
  "summary": "ملخص تنفيذي للتحليل (100-150 كلمة)",
  "sections": [
    {
      "title": "عنوان القسم الأول",
      "content": "محتوى القسم بتفصيل كامل"
    }
  ],
  "recommendations": ["توصية عملية تخص الموضوع"],
  "keyInsights": ["نقطة رئيسية مهمة من التحليل"],
  "dataPoints": [
    {
      "label": "اسم الإحصائية",
      "value": "القيمة",
      "unit": "الوحدة",
      "description": "توضيح"
    }
  ]
}`;
};

// البرومبتات الأساسية للتحليل (محدثة لتركز على النص الفعلي)
const ANALYSIS_PROMPTS = {
  fromArticle: (articleContent: string, userPrompt?: string) => {
    return `أنت محرر تحليلي محترف. اقرأ المقال التالي وقم بإنشاء تحليل عميق كما هو مطلوب.

المقال المصدر:
${articleContent}

${userPrompt ? `طلب المستخدم المحدد: "${userPrompt}"` : ''}

المطلوب: تحليل عميق يركز على ما هو مكتوب في المقال ويجيب على طلب المستخدم تحديداً.

اكتب تحليلاً يتضمن:
1. **مقدمة تحليلية**: سياق وأهمية الموضوع
2. **تحليل المحتوى**: استخلاص النقاط الرئيسية والمعاني العميقة
3. **الآثار والتداعيات**: تحليل التأثيرات المحتملة
4. **البيانات والحقائق**: الأرقام والإحصائيات المهمة
5. **وجهات نظر متعددة**: رؤى مختلفة للموضوع
6. **خلاصة وتوصيات**: نتائج وتوصيات عملية

اجعل التحليل مركزاً على موضوع المقال وطلب المستخدم فقط.`;
  },

  fromTopic: (topic: string, userPrompt: string, category?: string) => {
    return createUserFocusedPrompt(userPrompt, `الموضوع: ${topic}${category ? ` - التصنيف: ${category}` : ''}`);
  },

  fromExternal: (externalUrl: string, userPrompt?: string) => {
    return `أنت محرر تحليلي محترف. قم بإنشاء تحليل عميق بناءً على المحتوى الخارجي المطلوب تحليله.

المصدر: ${externalUrl}
${userPrompt ? `طلب التحليل: "${userPrompt}"` : ''}

المطلوب: تحليل موضوعي وعميق يركز على المحتوى المطلوب تحديداً.

يتضمن:
1. **تلخيص تحليلي**: النقاط الأساسية والرسائل المهمة
2. **التحليل النقدي**: تقييم وتحليل المحتوى
3. **السياق والخلفية**: وضع المحتوى في إطاره المناسب
4. **وجهات نظر متنوعة**: رؤى مختلفة حول الموضوع
5. **الدروس والتوصيات**: استخلاص العبر والتوصيات العملية

ركز فقط على الموضوع المطلوب وتجنب الخروج عن السياق.`;
  }
};

// دالة توليد التحليل
export async function generateDeepAnalysis(
  request: GenerateAnalysisRequest,
  opts?: { fast?: boolean }
): Promise<GenerateAnalysisResponse> {
  if (!openaiClient) {
    return {
      success: false,
      error: 'OpenAI client not initialized'
    };
  }

  try {
    // بناء البرومبت حسب نوع المصدر
    let prompt = '';
    
    switch (request.sourceType) {
      case 'article':
        prompt = ANALYSIS_PROMPTS.fromArticle(request.sourceId || '', request.customPrompt);
        break;
      case 'topic':
        prompt = ANALYSIS_PROMPTS.fromTopic(request.topic || '', request.customPrompt || request.topic || '', request.category);
        break;
      case 'external':
        prompt = ANALYSIS_PROMPTS.fromExternal(request.externalUrl || '', request.customPrompt);
        break;
      default:
        // إذا لم يحدد نوع المصدر، استخدم النص المباشر من المستخدم
        prompt = createUserFocusedPrompt(request.customPrompt || request.topic || '', `التصنيف: ${request.category || 'عام'}`);
    }

    // إضافة تعليمات خاصة إن وجدت (بدون إعادة إضافة customPrompt لأنه مضمن بالفعل)
    if (request.customPrompt && !prompt.includes(request.customPrompt)) {
      prompt += `\n\nتعليمات إضافية:\n${request.customPrompt}`;
    }

    // إضافة تعليمات الطول
    if (request.length) {
      const lengthInstructions = {
        short: 'اجعل التحليل مختصراً (800-1200 كلمة)',
        medium: 'اجعل التحليل متوسط الطول (1500-2000 كلمة)',
        long: 'اجعل التحليل مفصلاً (2500-3500 كلمة)'
      };
      prompt += `\n\n${lengthInstructions[request.length]}`;
    }

    // إعدادات الوضع السريع لتجنب timeout
    const isFast = opts?.fast === true;
    const maxTokens = isFast ? 1800 : 4000;  // تقليل أكثر لضمان السرعة
    const model = isFast ? 'gpt-4o-mini' : 'gpt-4o';
    
    // تعليمات محسّنة للتركيز على النص المكتوب من المستخدم
    const systemPrompt = `أنت كاتب ومحلل محترف متخصص في إنتاج التحليلات العميقة باللغة العربية.

🎯 مهمتك الرئيسية: إنشاء تحليل عميق مبني بشكل كامل على النص والطلب الذي كتبه المستخدم

⚠️ قواعد مهمة جداً (يجب اتباعها بدقة):
1. اركز فقط على الموضوع الذي ذكره المستخدم في نصه
2. لا تضيف مواضيع خارجية مثل "رؤية 2030" أو "الابتكار" إلا إذا ذكرها المستخدم بنفسه
3. اكتب التحليل كما طلبه المستخدم بالضبط
4. تجنب القوالب الجاهزة والتركيز على المحتوى المطلوب فعلياً
5. إذا طلب المستخدم تحليل موضوع معين، اكتب عنه فقط وليس عن مواضيع أخرى

📋 متطلبات الإخراج:
- تحليل عميق ومتخصص في الموضوع المحدد فقط
- لغة عربية احترافية وصحفية
- منظم بعناوين وفقرات واضحة
- مدعوم بالمعلومات والتحليل المنطقي المناسب للموضوع
- طول مناسب يتراوح بين ${isFast ? '800-1200' : '1500-2500'} كلمة

💡 شكل الإخراج (JSON):
{
  "title": "عنوان دقيق يعكس موضوع المستخدم تحديداً",
  "summary": "ملخص تنفيذي للتحليل المطلوب",
  "sections": [
    {
      "title": "عنوان القسم المتعلق بالموضوع",
      "content": "محتوى تحليلي مفصل حول الموضوع المطلوب"
    }
  ],
  "recommendations": ["توصيات عملية تخص الموضوع المحدد"],
  "keyInsights": ["نقاط رئيسية من التحليل المطلوب"],
  "dataPoints": [
    {
      "label": "إحصائية متعلقة بالموضوع",
      "value": "قيمة",
      "unit": "وحدة",
      "description": "توضيح"
    }
  ]
}

تذكر: الأولوية الكاملة لما كتبه المستخدم، وليس للقوالب الجاهزة.`;

    // استدعاء OpenAI
    const completion = await openaiClient.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: isFast ? prompt.substring(0, 1500) : prompt // نص أطول للحصول على سياق أفضل
        }
      ],
      temperature: isFast ? 0.6 : 0.8,  // تقليل للحصول على نتائج أسرع
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // تحليل الاستجابة مع معالجة قوية للأخطاء
    let parsedResponse: any = null;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response length:', response.length);
      console.log('First 500 chars:', response.substring(0, 500));
      console.log('Last 500 chars:', response.substring(response.length - 500));
      
      // محاولات إصلاح متعددة
      let fixedResponse = response;
      
      // 1. إزالة محارف التحكم
      fixedResponse = fixedResponse.replace(/[\u0000-\u001F\u007F]/g, ' ');
      
      // 2. إصلاح الأسطر الجديدة داخل السلاسل
      fixedResponse = fixedResponse.replace(/("[^"]*)(\n)([^"]*")/g, '$1\\n$3');
      
      // 3. إذا انتهى النص بشكل مفاجئ، حاول إغلاق JSON
      if (!fixedResponse.trim().endsWith('}')) {
        // البحث عن آخر فاصلة أو قوس
        const lastComma = fixedResponse.lastIndexOf(',');
        const lastBracket = fixedResponse.lastIndexOf('[');
        const lastBrace = fixedResponse.lastIndexOf('{');
        
        // قطع عند آخر عنصر صالح
        const cutPoint = Math.max(lastComma, lastBracket, lastBrace);
        if (cutPoint > 0) {
          fixedResponse = fixedResponse.substring(0, cutPoint);
          // إغلاق الهياكل المفتوحة
          const openBrackets = (fixedResponse.match(/\[/g) || []).length;
          const closeBrackets = (fixedResponse.match(/\]/g) || []).length;
          const openBraces = (fixedResponse.match(/\{/g) || []).length;
          const closeBraces = (fixedResponse.match(/\}/g) || []).length;
          
          // إضافة الأقواس المطلوبة
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixedResponse += ']';
          }
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixedResponse += '}';
          }
        }
      }
      
      try {
        parsedResponse = JSON.parse(fixedResponse);
      } catch (secondError) {
        // إذا فشلت كل المحاولات، أنشئ رد افتراضي
        console.error('Failed to fix JSON, creating default response');
        parsedResponse = {
          title: request.topic || 'تحليل عميق',
          summary: 'تم توليد هذا التحليل بواسطة الذكاء الاصطناعي',
          sections: [
            {
              title: 'مقدمة',
              content: 'حدث خطأ أثناء توليد التحليل الكامل. يرجى المحاولة مرة أخرى.'
            }
          ],
          recommendations: ['يُنصح بإعادة المحاولة'],
          keyInsights: ['حدث خطأ في التوليد']
        };
      }
    }
    
    // التحقق من أن الاستجابة ليست فارغة
    if (typeof parsedResponse === 'object' && Object.keys(parsedResponse).length === 0) {
      throw new Error('رد فارغ من GPT - الرجاء المحاولة مرة أخرى');
    }
    
    // التحقق من وجود المحتوى الأساسي
    if (!parsedResponse.title || !parsedResponse.sections || parsedResponse.sections.length === 0) {
      throw new Error('الرد من GPT لا يحتوي على محتوى كافٍ للتحليل');
    }
    
    // بناء محتوى التحليل
    const content = parseAnalysisResponse(parsedResponse);
    
    // حساب جودة المحتوى
    const qualityScore = calculateQualityScore(content);
    
    // حساب وقت القراءة (250 كلمة في الدقيقة)
    // حساب مجموع الكلمات من جميع الأقسام
    const totalWords = content.sections.reduce((total, section) => {
      return total + countWords(section.content);
    }, 0);
    const estimatedReadingTime = Math.ceil(totalWords / 250);

    return {
      success: true,
      analysis: {
        title: parsedResponse.title,
        summary: parsedResponse.summary,
        content: content,
        qualityScore: qualityScore,
        estimatedReadingTime: estimatedReadingTime
      },
      tokensUsed: completion.usage?.total_tokens,
      cost: calculateCost(completion.usage?.total_tokens || 0)
    };

  } catch (error) {
    console.error('Error generating analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// دالة تحليل استجابة GPT وتحويلها لمحتوى منظم
function parseAnalysisResponse(response: any): AnalysisContent {
  const sections: ContentSection[] = [];
  const dataPoints: DataPoint[] = [];
  
  // استخراج الأقسام
  if (response.sections && Array.isArray(response.sections)) {
    response.sections.forEach((section: any, index: number) => {
      sections.push({
        id: `section-${index + 1}`,
        title: section.title,
        content: section.content,
        order: index + 1,
        type: section.type || 'text',
        metadata: section.metadata || {}
      });
    });
  }

  // استخراج نقاط البيانات
  if (response.dataPoints && Array.isArray(response.dataPoints)) {
    response.dataPoints.forEach((point: any) => {
      dataPoints.push({
        label: point.label,
        value: point.value,
        unit: point.unit,
        trend: point.trend,
        description: point.description
      });
    });
  }

  // بناء جدول المحتويات
  const tableOfContents = sections.map(section => ({
    id: `toc-${section.id}`,
    title: section.title,
    level: 1,
    sectionId: section.id
  }));

  return {
    sections,
    tableOfContents,
    recommendations: response.recommendations || [],
    keyInsights: response.keyInsights || [],
    dataPoints
  };
}

// دالة حساب جودة المحتوى
function calculateQualityScore(content: AnalysisContent): number {
  let score = 0;
  
  // 1. وجود أقسام وتنوعها (15%)
  if (content.sections.length >= 10) {
    score += 15;
  } else if (content.sections.length >= 8) {
    score += 12;
  } else if (content.sections.length >= 6) {
    score += 9;
  } else if (content.sections.length >= 4) {
    score += 6;
  } else if (content.sections.length > 0) {
    score += 3;
  }
  
  // 2. طول المحتوى الإجمالي (25%)
  const totalWords = content.sections.reduce((total, section) => {
    return total + countWords(section.content);
  }, 0);
  
  if (totalWords >= 3000) {
    score += 25;
  } else if (totalWords >= 2500) {
    score += 20;
  } else if (totalWords >= 2000) {
    score += 15;
  } else if (totalWords >= 1500) {
    score += 10;
  } else if (totalWords >= 1000) {
    score += 5;
  }
  
  // 3. وجود عناوين منظمة (15%)
  const hasWellStructuredTitles = content.sections.every(s => 
    s.title && s.title.length > 5 && !s.title.includes('undefined')
  );
  const hasNumberedSections = content.sections.some(s => 
    /^\d+\./.test(s.title) || /^##/.test(s.title)
  );
  
  if (hasWellStructuredTitles && hasNumberedSections) {
    score += 15;
  } else if (hasWellStructuredTitles) {
    score += 10;
  } else {
    score += 5;
  }
  
  // 4. وجود بيانات وإحصائيات (10%)
  if (content.dataPoints && content.dataPoints.length >= 7) {
    score += 10;
  } else if (content.dataPoints && content.dataPoints.length >= 5) {
    score += 8;
  } else if (content.dataPoints && content.dataPoints.length >= 3) {
    score += 5;
  } else if (content.dataPoints && content.dataPoints.length > 0) {
    score += 3;
  }
  
  // 5. وجود توصيات عملية (10%)
  if (content.recommendations && content.recommendations.length >= 8) {
    score += 10;
  } else if (content.recommendations && content.recommendations.length >= 6) {
    score += 8;
  } else if (content.recommendations && content.recommendations.length >= 4) {
    score += 5;
  } else if (content.recommendations && content.recommendations.length > 0) {
    score += 3;
  }
  
  // 6. وجود رؤى رئيسية (10%)
  if (content.keyInsights && content.keyInsights.length >= 7) {
    score += 10;
  } else if (content.keyInsights && content.keyInsights.length >= 5) {
    score += 8;
  } else if (content.keyInsights && content.keyInsights.length >= 3) {
    score += 5;
  } else if (content.keyInsights && content.keyInsights.length > 0) {
    score += 3;
  }
  
  // 7. تنوع وثراء المحتوى (15%)
  let contentRichness = 0;
  
  // تحقق من وجود أقسام طويلة ومفصلة
  const hasDetailedSections = content.sections.filter(s => countWords(s.content) >= 300).length >= 5;
  if (hasDetailedSections) contentRichness += 5;
  
  // تحقق من وجود قوائم وتنسيق
  const hasLists = content.sections.some(s => 
    s.content.includes('•') || s.content.includes('-') || s.content.includes('1.')
  );
  if (hasLists) contentRichness += 3;
  
  // تحقق من وجود أرقام وإحصائيات في النص
  const hasNumbers = content.sections.filter(s => 
    /\d+%|\d+\s*(مليون|مليار|ألف)|\d{4}/.test(s.content)
  ).length >= 3;
  if (hasNumbers) contentRichness += 4;
  
  // تحقق من ذكر شركات أو مبادرات سعودية
  const hasSaudiContext = content.sections.some(s => 
    /(مرسول|جاهز|نون|stc|أرامكو|سابك|نيوم|البحر الأحمر|القدية|روشن|رؤية 2030)/i.test(s.content)
  );
  if (hasSaudiContext) contentRichness += 3;
  
  score += contentRichness;
  
  return Math.min(score, 100); // التأكد من عدم تجاوز 100
}

// دالة حساب عدد الكلمات
function countWords(text: string): number {
  // إزالة HTML tags إن وجدت
  const cleanText = text.replace(/<[^>]*>/g, '');
  // حساب الكلمات العربية والإنجليزية
  const words = cleanText.match(/[\u0600-\u06FF]+|\w+/g);
  return words ? words.length : 0;
}

// دالة حساب التكلفة (تقديرية)
function calculateCost(tokens: number): number {
  // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
  // نفترض متوسط 50/50 للإدخال والإخراج
  const avgPricePerToken = 0.045 / 1000;
  return Math.round(tokens * avgPricePerToken * 100) / 100;
}

// دالة تحسين تحليل موجود
export async function improveAnalysis(
  currentAnalysis: string,
  improvementType: 'expand' | 'summarize' | 'update',
  additionalContext?: string
): Promise<GenerateAnalysisResponse> {
  if (!openaiClient) {
    return {
      success: false,
      error: 'OpenAI client not initialized'
    };
  }

  try {
    let prompt = '';
    
    switch (improvementType) {
      case 'expand':
        prompt = `قم بتوسيع التحليل التالي بإضافة المزيد من التفاصيل والأمثلة:\n\n${currentAnalysis}`;
        break;
      case 'summarize':
        prompt = `قم بتلخيص التحليل التالي مع الحفاظ على النقاط الرئيسية:\n\n${currentAnalysis}`;
        break;
      case 'update':
        prompt = `قم بتحديث التحليل التالي بناءً على المعلومات الجديدة:\n\nالتحليل الحالي:\n${currentAnalysis}\n\nالمعلومات الجديدة:\n${additionalContext}`;
        break;
    }

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'أنت محرر تحليلي محترف. قم بتحسين التحليل المقدم حسب التعليمات.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const improvedContent = completion.choices[0].message.content || '';
    
    return {
      success: true,
      analysis: {
        title: 'تحليل محسّن',
        summary: 'تم تحسين هذا التحليل باستخدام الذكاء الاصطناعي',
        content: parseAnalysisResponse({ content: improvedContent, sections: [] }),
        qualityScore: 0.8,
        estimatedReadingTime: Math.ceil(countWords(improvedContent) / 250)
      },
      tokensUsed: completion.usage?.total_tokens,
      cost: calculateCost(completion.usage?.total_tokens || 0)
    };

  } catch (error) {
    console.error('Error improving analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// دالة تقييم جودة تحليل موجود
export async function evaluateAnalysisQuality(
  analysis: string
): Promise<{ score: number; feedback: string[] }> {
  if (!openaiClient) {
    return { score: 0, feedback: ['OpenAI client not initialized'] };
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في تقييم جودة التحليلات الصحفية. قم بتقييم التحليل المقدم وإعطاء نقاط القوة والضعف. يجب أن يكون الإخراج بصيغة JSON صحيحة.'
        },
        {
          role: 'user',
          content: `قم بتقييم جودة التحليل التالي على مقياس من 0 إلى 100، وقدم ملاحظات تفصيلية:

${analysis}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      score: evaluation.score / 100 || 0,
      feedback: evaluation.feedback || []
    };

  } catch (error) {
    console.error('Error evaluating analysis:', error);
    return { score: 0, feedback: ['Error during evaluation'] };
  }
}
