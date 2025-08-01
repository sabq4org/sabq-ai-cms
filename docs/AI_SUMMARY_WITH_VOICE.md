# الملخص الذكي مع التحويل الصوتي
AI Summary with Voice Synthesis

## نظرة عامة
تم تفعيل ميزة الملخص الذكي مع التحويل الصوتي في صفحات تفاصيل المقالات باستخدام:
- **توليد الملخص الذكي**: API داخلي لتوليد ملخصات ذكية للمقالات
- **التحويل الصوتي**: ElevenLabs API للتحويل المتقدم أو Web Speech API كبديل

## المكونات الرئيسية

### 1. مكون الملخص الذكي
- **الموقع**: `components/article/ArticleAISummary.tsx`
- **الميزات**:
  - عرض الملخص الذكي للمقال
  - توليد ملخص جديد إذا لم يكن موجودًا
  - تحويل النص لصوت باستخدام ElevenLabs
  - مشغل صوتي متكامل مع عناصر تحكم
  - دعم التحميل والتقديم السريع
  - احتساب وقت القراءة التقديري

### 2. API التحويل الصوتي
- **الموقع**: `app/api/tts/elevenlabs/route.ts`
- **النقاط**:
  - `POST /api/tts/elevenlabs` - تحويل النص لصوت
  - `GET /api/tts/elevenlabs` - جلب الأصوات المتاحة

### 3. API توليد الملخص
- **الموقع**: `app/api/ai/summarize/route.ts`
- **النقاط**:
  - `POST /api/ai/summarize` - توليد ملخص ذكي
  - `GET /api/ai/summarize` - جلب الملخص الموجود

## التكوين

### متغيرات البيئة
```env
ELEVENLABS_API_KEY=your_api_key_here
```

### الأصوات المتاحة
- **Saber**: صوت ذكوري عربي
- **Fatima**: صوت أنثوي عربي
- **Default**: صوت افتراضي

## الاستخدام

### في صفحة المقال
```tsx
import ArticleAISummary from '@/components/article/ArticleAISummary';

<ArticleAISummary
  articleId={article.id}
  title={article.title}
  content={article.content}
  existingSummary={article.ai_summary}
  className="shadow-lg"
/>
```

## الميزات

### 1. توليد الملخص التلقائي
- يتم توليد ملخص ذكي من أول 3000 حرف من المقال
- يُحفظ الملخص في metadata المقال

### 2. التحويل الصوتي المتقدم
- **الخيار الأول**: ElevenLabs للجودة العالية
- **الخيار الثاني**: Web Speech API كبديل مجاني
- تحميل الملف الصوتي كـ MP3

### 3. واجهة المستخدم
- تصميم عصري بألوان متدرجة
- أزرار تحكم سهلة الاستخدام
- شريط تقدم للصوت
- عرض الوقت المتبقي والمنقضي

## معالجة الأخطاء

### فشل ElevenLabs API
- يتم التبديل تلقائيًا إلى Web Speech API
- عرض رسالة تحذيرية في وحدة التحكم

### فشل توليد الملخص
- عرض رسالة خطأ واضحة
- إمكانية إعادة المحاولة

## الأمان
- تحقق من صلاحية مفتاح API
- تنظيف المدخلات قبل الإرسال
- حماية ضد الطلبات المتكررة

## التحسينات المستقبلية
1. دعم المزيد من اللغات
2. إضافة المزيد من الأصوات العربية
3. تحسين خوارزمية توليد الملخص
4. إضافة إعدادات صوتية متقدمة
5. دعم تحميل الملفات بصيغ مختلفة

## الصيانة
- تحديث مفتاح ElevenLabs API عند الحاجة
- مراقبة استخدام API لتجنب تجاوز الحدود
- تحديث الأصوات المتاحة دوريًا

## مثال عملي
```
1. افتح صفحة أي مقال
2. سيظهر قسم "الملخص الذكي" تحت العنوان
3. اضغط "توليد ملخص ذكي" إذا لم يكن موجودًا
4. اضغط "الاستماع للملخص" للتحويل الصوتي
5. استخدم أزرار التحكم للتشغيل/الإيقاف/التقديم
``` 