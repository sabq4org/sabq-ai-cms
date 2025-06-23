# دليل النشر المبسط - صحيفة سبق

## 🚀 نشر المشروع على الإنترنت (خطوات بسيطة للمبتدئين)

### الهدف
نشر نسخة تجريبية من مشروع صحيفة سبق على الإنترنت لاختبارها على الأجهزة المختلفة.

---

## الطريقة الأولى: النشر عبر GitHub + Vercel (الأسهل) ⭐

### الخطوة 1: رفع المشروع إلى GitHub

1. **افتح Terminal/Command Prompt**
2. **انتقل إلى مجلد المشروع**:
   ```bash
   cd /Users/alialhazmi/Projects/sabq-ai-cms
   ```

3. **ارفع التغييرات**:
   ```bash
   git add .
   git commit -m "إعداد المشروع للنشر"
   git push
   ```

### الخطوة 2: ربط GitHub بـ Vercel

1. **اذهب إلى موقع Vercel**:
   - افتح [vercel.com](https://vercel.com)
   - اضغط "Sign Up" أو "Log In"

2. **ربط GitHub**:
   - اختر "Continue with GitHub"
   - أعط الصلاحيات المطلوبة

3. **استيراد المشروع**:
   - اضغط "Import Project"
   - اختر repository الخاص بك: `sabq-ai-cms`
   - اضغط "Import"

### الخطوة 3: إعداد النشر

1. **إعدادات المشروع**:
   - **Framework**: Next.js (سيتم اختياره تلقائياً)
   - **Build Command**: `npm run build` (افتراضي)
   - **Output Directory**: `.next` (افتراضي)
   - **Install Command**: `npm install` (افتراضي)

2. **متغيرات البيئة (اختياري)**:
   - اضغط "Environment Variables"
   - أضف: `NODE_ENV` = `production`
   - أضف: `OPENAI_API_KEY` = `مفتاح_OpenAI_الخاص_بك` (إذا كان متوفراً)

3. **ابدأ النشر**:
   - اضغط "Deploy"
   - انتظر 2-5 دقائق

### الخطوة 4: الحصول على الرابط

- بعد انتهاء النشر، ستحصل على رابط مثل:
  `https://sabq-ai-cms-username.vercel.app`

---

## الطريقة الثانية: النشر المباشر عبر Vercel CLI

### الخطوة 1: تثبيت Vercel CLI

```bash
npm install -g vercel
```

### الخطوة 2: تسجيل الدخول

```bash
vercel login
```

### الخطوة 3: النشر

```bash
vercel --prod
```

---

## 🧪 اختبار المشروع

بعد النشر، اختبر المشروع على:

### الصفحات الرئيسية:
- **الرئيسية**: `https://your-site.vercel.app/`
- **الأخبار**: `https://your-site.vercel.app/news`
- **مقال معين**: `https://your-site.vercel.app/article/article-1750687587617-5q2ppvwbx`
- **لوحة التحكم**: `https://your-site.vercel.app/dashboard`
- **البحث**: `https://your-site.vercel.app/search`

### الأجهزة:
- ✅ كمبيوتر مكتبي
- ✅ جوال (Android/iPhone)
- ✅ تابلت
- ✅ متصفحات مختلفة

---

## 🔧 نصائح مهمة

### 1. حفظ الرابط
احفظ رابط المشروع في مكان آمن لاستخدامه لاحقاً.

### 2. التحديث التلقائي
أي تغيير تدفعه إلى GitHub سيتم نشره تلقائياً على Vercel.

### 3. مراقبة الأداء
- تحقق من سرعة التحميل
- اختبر على شبكات مختلفة
- راقب استخدام الموارد

---

## ✅ قائمة التحقق النهائية

- [ ] المشروع يعمل محلياً بدون أخطاء
- [ ] تم رفع جميع الملفات إلى GitHub
- [ ] تم ربط المشروع بـ Vercel
- [ ] الرابط يعمل ويفتح الصفحة الرئيسية
- [ ] تم اختبار الموقع على أجهزة مختلفة
- [ ] تم حفظ رابط المشروع

🎉 **مبروك! مشروعك الآن متاح على الإنترنت**

# دليل النشر السريع على Vercel

## المشاكل التي تم حلها

1. **مشكلة autoprefixer**: تم نقل `autoprefixer`, `postcss`, و `tailwindcss` من `devDependencies` إلى `dependencies`
2. **إعدادات Vercel**: تم تحديث `vercel.json` لتثبيت جميع الحزم بشكل صحيح

## متغيرات البيئة المطلوبة في Vercel

يجب إضافة هذه المتغيرات في إعدادات المشروع على Vercel:

```
# قاعدة البيانات
DATABASE_URL=

# JWT
JWT_SECRET=

# OpenAI
OPENAI_API_KEY=

# Email (اختياري)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# URLs
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
FRONTEND_URL=https://your-domain.vercel.app
```

## خطوات النشر

1. ادفع التغييرات إلى GitHub:
```bash
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main
```

2. في Vercel Dashboard:
   - أضف جميع متغيرات البيئة المطلوبة
   - تأكد من أن branch هو `main`
   - اضغط Deploy

## التحقق من البناء

إذا فشل البناء، تحقق من:
1. جميع متغيرات البيئة مضافة
2. جميع الملفات المطلوبة موجودة
3. لا توجد أخطاء في الكود

## ملاحظات مهمة

- تأكد من أن قاعدة البيانات متاحة من خارج localhost
- استخدم خدمة مثل Supabase أو PlanetScale للبيانات
- تأكد من أن OPENAI_API_KEY صالح وله رصيد
