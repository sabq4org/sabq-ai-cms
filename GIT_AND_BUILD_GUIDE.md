# 🚀 دليل Git والبناء الآمن لمشروع سبق

## 📋 المحتويات
- [المجلدات المحمية من Git](#المجلدات-المحمية-من-git)
- [حل مشاكل البناء](#حل-مشاكل-البناء)
- [أوامر التنظيف السريعة](#أوامر-التنظيف-السريعة)
- [أفضل الممارسات](#أفضل-الممارسات)

## 🛡️ المجلدات المحمية من Git

المجلدات التالية **لن يتم رفعها** إلى GitHub (موجودة في `.gitignore`):

```
✅ /node_modules        # التبعيات (كبيرة جداً)
✅ /.next/             # ملفات البناء المؤقتة
✅ /public/uploads/     # الملفات المرفوعة
✅ .env.local          # متغيرات البيئة السرية
✅ .turbo/             # كاش Turbopack
✅ tsconfig.tsbuildinfo # ملفات TypeScript المؤقتة
```

## 🔧 حل مشاكل البناء

### المشكلة الشائعة
عند تنفيذ `npm run dev` قد تظهر أخطاء مثل:
- أخطاء TypeScript
- أخطاء في الوحدات
- أخطاء في البناء السابق

### الحلول السريعة

#### 1️⃣ الأمر السريع (الأكثر استخداماً)
```bash
npm run fresh
```

#### 2️⃣ التنظيف اليدوي
```bash
# إيقاف الخادم
pkill -f "next dev"

# حذف المجلدات المؤقتة
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# إعادة التشغيل
npm run dev
```

#### 3️⃣ التنظيف الشامل (مع واجهة تفاعلية)
```bash
npm run clean:start
# أو
./clean-start.sh
```

## ⚡ أوامر التنظيف السريعة

تم إضافة الأوامر التالية في `package.json`:

| الأمر | الوصف |
|------|-------|
| `npm run fresh` | تنظيف سريع وإعادة تشغيل |
| `npm run clean:start` | تنظيف تفاعلي مع خيارات |
| `npm run clean:build` | تنظيف ملفات البناء فقط |

## 📝 أفضل الممارسات

### ✅ افعل
1. استخدم `npm run fresh` عند ظهور أخطاء غريبة
2. احفظ تغييراتك قبل التنظيف
3. تأكد من وجود `.env.local` قبل التشغيل

### ❌ لا تفعل
1. لا تحذف `package-lock.json` إلا عند الضرورة القصوى
2. لا ترفع `.env.local` أو `.env.production` لـ GitHub
3. لا تحذف `node_modules` كل مرة (استخدم `npm run fresh` أولاً)

## 🚨 حل المشاكل الشائعة

### "Module not found" خطأ
```bash
npm run fresh
```

### "Type error" في TypeScript
```bash
rm -rf tsconfig.tsbuildinfo
npm run dev
```

### الخادم لا يستجيب
```bash
pkill -f "next"
npm run dev
```

### تعارض في المنافذ
```bash
# تغيير المنفذ
PORT=3002 npm run dev
```

## 📦 رفع المشروع لـ GitHub

### قبل الرفع، تأكد من:
```bash
# 1. التحقق من الملفات المرحلة
git status

# 2. التأكد من عدم وجود ملفات حساسة
git diff --cached

# 3. الرفع الآمن
git add .
git commit -m "وصف التغييرات"
git push
```

### ملفات يجب عدم رفعها أبداً:
- `.env.local`
- `.env.production`
- `node_modules/`
- `.next/`
- `public/uploads/`
- أي ملفات تحتوي على مفاتيح API

---

💡 **نصيحة**: احفظ هذا الدليل في مفضلاتك للرجوع إليه عند الحاجة! 