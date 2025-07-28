# 🚀 إعداد Prisma Accelerate مع AWS Amplify

## ✅ الخطوات:

### 1️⃣ **في AWS Amplify Console:**

اذهب إلى: **App settings** → **Environment variables** → **Manage variables**

### 2️⃣ **احذف DATABASE_URL القديم وأضف الجديد:**

```
DATABASE_URL
```
```
prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19Gb1Y0azQxaV9UV0xISDNXSE1XbDYiLCJhcGlfa2V5IjoiMDFLMTdLS0ZHNTFBMVRFUzUzRzhBTjA1TVkiLCJ0ZW5hbnRfaWQiOiJkN2ViNzM3MTMyN2Y3MWM3YzZhYTg3NDZkOTg1ODlmOTM4MjIxZGRiNzRlNjMyYjY1OWE3ODRlZDQ1MTkzMDhkIiwiaW50ZXJuYWxfc2VjcmV0IjoiZTYzMjBiNWYtNDc5OC00ODg5LTliMjEtYzkwMWUyMzVhMmRjIn0.q9xng2jxSiFJiL3yM8FcK9UqzYWVjWJzBqNIHITVSfA
```

### 3️⃣ **أضف DIRECT_URL (مهم!):**

```
DIRECT_URL
```
```
postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

### 4️⃣ **تأكد من وجود:**

```
NEXTAUTH_SECRET
```
```
sabq-ai-cms-secret-key-2025
```

```
NEXTAUTH_URL
```
```
https://production-branch.dvdwfd4vy831i.amplifyapp.com
```

### 5️⃣ **اضغط Save ثم Redeploy**

## 📝 ملاحظات مهمة:

- **DATABASE_URL**: يستخدم Prisma Accelerate URL
- **DIRECT_URL**: يستخدم connection string المباشر (مطلوب لـ migrations)
- لا حاجة لأي binary targets
- لا حاجة لأي إعدادات خاصة

## 🎯 النتيجة المتوقعة:

خلال 5-10 دقائق:
- ✅ Build سينجح
- ✅ لا أخطاء Prisma Engine
- ✅ الموقع سيعمل بشكل كامل
- ✅ أداء أفضل مع Connection Pooling

## 🔍 للتحقق بعد النشر:

```bash
# فحص قاعدة البيانات
curl https://production-branch.dvdwfd4vy831i.amplifyapp.com/api/health/db

# فحص الموقع
https://production-branch.dvdwfd4vy831i.amplifyapp.com
```

## 🎉 مبروك! 
Prisma Accelerate يحل جميع مشاكل Amplify! 