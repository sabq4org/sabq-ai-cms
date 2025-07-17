# تقرير إصلاح مشكلة prerender-manifest.json في DigitalOcean

## التاريخ: 2025-01-17

## المشكلة
عند محاولة تشغيل التطبيق في DigitalOcean، ظهرت الأخطاء التالية:
1. `ENOENT: no such file or directory, open '/app/.next/prerender-manifest.json'`
2. `Readiness probe failed: dial tcp 10.244.184.56:3000: connect: connection refused`

## الأسباب
1. **ملف prerender-manifest.json مفقود**: Next.js يتوقع وجود هذا الملف لكنه لم يتم إنشاؤه أثناء البناء
2. **مشكلة في الاستماع على المنفذ**: التطبيق لا يستمع على جميع الواجهات (0.0.0.0)

## الحلول المطبقة

### 1. إنشاء سكريبت بناء محسّن (`scripts/digitalocean-build-v4.js`)
- يتحقق من متغيرات البيئة المطلوبة
- ينظف ملفات البناء السابقة
- يولد Prisma Client
- يبني التطبيق
- **ينشئ prerender-manifest.json تلقائيًا إذا لم يكن موجودًا**
- ينسخ الملفات المطلوبة إلى مجلد standalone

### 2. تحديث ملف البداية (`start.sh`)
- يتحقق من وجود prerender-manifest.json وينشئه إذا لزم الأمر
- يستخدم `HOSTNAME=0.0.0.0` للاستماع على جميع الواجهات
- يدعم تخصيص المنفذ عبر متغير البيئة `PORT`
- يضيف معالجة أفضل للأخطاء

### 3. تحديث Dockerfile
- استخدام سكريبت البناء الجديد `digitalocean-build-v4.js`
- التأكد من أن ملف start.sh قابل للتنفيذ

## بنية ملف prerender-manifest.json
```json
{
  "version": 3,
  "routes": {},
  "dynamicRoutes": {},
  "notFoundRoutes": [],
  "preview": {
    "previewModeId": "preview-mode-id",
    "previewModeSigningKey": "preview-mode-signing-key",
    "previewModeEncryptionKey": "preview-mode-encryption-key"
  }
}
```

## خطوات النشر
1. **ادفع التغييرات إلى GitHub**:
   ```bash
   git add .
   git commit -m "Fix prerender-manifest.json issue for DigitalOcean"
   git push origin main
   ```

2. **في DigitalOcean App Platform**:
   - سيتم إعادة البناء تلقائيًا
   - تأكد من وجود جميع متغيرات البيئة المطلوبة

## متغيرات البيئة المطلوبة
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

## ملاحظات إضافية
- التطبيق الآن يستمع على `0.0.0.0:3000` بدلاً من `localhost:3000`
- يتم إنشاء prerender-manifest.json في مرحلتين: أثناء البناء وعند البداية (كإجراء احتياطي)
- السكريبت يوفر معلومات تفصيلية عن كل خطوة لتسهيل تتبع المشاكل 