# 🔗 ربط DigitalOcean مع قاعدة بيانات Amazon RDS

## 📋 الخطوات:

### 1️⃣ **في DigitalOcean App Platform:**

#### إضافة متغيرات البيئة:
```
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=https://sabq.io
NODE_ENV=production
```

### 2️⃣ **إصلاح خطأ npm (TipTap):**
تم إصلاحه في package.json - جميع إصدارات TipTap الآن 2.26.1

### 3️⃣ **في Amazon RDS Security Group:**
أضف IP addresses لـ DigitalOcean:
- اذهب إلى AWS RDS Console
- اختر database-1
- Security Groups → Edit inbound rules
- أضف PostgreSQL rule لـ DigitalOcean IPs

### 4️⃣ **دفع التغييرات:**
```bash
git add -A
git commit -m "fix: حل تعارض TipTap dependencies"
git push origin production-branch
```

### 5️⃣ **إعادة النشر في DigitalOcean:**
- سيتم تلقائياً بعد git push
- أو يدوياً من Dashboard

## ✅ النتيجة:
- DigitalOcean يستخدم نفس قاعدة بيانات Amazon
- لا حاجة لنقل البيانات
- نفس المحتوى في كلا الموقعين 