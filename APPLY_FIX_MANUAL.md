# 🔧 تطبيق الإصلاح يدوياً - خطوة بخطوة

## 🎯 المشكلة المحددة
```
GET /api/categories 500 (Internal Server Error)
السبب: رابط قاعدة البيانات MySQL غير متوافق مع Prisma
```

## 📋 الحل اليدوي (5 دقائق)

### الخطوة 1: الدخول إلى Vercel Dashboard
1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع **sabq-ai-cms**
3. انقر تبويب **"Settings"**
4. اختر **"Environment Variables"** من القائمة الجانبية

### الخطوة 2: تحديث DATABASE_URL
ابحث عن متغير `DATABASE_URL` وقم بتحديثه:

**الرابط الحالي:**
```
mysql://5k3qivqt4ihe...
```

**الرابط الجديد (أضف SSL parameters):**
```
mysql://5k3qivqt4ihe...?sslaccept=strict&connect_timeout=60&pool_timeout=60
```

### الخطوة 3: إضافة DIRECT_URL
انقر **"Add New"** وأضف:
- **Name:** `DIRECT_URL`
- **Value:** نفس قيمة `DATABASE_URL` الجديدة
- **Environment:** Production

### الخطوة 4: إضافة متغيرات الأمان (إن لم تكن موجودة)
```env
JWT_SECRET=sabq-secret-key-2024-ultra-secure
ADMIN_SECRET=admin-secret-2024
```

### الخطوة 5: إضافة متغيرات Cloudinary (إن لم تكن موجودة)
```env
CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=vuiA8rLNm7d1U-UAOTED6FyC4hY
```

### الخطوة 6: إعادة النشر
1. اذهب إلى تبويب **"Deployments"**
2. انقر على آخر deployment
3. انقر **"Redeploy"**
4. انتظر انتهاء النشر (2-3 دقائق)

### الخطوة 7: اختبار النتيجة
افتح في متصفح جديد:
```
https://sabq-ai-cms.vercel.app/api/test-db
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "قاعدة البيانات تعمل بشكل صحيح",
  "database": {
    "connected": true,
    "tables": {...}
  }
}
```

## 🚀 اختبار سريع للموقع
بعد الإصلاح، جرب:
1. https://sabq-ai-cms.vercel.app/api/categories
2. https://sabq-ai-cms.vercel.app/dashboard
3. رفع صورة في لوحة التحكم

## 🔍 إذا لم يعمل الحل
جرب هذه البدائل:

### بديل 1: تغيير تنسيق الرابط
```env
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict&ssl_mode=REQUIRED
```

### بديل 2: إنشاء قاعدة PostgreSQL جديدة
1. في Vercel Storage > Create Database
2. اختر **Postgres** بدلاً من MySQL
3. سيتم إنشاء `POSTGRES_PRISMA_URL` تلقائياً
4. حدث `DATABASE_URL=$POSTGRES_PRISMA_URL`

### بديل 3: استخدام PlanetScale
1. أنشئ حساب في https://planetscale.com
2. أنشئ قاعدة بيانات جديدة
3. احصل على connection string
4. حدث `DATABASE_URL` في Vercel

## 📊 متابعة الحالة
بعد التطبيق، راقب:
- **Vercel Function Logs**: للتأكد من عدم وجود أخطاء
- **Database Connections**: تأكد من عدم تجاوز الحد المسموح
- **API Response Times**: يجب أن تكون أسرع

## 🎉 علامات النجاح
- ✅ `/api/categories` يعطي قائمة الفئات
- ✅ `/api/test-db` يعطي `"success": true`
- ✅ لوحة التحكم تعمل بدون أخطاء
- ✅ رفع الصور يعمل بشكل طبيعي

---

💡 **ملاحظة**: إذا واجهت أي مشكلة، تحقق من **Function Logs** في Vercel لمعرفة الخطأ الدقيق. 