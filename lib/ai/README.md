# 🤖 نظام برومبتات سبق الذكية الموحد

## 📚 نظرة عامة

هذا المجلد يحتوي على نظام موحد لجميع برومبتات الذكاء الاصطناعي المستخدمة في منصة سبق الذكية، مع معايير موحدة لأسلوب سبق التحريري ونظام تقييم تلقائي للمخرجات.

---

## 📁 الملفات

### 1. `sabq-prompts-library.ts`
**مكتبة البرومبتات الموحدة**

يحتوي على:
- ✅ 8 برومبتات رئيسية موحدة
- ✅ معايير أسلوب سبق التحريري
- ✅ إعدادات محسّنة لكل برومبت
- ✅ دوال مساعدة للوصول إلى البرومبتات

**البرومبتات المتوفرة:**
1. `sabq.ai.prompts.editor.improveText` - المحرر الذكي
2. `sabq.ai.prompts.summary.generate` - الملخص الذكي
3. `sabq.ai.prompts.analysis.deepReport` - التحليل العميق
4. `sabq.ai.prompts.links.entityMap` - الروابط الذكية
5. `sabq.ai.prompts.moderation.filter` - فلترة التعليقات
6. `sabq.ai.prompts.recommendation.personalize` - التوصيات الذكية
7. `sabq.ai.prompts.titles.generate` - توليد العناوين
8. `sabq.ai.prompts.keywords.extract` - استخراج الكلمات المفتاحية

### 2. `prompt-evaluation-service.ts`
**خدمة التقييم التلقائي**

يحتوي على:
- ✅ نظام تقييم بـ 5 معايير
- ✅ تقييم فردي ودفعات
- ✅ مقارنة بين برومبتات
- ✅ توليد تقارير تفصيلية

**المعايير:**
- الوضوح (Clarity)
- الدقة الواقعية (Factuality)
- مطابقة الأسلوب (Style Match)
- الاكتمال (Completeness)
- الصلة (Relevance)

---

## 🚀 الاستخدام

### استخدام البرومبتات الموحدة

```typescript
import { SABQ_NEWS_EDITOR_PROMPT } from '@/lib/ai/sabq-prompts-library';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// إنشاء البرومبت
const userPrompt = SABQ_NEWS_EDITOR_PROMPT.userPromptTemplate(
  rawContent,
  titleHint,
  category
);

// استدعاء OpenAI
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

const result = JSON.parse(response.choices[0]?.message?.content || '{}');
```

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

console.log(`الدرجة: ${result.overallScore}/100`);
console.log(`التقدير: ${result.grade}`);
console.log(`جاهز للنشر: ${result.readyForPublish}`);

// تقييم دفعة
const batchResult = await evaluator.evaluateBatch(requests);
const report = evaluator.generateReport(batchResult);
console.log(report);
```

### الحصول على برومبت بالمعرف

```typescript
import { getSabqPrompt } from '@/lib/ai/sabq-prompts-library';

const prompt = getSabqPrompt('sabq.ai.prompts.editor.improveText');
console.log(prompt.name); // "محرر الأخبار الذكي"
console.log(prompt.category); // "تحرير"
```

### الحصول على برومبتات حسب الفئة

```typescript
import { getSabqPromptsByCategory } from '@/lib/ai/sabq-prompts-library';

const editorPrompts = getSabqPromptsByCategory('تحرير');
console.log(editorPrompts.length); // عدد برومبتات التحرير
```

---

## 🎯 أمثلة عملية

### مثال 1: تحرير خبر

```typescript
import { SABQ_NEWS_EDITOR_PROMPT } from '@/lib/ai/sabq-prompts-library';
import OpenAI from 'openai';

async function editNews(content: string, title?: string, category?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
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
    ...SABQ_NEWS_EDITOR_PROMPT.settings,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}

// الاستخدام
const result = await editNews(
  'أعلنت وزارة الاستثمار...',
  'إطلاق مشروع جديد',
  'اقتصاد'
);

console.log(result.title);
console.log(result.subtitle);
console.log(result.smart_summary);
console.log(result.keywords);
```

### مثال 2: تلخيص مقال

```typescript
import { SABQ_SMART_SUMMARY_PROMPT } from '@/lib/ai/sabq-prompts-library';
import OpenAI from 'openai';

async function summarizeArticle(content: string, maxLength: number = 400) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
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
    ...SABQ_SMART_SUMMARY_PROMPT.settings
  });

  return response.choices[0]?.message?.content || '';
}

// الاستخدام
const summary = await summarizeArticle('نص المقال الطويل...');
console.log(summary);
```

### مثال 3: تحليل عميق

```typescript
import { SABQ_DEEP_ANALYSIS_PROMPT } from '@/lib/ai/sabq-prompts-library';
import OpenAI from 'openai';

async function analyzeDeep(topic: string, context?: string, customPrompt?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
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
    ...SABQ_DEEP_ANALYSIS_PROMPT.settings,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}

// الاستخدام
const analysis = await analyzeDeep(
  'التحول الرقمي في السعودية',
  'قطاع التقنية',
  'ركز على الجوانب الاقتصادية'
);

console.log(analysis.title);
console.log(analysis.summary);
console.log(analysis.sections);
console.log(analysis.recommendations);
```

### مثال 4: تقييم المخرجات

```typescript
import PromptEvaluationService from '@/lib/ai/prompt-evaluation-service';

async function evaluateOutput(
  promptType: string,
  originalContent: string,
  generatedOutput: string
) {
  const evaluator = new PromptEvaluationService(process.env.OPENAI_API_KEY);
  
  const result = await evaluator.evaluateSingle({
    promptType,
    originalContent,
    generatedOutput
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

  return result;
}

// الاستخدام
await evaluateOutput(
  'sabq.ai.prompts.editor.improveText',
  'النص الأصلي...',
  'المخرج المولد...'
);
```

---

## 🧪 الاختبار

### تشغيل سكربت الاختبار

```bash
# من جذر المشروع
npx tsx scripts/test-prompts-evaluation.ts
```

سيقوم السكربت بـ:
1. اختبار جميع البرومبتات على عينات متنوعة
2. تقييم المخرجات تلقائياً
3. توليد تقرير تفصيلي
4. حفظ النتائج في `test-results/`

### عينات الاختبار المتوفرة

- خبر عادي (اقتصاد)
- مقال رأي (تحليل)
- خبر عاجل
- خبر رياضي

---

## 📊 معايير الجودة

### نظام التقدير

| الدرجة | التقدير | الوصف |
|--------|---------|-------|
| 90-100 | ممتاز | جاهز للنشر مباشرة |
| 75-89 | جيد جداً | يحتاج تعديلات طفيفة |
| 60-74 | جيد | يحتاج تحسينات |
| 40-59 | مقبول | يحتاج مراجعة شاملة |
| 0-39 | ضعيف | يحتاج إعادة كتابة |

### المعايير الخمسة

1. **الوضوح (Clarity)**
   - هل النص واضح ومفهوم؟
   - هل الجمل قصيرة ومباشرة؟
   - هل المصطلحات مناسبة؟

2. **الدقة الواقعية (Factuality)**
   - هل المعلومات دقيقة؟
   - هل الأرقام صحيحة؟
   - هل المصادر موثوقة؟

3. **مطابقة الأسلوب (Style Match)**
   - هل يتبع أسلوب سبق التحريري؟
   - هل النبرة مناسبة؟
   - هل اللغة رسمية واحترافية؟

4. **الاكتمال (Completeness)**
   - هل يحتوي على جميع العناصر المطلوبة؟
   - هل الطول مناسب؟
   - هل التنسيق صحيح؟

5. **الصلة (Relevance)**
   - هل المحتوى ذو صلة بالموضوع؟
   - هل يجيب على السؤال المطلوب؟
   - هل يركز على النقاط المهمة؟

---

## 🔧 الإعدادات المحسّنة

### جدول الإعدادات لكل برومبت

| البرومبت | Model | Temperature | Max Tokens | Use Case |
|---------|-------|-------------|------------|----------|
| **المحرر الذكي** | gpt-4o-mini | 0.3 | 1500 | تحرير الأخبار |
| **الملخص الذكي** | gpt-4o-mini | 0.2 | 500 | تلخيص المقالات |
| **التحليل العميق** | gpt-4o-mini | 0.5 | 3000 | التحليلات المتعمقة |
| **الروابط الذكية** | gpt-4o-mini | 0.1 | 1000 | استخراج الكيانات |
| **فلترة التعليقات** | gpt-4o-mini | 0.1 | 500 | تصنيف التعليقات |
| **التوصيات** | gpt-4o-mini | 0.4 | 1500 | توصيات المقالات |
| **توليد العناوين** | gpt-4o-mini | 0.6 | 800 | إنشاء العناوين |
| **الكلمات المفتاحية** | gpt-4o-mini | 0.1 | 600 | SEO |

### شرح المعلمات

- **Temperature**: 
  - `0.1-0.2`: للمهام التي تتطلب دقة عالية (تلخيص، كلمات مفتاحية)
  - `0.3-0.4`: للمهام المتوازنة (تحرير، توصيات)
  - `0.5-0.6`: للمهام الإبداعية (تحليل، عناوين)

- **Max Tokens**:
  - `500-600`: للمخرجات القصيرة (ملخص، كلمات مفتاحية)
  - `800-1500`: للمخرجات المتوسطة (تحرير، عناوين، توصيات)
  - `3000`: للمخرجات الطويلة (تحليل عميق)

---

## 📝 أفضل الممارسات

### 1. استخدام البرومبتات الموحدة دائماً

```typescript
// ❌ سيء - برومبت مخصص
const prompt = "اكتب عنواناً للخبر...";

// ✅ جيد - برومبت موحد
import { SABQ_TITLE_GENERATION_PROMPT } from '@/lib/ai/sabq-prompts-library';
const prompt = SABQ_TITLE_GENERATION_PROMPT.userPromptTemplate(content);
```

### 2. تقييم المخرجات قبل النشر

```typescript
// ✅ جيد - تقييم تلقائي
const result = await evaluator.evaluateSingle({
  promptType: 'sabq.ai.prompts.editor.improveText',
  originalContent,
  generatedOutput
});

if (result.readyForPublish) {
  // نشر المحتوى
} else {
  // مراجعة يدوية
}
```

### 3. استخدام الإعدادات المحسّنة

```typescript
// ✅ جيد - استخدام الإعدادات الموحدة
const response = await openai.chat.completions.create({
  ...SABQ_NEWS_EDITOR_PROMPT.settings,
  messages: [...]
});
```

### 4. معالجة الأخطاء

```typescript
try {
  const result = await editNews(content);
  // معالجة النتيجة
} catch (error) {
  console.error('خطأ في التحرير:', error);
  // استخدام fallback أو إشعار المستخدم
}
```

---

## 🔄 التحديثات المستقبلية

### خطة التطوير

- [ ] إضافة برومبتات جديدة (تصحيح لغوي، ترجمة)
- [ ] دعم نماذج GPT-4 الأحدث
- [ ] تحسين نظام التقييم بالتعلم الآلي
- [ ] إضافة cache للمخرجات المتكررة
- [ ] لوحة تحكم لمراقبة الأداء

---

## 📚 المراجع

- [وثائق OpenAI](https://platform.openai.com/docs)
- [دليل Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [معايير سبق التحريرية](../docs/SABQ_AI_PROMPT_REVIEW.md)

---

## 🤝 المساهمة

لإضافة برومبت جديد:

1. أضف البرومبت في `sabq-prompts-library.ts`
2. اتبع معايير التسمية الموحدة
3. حدد الإعدادات المناسبة
4. أضف أمثلة في هذا الملف
5. اختبر البرومبت على عينات متنوعة
6. قيّم المخرجات تلقائياً

---

**الإصدار**: 2.0.0  
**آخر تحديث**: 17 أكتوبر 2025  
**المسؤول**: فريق سبق الذكية - قسم الذكاء الاصطناعي

