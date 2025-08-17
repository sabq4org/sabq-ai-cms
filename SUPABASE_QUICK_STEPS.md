# خطوات سريعة لتوحيد قاعدة البيانات على Supabase

## ⚡ الخطوات الفورية

### 1️⃣ إنشاء مشروع Supabase للإنتاج (اختياري ولكن موصى به)

1. اذهب إلى [app.supabase.com](https://app.supabase.com)
2. انقر على "New Project"
3. اختر:
   - **Project name**: `sabq-production`
   - **Database Password**: كلمة مرور قوية
   - **Region**: اختر الأقرب لمستخدميك

4. انسخ بيانات الاتصال من:
   - Settings → Database → Connection string → URI

### 2️⃣ أخذ نسخة احتياطية من AWS RDS

```bash
# في Terminal
pg_dump "postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms" > aws_backup.sql
```

### 3️⃣ استيراد البيانات إلى Supabase

```bash
# استبدل YOUR_SUPABASE_URL بالرابط الخاص بك
psql "YOUR_SUPABASE_URL" < aws_backup.sql
```

### 4️⃣ تحديث ملفات البيئة

#### أ. تحديث `digitalocean-supabase-db.env`:
```env
DATABASE_URL="postgresql://postgres:كلمة_المرور@db.xxxxxxxxxxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:كلمة_المرور@db.xxxxxxxxxxxx.supabase.co:5432/postgres"
```

#### ب. تحديث `.env.production` (إن وُجد):
نفس القيم أعلاه

### 5️⃣ تحديث DigitalOcean App Platform

1. اذهب إلى [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. اختر تطبيقك
3. Settings → App-Level Environment Variables
4. حدّث:
   - `DATABASE_URL` = رابط Supabase الجديد
   - `DIRECT_URL` = نفس الرابط

5. انقر "Save" ثم "Deploy"

## 🔍 التحقق السريع

```bash
# اختبر الاتصال محلياً
DATABASE_URL="رابط_supabase_الجديد" node scripts/test-db-connection.js
```

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطية**: احتفظ بنسخة من `aws_backup.sql`
2. **البيانات الحساسة**: لا تشارك روابط قواعد البيانات
3. **الاختبار**: اختبر محلياً قبل النشر
4. **المراقبة**: راقب السجلات بعد النشر

## 🆘 مساعدة سريعة

### مشكلة: `pg_dump` غير موجود
```bash
# على macOS
brew install postgresql

# على Ubuntu/Debian
sudo apt-get install postgresql-client
```

### مشكلة: فشل الاستيراد
- تأكد من أن قاعدة البيانات فارغة
- أو احذف الجداول الموجودة أولاً

## ✅ قائمة تحقق نهائية

- [ ] نسخة احتياطية من AWS RDS
- [ ] مشروع Supabase جديد (اختياري)
- [ ] استيراد البيانات
- [ ] تحديث ملفات البيئة
- [ ] تحديث DigitalOcean
- [ ] اختبار محلي
- [ ] نشر التطبيق
- [ ] اختبار الموقع المباشر 