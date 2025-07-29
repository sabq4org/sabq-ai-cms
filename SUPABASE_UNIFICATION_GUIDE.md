# دليل توحيد قاعدة البيانات على Supabase

## 🎯 الهدف

توحيد استخدام قاعدة بيانات Supabase في كل من بيئة التطوير والإنتاج بدلاً من استخدام AWS RDS في الإنتاج.

## 📊 الوضع الحالي

### بيئة التطوير (المحلية)
```
DATABASE_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres
```
- **النوع**: Supabase ✅
- **الحالة**: يعمل بشكل جيد

### بيئة الإنتاج
```
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```
- **النوع**: AWS RDS ❌
- **المطلوب**: التحويل إلى Supabase

## ⚠️ تحذيرات مهمة

### قبل البدء:
1. **نسخ احتياطية**: تأكد من أخذ نسخة احتياطية كاملة من قاعدة بيانات AWS RDS
2. **البيانات الحالية**: قد تحتاج لترحيل البيانات من AWS RDS إلى Supabase
3. **التوقف المؤقت**: قد يتطلب الأمر توقف مؤقت للموقع أثناء الترحيل

## 🔧 خطوات التوحيد

### 1. إعداد قاعدة بيانات Supabase للإنتاج

يمكنك استخدام نفس قاعدة البيانات الحالية أو إنشاء قاعدة بيانات جديدة مخصصة للإنتاج:

#### خيار أ: استخدام نفس قاعدة البيانات (غير موصى به)
- استخدام نفس `DATABASE_URL` في كل من التطوير والإنتاج
- ⚠️ خطر: قد تؤثر تغييرات التطوير على البيانات الإنتاجية

#### خيار ب: إنشاء قاعدة بيانات منفصلة للإنتاج (موصى به)
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. أنشئ مشروع جديد للإنتاج
3. احصل على بيانات الاتصال الجديدة

### 2. ترحيل البيانات من AWS RDS إلى Supabase

```bash
# 1. تصدير البيانات من AWS RDS
pg_dump "postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms" > production_backup.sql

# 2. استيراد البيانات إلى Supabase
psql "postgresql://postgres:YOUR_SUPABASE_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres" < production_backup.sql
```

### 3. تحديث ملفات البيئة

#### أ. إنشاء ملف `.env.production`
```bash
# Supabase Production Database
DATABASE_URL="postgresql://postgres:YOUR_PRODUCTION_SUPABASE_PASSWORD@YOUR_PRODUCTION_SUPABASE_HOST:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PRODUCTION_SUPABASE_PASSWORD@YOUR_PRODUCTION_SUPABASE_HOST:5432/postgres"
NEXTAUTH_SECRET="sabq-ai-cms-secret-key-2025"
NEXTAUTH_URL="https://sabq.io"
NODE_ENV="production"
```

#### ب. تحديث ملف `digitalocean-aws-db.env`
استبدل محتوى الملف بإعدادات Supabase الجديدة.

### 4. التحقق من الإعدادات

```bash
# تشغيل سكريبت للتحقق من الاتصال
node scripts/test-db-connection.js
```

### 5. تحديث منصات النشر

#### DigitalOcean App Platform
1. اذهب إلى إعدادات التطبيق
2. حدث متغير `DATABASE_URL` ليشير إلى Supabase
3. حدث متغير `DIRECT_URL` بنفس القيمة

#### AWS Amplify (إن كان مستخدماً)
1. اذهب إلى Environment Variables
2. حدث `DATABASE_URL` و `DIRECT_URL`

## 📋 قائمة التحقق

- [ ] نسخة احتياطية من AWS RDS
- [ ] إنشاء قاعدة بيانات Supabase للإنتاج (اختياري)
- [ ] ترحيل البيانات
- [ ] تحديث ملفات البيئة
- [ ] اختبار الاتصال محلياً
- [ ] تحديث متغيرات البيئة في منصة النشر
- [ ] نشر التطبيق
- [ ] اختبار الموقع المباشر
- [ ] التحقق من عمل جميع الوظائف

## 🚀 مزايا التوحيد

1. **بساطة الإدارة**: قاعدة بيانات واحدة من نفس المزود
2. **التكلفة**: Supabase يوفر خطة مجانية سخية
3. **المميزات**: 
   - Real-time subscriptions
   - Built-in authentication
   - Storage مدمج
   - Edge Functions
4. **سهولة التطوير**: نفس البيئة في التطوير والإنتاج

## 🔐 اعتبارات الأمان

1. **استخدم قواعد بيانات منفصلة** للتطوير والإنتاج
2. **قيّد الوصول** باستخدام Row Level Security (RLS)
3. **احم بيانات الاتصال** ولا تشاركها في الكود
4. **فعّل SSL** لجميع الاتصالات

## 🆘 استكشاف الأخطاء

### مشكلة: فشل الاتصال بـ Supabase
```bash
# تحقق من:
1. صحة بيانات الاتصال
2. السماح بـ IP في إعدادات Supabase
3. حالة خدمة Supabase
```

### مشكلة: أخطاء في الترحيل
```bash
# حلول:
1. تحقق من توافق إصدارات PostgreSQL
2. قم بترحيل الجداول أولاً ثم البيانات
3. تعامل مع المفاتيح الأجنبية بعناية
```

## 📞 الدعم

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [PostgreSQL Migration Guide](https://www.postgresql.org/docs/current/migration.html) 