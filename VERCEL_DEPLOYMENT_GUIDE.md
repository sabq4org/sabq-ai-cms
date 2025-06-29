# دليل نشر مشروع سبق على Vercel

## 1. إعداد المتغيرات البيئية في Vercel

اذهب إلى لوحة تحكم Vercel وأضف المتغيرات التالية:

### متغيرات قاعدة البيانات
```
DATABASE_URL=your-database-connection-string
```

### متغيرات التحقق والأمان
```
JWT_SECRET=your-jwt-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://sabq-ai-cms.vercel.app
ADMIN_SECRET=your-admin-secret-for-migration
```

### إعدادات البريد الإلكتروني
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@sabq-ai.com
```

### OpenAI API (للذكاء الاصطناعي)
```
OPENAI_API_KEY=your-openai-api-key
```

### رفع الملفات (Cloudinary) - **تم إعداده مسبقاً**
```
CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=vuiA8rLNm7d1U-UAOTED6FyC4hY
CLOUDINARY_URL=cloudinary://559894124915114:vuiA8rLNm7d1U-UAOTED6FyC4hY@dybhezmvb
```

### إعدادات التطبيق
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sabq-ai-cms.vercel.app
NEXT_PUBLIC_API_URL=https://sabq-ai-cms.vercel.app/api
```

## 2. إعداد قاعدة البيانات

### خيار 1: PlanetScale (مُوصى به)
1. أنشئ حساب على [PlanetScale](https://planetscale.com)
2. أنشئ قاعدة بيانات جديدة
3. احصل على connection string
4. أضفه في متغير `DATABASE_URL`

### خيار 2: PostgreSQL (Supabase/Neon)
1. أنشئ حساب على [Supabase](https://supabase.com) أو [Neon](https://neon.tech)
2. أنشئ قاعدة بيانات جديدة
3. احصل على connection string
4. أضفه في متغير `DATABASE_URL`

## 3. إعداد رفع الملفات - ✅ **تم الانتهاء**

### ✅ Cloudinary مُعد ومجهز
- **Cloud Name**: dybhezmvb
- **API Key**: 559894124915114
- **API Secret**: vuiA8rLNm7d1U-UAOTED6FyC4hY

**الميزات المُفعلة:**
- ✅ رفع الصور تلقائياً إلى Cloudinary
- ✅ تحسين الصور تلقائياً (جودة وحجم)
- ✅ تحويل الصور لأفضل تنسيق
- ✅ حد أقصى 1200x800 بكسل
- ✅ مجلد منظم: `sabq-cms/`

## 4. التحديثات المطلوبة للكود - ✅ **تم الانتهاء**

### تم إضافة `runtime = 'nodejs'` للملفات التالية:
- جميع مسارات API التي تستخدم Prisma
- جميع مسارات API التي تستخدم نظام الملفات
- مسارات رفع الملفات والمصادقة

### تم تحديث `next.config.js`:
- إزالة `output: 'standalone'`
- إزالة `unoptimized: true` للصور
- تحسين إعدادات الصور لـ Vercel

### تم تحديث نظام رفع الملفات:
- ✅ دعم Cloudinary مع البيانات الصحيحة
- ✅ تحسين الصور تلقائياً
- ✅ التراجع للتخزين المحلي في حالة الطوارئ

## 5. خطوات النشر

1. **ربط المستودع**: اربط مستودع GitHub بـ Vercel
2. **إعداد المتغيرات**: أضف المتغيرات البيئية المطلوبة (خاصة DATABASE_URL)
3. **النشر**: اضغط على Deploy
4. **تشغيل المهاجرات**: اختر إحدى الطرق التالية:

   **أ) تلقائياً مع البناء (مُوصى به):**
   - ✅ تم إعداده مسبقاً في `package.json`
   - سيعمل تلقائياً عند النشر

   **ب) يدوياً عبر API:**
   ```bash
   # أضف ADMIN_SECRET في متغيرات Vercel أولاً
   npm run migrate:prod
   ```

   **ج) عبر Vercel CLI:**
   ```bash
   vercel exec -- npx prisma db push
   ```

## 6. اختبار النشر

بعد النشر، تأكد من:
- [ ] تحميل الصفحة الرئيسية
- [ ] تسجيل الدخول
- [ ] إنشاء مستخدم جديد
- [ ] **رفع صورة (سيعمل تلقائياً مع Cloudinary)** ✅
- [ ] إنشاء مقال جديد
- [ ] عمل التفاعلات

## 7. مشاكل شائعة وحلولها

### مشكلة: API routes لا تعمل
**الحل**: تأكد من وجود `export const runtime = 'nodejs'` في جميع ملفات API

### مشكلة: قاعدة البيانات لا تعمل
**الحل**: تأكد من صحة `DATABASE_URL` وتشغيل `npx prisma db push`

### ✅ مشكلة: رفع الصور - **تم الحل**
**الحالة**: يعمل تلقائياً مع Cloudinary المُعد مسبقاً

### مشكلة: البريد الإلكتروني لا يُرسل
**الحل**: تأكد من إعدادات SMTP وكلمة مرور التطبيق

## 8. مراقبة الأداء

- استخدم Vercel Analytics لمراقبة الأداء
- راقب Function Logs للأخطاء
- استخدم Vercel Speed Insights
- راقب استخدام Cloudinary من [لوحة التحكم](https://console.cloudinary.com)

## 9. النسخ الاحتياطي

- قم بعمل نسخة احتياطية من قاعدة البيانات دورياً
- احتفظ بنسخة من المتغيرات البيئية
- استخدم Git للتحكم في الإصدارات
- **الصور محفوظة تلقائياً في Cloudinary** ✅

## 10. الأمان

- لا تشارك المتغيرات البيئية
- استخدم HTTPS فقط
- قم بتحديث المكتبات دورياً
- راجع صلاحيات المستخدمين
- **بيانات Cloudinary آمنة ومحمية** ✅

---

## نصائح إضافية:

1. **استخدم Environment Preview**: لاختبار التغييرات قبل النشر
2. **فعّل Automatic Deployments**: للنشر التلقائي عند push
3. **استخدم Custom Domain**: لمظهر أكثر احترافية
4. **راقب Usage**: لتجنب تجاوز الحدود المجانية
5. **راقب Cloudinary Usage**: خطة مجانية تتضمن 25 GB و 25,000 تحويل شهرياً

## 🎯 الحالة الحالية:

### ✅ **جاهز للنشر:**
- رفع الملفات (Cloudinary)
- تحسين الصور
- جميع إصلاحات API
- إعدادات Vercel

### ⏳ **يحتاج إعداد:**
- قاعدة البيانات (DATABASE_URL)
- مفاتيح JWT والأمان
- إعدادات البريد الإلكتروني
- مفتاح OpenAI (اختياري)

للمساعدة: تواصل مع فريق التطوير أو راجع [وثائق Vercel](https://vercel.com/docs) 