# 📋 انسخ والصق في Northflank Environment Variables

## 🟢 الخيار 1: استخدم المتغيرات الديناميكية (الموصى به)

انسخ هذا بالضبط:

```env
DATABASE_URL="${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"
DIRECT_URL="${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"
NEXTAUTH_SECRET="KIl0A88GLpvIfhVxeEJzqJ0ZIiFz8KdhNtUKTWV2OjQ="
NEXTAUTH_URL="https://sabq.me"
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
```

## 🔵 الخيار 2: إذا لم تعمل المتغيرات الديناميكية

انسخ هذا بدلاً منها:

```env
DATABASE_URL="postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7"
DIRECT_URL="postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7"
NEXTAUTH_SECRET="KIl0A88GLpvIfhVxeEJzqJ0ZIiFz8KdhNtUKTWV2OjQ="
NEXTAUTH_URL="https://sabq.me"
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
```

## 📝 خطوات الإضافة في Northflank:

1. افتح خدمة `sabq-app`
2. اذهب إلى **Environment** > **Variables**
3. اضغط على **Bulk Edit**
4. احذف أي محتوى موجود
5. الصق المتغيرات من الأعلى
6. اضغط **Save**

## ⚠️ تنبيهات مهمة:

- جرب **الخيار 1** أولاً (المتغيرات الديناميكية)
- إذا لم يعمل، استخدم **الخيار 2** (القيم المباشرة)
- قد تحتاج لتغيير `NEXTAUTH_SECRET` لقيمة جديدة
- الخدمة ستُعاد تشغيلها تلقائياً بعد الحفظ

## ➕ متغيرات إضافية (اختيارية):

بعد نجاح الاتصال بقاعدة البيانات، يمكنك إضافة:

```env
# AWS S3
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="sabq-cms-content"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="Sabq AI <noreply@sabq.me>"

# OpenAI
OPENAI_API_KEY="sk-..."

# API Security
API_SECRET_KEY="generate-new-secret"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```
