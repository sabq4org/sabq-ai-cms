# ✅ إضافة ميزة عرض شرح الصورة (Alt Text) في تفاصيل الخبر

## 📋 المشكلة
المستخدم لا يرى شرح الصورة (Alt Text) في صفحة تفاصيل الخبر، رغم أن النظام يحفظه في قاعدة البيانات.

## ✅ الحل المطبق

### 1. تعديل مكون عرض الصورة البارزة
**الملف:** `components/article/ArticleFeaturedImage.tsx`

- ✅ إضافة عرض شرح الصورة (Alt Text) تحت الصورة
- ✅ عرض وصف الصورة (caption) إذا كان مختلف عن الـ Alt Text
- ✅ تمييز بصري بين الـ Alt Text (خط عريض) ووصف الصورة (مائل)

```tsx
{/* عرض شرح الصورة (Alt Text) أو وصف الصورة إذا وُجد */}
{(alt || caption) && (
  <div className="mt-3 text-center">
    {alt && alt !== title && (
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {alt}
      </p>
    )}
    {caption && caption !== alt && (
      <p className="text-sm text-gray-500 dark:text-gray-500 italic mt-1">
        {caption}
      </p>
    )}
  </div>
)}
```

### 2. تعديل مكون الصورة للموبايل
**الملف:** `components/article/MobileFeaturedImage.tsx`

- ✅ إضافة عرض شرح الصورة في إصدار الموبايل
- ✅ تصميم متجاوب مع خلفية مميزة

```tsx
{/* شرح الصورة (Alt Text) أو التعليق على الصورة إن وجد */}
{(alt || caption) && (
  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
    {alt && alt !== title && (
      <p className="text-xs text-gray-600 dark:text-gray-300 text-center font-medium">
        {alt}
      </p>
    )}
    {caption && caption !== alt && (
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic mt-1">
        {caption}
      </p>
    )}
  </div>
)}
```

### 3. تحديث API لإرجاع بيانات Alt Text
**الملف:** `app/api/articles/[id]/route.ts`

- ✅ إضافة `featured_image_alt` و `featured_image_caption` في الاستجابة
- ✅ ضمان وصول البيانات للواجهة الأمامية

```typescript
// ✅ إضافة حقول Alt Text ووصف الصورة
featured_image_alt: (article as any).featured_image_alt,
featured_image_caption: (article as any).featured_image_caption,
```

## 🎯 النتيجة

### ميزات جديدة:
1. **عرض شرح الصورة:** يظهر النص البديل للصورة أسفل الصورة البارزة
2. **دعم وصف الصورة:** يمكن عرض وصف إضافي للصورة إذا كان مختلف عن الـ Alt Text
3. **تمييز بصري:** الـ Alt Text يظهر بخط عريض، ووصف الصورة بخط مائل
4. **تجاوب كامل:** يعمل على جميع الشاشات والأوضاع (موبايل وديسكتوب)

### شروط العرض:
- ✅ يظهر شرح الصورة إذا كان مختلف عن عنوان المقال
- ✅ يظهر وصف الصورة إذا كان موجود ومختلف عن شرح الصورة
- ✅ لا يظهر إذا كان مطابق لعنوان المقال (تجنب التكرار)

## 🔧 كيفية الاستخدام

### للمحررين:
1. في صفحة إنشاء/تحديث الخبر
2. ارفع الصورة البارزة
3. املأ حقل "شرح الصورة" (Alt Text)
4. اختيارياً: املأ حقل "وصف الصورة" (Caption)
5. احفظ المقال

### للقراء:
- سيظهر شرح الصورة تلقائياً أسفل الصورة البارزة في صفحة تفاصيل الخبر

## 📱 التوافق
- ✅ ديسكتوب: في جميع أوضاع عرض الصور (blur-overlay، aspect-ratio، fullwidth)
- ✅ موبايل: في مكون الصورة المخصص للموبايل
- ✅ الوضع المظلم: ألوان متوافقة مع النمط المظلم

## 🎨 التصميم
- **شرح الصورة:** `text-gray-600 dark:text-gray-400 font-medium`
- **وصف الصورة:** `text-gray-500 dark:text-gray-500 italic`
- **المحاذاة:** وسط الصفحة
- **التباعد:** هامش علوي 12px من الصورة

---
📅 **تاريخ التطبيق:** يناير 2025  
🔖 **الحالة:** ✅ مكتمل ومفعّل
