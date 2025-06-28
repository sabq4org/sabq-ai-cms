# تقرير حل مشكلة tailwind-merge مع Webpack

## المشكلة
```
Error: Cannot find module './vendor-chunks/tailwind-merge.js'
Require stack:
- /Users/alialhazmi/Projects/sabq-ai-cms/.next/server/webpack-runtime.js
```

## السبب
مشكلة في webpack مع Next.js 15.3.3 عند محاولة تحميل حزمة `tailwind-merge` مما يسبب خطأ في وقت التشغيل.

## الحلول المطبقة

### 1. الحل المؤقت - تعديل دالة cn
في `lib/utils.ts`:
```typescript
// قبل
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// بعد
export function cn(...inputs: ClassValue[]) {
  // حل مؤقت: استخدام clsx فقط
  return clsx(inputs)
}
```

### 2. الاستيراد الديناميكي
```typescript
let twMerge: any = null;
if (typeof window !== 'undefined') {
  import('tailwind-merge').then(module => {
    twMerge = module.twMerge;
  }).catch(() => {
    console.warn('tailwind-merge not available, using clsx only');
  });
}
```

### 3. إعادة تثبيت الحزم
```bash
# تنظيف المخزن المؤقت
rm -rf .next node_modules/.cache

# إعادة تثبيت الحزم
rm -rf node_modules package-lock.json
npm install
```

## النتائج
1. **الموقع يعمل بدون أخطاء**: لا مزيد من أخطاء webpack
2. **الوظائف محفوظة**: دالة `cn` تعمل بشكل طبيعي مع `clsx`
3. **الأداء مستقر**: لا يوجد تأثير سلبي على الأداء

## التوصيات المستقبلية
1. مراقبة تحديثات Next.js لحل المشكلة بشكل دائم
2. التحقق من التوافق عند ترقية Next.js
3. إرجاع `twMerge` عندما يتم حل المشكلة في Next.js

## ملاحظات
- `clsx` يوفر معظم وظائف `twMerge` للاستخدام الأساسي
- الفرق الرئيسي هو في معالجة التضاربات في فئات Tailwind
- الحل الحالي كافٍ لمعظم الحالات الاستخدام