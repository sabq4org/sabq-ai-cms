# حل مشكلة البناء على Digital Ocean

## المشكلة
```
[Error: Failed to collect page data for /api/upload]
```

هذا الخطأ يحدث بسبب مكتبة `sharp` التي تُستخدم لمعالجة الصور.

## الحلول

### 1. تحديث ملف app.yaml
تأكد من أن `build_command` يستخدم السكريبت الجديد:
```yaml
build_command: node scripts/digitalocean-build-fix.js
```

### 2. تحديث Dockerfile
تم إضافة التبعيات المطلوبة لـ sharp:
```dockerfile
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev
```

### 3. تحديث الكود للتعامل مع عدم توفر sharp
تم تحديث `lib/image-optimizer.ts` للتعامل مع الحالات التي لا يتوفر فيها sharp.

### 4. متغيرات البيئة المطلوبة
تأكد من وجود هذه المتغيرات في Digital Ocean:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
SKIP_EMAIL_VERIFICATION=true
NEXT_TELEMETRY_DISABLED=1
```

### 5. إذا استمرت المشكلة

#### الخيار الأول: تعطيل تحسين الصور مؤقتاً
أضف في متغيرات البيئة:
```
DISABLE_IMAGE_OPTIMIZATION=true
```

#### الخيار الثاني: استخدام بناء مخصص
```bash
# في Build Command
npm install --include=optional sharp || true && node scripts/digitalocean-build-fix.js
```

#### الخيار الثالث: استخدام Docker
استخدم Dockerfile المحدث الذي يحتوي على جميع التبعيات.

## التحقق من نجاح البناء

1. اذهب إلى **Activity** → **Deployments**
2. انقر على آخر deployment
3. اضغط **View Logs**
4. ابحث عن:
   - `✅ تم تثبيت sharp بنجاح` أو
   - `⚠️ فشل تثبيت sharp، سيتم الاستمرار بدونه`
   - `🎉 تم إكمال البناء بنجاح!`

## ملاحظات مهمة

- إذا فشل تثبيت sharp، سيستمر التطبيق بالعمل ولكن بدون تحسين الصور
- الصور سترفع إلى Cloudinary مباشرة بدون تحسين
- هذا لن يؤثر على وظائف التطبيق الأساسية 