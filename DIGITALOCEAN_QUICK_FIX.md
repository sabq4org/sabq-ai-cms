# حل سريع لمشكلة API الفئات على DigitalOcean

## 🚨 المشكلة الحالية
- خطأ 500 في `/api/categories`
- الموقع قد يكون متوقف بالكامل

## ✅ الحل السريع (10 دقائق)

### 1️⃣ ارفع التغييرات الجديدة
```bash
git add .
git commit -m "Fix categories API 500 error - Prisma build fix"
git push origin main
```

### 2️⃣ انتظر إعادة البناء التلقائي
- DigitalOcean سيعيد البناء تلقائياً عند الدفع إلى GitHub
- انتظر 5-10 دقائق

### 3️⃣ راقب Build Logs
1. اذهب إلى: https://cloud.digitalocean.com/apps
2. اضغط على `sabq-ai-cms`
3. اذهب إلى **Activity** للتحقق من حالة البناء
4. اضغط على البناء الحالي لرؤية التفاصيل

### 4️⃣ إذا فشل البناء
**خطأ Prisma؟**
- تحقق من وجود `DATABASE_URL` في متغيرات البيئة

**خطأ في البناء؟**
- راجع سجلات البناء للتفاصيل

### 5️⃣ اختبر بعد البناء
```bash
# اختبار صحة API
curl https://sabq-ai-cms-s5gpr.ondigitalocean.app/api/categories/health

# اختبار API الفئات
curl https://sabq-ai-cms-s5gpr.ondigitalocean.app/api/categories
```

## 🔧 ما تم إصلاحه

### ✅ سكريبت البناء المحدث
- تنظيف الملفات القديمة
- توليد Prisma مع binary targets الصحيح
- فحوصات إضافية للتأكد من البناء

### ✅ API صحة جديد
- `/api/categories/health` للتشخيص
- يعرض حالة قاعدة البيانات وعدد الفئات

## 📝 إذا احتجت مساعدة إضافية

### فحص السجلات عبر CLI
```bash
# تثبيت DigitalOcean CLI إذا لم يكن مثبتاً
brew install doctl

# تسجيل الدخول
doctl auth init

# عرض التطبيقات
doctl apps list

# عرض سجلات البناء
doctl apps logs YOUR_APP_ID --type=build

# عرض سجلات التشغيل
doctl apps logs YOUR_APP_ID --type=run
```

### إعادة deploy يدوي
```bash
doctl apps create-deployment YOUR_APP_ID
```

## ⚡ نصيحة مهمة
إذا كان الموقع لا يزال لا يعمل بعد 15 دقيقة:
1. تحقق من **App Spec** في إعدادات التطبيق
2. تأكد من أن `build_command` يشير إلى: `node scripts/digitalocean-build-fix.js`
3. تحقق من وجود جميع متغيرات البيئة المطلوبة 