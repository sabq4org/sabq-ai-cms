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

// البرومبتات الأساسية للتحليل
const ANALYSIS_PROMPTS = {
  fromArticle: `أنت محرر تحليلي محترف في صحيفة سبق. اقرأ الخبر التالي بعناية، ثم قم بإنشاء تحليل عميق واستراتيجي يتضمن:

1. **خلفية الحدث**: السياق التاريخي والظروف المحيطة
2. **الأثر المحلي والعالمي**: التأثيرات المباشرة وغير المباشرة
3. **البيانات والأرقام**: إحصائيات ومؤشرات ذات صلة
4. **التداعيات المستقبلية**: السيناريوهات المحتملة
5. **التحديات**: العقبات والصعوبات المتوقعة
6. **الفرص**: الإمكانيات والآفاق الإيجابية
7. **التوصيات الاستراتيجية**: خطوات عملية مقترحة

يجب أن يكون التحليل:
- بلغة عربية فصحى احترافية
- منظم بعناوين فرعية واضحة
- مدعوم بالحقائق والمنطق
- يتراوح بين 1500-2500 كلمة

الخبر:
{articleContent}`,

  fromTopic: `أنت محرر تحليلي محترف في صحيفة سبق. قم بإنشاء تحليل عميق حول الموضوع التالي:

الموضوع: {topic}
التصنيف: {category}

يجب أن يتضمن التحليل:
1. مقدمة شاملة عن الموضوع
2. الوضع الحالي والتطورات الأخيرة
3. التحديات الرئيسية
4. الفرص والإمكانيات
5. مقارنات محلية وعالمية
6. توقعات مستقبلية
7. توصيات عملية

احرص على:
- استخدام لغة عربية فصحى احترافية
- تنظيم المحتوى بشكل منطقي
- دعم التحليل بأمثلة واقعية
- تقديم رؤى عميقة وقيّمة`,

  fromExternal: `أنت محرر تحليلي محترف في صحيفة سبق. بناءً على المحتوى التالي من مصدر خارجي، قم بإنشاء تحليل عميق:

المصدر: {externalUrl}
المحتوى:
{externalContent}

قم بـ:
1. تلخيص النقاط الرئيسية
2. تحليل الأهمية والتأثير
3. ربط الموضوع بالسياق المحلي
4. تقديم وجهات نظر متعددة
5. استخلاص الدروس والعبر
6. اقتراح خطوات مستقبلية

تأكد من:
- عدم نسخ المحتوى حرفياً
- إضافة قيمة تحليلية حقيقية
- الحفاظ على الموضوعية`
};

// دالة توليد التحليل
export async function generateDeepAnalysis(
  request: GenerateAnalysisRequest
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
        prompt = ANALYSIS_PROMPTS.fromArticle.replace('{articleContent}', request.sourceId || '');
        break;
      case 'topic':
        prompt = ANALYSIS_PROMPTS.fromTopic
          .replace('{topic}', request.topic || '')
          .replace('{category}', request.category || '');
        break;
      case 'external':
        prompt = ANALYSIS_PROMPTS.fromExternal
          .replace('{externalUrl}', request.externalUrl || '')
          .replace('{externalContent}', ''); // سيتم جلب المحتوى
        break;
    }

    // إضافة تعليمات خاصة إن وجدت
    if (request.customPrompt) {
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

    // استدعاء OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'أنت محرر تحليلي محترف في صحيفة سبق الإخبارية. تكتب تحليلات عميقة ومهنية باللغة العربية الفصحى.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // تحليل الاستجابة
    const parsedResponse = JSON.parse(response);
    
    // بناء محتوى التحليل
    const content = parseAnalysisResponse(parsedResponse);
    
    // حساب جودة المحتوى
    const qualityScore = calculateQualityScore(content);
    
    // حساب وقت القراءة (250 كلمة في الدقيقة)
    const wordCount = countWords(parsedResponse.content || '');
    const estimatedReadingTime = Math.ceil(wordCount / 250);

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
  
  // وجود أقسام (25%)
  if (content.sections.length >= 5) {
    score += 0.25;
  } else if (content.sections.length >= 3) {
    score += 0.15;
  }
  
  // وجود بيانات (25%)
  if (content.dataPoints && content.dataPoints.length > 0) {
    score += 0.25;
  }
  
  // وجود توصيات (25%)
  if (content.recommendations && content.recommendations.length >= 3) {
    score += 0.25;
  } else if (content.recommendations && content.recommendations.length > 0) {
    score += 0.15;
  }
  
  // وجود رؤى رئيسية (25%)
  if (content.keyInsights && content.keyInsights.length >= 3) {
    score += 0.25;
  } else if (content.keyInsights && content.keyInsights.length > 0) {
    score += 0.15;
  }
  
  return Math.round(score * 100) / 100;
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
      model: 'gpt-4',
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
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في تقييم جودة التحليلات الصحفية. قم بتقييم التحليل المقدم وإعطاء نقاط القوة والضعف.'
        },
        {
          role: 'user',
          content: `قم بتقييم جودة التحليل التالي على مقياس من 0 إلى 100، وقدم ملاحظات تفصيلية:\n\n${analysis}`
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