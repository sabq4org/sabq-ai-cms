# 📘 دليل التنفيذ: نقل قاعدة البيانات من Supabase إلى DigitalOcean

**تاريخ الإعداد**: 16 يناير 2025  
**الفريق المستهدف**: فريق التطوير التقني  
**مدة التنفيذ المتوقعة**: 4-6 ساعات

---

## 🎯 الهدف الرئيسي

استبدال قاعدة البيانات القديمة (Supabase) بقاعدة بيانات جديدة مستضافة على DigitalOcean (PostgreSQL) مع الحفاظ على جميع البيانات والتأكد من التشغيل السليم للمشروع.

---

## ⚡ المتطلبات قبل البدء

### 1. الأدوات المطلوبة:
```bash
# التحقق من تثبيت PostgreSQL tools
pg_dump --version
psql --version

# التحقق من تثبيت Node.js
node --version
npm --version
pnpm --version
```

### 2. المعلومات المطلوبة:
- [ ] بيانات الاتصال بـ Supabase
- [ ] بيانات الاتصال بـ DigitalOcean
- [ ] صلاحيات admin على كلا قاعدتي البيانات
- [ ] مساحة تخزين كافية (10GB على الأقل)

---

## ✳️ الإجراء الأول: أخذ نسخة احتياطية من القاعدة القديمة

### 1.1 إنشاء مجلد النسخ الاحتياطية:
```bash
# إنشاء مجلد مع timestamp
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/${BACKUP_DATE}
cd backups/${BACKUP_DATE}
```

### 1.2 استخراج بيانات الاتصال من Supabase:
```bash
# من لوحة تحكم Supabase، احصل على:
SUPABASE_HOST="db.xxxxxx.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PASSWORD="your-password-here"
```

### 1.3 أخذ النسخة الاحتياطية:
```bash
# نسخة كاملة بتنسيقات مختلفة
echo "🔄 بدء أخذ النسخة الاحتياطية..."

# 1. نسخة SQL نصية
pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --username=${SUPABASE_USER} \
  --host=${SUPABASE_HOST} \
  --port=${SUPABASE_PORT} \
  --dbname=${SUPABASE_DB} \
  --file=supabase_backup_${BACKUP_DATE}.sql \
  --verbose

# 2. نسخة مضغوطة
gzip -c supabase_backup_${BACKUP_DATE}.sql > supabase_backup_${BACKUP_DATE}.sql.gz

# 3. نسخة بتنسيق custom (للاستعادة الانتقائية)
pg_dump \
  --format=custom \
  --username=${SUPABASE_USER} \
  --host=${SUPABASE_HOST} \
  --port=${SUPABASE_PORT} \
  --dbname=${SUPABASE_DB} \
  --file=supabase_backup_${BACKUP_DATE}.dump

echo "✅ تم أخذ النسخة الاحتياطية بنجاح"
echo "📁 الملفات: $(ls -la)"
```

### 1.4 التحقق من سلامة النسخة:
```bash
# فحص حجم الملف
du -h supabase_backup_${BACKUP_DATE}.sql

# فحص محتوى الملف
head -n 50 supabase_backup_${BACKUP_DATE}.sql

# عد الجداول
grep -c "CREATE TABLE" supabase_backup_${BACKUP_DATE}.sql
```

---

## ✳️ الإجراء الثاني: زرع البيانات في القاعدة الجديدة

### 2.1 إعداد معلومات DigitalOcean:
```bash
# متغيرات الاتصال لـ DigitalOcean
DO_DB_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_DB_PORT="25060"
DO_DB_USER="doadmin"
DO_DB_PASSWORD="YOUR_DO_DB_PASSWORD"  # استبدل بكلمة المرور الفعلية
DO_DB_NAME="sabq_app_pool"

# Connection string
DO_DATABASE_URL="postgresql://${DO_DB_USER}:${DO_DB_PASSWORD}@${DO_DB_HOST}:${DO_DB_PORT}/${DO_DB_NAME}?sslmode=require"

# متغيرات Supabase
SUPABASE_DB_URL="YOUR_SUPABASE_DB_URL"  # استبدل بعنوان قاعدة البيانات الفعلي
```

### 2.2 إنشاء قاعدة البيانات (إذا لم تكن موجودة):
```bash
# الاتصال بـ defaultdb أولاً
psql "host=${DO_HOST} port=${DO_PORT} dbname=defaultdb user=${DO_USER} password=${DO_PASSWORD} sslmode=require" \
  -c "CREATE DATABASE ${DO_DB};"

# التحقق من الإنشاء
psql "host=${DO_HOST} port=${DO_PORT} dbname=defaultdb user=${DO_USER} password=${DO_PASSWORD} sslmode=require" \
  -c "\l" | grep ${DO_DB}
```

### 2.3 تحضير قاعدة البيانات الجديدة:
```bash
# تفعيل الـ extensions المطلوبة
psql "host=${DO_HOST} port=${DO_PORT} dbname=${DO_DB} user=${DO_USER} password=${DO_PASSWORD} sslmode=require" << EOF
-- تفعيل UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- تفعيل التشفير
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- تفعيل البحث النصي
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- عرض الـ extensions المفعلة
\dx
EOF
```

### 2.4 استيراد البيانات:
```bash
echo "🔄 بدء استيراد البيانات..."

# طريقة 1: استيراد مباشر
psql "host=${DO_HOST} port=${DO_PORT} dbname=${DO_DB} user=${DO_USER} password=${DO_PASSWORD} sslmode=require" \
  < supabase_backup_${BACKUP_DATE}.sql

# أو طريقة 2: مع progress bar
pv supabase_backup_${BACKUP_DATE}.sql | \
psql "host=${DO_HOST} port=${DO_PORT} dbname=${DO_DB} user=${DO_USER} password=${DO_PASSWORD} sslmode=require"

echo "✅ تم استيراد البيانات بنجاح"
```

### 2.5 التحقق من الاستيراد:
```bash
# سكريبت التحقق
psql "host=${DO_HOST} port=${DO_PORT} dbname=${DO_DB} user=${DO_USER} password=${DO_PASSWORD} sslmode=require" << EOF
-- عد الجداول
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- الجداول الرئيسية
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'articles', 'categories', 'interactions', 'loyalty_points')
ORDER BY table_name;

-- عد السجلات في الجداول المهمة
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'articles', COUNT(*) FROM articles
UNION ALL
SELECT 
  'categories', COUNT(*) FROM categories
UNION ALL
SELECT 
  'interactions', COUNT(*) FROM interactions;
EOF
```

---

## ✳️ الإجراء الثالث: اختبار الاتصال وربط المشروع

### 3.1 تحديث متغيرات البيئة:
```bash
# حفظ نسخة احتياطية من .env الحالي
cp .env .env.backup_${BACKUP_DATE}

# تحديث DATABASE_URL
cat > .env.new << EOF
# قاعدة البيانات الجديدة - DigitalOcean
DATABASE_URL="postgresql://${DO_USER}:${DO_PASSWORD}@${DO_HOST}:${DO_PORT}/${DO_DB}?sslmode=require"

# نسخ باقي المتغيرات من .env القديم
$(grep -v "DATABASE_URL" .env.backup_${BACKUP_DATE})
EOF

# استبدال الملف
mv .env.new .env
```

### 3.2 اختبار الاتصال المباشر:
```bash
# سكريبت اختبار سريع
node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('✅ الاتصال بقاعدة البيانات نجح!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('⏰ وقت الخادم:', result.rows[0].now);
    return client.end();
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });
"
```

### 3.3 إعادة بناء وتشغيل المشروع:
```bash
# تنظيف البناء السابق
rm -rf .next
rm -rf node_modules/.cache

# إعادة تثبيت التبعيات
pnpm install

# البناء
pnpm build

# التشغيل
pnpm start
```

### 3.4 اختبار الوظائف الأساسية:

#### A. اختبار صفحة الصحة:
```bash
# من terminal آخر
curl -f http://localhost:3000/api/health || echo "❌ فشل اختبار الصحة"
```

#### B. اختبار جلب المقالات:
```bash
curl -s http://localhost:3000/api/articles?limit=5 | jq '.data | length'
```

#### C. اختبار تسجيل الدخول:
```bash
# باستخدام بيانات المستخدم التجريبي
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@sabq.ai",
    "password": "Test@123456"
  }' | jq '.success'
```

---

## ✳️ الإجراء الرابع: تعديل الاتصالات في Prisma

### 4.1 سحب الـ Schema من قاعدة البيانات الجديدة:
```bash
# سحب الـ schema الحالي
npx prisma db pull

# مقارنة مع الـ schema القديم
diff prisma/schema.prisma prisma/schema.prisma.backup
```

### 4.2 توليد Prisma Client:
```bash
# توليد الـ client الجديد
npx prisma generate

# التحقق من عدم وجود أخطاء
npx prisma validate
```

### 4.3 تشغيل Migrations (إذا لزم الأمر):
```bash
# عرض الـ migrations المعلقة
npx prisma migrate status

# تطبيق أي migrations مفقودة
npx prisma migrate deploy
```

---

## ✅ قائمة التحقق النهائية

### الوظائف الأساسية:
- [ ] عرض المقالات في `/articles`
- [ ] عرض الصفحة الرئيسية `/`
- [ ] تسجيل الدخول `/login`
- [ ] صفحة الملف الشخصي `/profile`

### وظائف المستخدم:
- [ ] حفظ المقالات (Bookmarks)
- [ ] الإعجاب بالمقالات (Likes)
- [ ] كتابة التعليقات
- [ ] عرض نقاط الولاء

### وظائف متقدمة:
- [ ] جلب المقالات حسب الاهتمامات
- [ ] تتبع سجل القراءة
- [ ] عرض صفحة "رحلتك المعرفية" `/my-journey`
- [ ] البحث في المقالات

### اختبارات الأداء:
```bash
# قياس سرعة الاستجابة
time curl -s http://localhost:3000/api/articles > /dev/null

# اختبار التحميل
ab -n 100 -c 10 http://localhost:3000/api/articles
```

---

## 🚨 في حالة حدوث مشاكل

### مشكلة: فشل الاتصال بقاعدة البيانات
```bash
# التحقق من الشبكة
ping ${DO_HOST}

# التحقق من المنفذ
nc -zv ${DO_HOST} ${DO_PORT}

# التحقق من SSL
openssl s_client -connect ${DO_HOST}:${DO_PORT} -starttls postgres
```

### مشكلة: أخطاء في الـ Schema
```bash
# العودة للـ schema القديم
cp prisma/schema.prisma.backup prisma/schema.prisma
npx prisma generate
```

### مشكلة: بطء في الأداء
```sql
-- تحليل الاستعلامات البطيئة
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- إنشاء indexes مفقودة
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_interactions_user ON interactions(user_id, article_id);
```

---

## 📝 توثيق النتائج

### إنشاء تقرير النقل:
```bash
cat > migration_report_${BACKUP_DATE}.md << EOF
# تقرير نقل قاعدة البيانات

## التفاصيل:
- التاريخ: $(date)
- المصدر: Supabase
- الهدف: DigitalOcean (${DO_HOST})
- قاعدة البيانات: ${DO_DB}

## النتائج:
- عدد الجداول المنقولة: $(grep -c "CREATE TABLE" supabase_backup_${BACKUP_DATE}.sql)
- حجم النسخة الاحتياطية: $(du -h supabase_backup_${BACKUP_DATE}.sql | cut -f1)
- وقت النقل: [يدوياً]

## الاختبارات:
- [ ] اختبار الاتصال: ✅
- [ ] اختبار الوظائف: ✅
- [ ] اختبار الأداء: ✅

## ملاحظات:
[أضف أي ملاحظات هنا]
EOF
```

---

## 🎉 انتهى! 

المشروع الآن يعمل على قاعدة البيانات الجديدة في DigitalOcean.

**نصائح مهمة**:
1. احتفظ بالنسخ الاحتياطية لمدة شهر على الأقل
2. راقب الأداء خلال الـ 48 ساعة القادمة
3. قم بإعداد نسخ احتياطية تلقائية في DigitalOcean 