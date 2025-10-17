# 📚 أمثلة عملية لاستخدام برومبتات سبق الذكية

## 🎯 نظرة عامة

هذا المستند يحتوي على أمثلة عملية شاملة لاستخدام جميع برومبتات سبق الذكية الموحدة في سيناريوهات حقيقية.

---

## 1️⃣ المحرر الذكي (News Editor)

### الاستخدام الأساسي

```typescript
import { SABQ_NEWS_EDITOR_PROMPT } from '@/lib/ai/sabq-prompts-library';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function editNewsArticle(content: string, title?: string, category?: string) {
  const userPrompt = SABQ_NEWS_EDITOR_PROMPT.userPromptTemplate(
    content,
    title,
    category
  );

  const response = await openai.chat.completions.create({
    model: SABQ_NEWS_EDITOR_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_NEWS_EDITOR_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_NEWS_EDITOR_PROMPT.settings.temperature,
    max_tokens: SABQ_NEWS_EDITOR_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال 1: خبر اقتصادي

```typescript
const economicNews = `
أعلنت وزارة الاستثمار السعودية اليوم الأحد عن إطلاق مشروع استثماري ضخم 
بقيمة 5 مليارات ريال في قطاع التقنية والابتكار بمدينة الرياض.

يهدف المشروع إلى تطوير البنية التحتية التقنية ودعم الشركات الناشئة 
في مجالات الذكاء الاصطناعي والتحول الرقمي.

وقال وزير الاستثمار المهندس خالد الفالح إن المشروع يأتي ضمن رؤية 
المملكة 2030 لتنويع مصادر الدخل وبناء اقتصاد معرفي متقدم.

من المتوقع أن يوفر المشروع أكثر من 10 آلاف وظيفة نوعية في القطاع 
التقني خلال السنوات الخمس القادمة.
`;

const result = await editNewsArticle(
  economicNews,
  'إطلاق مشروع استثماري',
  'اقتصاد'
);

console.log(result);
// {
//   title: "السعودية تطلق مشروعاً استثمارياً بـ 5 مليارات ريال في التقنية",
//   subtitle: "المشروع يستهدف تطوير البنية التحتية ودعم الشركات الناشئة بالرياض",
//   smart_summary: "أعلنت وزارة الاستثمار السعودية عن مشروع استثماري...",
//   keywords: ["وزارة الاستثمار", "الرياض", "التقنية", "الذكاء الاصطناعي", ...],
//   slug: "saudi-tech-investment-5-billion",
//   seo_title: "مشروع سعودي بـ 5 مليارات ريال للتقنية والابتكار",
//   meta_description: "السعودية تطلق مشروعاً استثمارياً ضخماً...",
//   tags: ["استثمار", "تقنية", "رؤية 2030", ...]
// }
```

### مثال 2: خبر عاجل

```typescript
const urgentNews = `
أصدر مجلس الوزراء السعودي قراراً بتعديل نظام العمل لتعزيز مرونة 
سوق العمل ودعم التوظيف.

يتضمن القرار السماح بالعمل عن بُعد بشكل رسمي، وتنظيم ساعات العمل 
المرنة، وتحسين حقوق العاملين في القطاع الخاص.

يدخل القرار حيز التنفيذ خلال 90 يوماً من تاريخ نشره في الجريدة الرسمية.
`;

const result = await editNewsArticle(
  urgentNews,
  'قرار مجلس الوزراء',
  'عاجل'
);

console.log(result);
// {
//   title: "مجلس الوزراء يعدّل نظام العمل ويسمح بالعمل عن بُعد رسمياً",
//   subtitle: "القرار يدخل حيز التنفيذ خلال 90 يوماً ويشمل ساعات عمل مرنة",
//   smart_summary: "أصدر مجلس الوزراء السعودي قراراً تاريخياً...",
//   keywords: ["مجلس الوزراء", "نظام العمل", "العمل عن بُعد", ...],
//   ...
// }
```

---

## 2️⃣ الملخص الذكي (Smart Summary)

### الاستخدام الأساسي

```typescript
import { SABQ_SMART_SUMMARY_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function summarizeArticle(content: string, maxLength: number = 400) {
  const userPrompt = SABQ_SMART_SUMMARY_PROMPT.userPromptTemplate(
    content,
    maxLength
  );

  const response = await openai.chat.completions.create({
    model: SABQ_SMART_SUMMARY_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_SMART_SUMMARY_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_SMART_SUMMARY_PROMPT.settings.temperature,
    max_tokens: SABQ_SMART_SUMMARY_PROMPT.settings.max_tokens
  });

  return response.choices[0]?.message?.content || '';
}
```

### مثال: تلخيص مقال طويل

```typescript
const longArticle = `
[مقال طويل من 2000 كلمة عن التحول الرقمي في السعودية...]
`;

const summary = await summarizeArticle(longArticle, 350);

console.log(summary);
// "يشهد الاقتصاد السعودي تحولاً رقمياً متسارعاً يعيد تشكيل القطاعات 
// التقليدية. يركز التحول على تحسين الخدمات الحكومية وخلق فرص عمل جديدة 
// في التقنية. يواجه التحول تحديات في تطوير المهارات والأمن السيبراني، 
// لكن التكامل بين القطاعين العام والخاص يعزز فرص النجاح."
```

---

## 3️⃣ التحليل العميق (Deep Analysis)

### الاستخدام الأساسي

```typescript
import { SABQ_DEEP_ANALYSIS_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function analyzeDeep(
  topic: string, 
  context?: string, 
  customPrompt?: string
) {
  const userPrompt = SABQ_DEEP_ANALYSIS_PROMPT.userPromptTemplate(
    topic,
    context,
    customPrompt
  );

  const response = await openai.chat.completions.create({
    model: SABQ_DEEP_ANALYSIS_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_DEEP_ANALYSIS_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_DEEP_ANALYSIS_PROMPT.settings.temperature,
    max_tokens: SABQ_DEEP_ANALYSIS_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال: تحليل التحول الرقمي

```typescript
const analysis = await analyzeDeep(
  'التحول الرقمي في السعودية',
  'قطاع التقنية والابتكار',
  'ركز على الجوانب الاقتصادية والاجتماعية'
);

console.log(analysis);
// {
//   title: "التحول الرقمي في السعودية: فرص وتحديات",
//   summary: "تحليل شامل للتحول الرقمي في المملكة...",
//   sections: [
//     {
//       title: "الوضع الحالي للتحول الرقمي",
//       content: "تشهد المملكة العربية السعودية..."
//     },
//     {
//       title: "الفرص الاقتصادية",
//       content: "يوفر التحول الرقمي فرصاً هائلة..."
//     },
//     {
//       title: "التحديات الاجتماعية",
//       content: "رغم الفوائد الكبيرة، يواجه التحول..."
//     }
//   ],
//   recommendations: [
//     "تطوير برامج تدريبية للمهارات الرقمية",
//     "تعزيز البنية التحتية التقنية",
//     "دعم الشركات الناشئة في القطاع التقني"
//   ],
//   keyInsights: [
//     "التحول الرقمي يساهم في تنويع الاقتصاد",
//     "الحاجة إلى 500 ألف متخصص تقني بحلول 2030",
//     "الاستثمار في الذكاء الاصطناعي يتجاوز 20 مليار ريال"
//   ],
//   dataPoints: [
//     {
//       label: "نمو القطاع التقني",
//       value: "15",
//       unit: "%",
//       description: "معدل النمو السنوي المتوقع"
//     }
//   ]
// }
```

---

## 4️⃣ توليد العناوين (Title Generation)

### الاستخدام الأساسي

```typescript
import { SABQ_TITLE_GENERATION_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function generateTitles(content: string) {
  const userPrompt = SABQ_TITLE_GENERATION_PROMPT.userPromptTemplate(content);

  const response = await openai.chat.completions.create({
    model: SABQ_TITLE_GENERATION_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_TITLE_GENERATION_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_TITLE_GENERATION_PROMPT.settings.temperature,
    max_tokens: SABQ_TITLE_GENERATION_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال: توليد عناوين متنوعة

```typescript
const newsContent = `
أعلنت هيئة الرياضة السعودية عن استضافة المملكة لبطولة كأس العالم 
للأندية 2025، بمشاركة 32 فريقاً من مختلف القارات.
`;

const titles = await generateTitles(newsContent);

console.log(titles);
// {
//   titles: [
//     {
//       text: "السعودية تستضيف كأس العالم للأندية 2025 بمشاركة 32 فريقاً",
//       type: "إخباري مباشر",
//       score: 95,
//       seoOptimized: true
//     },
//     {
//       text: "32 فريقاً عالمياً في السعودية: كأس العالم للأندية 2025",
//       type: "بالأرقام",
//       score: 90,
//       seoOptimized: true
//     },
//     {
//       text: "رسمياً.. السعودية تحتضن كأس العالم للأندية",
//       type: "عاجل",
//       score: 88,
//       seoOptimized: false
//     },
//     {
//       text: "هل تستعد السعودية لأكبر حدث رياضي في 2025؟",
//       type: "سؤال",
//       score: 75,
//       seoOptimized: false
//     }
//   ],
//   recommended: "السعودية تستضيف كأس العالم للأندية 2025 بمشاركة 32 فريقاً",
//   reasoning: "العنوان الأول يجمع بين الوضوح والمعلومات الأساسية..."
// }
```

---

## 5️⃣ استخراج الكلمات المفتاحية (Keywords Extraction)

### الاستخدام الأساسي

```typescript
import { SABQ_KEYWORDS_EXTRACTION_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function extractKeywords(content: string, category?: string) {
  const userPrompt = SABQ_KEYWORDS_EXTRACTION_PROMPT.userPromptTemplate(
    content,
    category
  );

  const response = await openai.chat.completions.create({
    model: SABQ_KEYWORDS_EXTRACTION_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_KEYWORDS_EXTRACTION_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_KEYWORDS_EXTRACTION_PROMPT.settings.temperature,
    max_tokens: SABQ_KEYWORDS_EXTRACTION_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال: استخراج كلمات مفتاحية من خبر

```typescript
const newsContent = `
أعلن صندوق الاستثمارات العامة السعودي عن إطلاق صندوق جديد بقيمة 
40 مليار دولار للاستثمار في التقنيات الناشئة والذكاء الاصطناعي.
`;

const keywords = await extractKeywords(newsContent, 'اقتصاد');

console.log(keywords);
// {
//   primaryKeywords: [
//     "صندوق الاستثمارات العامة",
//     "الذكاء الاصطناعي",
//     "التقنيات الناشئة"
//   ],
//   secondaryKeywords: [
//     "استثمار",
//     "السعودية",
//     "40 مليار دولار"
//   ],
//   entities: {
//     persons: [],
//     places: ["السعودية"],
//     organizations: ["صندوق الاستثمارات العامة"],
//     events: ["إطلاق صندوق جديد"],
//     topics: ["الذكاء الاصطناعي", "التقنيات الناشئة"]
//   },
//   searchTerms: [
//     "صندوق الاستثمارات العامة السعودي",
//     "استثمار الذكاء الاصطناعي",
//     "التقنيات الناشئة السعودية"
//   ],
//   seoKeywords: [
//     "صندوق الاستثمارات العامة",
//     "الذكاء الاصطناعي السعودية",
//     "استثمار 40 مليار دولار"
//   ]
// }
```

---

## 6️⃣ الروابط الذكية (Smart Links)

### الاستخدام الأساسي

```typescript
import { SABQ_SMART_LINKS_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function extractEntities(content: string) {
  const userPrompt = SABQ_SMART_LINKS_PROMPT.userPromptTemplate(content);

  const response = await openai.chat.completions.create({
    model: SABQ_SMART_LINKS_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_SMART_LINKS_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_SMART_LINKS_PROMPT.settings.temperature,
    max_tokens: SABQ_SMART_LINKS_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال: استخراج كيانات للربط

```typescript
const articleContent = `
التقى ولي العهد الأمير محمد بن سلمان مع رئيس شركة تسلا إيلون ماسك 
في الرياض لبحث فرص الاستثمار في مشاريع الطاقة المتجددة.
`;

const entities = await extractEntities(articleContent);

console.log(entities);
// {
//   persons: [
//     {
//       name: "محمد بن سلمان",
//       title: "ولي العهد",
//       relevance: 100,
//       suggestedLink: "/tag/mohammed-bin-salman"
//     },
//     {
//       name: "إيلون ماسك",
//       title: "رئيس شركة تسلا",
//       relevance: 95,
//       suggestedLink: "/tag/elon-musk"
//     }
//   ],
//   places: [
//     {
//       name: "الرياض",
//       type: "مدينة",
//       relevance: 85,
//       suggestedLink: "/location/riyadh"
//     }
//   ],
//   organizations: [
//     {
//       name: "تسلا",
//       type: "شركة",
//       relevance: 90,
//       suggestedLink: "/tag/tesla"
//     }
//   ],
//   topics: [
//     {
//       name: "الطاقة المتجددة",
//       relevance: 80,
//       suggestedLink: "/category/renewable-energy"
//     },
//     {
//       name: "الاستثمار",
//       relevance: 75,
//       suggestedLink: "/category/investment"
//     }
//   ],
//   relatedArticles: [
//     "مشاريع الطاقة المتجددة في السعودية",
//     "استثمارات تسلا في الشرق الأوسط"
//   ]
// }
```

---

## 7️⃣ فلترة التعليقات (Comment Moderation)

### الاستخدام الأساسي

```typescript
import { SABQ_COMMENT_MODERATION_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function moderateComment(comment: string, articleContext?: string) {
  const userPrompt = SABQ_COMMENT_MODERATION_PROMPT.userPromptTemplate(
    comment,
    articleContext
  );

  const response = await openai.chat.completions.create({
    model: SABQ_COMMENT_MODERATION_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_COMMENT_MODERATION_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_COMMENT_MODERATION_PROMPT.settings.temperature,
    max_tokens: SABQ_COMMENT_MODERATION_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال 1: تعليق مقبول

```typescript
const comment1 = "مقال رائع ومفيد، شكراً على المعلومات القيمة";
const result1 = await moderateComment(comment1);

console.log(result1);
// {
//   action: "approve",
//   category: "positive",
//   severity: 0,
//   reason: "تعليق إيجابي ومحترم",
//   suggestedEdit: null,
//   confidence: 100
// }
```

### مثال 2: تعليق يحتاج مراجعة

```typescript
const comment2 = "هذا القرار سيء جداً ولن ينفع أبداً";
const result2 = await moderateComment(comment2);

console.log(result2);
// {
//   action: "review",
//   category: "negative_opinion",
//   severity: 30,
//   reason: "رأي سلبي لكنه لا يحتوي على إساءة مباشرة",
//   suggestedEdit: "أعتقد أن هذا القرار قد لا يحقق النتائج المرجوة",
//   confidence: 85
// }
```

### مثال 3: تعليق مرفوض

```typescript
const comment3 = "كلام فارغ ومسؤولين فاشلين";
const result3 = await moderateComment(comment3);

console.log(result3);
// {
//   action: "reject",
//   category: "offensive",
//   severity: 80,
//   reason: "يحتوي على إساءة وألفاظ غير لائقة",
//   suggestedEdit: null,
//   confidence: 95
// }
```

---

## 8️⃣ التوصيات الذكية (Smart Recommendations)

### الاستخدام الأساسي

```typescript
import { SABQ_SMART_RECOMMENDATIONS_PROMPT } from '@/lib/ai/sabq-prompts-library';

async function getRecommendations(
  userInterests: string[],
  readingHistory: string[],
  availableArticles: any[]
) {
  const userPrompt = SABQ_SMART_RECOMMENDATIONS_PROMPT.userPromptTemplate(
    userInterests,
    readingHistory,
    availableArticles
  );

  const response = await openai.chat.completions.create({
    model: SABQ_SMART_RECOMMENDATIONS_PROMPT.settings.model,
    messages: [
      { role: 'system', content: SABQ_SMART_RECOMMENDATIONS_PROMPT.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: SABQ_SMART_RECOMMENDATIONS_PROMPT.settings.temperature,
    max_tokens: SABQ_SMART_RECOMMENDATIONS_PROMPT.settings.max_tokens,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

### مثال: توصيات مخصصة

```typescript
const userInterests = ['تقنية', 'اقتصاد', 'رياضة'];
const readingHistory = [
  'الذكاء الاصطناعي في السعودية',
  'استثمارات التقنية',
  'كأس العالم 2026'
];
const availableArticles = [
  { id: 1, title: 'مشروع نيوم التقني', category: 'تقنية', views: 5000 },
  { id: 2, title: 'البورصة السعودية', category: 'اقتصاد', views: 3000 },
  { id: 3, title: 'دوري روشن', category: 'رياضة', views: 8000 },
  // ... المزيد
];

const recommendations = await getRecommendations(
  userInterests,
  readingHistory,
  availableArticles
);

console.log(recommendations);
// {
//   recommendations: [
//     {
//       articleId: 1,
//       title: "مشروع نيوم التقني",
//       score: 95,
//       reason: "يتطابق مع اهتمامك بالتقنية والاستثمار",
//       category: "تقنية"
//     },
//     {
//       articleId: 3,
//       title: "دوري روشن",
//       score: 85,
//       reason: "يتوافق مع اهتمامك بالرياضة",
//       category: "رياضة"
//     },
//     {
//       articleId: 2,
//       title: "البورصة السعودية",
//       score: 80,
//       reason: "يتعلق بالاقتصاد والاستثمار",
//       category: "اقتصاد"
//     }
//   ],
//   diversity: {
//     categories: ["تقنية", "رياضة", "اقتصاد"],
//     balance: "متوازن"
//   },
//   reasoning: "تم اختيار المقالات بناءً على اهتماماتك وسجل قراءتك..."
// }
```

---

## 🧪 التقييم التلقائي

### استخدام نظام التقييم

```typescript
import PromptEvaluationService from '@/lib/ai/prompt-evaluation-service';

const evaluator = new PromptEvaluationService(process.env.OPENAI_API_KEY);

// تقييم مخرج واحد
const result = await evaluator.evaluateSingle({
  promptType: 'sabq.ai.prompts.editor.improveText',
  originalContent: rawContent,
  generatedOutput: aiOutput
});

console.log('📊 نتائج التقييم:');
console.log('  الدرجة الإجمالية:', result.overallScore + '/100');
console.log('  التقدير:', result.grade);
console.log('  جاهز للنشر:', result.readyForPublish ? 'نعم' : 'لا');
console.log('\n  المعايير:');
console.log('    الوضوح:', result.scores.clarity);
console.log('    الدقة:', result.scores.factuality);
console.log('    مطابقة الأسلوب:', result.scores.styleMatch);
console.log('    الاكتمال:', result.scores.completeness);
console.log('    الصلة:', result.scores.relevance);

if (result.weaknesses.length > 0) {
  console.log('\n  نقاط الضعف:');
  result.weaknesses.forEach(w => console.log('    -', w));
}

if (result.suggestions.length > 0) {
  console.log('\n  الاقتراحات:');
  result.suggestions.forEach(s => console.log('    -', s));
}
```

### تقييم دفعة من المخرجات

```typescript
const requests = [
  {
    promptType: 'sabq.ai.prompts.editor.improveText',
    originalContent: content1,
    generatedOutput: output1
  },
  {
    promptType: 'sabq.ai.prompts.summary.generate',
    originalContent: content2,
    generatedOutput: output2
  },
  // ... المزيد
];

const batchResult = await evaluator.evaluateBatch(requests);

console.log('📈 الإحصائيات:');
console.log('  إجمالي العينات:', batchResult.totalSamples);
console.log('  المتوسط العام:', batchResult.averageScore.toFixed(1) + '/100');
console.log('  نسبة النجاح:', batchResult.passRate.toFixed(1) + '%');

// توليد تقرير
const report = evaluator.generateReport(batchResult);
console.log('\n' + report);
```

---

## 🎯 أفضل الممارسات

### 1. استخدام البرومبتات الموحدة دائماً

```typescript
// ❌ سيء - برومبت مخصص
const prompt = "اكتب عنواناً للخبر...";

// ✅ جيد - برومبت موحد
import { SABQ_TITLE_GENERATION_PROMPT } from '@/lib/ai/sabq-prompts-library';
const prompt = SABQ_TITLE_GENERATION_PROMPT.userPromptTemplate(content);
```

### 2. معالجة الأخطاء

```typescript
try {
  const result = await editNewsArticle(content);
  // معالجة النتيجة
} catch (error) {
  console.error('خطأ في التحرير:', error);
  // استخدام fallback أو إشعار المستخدم
}
```

### 3. التحقق من الجودة

```typescript
const result = await editNewsArticle(content);

// تقييم الجودة
const evaluation = await evaluator.evaluateSingle({
  promptType: 'sabq.ai.prompts.editor.improveText',
  originalContent: content,
  generatedOutput: JSON.stringify(result)
});

if (evaluation.readyForPublish) {
  // نشر المحتوى
  await publishArticle(result);
} else {
  // مراجعة يدوية
  await sendForReview(result, evaluation.suggestions);
}
```

### 4. التخزين المؤقت

```typescript
import { createHash } from 'crypto';

// إنشاء مفتاح كاش
const cacheKey = createHash('md5')
  .update(content + category)
  .digest('hex');

// التحقق من الكاش
let result = await cache.get(cacheKey);

if (!result) {
  // توليد جديد
  result = await editNewsArticle(content, title, category);
  
  // حفظ في الكاش
  await cache.set(cacheKey, result, 3600); // ساعة واحدة
}

return result;
```

---

## 📚 المراجع

- [دليل البرومبتات الموحدة](./lib/ai/README.md)
- [تقرير مراجعة البرومبتات](./SABQ_AI_PROMPT_REVIEW.md)
- [وثائق OpenAI](https://platform.openai.com/docs)

---

**الإصدار**: 1.0.0  
**آخر تحديث**: 17 أكتوبر 2025  
**المسؤول**: فريق سبق الذكية - قسم الذكاء الاصطناعي

