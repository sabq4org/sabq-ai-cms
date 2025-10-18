# 🔧 تشغيل Migration على Vercel

## المشكلة
خطأ 500 عند فتح `/admin/categories` لأن:
- Migration لم يُطبّق على قاعدة البيانات بعد
- حقل `icon_url` غير موجود في الجدول
- Prisma يحاول قراءة حقل غير موجود

## الحل السريع

### الطريقة 1: عبر Vercel Dashboard

1. افتح Vercel Dashboard
2. اذهب إلى Project → Settings → Environment Variables
3. تأكد من وجود `DATABASE_URL`
4. افتح Terminal في Vercel:

```bash
npx prisma migrate deploy
```

### الطريقة 2: عبر Vercel CLI محلياً

```bash
# 1. تثبيت Vercel CLI (إذا لم يكن مثبتاً)
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. ربط المشروع
vercel link

# 4. تشغيل Migration على الإنتاج
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### الطريقة 3: Migration يدوي مباشر

إذا كان لديك وصول مباشر لقاعدة البيانات:

```sql
-- تنفيذ هذا SQL مباشرة على قاعدة البيانات
ALTER TABLE "categories" 
ALTER COLUMN "icon" TYPE VARCHAR(2000);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE "categories" 
    ADD COLUMN "icon_url" VARCHAR(2000);
  END IF;
END
$$;

UPDATE "categories" 
SET "icon_url" = "icon" 
WHERE "icon" IS NOT NULL AND "icon_url" IS NULL;
```

## التحقق من نجاح Migration

```bash
# التحقق من الحقول
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name IN ('icon', 'icon_url');
```

النتيجة المتوقعة:
```
column_name | data_type        | character_maximum_length
------------|------------------|-------------------------
icon        | character varying| 2000
icon_url    | character varying| 2000
```

## بعد تطبيق Migration

1. أعد بناء المشروع على Vercel
2. اختبر API:
   ```bash
   curl https://www.sabq.io/api/categories
   ```
3. افتح قسم التصنيفات: https://www.sabq.io/admin/categories

## إذا استمرت المشكلة

### تحقق من Prisma Client

```bash
# على Vercel
npx prisma generate
```

### تحقق من اتصال قاعدة البيانات

في Vercel Dashboard → Deployments → أحدث deployment → Function Logs

ابحث عن:
- `Connected to database`
- أي أخطاء متعلقة بـ Prisma

---

## ملاحظة هامة ⚠️

**Migration تلقائي على Vercel لا يعمل دائماً!**

السبب:
- Vercel لا تشغل migrations تلقائياً في build
- يجب تشغيلها يدوياً أو عبر script

**الحل الدائم:**

أضف إلى `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

ثم أعد النشر على Vercel.
