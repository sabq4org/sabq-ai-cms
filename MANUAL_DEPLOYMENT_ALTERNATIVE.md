# بديل النشر اليدوي (في حالة استمرار مشكلة GitHub)

## الخيار 1: تطبيق التغييرات يدوياً على الخادم

### 1. الاتصال بخادم الإنتاج عبر SSH
```bash
ssh your-server
cd /path/to/sabq-ai-cms
```

### 2. تطبيق الـ patch
```bash
# انسخ محتوى digitalocean-fixes.patch
# ثم طبقه:
git apply digitalocean-fixes.patch
```

### 3. بناء Prisma وإعادة تشغيل التطبيق
```bash
npx prisma generate
npm run build
pm2 restart sabq-ai-cms  # أو أي أمر تستخدمه لإعادة التشغيل
```

## الخيار 2: تعديل الملفات مباشرة في GitHub UI

### 1. تعديل prisma/schema.prisma
- اذهب إلى: https://github.com/sabq4org/sabq-ai-cms/blob/main/prisma/schema.prisma
- اضغط على زر Edit (القلم)
- استبدل المحتوى بالـ schema الجديد من ملفك المحلي

### 2. تعديل app/api/articles/route.ts
- غير `categories` إلى `category` في السطر 220

### 3. تعديل app/api/articles/[id]/route.ts
- غير `categories` إلى `category` في الأسطر 44 و 116

### 4. تعديل app/api/articles/personalized/route.ts
- غير `categories` إلى `category` في السطر 86

## الخيار 3: إنشاء fork نظيف

1. إنشاء fork جديد من المشروع
2. تطبيق التغييرات على الـ fork
3. استخدام الـ fork للنشر مؤقتاً
4. بعد حل مشكلة الـ secrets، دمج التغييرات

## ملاحظات مهمة:
- التغييرات ضرورية لعمل الموقع مع DigitalOcean
- بدون هذه التغييرات، ستظهر رسالة "لا توجد مقالات منشورة"
- تأكد من تحديث DATABASE_URL في بيئة الإنتاج 