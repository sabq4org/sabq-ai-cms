# نظام التصميم الموحد - سبق الذكية

## 1. الألوان

### الألوان الأساسية
- **النص الرئيسي**: `text-neutral-900 dark:text-neutral-100`
- **النص الثانوي**: `text-neutral-600 dark:text-neutral-400`
- **النص الخافت**: `text-neutral-500 dark:text-neutral-500`
- **الخلفيات**: 
  - الرئيسية: `bg-white dark:bg-neutral-900`
  - الثانوية: `bg-neutral-50 dark:bg-neutral-800`
  - البطاقات: `bg-white dark:bg-neutral-900`

### الحدود
- **الحدود الرئيسية**: `border-neutral-200 dark:border-neutral-700`
- **الحدود الخفيفة**: `border-neutral-100 dark:border-neutral-800`
- **حدود الفورم**: `border-[#f0f0ef] dark:border-neutral-700`

### ألوان التفاعل
- **اللون الأساسي**: Neutral (رمادي) وليس أزرق
- **الروابط**: `text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100`
- **Focus states**: `focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600`

## 2. الأزرار

### الزر الأساسي (Primary)
```css
bg-neutral-900 hover:bg-neutral-800 
dark:bg-neutral-100 dark:hover:bg-neutral-200
text-white dark:text-neutral-900
px-5 py-2 rounded-lg font-medium text-sm
transition-all duration-200
```

### الزر الثانوي (Secondary)
```css
bg-neutral-100 hover:bg-neutral-200 
dark:bg-neutral-800 dark:hover:bg-neutral-700
text-neutral-700 dark:text-neutral-300
px-5 py-2 rounded-lg font-medium text-sm
transition-all duration-200
```

### الزر الشبحي (Ghost)
```css
hover:bg-neutral-100 dark:hover:bg-neutral-800
text-neutral-700 dark:text-neutral-300
px-5 py-2 rounded-lg font-medium text-sm
transition-all duration-200
```

## 3. حقول الإدخال

### حقل النص العادي
```css
w-full p-4 
border border-neutral-200 dark:border-neutral-700 
rounded-xl 
bg-white dark:bg-neutral-900 
text-neutral-900 dark:text-neutral-100 
placeholder-neutral-400 dark:placeholder-neutral-500
focus:outline-none focus:ring-1 
focus:ring-neutral-300 dark:focus:ring-neutral-600
transition-colors
```

## 4. البطاقات والحاويات

### بطاقة عادية
```css
bg-white dark:bg-neutral-900
border border-neutral-200 dark:border-neutral-700
rounded-xl p-6
```

### بطاقة بدون حدود
```css
bg-white dark:bg-neutral-900
rounded-xl p-6
shadow-sm
```

## 5. المسافات

### Padding
- صغير: `p-2` (8px)
- متوسط: `p-4` (16px)
- كبير: `p-6` (24px)

### Margin
- بين الأقسام: `mt-12` (48px)
- بين العناصر: `mt-6` (24px)
- بين النصوص: `mt-3` (12px)

## 6. الحواف المنحنية

- أزرار وحقول: `rounded-lg` (8px)
- بطاقات: `rounded-xl` (12px)
- معارض الصور: `rounded-2xl` (16px)

## 7. الظلال

- خفيف: `shadow-sm`
- متوسط: `shadow`
- بدون ظل في معظم الحالات

## 8. التحولات

- سريع: `transition-colors duration-200`
- متوسط: `transition-all duration-300`
- بطيء: `transition-all duration-500`

## 9. أحجام النصوص

- العناوين الكبيرة: `text-2xl md:text-3xl font-bold`
- العناوين المتوسطة: `text-xl font-bold`
- العناوين الصغيرة: `text-lg font-semibold`
- النص العادي: `text-base`
- النص الصغير: `text-sm`
- النص الصغير جداً: `text-xs`

## 10. قواعد عامة

1. **تجنب الألوان الزاهية**: لا أزرق، لا أحمر، لا أخضر قوي
2. **استخدم تدرجات الرمادي**: من الأبيض إلى الأسود مع درجات neutral
3. **الحدود الخفيفة**: استخدم حدود رفيعة بدلاً من الظلال القوية
4. **التباين المناسب**: تأكد من وضوح النص على الخلفيات
5. **البساطة**: تصميم نظيف وبسيط بدون زخرفة زائدة
