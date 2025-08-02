import OpenAI from 'openai';

// إنشاء client اختياري - يعمل بدون API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export type DosePeriod = 'morning' | 'noon' | 'evening' | 'night';

// تطابق مع enum في قاعدة البيانات
export type DBDosePeriod = 'morning' | 'noon' | 'evening' | 'night';

export interface DoseContent {
  main_text: string;
  sub_text: string;
  topics: string[];
  source_articles: string[];
}

export interface GeneratedDose {
  period: DosePeriod;
  content: DoseContent;
  ai_prompt_used: string;
}

// قوالب العبارات الجاهزة كـ fallback
const DOSE_TEMPLATES = {
  morning: [
    {
      main_text: "ابدأ يومك بالأهم 👇",
      sub_text: "ملخص ذكي لما فاتك من أحداث البارحة… قبل فنجان القهوة ☕️"
    },
    {
      main_text: "صباح النشاط والإلهام ✨",
      sub_text: "هذه 3 أخبار مُلهمة تستحق أن تبدأ بها يومك"
    },
    {
      main_text: "مع قهوتك لا يفوتك 👀",
      sub_text: "اطلع على أبرز قصص الأمس… باختصار ذكي وممتع"
    }
  ],
  noon: [
    {
      main_text: "منتصف النهار… وحرارة الأخبار 🔥",
      sub_text: "إليك آخر المستجدات حتى هذه اللحظة، باختصار لا يفوّت"
    },
    {
      main_text: "موجز منتصف اليوم ⚡️",
      sub_text: "أخبار وتحليلات سريعة لتبقَ في قلب الحدث وأنت في زحمة اليوم"
    },
    {
      main_text: "بين العمل والحدث 📰",
      sub_text: "3 نقاط تلخص أبرز ما حصل هذا اليوم حتى الآن"
    }
  ],
  evening: [
    {
      main_text: "مساؤك ذكاء واطّلاع 🌇",
      sub_text: "إليك تحليلًا خفيفًا وذكيًا لأبرز قصص اليوم"
    },
    {
      main_text: "خلاصة المساء 🔍",
      sub_text: "أهم ما يمكن أن تعرفه قبل أن تُغلق دفاتر اليوم"
    },
    {
      main_text: "بين سطور المساء 📘",
      sub_text: "3 حكايات أو تقارير تستحق التأمل والمشاركة"
    }
  ],
  night: [
    {
      main_text: "قبل أن تنام… تعرف على ملخص اليوم 🌙",
      sub_text: "3 أخبار مختارة بعناية، خالية من الضجيج"
    },
    {
      main_text: "لأجل نوم هادئ 💤",
      sub_text: "قصص قصيرة وتحليلات مريحة… تلائم هذا الوقت"
    },
    {
      main_text: "خلاصة اليوم… بدون تشويش 🎧",
      sub_text: "أهم ما حدث بصيغة هادئة وسهلة الهضم"
    }
  ]
};

// أيقونات الفترات
const PERIOD_ICONS = {
  morning: '☀️',
  noon: '🕛',
  evening: '🌇',
  night: '🌙'
};

// ألوان الفترات
const PERIOD_COLORS = {
  morning: { primary: '#f59e0b', secondary: '#fbbf24' }, // أصفر دافئ
  noon: { primary: '#3b82f6', secondary: '#60a5fa' },    // أزرق نشط
  evening: { primary: '#8b5cf6', secondary: '#a78bfa' }, // بنفسجي هادئ
  night: { primary: '#475569', secondary: '#64748b' }    // رمادي مطمئن
};

/**
 * توليد جرعة ذكية بالذكاء الاصطناعي
 */
export async function generateSmartDose({
  period,
  recentArticles = [],
  userPreferences = [],
  context = {}
}: {
  period: DosePeriod;
  recentArticles?: any[];
  userPreferences?: string[];
  context?: Record<string, any>;
}): Promise<GeneratedDose> {
  
  try {
    // إذا لم يكن OpenAI متاحاً، استخدم القوالب مباشرة
    if (!openai) {
      console.log('⚠️ OpenAI غير متاح، استخدام القوالب الاحتياطية');
      return generateFallbackDose(period, recentArticles);
    }

    // إعداد السياق
    const timeContext = getTimeContext(period);
    const articlesContext = summarizeArticles(recentArticles.slice(0, 10));
    const preferencesContext = userPreferences.length > 0 
      ? `اهتمامات المستخدم: ${userPreferences.join(', ')}`
      : '';

    // بناء البرومبت
    const prompt = buildDosePrompt({
      period,
      timeContext,
      articlesContext,
      preferencesContext,
      context
    });

    // استدعاء OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `أنت مساعد تحريري خبير في صحيفة عربية متطورة. مهمتك إنتاج "جرعات ذكية" يومية تجمع بين الإعلام والإلهام.

قواعد الكتابة:
- استخدم لغة عربية بسيطة وجذابة
- اجعل العنوان الرئيسي قصير وملفت (3-8 كلمات)
- اجعل العنوان الفرعي ملهم ويشرح القيمة (10-15 كلمة)
- تجنب الإفراط في الرموز التعبيرية
- ركز على القيمة المضافة للقارئ
- تأكد من ملاءمة المحتوى للفترة الزمنية`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('لم يتم الحصول على استجابة من الذكاء الاصطناعي');
    }

    // تحليل الاستجابة
    const parsedContent = parseAIResponse(response, recentArticles);
    
    return {
      period,
      content: parsedContent,
      ai_prompt_used: prompt
    };

  } catch (error) {
    console.error('خطأ في توليد الجرعة بالذكاء الاصطناعي:', error);
    
    // العودة للقوالب الجاهزة كـ fallback
    return generateFallbackDose(period, recentArticles);
  }
}

/**
 * بناء البرومبت للذكاء الاصطناعي
 */
function buildDosePrompt({
  period,
  timeContext,
  articlesContext,
  preferencesContext,
  context
}: {
  period: DosePeriod;
  timeContext: string;
  articlesContext: string;
  preferencesContext: string;
  context: Record<string, any>;
}): string {
  
  const icon = PERIOD_ICONS[period];
  
  return `
المطلوب: إنتاج جرعة ذكية لفترة "${period}" ${icon}

${timeContext}

${articlesContext}

${preferencesContext}

تعليمات التنفيذ:
1. اكتب عنوان رئيسي جذاب (3-8 كلمات)
2. اكتب عنوان فرعي ملهم يوضح القيمة (10-15 كلمة)
3. اجعل المحتوى مناسب لهذه الفترة الزمنية
4. ركز على 2-3 مواضيع رئيسية فقط

تنسيق الاستجابة:
العنوان الرئيسي: [النص هنا]
العنوان الفرعي: [النص هنا]
المواضيع: [موضوع1, موضوع2, موضوع3]
`.trim();
}

/**
 * الحصول على سياق الوقت للفترة
 */
function getTimeContext(period: DosePeriod): string {
  const contexts = {
    morning: 'الوقت: الصباح الباكر - القراء يبحثون عن ملخص سريع لأحداث البارحة وما ينتظرهم اليوم',
    noon: 'الوقت: منتصف النهار - القراء في استراحة العمل يريدون آخر المستجدات العاجلة والمهمة',
    evening: 'الوقت: المساء - القراء يبحثون عن تحليل هادئ وخلاصة اليوم',
    night: 'الوقت: قبل النوم - القراء يريدون محتوى مريح وملخص يومي هادئ'
  };
  
  return contexts[period];
}

/**
 * تلخيص المقالات الحديثة
 */
function summarizeArticles(articles: any[]): string {
  if (articles.length === 0) {
    return 'لا توجد مقالات حديثة متاحة';
  }
  
  const summaries = articles.slice(0, 5).map((article, index) => 
    `${index + 1}. ${article.title} (${article.category_name || 'عام'})`
  );
  
  return `المقالات الحديثة المتاحة:\n${summaries.join('\n')}`;
}

/**
 * تحليل استجابة الذكاء الاصطناعي
 */
function parseAIResponse(response: string, sourceArticles: any[]): DoseContent {
  const lines = response.split('\n').filter(line => line.trim());
  
  let main_text = '';
  let sub_text = '';
  let topics: string[] = [];
  
  for (const line of lines) {
    if (line.includes('العنوان الرئيسي:')) {
      main_text = line.replace('العنوان الرئيسي:', '').trim();
    } else if (line.includes('العنوان الفرعي:')) {
      sub_text = line.replace('العنوان الفرعي:', '').trim();
    } else if (line.includes('المواضيع:')) {
      const topicsText = line.replace('المواضيع:', '').trim();
      topics = topicsText.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  
  // التحقق من صحة البيانات
  if (!main_text || !sub_text) {
    throw new Error('استجابة غير مكتملة من الذكاء الاصطناعي');
  }
  
  return {
    main_text,
    sub_text,
    topics: topics.length > 0 ? topics : ['عام'],
    source_articles: sourceArticles.slice(0, 3).map(a => a.id || a.slug)
  };
}

/**
 * توليد جرعة احتياطية من القوالب
 */
function generateFallbackDose(period: DosePeriod, sourceArticles: any[]): GeneratedDose {
  const templates = DOSE_TEMPLATES[period];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // استخراج المواضيع من المقالات المتاحة
  const topics = sourceArticles
    .slice(0, 3)
    .map(article => article.category_name || 'عام')
    .filter((topic, index, arr) => arr.indexOf(topic) === index); // إزالة التكرار
  
  return {
    period,
    content: {
      main_text: randomTemplate.main_text,
      sub_text: randomTemplate.sub_text,
      topics: topics.length > 0 ? topics : ['عام'],
      source_articles: sourceArticles.slice(0, 3).map(a => a.id || a.slug)
    },
    ai_prompt_used: `قالب احتياطي للفترة ${period}`
  };
}

/**
 * الحصول على ألوان الفترة
 */
export function getPeriodColors(period: DosePeriod) {
  return PERIOD_COLORS[period];
}

/**
 * الحصول على أيقونة الفترة
 */
export function getPeriodIcon(period: DosePeriod) {
  return PERIOD_ICONS[period];
}

/**
 * تحديد الفترة الحالية بناءً على الوقت
 */
export function getCurrentPeriod(): DosePeriod {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'noon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * الحصول على النص الوصفي للفترة
 */
export function getPeriodLabel(period: DosePeriod): string {
  const labels = {
    morning: 'الجرعة الصباحية',
    noon: 'جرعة منتصف اليوم',
    evening: 'الجرعة المسائية',
    night: 'جرعة ما قبل النوم'
  };
  
  return labels[period];
}