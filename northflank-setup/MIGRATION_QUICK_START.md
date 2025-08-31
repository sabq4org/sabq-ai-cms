# 🚀 دليل البدء السريع - نقل البيانات إلى Northflank

## 📋 الطرق المتاحة

### 1️⃣ النقل السريع بـ Shell Script (5 دقائق)
```bash
# الأسرع والأبسط
chmod +x northflank-setup/quick-migrate.sh

OLD_DATABASE_URL="postgresql://old..." \
NEW_DATABASE_URL="postgresql://new..." \
./northflank-setup/quick-migrate.sh
```

### 2️⃣ النقل الآمن بـ JavaScript (10 دقائق)
```bash
# مع فحوصات وتحقق
OLD_DATABASE_URL="postgresql://old..." \
NEW_DATABASE_URL="postgresql://new..." \
node northflank-setup/migrate-to-northflank.js
```

### 3️⃣ النقل الذكي بـ Prisma (15 دقائق)
```bash
# للبيانات المعقدة والعلاقات
OLD_DATABASE_URL="postgresql://old..." \
NEW_DATABASE_URL="postgresql://new..." \
node northflank-setup/migrate-with-prisma.js
```

## 🎯 أيهما أختار؟

| الطريقة | الوقت | الأمان | متى تستخدمها |
|---------|-------|--------|---------------|
| Shell Script | ⚡ 5 دقائق | ⭐⭐⭐ | بيانات بسيطة، نقل سريع |
| JavaScript | ⏱️ 10 دقائق | ⭐⭐⭐⭐ | تحتاج فحوصات وتقارير |
| Prisma | ⏰ 15 دقائق | ⭐⭐⭐⭐⭐ | علاقات معقدة، بيانات حساسة |

## 📝 الخطوات الأساسية

### 1. احصل على Connection Strings

#### من القاعدة القديمة:
- **Supabase**: Settings > Database > Connection string
- **PlanetScale**: Connect > Create password
- **DigitalOcean**: Connection Details > Connection string

#### من Northflank:
- استخدم **External URI** مع IP whitelist
- أو من داخل Northflank Job استخدم Internal URI

### 2. شغّل النقل

```bash
# مثال كامل
OLD_DATABASE_URL="postgresql://user:pass@old-host:5432/db" \
NEW_DATABASE_URL="postgresql://user:pass@new-host:5432/db" \
./northflank-setup/quick-migrate.sh
```

### 3. تحقق من النتائج

```bash
# في Northflank Shell
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM articles;"
```

## ⚡ نصائح للنقل السريع

### قبل النقل:
```bash
# 1. تأكد من وجود pg_dump و psql
which pg_dump psql

# 2. اختبر الاتصال بالقاعدتين
psql "$OLD_DATABASE_URL" -c "SELECT 1;"
psql "$NEW_DATABASE_URL" -c "SELECT 1;"
```

### أثناء النقل:
- ضع الموقع في **maintenance mode**
- أوقف الكتابة في القاعدة القديمة
- راقب استخدام الذاكرة

### بعد النقل:
```bash
# 1. تحقق من الأعداد
node -e "
const tables = ['users', 'articles', 'categories'];
tables.forEach(t => {
  console.log(\`SELECT '\${t}', COUNT(*) FROM \${t};\`);
});
"

# 2. اختبر تسجيل الدخول
# 3. اختبر إنشاء مقال جديد
```

## 🆘 حل المشاكل الشائعة

### مشكلة: "permission denied"
```bash
# أضف في بداية الاستيراد
GRANT ALL ON ALL TABLES IN SCHEMA public TO current_user;
```

### مشكلة: "duplicate key"
```bash
# نظف الجداول أولاً
TRUNCATE TABLE users, articles, categories CASCADE;
```

### مشكلة: "out of memory"
```bash
# قسّم النقل لجداول منفصلة
pg_dump $OLD_DB -t users | psql $NEW_DB
pg_dump $OLD_DB -t articles | psql $NEW_DB
```

## 📊 مثال ناجح

```
🚀 نقل البيانات السريع إلى Northflank
====================================

📦 إنشاء نسخة احتياطية...
✅ تم إنشاء النسخة الاحتياطية: backup_20240115_143022.sql
   الحجم: 45M

📥 استيراد البيانات إلى Northflank...
✅ تم استيراد البيانات بنجاح!

🔍 فحص سريع للبيانات...
 table_name | count
------------+-------
 articles   | 15234
 categories |    28
 users      |  1847
 interactions| 45621

🎉 اكتمل نقل البيانات!
```

---

**جاهز للبدء؟** اختر طريقة واحدة من الأعلى وابدأ النقل! 🚀
