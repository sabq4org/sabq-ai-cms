# إصلاح خطأ Image Ref في Next.js 🖼️

## المشكلة
ظهر خطأ في وحدة التحكم (console) متعلق بـ Image component من Next.js:
```
ImageElement</ownRef<@webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/image-component.js:146:25
```

## السبب
استخدام spread operator مع خصائص شرطية في مكون Image يمكن أن يسبب مشاكل في refs:
```javascript
// ❌ هذا يسبب مشاكل
<Image
  {...(fill ? { fill } : { width, height })}
  {...(sizes ? { sizes } : {})}
/>
```

## الحل
فصل الحالات المختلفة إلى مكونات منفصلة:

```javascript
// ✅ هذا أفضل
{fill ? (
  <Image
    fill
    src={imageSrc}
    alt={alt}
    sizes={sizes || '100vw'}
  />
) : (
  <Image
    width={width}
    height={height}
    src={imageSrc}
    alt={alt}
  />
)}
```

## الملفات المحدثة
- `components/ui/SafeImage.tsx` - تم تحديث طريقة render لتجنب spread operator

## الفوائد
1. تجنب مشاكل refs في Next.js
2. كود أوضح وأسهل للفهم
3. أداء أفضل (تجنب إنشاء objects غير ضرورية)
4. تجنب أخطاء TypeScript المحتملة

## ملاحظات إضافية
- Next.js Image component حساس جداً لطريقة تمرير الخصائص
- يفضل دائماً تمرير الخصائص مباشرة بدلاً من استخدام spread operator
- عند استخدام `fill`، يجب دائماً تمرير `sizes` لتحسين الأداء 