# 🚨 إصلاحات عاجلة للإنتاج - sabq.io

## المشاكل الحالية:
1. ❌ التصنيفات لا تعمل - "لا توجد تصنيفات متاحة حالياً"
2. ❌ صور البطاقات لا تظهر - جميعها placeholder
3. ❌ البطاقات المخصصة غير ظاهرة في الجوال

## 🔥 الحل السريع - نفذ الآن!

### الخطوة 1: اسحب آخر التحديثات

```bash
# على سيرفر الإنتاج (Digital Ocean)
cd /var/www/sabq-ai-cms
git pull origin main
```

### الخطوة 2: تحديث البيئة وإعادة البناء

```bash
# تثبيت التبعيات
npm ci

# إنشاء Prisma Client
npx prisma generate

# بناء المشروع
npm run build
```

### الخطوة 3: إصلاح صور قاعدة البيانات

```bash
# تشغيل إصلاح الصور
node scripts/fix-production-card-images.js
```

### الخطوة 4: إعادة تشغيل التطبيق

```bash
# إعادة تشغيل PM2
pm2 restart sabq-cms

# مراقبة السجلات
pm2 logs sabq-cms --lines 100
```

## 🔍 التحقق من النتائج

### 1. فحص التصنيفات
```bash
curl https://sabq.io/api/categories?is_active=true | jq
```

### 2. فحص الصور
- افتح https://sabq.io
- تحقق من ظهور الصور الحقيقية بدلاً من placeholder
- افتح Developer Tools > Network > Images

### 3. فحص البطاقات المخصصة
- افتح الموقع على الجوال
- مرر لأسفل وتحقق من ظهور البطاقات المخصصة بين الأخبار

## 🆘 إذا لم تحل المشكلة

### مشكلة التصنيفات:
```bash
# تحقق من اتصال قاعدة البيانات
node scripts/test-db-connection.js

# تحقق من وجود التصنيفات في قاعدة البيانات
npx prisma studio
# افتح جدول categories وتحقق من is_active = true
```

### مشكلة الصور:
```bash
# فحص حالة الصور
node scripts/test-production-images.js

# تحقق من متغيرات البيئة
env | grep CLOUDINARY
```

### مشكلة البطاقات المخصصة:
```bash
# تحقق من API التوصيات
curl https://sabq.io/api/smart-recommendations | jq
```

## 📱 اختبار سريع

1. **الصفحة الرئيسية**: https://sabq.io
2. **صفحة الأخبار**: https://sabq.io/news
3. **صفحة التصنيفات**: https://sabq.io/categories

## ⚡ أوامر مفيدة

```bash
# مراقبة الأداء
pm2 monit

# مراقبة الأخطاء فقط
pm2 logs sabq-cms --err

# إعادة تشغيل مع مسح الذاكرة
pm2 restart sabq-cms --update-env

# فحص استخدام الموارد
pm2 info sabq-cms
```

## 🔄 في حالة الطوارئ

```bash
# التراجع السريع
git log --oneline -5
git checkout [COMMIT_HASH_السابق]
npm ci && npm run build
pm2 restart sabq-cms
```

---

⏰ **الوقت المتوقع**: 10-15 دقيقة
🎯 **الأولوية**: عاجلة جداً 