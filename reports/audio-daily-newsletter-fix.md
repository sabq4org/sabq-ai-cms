# إصلاح ظهور النشرة الصوتية اليومية في الصفحة الرئيسية

## المشكلة
عند توليد نشرة صوتية مع تفعيل خيار "حفظ كنشرة يومية" من صفحة `/dashboard/audio-test`، كانت النشرة لا تظهر في بلوك النشرة الصوتية في الصفحة الرئيسية.

## السبب
1. بلوك النشرة الصوتية (`PodcastBlock`) يبحث عن النشرات المنشورة باستخدام: `/api/audio/archive?published=true&latest=true`
2. API التوليد كان يحفظ النشرة مع `is_daily: true` فقط دون `is_published: true`
3. API الأرشيف لم يكن يدعم حقل `is_published` في حفظ النشرة

## الحل

### 1. تحديث صفحة اختبار الصوت
- **الملف**: `app/dashboard/audio-test/page.tsx`
- **التغيير**: تحديث النص من "ستُحفظ في الأرشيف" إلى "ستظهر في الصفحة الرئيسية"

### 2. تحديث API التوليد
- **الملف**: `app/api/audio/generate/route.ts`
- **التغيير**: عند توليد نشرة مع `is_daily: true`، يتم أيضاً إضافة `is_published: true`

```javascript
// في قسم حفظ الأرشيف الأساسي
body: JSON.stringify({
  // ... باقي الحقول
  is_daily: body.is_daily === true,
  is_published: body.is_daily === true // النشرة اليومية تكون منشورة تلقائياً
})
```

### 3. تحديث API الأرشيف
- **الملف**: `app/api/audio/archive/route.ts`
- **التغيير**: إضافة دعم حقل `is_published` في حفظ النشرة

```javascript
const { filename, url, size, duration, voice, text_length, is_daily, is_published } = body;

const newPodcast = {
  // ... باقي الحقول
  is_daily: is_daily || false,
  is_published: is_published || false, // إضافة حقل is_published
};
```

### 4. تحديث قسم Fallback
- **الملف**: `app/api/audio/generate/route.ts`
- **التغيير**: إضافة `is_published` في حالة استخدام الصوت الاحتياطي

## النتيجة
الآن عند توليد نشرة صوتية مع تفعيل خيار "حفظ كنشرة يومية":
1. تُحفظ النشرة في الأرشيف مع `is_daily: true` و `is_published: true`
2. تظهر مباشرة في بلوك النشرة الصوتية في الصفحة الرئيسية
3. لا حاجة لنشرها يدوياً من صفحة الأرشيف

## ملاحظات
- النشرات العادية (غير اليومية) تحتاج للنشر اليدوي من صفحة الأرشيف
- يمكن إلغاء نشر النشرة اليومية من صفحة الأرشيف إذا لزم الأمر
- البلوك يعرض آخر نشرة منشورة تلقائياً 