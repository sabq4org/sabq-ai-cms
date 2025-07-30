# دليل النشر على DigitalOcean بعد الإصلاحات

## 📅 آخر تحديث: 29 يناير 2025

## ✅ الإصلاحات المنفذة

1. **متغيرات البيئة**: تم إضافة جميع المتغيرات المطلوبة
2. **تحسينات الأداء**: تم زيادة build timeout إلى 90 ثانية
3. **Next.js 15**: تم حل تحذيرات viewport

## 🚀 خطوات النشر

### 1. تحديث متغيرات البيئة في DigitalOcean

في لوحة تحكم **App Platform**، أضف المتغيرات التالية:

```bash
# قاعدة البيانات (حرج!)
DATABASE_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uopckyrdhlvsxnvcobbw.supabase.co
SUPABASE_SERVICE_KEY=[احصل عليه من Supabase Dashboard]
SUPABASE_SERVICE_ROLE_KEY=[نفس المفتاح أعلاه]

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=vuiA8rLNm7d1U-UAOTED6FyC4hY

# المصادقة
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=https://sabq.me

# البيئة
NEXT_PUBLIC_SITE_URL=https://sabq.me
NODE_ENV=production
```

### 2. الحصول على SUPABASE_SERVICE_KEY

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك: `uopckyrdhlvsxnvcobbw`
3. اذهب إلى **Settings** > **API**
4. انسخ **service_role key** (يبدأ بـ `eyJ...`)
5. أضفه كـ `SUPABASE_SERVICE_KEY` و `SUPABASE_SERVICE_ROLE_KEY`

### 3. تحديث إعدادات Build

في **App Settings**:

```yaml
# Build Command
npm run build

# Output Directory
.next

# Build Timeout
90 seconds (أو أكثر إذا لزم)
```

### 4. إطلاق النشر

1. انقر على **Deploy** في لوحة التحكم
2. راقب سجلات البناء للتأكد من عدم وجود أخطاء
3. تحقق من:
   - عدم وجود خطأ `DATABASE_URL`
   - عدم وجود تحذيرات viewport
   - نجاح بناء جميع الصفحات

### 5. التحقق بعد النشر

```bash
# تحقق من الموقع المباشر
curl -I https://sabq.me

# تحقق من API
curl https://sabq.me/api/categories

# تحقق من الصور
curl -I https://sabq.me/api/health
```

## ⚠️ مشاكل محتملة

### إذا فشلت بعض الصفحات في البناء:

1. **الصفحات الثقيلة** (admin/polls, admin/audio-newsletters):
   - قد تحتاج لزيادة timeout أكثر
   - أو تحويلها إلى dynamic imports

2. **أخطاء TypeScript**:
   - حالياً معطلة (`ignoreBuildErrors: true`)
   - يفضل إصلاحها لاحقاً

### إذا لم تظهر الصور:

1. تحقق من Cloudinary credentials
2. تحقق من `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. راجع Network tab في المتصفح

## 📝 ملاحظات مهمة

- **الأمان**: تأكد من تجديد `CLOUDINARY_API_SECRET` إذا تم كشفه
- **الأداء**: راقب استخدام الذاكرة بعد النشر
- **النسخ الاحتياطي**: احتفظ بنسخة من `.env` محلياً

## ✨ بعد النشر الناجح

1. امسح كاش المتصفح
2. اختبر جميع الوظائف الأساسية:
   - تسجيل الدخول
   - عرض المقالات
   - رفع الصور
   - التصنيفات

## 🆘 للمساعدة

في حالة وجود مشاكل، راجع:
- `/docs/ENV_SETUP_CRITICAL.md`
- `/docs/PRODUCTION_BUILD_FIXES_SUMMARY.md`
- سجلات DigitalOcean App Platform 