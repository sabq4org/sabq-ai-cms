# خطوات الهجرة اليدوية السريعة

## الخطوة 1: تثبيت PostgreSQL 17
```bash
# إلغاء تثبيت النسخة القديمة
brew uninstall postgresql@14

# تثبيت النسخة الجديدة
brew install postgresql@17
brew link postgresql@17 --force
```

## الخطوة 2: تنفيذ الهجرة المباشرة
```bash
# تصدير من Supabase
PGPASSWORD='AVNS_Br4uKMaWR6wxTIpZ7xj' pg_dump \
  "postgresql://postgres@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres" \
  --no-owner --no-privileges --exclude-schema='supabase*' \
  > backup.sql

# استيراد إلى DigitalOcean
PGPASSWORD='AVNS_Br4uKMaWR6wxTIpZ7xj' psql \
  "postgresql://doadmin@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool" \
  < backup.sql
```

## الخطوة 3: تحديث البيئة
```bash
# تحديث .env
cp .env .env.supabase.backup
cat > .env << EOF
DATABASE_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
DIRECT_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
EOF

# نسخ المتغيرات الأخرى
grep -v "DATABASE_URL\|DIRECT_URL" .env.supabase.backup >> .env
```

## الخطوة 4: التحقق وإعادة البناء
```bash
# التحقق من الاتصال
npx prisma db pull

# إعادة البناء
npx prisma generate

# إعادة تشغيل التطبيق
npm run dev
```

---

## البديل: استخدام Supabase CLI
```bash
# تثبيت Supabase CLI
brew install supabase/tap/supabase

# تصدير البيانات
supabase db dump --db-url "postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres" > backup.sql

# ثم استيراد إلى DigitalOcean كما في الخطوة 2
``` 