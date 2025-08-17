# 📋 خطوات نشر التحديثات على موقع الإنتاج (Digital Ocean)

## 🚨 المشكلة الحالية:
- الصور **تعمل في API** ✅
- لكنها **لا تظهر في الواجهة** ❌
- السبب: التحديثات الأخيرة لم تُنشر (خاصة إصلاحات SafeImage)

## 🚀 الخطوات المطلوبة:

### 1️⃣ **الدخول على السيرفر:**
```bash
ssh root@YOUR_SERVER_IP
cd /var/www/sabq-ai-cms
```

### 2️⃣ **سحب آخر التحديثات:**
```bash
git pull origin main
```

### 3️⃣ **تثبيت التبعيات:**
```bash
npm ci
```

### 4️⃣ **بناء المشروع:**
```bash
npm run build
```

### 5️⃣ **إعادة تشغيل التطبيق:**
```bash
pm2 restart sabq-ai-cms
pm2 save
pm2 startup  # إذا لم يكن مُعد مسبقاً
```

### 6️⃣ **التحقق من العمل:**
```bash
pm2 status
pm2 logs sabq-ai-cms --lines 20
```

## 🔍 اختبار النتائج:

### على الموقع:
1. افتح https://sabq.io - تحقق من ظهور الصور
2. افتح https://sabq.io/news - تحقق من صور المقالات
3. افتح https://sabq.io/categories - تحقق من صور التصنيفات

### في لوحة التحكم:
1. جرب تعديل مقال - تحقق من ظهور البيانات
2. جرب رفع صورة جديدة - سترفع على Cloudinary

## 🆘 في حالة استمرار المشكلة:

### الحل المؤقت:
```bash
node scripts/emergency-image-fix.js
```

### فحص الصور:
```bash
node scripts/check-production-images.js
```

### مسح الكاش:
```bash
pm2 restart sabq-ai-cms
# أو
curl "https://sabq.io/api/categories?nocache=true"
```

## 📝 ملاحظات مهمة:

1. **التحديثات المهمة في هذا النشر:**
   - ✅ إصلاح SafeImage component
   - ✅ توحيد رفع الصور على Cloudinary
   - ✅ إصلاح مشاكل قاعدة البيانات
   - ✅ تحسينات الأداء

2. **بعد النشر الناجح:**
   - ستُرفع الصور الجديدة على Cloudinary تلقائياً
   - الصور القديمة على S3 ستستمر في العمل
   - يمكن ترحيل الصور القديمة لاحقاً

3. **المتطلبات:**
   - Node.js 18+ على السيرفر
   - PM2 مثبت ومُعد
   - صلاحيات git pull

## ⚡ أمر سريع واحد (نسخ ولصق):
```bash
ssh root@YOUR_SERVER_IP "cd /var/www/sabq-ai-cms && git pull && npm ci && npm run build && pm2 restart sabq-ai-cms && pm2 status"
```

---

**آخر تحديث:** 29 يوليو 2025 