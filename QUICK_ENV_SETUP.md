# إعداد ملف .env بسرعة ⚡️

## 🔧 أنشئ ملف .env في المجلد الرئيسي:

```bash
# أنشئ الملف
touch .env

# أضف هذا المحتوى
```

## 📝 المحتوى المطلوب:

```env
# Database URL - اختر واحد من الخيارات التالية:

# خيار 1: MySQL محلي (الموصى به)
DATABASE_URL="mysql://root:your_password@localhost:3306/sabq_ai_cms"

# خيار 2: Supabase (سحابي مجاني)
# DATABASE_URL="mysql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# خيار 3: PlanetScale (سحابي)
# DATABASE_URL="mysql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?ssl={"rejectUnauthorized":true}"

# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this

# AI (اختياري)
OPENAI_API_KEY=sk-...
```

## 🚀 خطوات سريعة:

### 1️⃣ MySQL محلي (XAMPP/MAMP):
```bash
# افتح phpMyAdmin
# أنشئ قاعدة بيانات: sabq_ai_cms
# ثم شغّل:
npx prisma db push
npm run seed
```

### 2️⃣ Supabase (مجاني):
1. اذهب إلى https://supabase.com
2. أنشئ مشروع جديد
3. انسخ Database URL من Settings > Database
4. ضعه في .env
5. شغّل الأوامر أعلاه

## ✅ تحقق من الاتصال:
```bash
npx prisma db push
```

## 🎯 الخطأ الشائع:
```
error: Error validating datasource `db`: the URL must start with the protocol `mysql://`
```

**الحل:** تأكد أن DATABASE_URL يبدأ بـ `mysql://` وليس فارغ! 