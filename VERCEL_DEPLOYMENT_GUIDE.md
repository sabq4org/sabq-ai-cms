# 🚀 دليل نشر المشروع على Vercel

## لماذا Vercel؟
- ✅ يدعم Next.js و Prisma بشكل ممتاز
- ✅ سهل الإعداد (5 دقائق)
- ✅ مجاني للمشاريع الصغيرة
- ✅ لا يحتاج إعدادات معقدة

## 📋 خطوات النشر:

### 1️⃣ **إنشاء حساب Vercel:**
1. اذهب إلى https://vercel.com
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. سجل دخول بحساب GitHub

### 2️⃣ **استيراد المشروع:**
1. اضغط "Add New..." → "Project"
2. اختر "Import Git Repository"
3. ابحث عن `sabq-ai-cms`
4. اضغط "Import"

### 3️⃣ **إعدادات المشروع:**

#### Framework Preset:
- اختر: **Next.js**

#### Root Directory:
- اتركه فارغ (سيستخدم الجذر)

#### Build Command:
```
npm run build
```

#### Output Directory:
```
.next
```

### 4️⃣ **متغيرات البيئة (الأهم):**

اضغط "Environment Variables" وأضف:

```
DATABASE_URL
postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

```
NEXTAUTH_SECRET
sabq-ai-cms-secret-key-2025
```

```
NEXTAUTH_URL
https://YOUR-PROJECT-NAME.vercel.app
```
(سيتم تحديثه تلقائياً بعد النشر)

### 5️⃣ **النشر:**
1. اضغط "Deploy"
2. انتظر 3-5 دقائق
3. ستحصل على رابط مثل: `https://sabq-ai-cms.vercel.app`

### 6️⃣ **تحديث NEXTAUTH_URL:**
بعد النشر الأول:
1. اذهب إلى Settings → Environment Variables
2. حدث `NEXTAUTH_URL` بالرابط الفعلي
3. اضغط Save
4. اذهب إلى Deployments → Redeploy

## 🎯 النتيجة:
- موقع يعمل بنسبة 100%
- قاعدة بيانات متصلة
- لا مشاكل Prisma
- شهادة SSL مجانية

## 💡 نصائح:
- يمكنك ربط دومين مخصص مجاناً
- Vercel يدعم Auto-scaling
- يوفر Analytics مجانية
- يدعم Preview deployments لكل PR

## 🆘 مساعدة:
إذا واجهت أي مشكلة:
1. تحقق من Build Logs
2. تأكد من متغيرات البيئة
3. جرب Redeploy 