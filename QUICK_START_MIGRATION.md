# 🚀 دليل البدء السريع - نقل قاعدة البيانات

## 📋 الملفات المطلوبة لعملية النقل

### 1. التقارير والوثائق:
- 📄 **[التقرير الفني الشامل](DIGITAL_OCEAN_MIGRATION_ASSESSMENT.md)** - تحليل مفصل
- 📊 **[الملخص التنفيذي](EXECUTIVE_MIGRATION_SUMMARY.md)** - للإدارة
- ⚠️ **[تحليل المخاطر](MIGRATION_RISKS_AND_MITIGATIONS.md)** - المخاطر وحلولها
- 📘 **[دليل التنفيذ](MIGRATION_EXECUTION_GUIDE.md)** - خطوة بخطوة

### 2. السكريبتات الجاهزة:
- 🔍 **[فحص الجاهزية](scripts/pre-migration-check.sh)**
  ```bash
  chmod +x scripts/pre-migration-check.sh
  ./scripts/pre-migration-check.sh
  ```

- 🔄 **[سكريبت النقل الرئيسي](scripts/migrate-to-digitalocean.sh)**
  ```bash
  chmod +x scripts/migrate-to-digitalocean.sh
  ./scripts/migrate-to-digitalocean.sh
  ```

- 📊 **[مقارنة الأداء](scripts/compare-database-performance.js)**
  ```bash
  node scripts/compare-database-performance.js
  ```

---

## ⚡ البدء السريع (5 خطوات)

### 1️⃣ التحقق من الجاهزية:
```bash
./scripts/pre-migration-check.sh
```

### 2️⃣ إضافة بيانات Supabase:
```bash
export SUPABASE_HOST="db.xxxxx.supabase.co"
export SUPABASE_PASSWORD="your-password"
```

### 3️⃣ تشغيل النقل:
```bash
./scripts/migrate-to-digitalocean.sh
```

### 4️⃣ تحديث المشروع:
```bash
# تحديث .env
echo 'DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"' > .env

# إعادة بناء
pnpm install
pnpm build
pnpm start
```

### 5️⃣ اختبار سريع:
```bash
# صفحة الصحة
curl http://localhost:3000/api/health

# جلب المقالات
curl http://localhost:3000/api/articles?limit=5
```

---

## 📱 أرقام الدعم الفني

### في حالة الطوارئ:
- **مدير المشروع**: [الهاتف]
- **DBA**: [الهاتف]
- **DevOps**: [الهاتف]

### الدعم الخارجي:
- **DigitalOcean**: +1-XXX-XXX-XXXX
- **Supabase Support**: support@supabase.io

---

## ⏱️ الوقت المتوقع

- **فحص الجاهزية**: 5 دقائق
- **أخذ النسخة الاحتياطية**: 30-60 دقيقة
- **نقل البيانات**: 2-4 ساعات
- **الاختبار والتحقق**: 1-2 ساعة
- **الإجمالي**: 4-6 ساعات

---

## 🆘 مشاكل شائعة وحلولها

### 1. خطأ الاتصال بـ Supabase:
```bash
# تحقق من الـ host
nslookup db.xxxxx.supabase.co

# جرب مع port مختلف
export SUPABASE_PORT=6543
```

### 2. خطأ SSL مع DigitalOcean:
```bash
# أضف هذا للـ connection string
?sslmode=require&ssl={"rejectUnauthorized":false}
```

### 3. Prisma errors:
```bash
# أعد توليد client
npx prisma generate --force

# امسح cache
rm -rf node_modules/.prisma
```

---

## ✅ بعد النقل

1. **احذف بيانات Supabase من .env**
2. **احتفظ بالنسخ الاحتياطية لـ 30 يوم**
3. **قم بإعداد automated backups في DigitalOcean**
4. **راقب الأداء لـ 48 ساعة**

---

**للمساعدة**: افتح issue في GitHub أو تواصل مع الفريق التقني 