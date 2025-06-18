# تطبيق الوضع الليلي (Dark Mode) - صحيفة سبق

## نظرة عامة
تم تطبيق نظام شامل للوضع الليلي في جميع أجزاء المشروع، يدعم التبديل اليدوي والكشف التلقائي مع حفظ تفضيلات المستخدم.

## 🎯 الميزات المنفذة

### 1. نظام Hook موحد
- **ملف**: `/hooks/useDarkMode.ts`
- يدير حالة الوضع الليلي عبر التطبيق
- يدعم الكشف التلقائي لتفضيل النظام
- يحفظ تفضيل المستخدم في localStorage
- يطبق الكلاس `dark` على document.documentElement

### 2. مكونات الوضع الليلي

#### DarkModeProvider
- **ملف**: `/components/DarkModeProvider.tsx`
- Provider يطبق الوضع الليلي على مستوى التطبيق
- يتعامل مع التحديثات التلقائية

#### DarkModeToggle
- **ملف**: `/components/DarkModeToggle.tsx`
- زر تبديل مع أيقونات Sun/Moon
- يحتوي على tooltip تفاعلي
- رسوم متحركة سلسة

### 3. التكامل في التطبيق

#### Layout الرئيسي
- **ملف**: `/app/layout.tsx`
- تطبيق الألوان الأساسية على body
- دعم الانتقالات السلسة

#### Providers
- **ملف**: `/app/providers.tsx`
- تضمين DarkModeProvider كأعلى مستوى
- تحديث أنماط react-hot-toast للوضع الليلي

#### Header
- **ملف**: `/components/Header.tsx`
- إضافة زر التبديل في الهيدر
- تطبيق الألوان المناسبة للوضع الليلي

#### لوحة التحكم
- **ملفات**: `/app/dashboard/layout.tsx`, `/app/dashboard/page.tsx`, `/app/dashboard/news/page.tsx`
- استخدام useDarkMode hook
- تطبيق الألوان على جميع المكونات
- دعم خاص للجداول والبطاقات

### 4. تفاصيل التصميم

#### الألوان الأساسية

**الوضع النهاري:**
- الخلفية: `bg-white`
- النص الرئيسي: `text-gray-900`
- النص الثانوي: `text-gray-600`
- الحدود: `border-gray-200`

**الوضع الليلي:**
- الخلفية: `bg-gray-900`
- النص الرئيسي: `text-gray-100`
- النص الثانوي: `text-gray-400`
- الحدود: `border-gray-700`

#### مكونات خاصة

**الجداول:**
- رأس الجدول: `#1e3a5f` (ليلي) / `#f0fdff` (نهاري)
- حدود الخلايا: `#374151` (ليلي) / `#f4f8fe` (نهاري)
- الصفوف عند التمرير: `hover:bg-gray-700` / `hover:bg-slate-50`

**البطاقات:**
- خلفية: `bg-gray-800` / `bg-white`
- حدود: `border-gray-700` / `border-gray-100`

## 🔧 التكوين

### Tailwind CSS
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // تفعيل الوضع الليلي بناءً على الكلاس
  // ...
}
```

### CSS عام
```css
/* app/globals.css */
/* تحسينات للـ scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

## 📱 الاستخدام

### في Component جديد
```tsx
import { useDarkMode } from '@/hooks/useDarkMode';

export function MyComponent() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={darkMode ? 'bg-gray-800' : 'bg-white'}>
      // محتوى المكون
    </div>
  );
}
```

### استخدام Tailwind Classes
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  محتوى يدعم الوضع الليلي
</div>
```

## 🎨 أفضل الممارسات

1. **استخدم دائماً dark: prefix** مع Tailwind classes
2. **أضف transition-colors** للانتقالات السلسة
3. **تأكد من التباين** - استخدم ألوان متباينة لسهولة القراءة
4. **اختبر على الوضعين** - تأكد من عمل التصميم في كلا الوضعين

## 🐛 حل المشاكل الشائعة

### المشكلة: الوضع الليلي لا يعمل
- تأكد من وجود `darkMode: 'class'` في `tailwind.config.js`
- تأكد من تضمين DarkModeProvider في التطبيق
- تحقق من وجود الكلاس `dark` على `<html>`

### المشكلة: تغييرات مفاجئة في الألوان
- أضف `transition-colors duration-300` للعناصر
- استخدم `suppressHydrationWarning` على `<html>`

## ✅ قائمة التحقق

- [x] تكوين Tailwind CSS
- [x] إنشاء useDarkMode hook
- [x] إنشاء DarkModeProvider
- [x] إنشاء DarkModeToggle component
- [x] تحديث Layout الرئيسي
- [x] تحديث Header
- [x] تحديث لوحة التحكم
- [x] تحديث جميع الصفحات الفرعية
- [x] دعم الجداول والبطاقات
- [x] اختبار التباين والوصولية
- [x] إضافة الانتقالات السلسة
- [x] دعم prefers-color-scheme
- [x] حفظ التفضيل في localStorage

## 🚀 التحسينات المستقبلية

1. إضافة مزيد من السمات (Themes)
2. دعم تخصيص الألوان
3. إضافة وضع تلقائي يتبع توقيت اليوم
4. تحسين الأداء باستخدام CSS Variables
5. إضافة اختصارات لوحة المفاتيح للتبديل 