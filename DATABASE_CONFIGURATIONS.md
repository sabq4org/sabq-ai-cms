# إعدادات قاعدة البيانات - Database Configurations

## ✅ الإعداد الحالي (Supabase - يعمل)
```bash
DATABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
```

## 🔄 AWS RDS PostgreSQL (محضر للاستخدام)

### الصيغة الأساسية:
```bash
DATABASE_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
DIRECT_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
```

### الصيغة المشفرة (URL Encoded) - للبيئات التي تتطلب ذلك:
```bash
DATABASE_URL="postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
DIRECT_URL="postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
```

## 🔧 إعدادات منفصلة (لـ Laravel أو غيره)

### AWS RDS PostgreSQL:
```bash
DB_CONNECTION=pgsql
DB_HOST=database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=sabqcms
DB_USERNAME=postgres
DB_PASSWORD=*7gzOMPcDco8l4If:O-CVb9Ehztq
```

### Supabase PostgreSQL:
```bash
DB_CONNECTION=pgsql
DB_HOST=db.uopckyrdhlvsxnvcobbw.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=AVNS_Br4uKMaWR6wxTIpZ7xj
```

## 🚀 للنشر في البيئات المختلفة

### DigitalOcean App Platform:
```bash
DATABASE_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

### AWS Amplify:
```bash
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

### Vercel:
```bash
DATABASE_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
```

## 📝 ملاحظات مهمة

### أمان كلمة المرور:
- كلمة المرور تحتوي على رموز خاصة: `*7gzOMPcDco8l4If:O-CVb9Ehztq`
- الرموز الخاصة: `*` و `:`
- في URL Encoding: `*` → `%2A` و `:` → `%3A`

### متطلبات الشبكة:
- التأكد من أن AWS RDS متاح للوصول الخارجي
- إعداد Security Groups بشكل صحيح
- السماح للـ IP addresses المطلوبة

### SSL/TLS:
- AWS RDS يتطلب SSL بشكل افتراضي
- إضافة `?sslmode=require` إذا لزم الأمر

## 🔄 خطوات التبديل من Supabase إلى AWS RDS

### 1. التأكد من إعدادات AWS RDS:
```bash
# التحقق من الاتصال
psql "postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms"
```

### 2. نسخ البيانات (إذا لزم الأمر):
```bash
# تصدير من Supabase
pg_dump "postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres" > backup.sql

# استيراد إلى AWS RDS
psql "postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms" < backup.sql
```

### 3. تحديث .env:
```bash
# تعليق Supabase
# DATABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"

# تفعيل AWS RDS
DATABASE_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
```

### 4. تطبيق المخطط:
```bash
npx prisma db push
# أو
npx prisma migrate deploy
```

## 🌐 الحالة الحالية
- ✅ **قاعدة البيانات النشطة:** Supabase PostgreSQL
- 🔄 **قاعدة البيانات المحضرة:** AWS RDS PostgreSQL  
- 🚀 **جاهز للنشر:** في أي بيئة سحابية
