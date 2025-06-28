# دليل حل مشاكل محرر TipTap في نظام سبق

## 🔍 المشكلة
المحرر الذي يظهر في الصورة ليس محرر TipTap المتقدم، بل محرر بسيط بدون الميزات المطلوبة (الجداول، رفع الصور، التغريدات).

## 📋 خطوات التحقق والحل

### 1. التأكد من أن محرر TipTap يعمل
افتح المتصفح واذهب إلى:
```
http://localhost:3000/test-tiptap
```

إذا ظهر محرر TipTap بشريط أدوات كامل يحتوي على:
- أزرار التنسيق (B, I, U)
- العناوين (H2, H3)
- القوائم (نقطية ومرقمة)
- اقتباس (💬)
- رفع صورة (📷)
- إدراج جدول (📊)
- تغريدة (🐦)

✅ **إذن المحرر يعمل والمشكلة في صفحة إنشاء المقال**

### 2. فحص صفحة إنشاء المقال
1. افتح: http://localhost:3000/dashboard/news/create
2. قد تحتاج لتسجيل الدخول أولاً
3. انتقل إلى تبويب "المحتوى"

### 3. فحص وحدة التحكم (Console)
1. افتح أدوات المطور (F12)
2. انتقل إلى Console
3. ابحث عن أخطاء مثل:
   - `Cannot find module`
   - `TipTap is not defined`
   - `Hydration mismatch`

### 4. الحلول المحتملة

#### أ. مسح ذاكرة التخزين المؤقت
```bash
rm -rf .next
npm run dev
```

#### ب. التأكد من تثبيت المكتبات
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-underline @tiptap/extension-blockquote
```

#### ج. تحديث الصفحة بقوة
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

### 5. التحقق من أن المحرر الصحيح يتم تحميله

في ملف `app/dashboard/news/create/page.tsx`، تأكد من:

1. **الاستيراد الصحيح** (السطر 23):
```typescript
const TiptapEditor = dynamic(() => import('@/components/Editor/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
  )
});
```

2. **الاستخدام الصحيح** (السطر 830-840):
```tsx
<TiptapEditor 
  content={formData.content_html}
  onChange={(html, json) => {
    setFormData(prev => ({ 
      ...prev, 
      content_html: html,
      content_json: json
    }));
  }}
  placeholder="ابدأ بكتابة محتوى المقال هنا..."
/>
```

### 6. إذا استمرت المشكلة

#### تحقق من وجود محرر آخر
ابحث في الكود عن:
```bash
grep -r "ContentEditor" app/dashboard/news/create/
```

إذا وجدت محرر آخر، تأكد من أنه لا يتم استخدامه بدلاً من TipTap.

#### فحص حالة التحميل
أضف console.log للتأكد من التحميل:
```javascript
console.log('TiptapEditor loaded:', TiptapEditor);
```

### 7. الحل النهائي - إعادة البناء الكامل

```bash
# 1. إيقاف الخادم (Ctrl+C)
# 2. حذف node_modules و .next
rm -rf node_modules .next package-lock.json

# 3. إعادة تثبيت المكتبات
npm install

# 4. تشغيل الخادم
npm run dev

# 5. فتح الصفحة
http://localhost:3000/dashboard/news/create
```

## 🎯 النتيجة المتوقعة

يجب أن ترى محرر TipTap بشريط أدوات يحتوي على:
- **تنسيق**: B (عريض), I (مائل), U (تحته خط)
- **عناوين**: H2, H3
- **قوائم**: • (نقطية), 1. (مرقمة)
- **أدوات متقدمة**:
  - 💬 اقتباس
  - 🔗 إدراج صورة برابط
  - 📷 رفع صورة من الجهاز
  - 📊 إدراج جدول
  - 🐦 إدراج تغريدة
  - 🎥 إدراج فيديو
  - 😊 إدراج رمز تعبيري

## 📞 إذا لم تنجح الحلول

1. أرسل لقطة شاشة من Console
2. أرسل محتوى Network tab
3. تحقق من إصدار Node.js: `node --version` (يجب أن يكون 18+ أو 20+) 