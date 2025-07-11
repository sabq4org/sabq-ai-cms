# إصلاح مشكلة تقييم الجودة

## المشكلة
تقييم الجودة لا يظهر في التحليلات المولدة بـ GPT.

## الأسباب
1. خطأ في حساب عدد الكلمات - كان يحاول حساب الكلمات من `parsedResponse.content` غير الموجود
2. عدم تقريب قيمة الجودة قبل إرسالها للواجهة

## الحلول المطبقة

### 1. تصحيح حساب عدد الكلمات في `lib/services/deepAnalysisService.ts`
```typescript
// قبل:
const wordCount = countWords(parsedResponse.content || '');

// بعد:
const totalWords = content.sections.reduce((total, section) => {
  return total + countWords(section.content);
}, 0);
```

### 2. تحسين إرسال قيمة الجودة في `app/api/deep-analyses/generate/route.ts`
```typescript
// إضافة تقريب القيمة
qualityScore: Math.round(result.analysis.qualityScore || 0),
```

### 3. إضافة سجلات تشخيصية
```typescript
console.log('Analysis quality score:', result.analysis.qualityScore);
console.log('Analysis content sections:', result.analysis.content?.sections?.length);
```

## كيفية عمل تقييم الجودة

يتم حساب الجودة بناءً على معايير متعددة:

1. **عدد الأقسام (15%)**
   - 10+ أقسام = 15 نقطة
   - 8+ أقسام = 12 نقطة
   - 6+ أقسام = 9 نقاط

2. **طول المحتوى (25%)**
   - 3000+ كلمة = 25 نقطة
   - 2500+ كلمة = 20 نقطة
   - 2000+ كلمة = 15 نقطة

3. **جودة العناوين (15%)**
   - عناوين منظمة ومرقمة = 15 نقطة
   - عناوين جيدة فقط = 10 نقاط

4. **البيانات والإحصائيات (10%)**
   - 7+ نقاط بيانات = 10 نقاط
   - 5+ نقاط بيانات = 8 نقاط

5. **التوصيات العملية (10%)**
   - 8+ توصيات = 10 نقاط
   - 6+ توصيات = 8 نقاط

6. **الرؤى الرئيسية (10%)**
   - 7+ رؤى = 10 نقاط
   - 5+ رؤى = 8 نقاط

7. **ثراء المحتوى (15%)**
   - أقسام مفصلة (300+ كلمة)
   - وجود قوائم وتنسيق
   - أرقام وإحصائيات
   - سياق سعودي محلي

## النتيجة
الآن يتم حساب وعرض تقييم الجودة بشكل صحيح في:
- رسالة النجاح عند التوليد
- جدول التحليلات (شريط تقدم مع نسبة مئوية)
- الإحصائيات العامة (متوسط الجودة) 