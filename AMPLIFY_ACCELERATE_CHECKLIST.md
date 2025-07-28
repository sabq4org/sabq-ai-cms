# ✅ قائمة التحقق من Prisma Accelerate على Amplify

## 1️⃣ **في Amplify Console - Environment Variables:**

### أربع متغيرات مطلوبة بالضبط:

#### DATABASE_URL (نسخ بدون تعديل):
```
prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19Gb1Y0azQxaV9UV0xISDNXSE1XbDYiLCJhcGlfa2V5IjoiMDFLMTdLS0ZHNTFBMVRFUzUzRzhBTjA1TVkiLCJ0ZW5hbnRfaWQiOiJkN2ViNzM3MTMyN2Y3MWM3YzZhYTg3NDZkOTg1ODlmOTM4MjIxZGRiNzRlNjMyYjY1OWE3ODRlZDQ1MTkzMDhkIiwiaW50ZXJuYWxfc2VjcmV0IjoiZTYzMjBiNWYtNDc5OC00ODg5LTliMjEtYzkwMWUyMzVhMmRjIn0.q9xng2jxSiFJiL3yM8FcK9UqzYWVjWJzBqNIHITVSfA
```

#### DIRECT_URL (نسخ بدون تعديل):
```
postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

#### NEXTAUTH_SECRET:
```
sabq-ai-cms-secret-key-2025
```

#### NEXTAUTH_URL:
```
https://production-branch.dvdwfd4vy831i.amplifyapp.com
```

## 2️⃣ **تأكد من أن Branch الصحيح:**
- استخدم `production-branch` وليس `main`

## 3️⃣ **Build settings:**
- يجب أن يكون Build spec نظيف وبسيط (تم تحديثه)

## 4️⃣ **بعد الحفظ:**
1. اضغط **Save** 
2. اضغط **Redeploy this version**

## 5️⃣ **انتظر البناء (5-10 دقائق)**

## 6️⃣ **للتحقق بعد البناء:**
```bash
# 1. فحص الصحة
curl https://production-branch.dvdwfd4vy831i.amplifyapp.com/api/health

# 2. فحص قاعدة البيانات
curl https://production-branch.dvdwfd4vy831i.amplifyapp.com/api/health/db

# 3. فحص المقالات
curl https://production-branch.dvdwfd4vy831i.amplifyapp.com/api/articles
```

## ⚠️ **أخطاء شائعة:**
- ❌ استخدام علامات الاقتباس " " حول القيم
- ❌ إضافة مسافات في البداية أو النهاية
- ❌ تعديل DATABASE_URL (يجب نسخه كما هو)
- ❌ نسيان DIRECT_URL (مطلوب!)

## 🔍 **إذا لم يعمل:**
1. تحقق من Build logs في Amplify Console
2. ابحث عن "error" أو "failed"
3. شارك معي الأخطاء 