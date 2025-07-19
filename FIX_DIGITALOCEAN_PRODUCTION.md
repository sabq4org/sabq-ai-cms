# حل مشاكل الإنتاج على DigitalOcean

## 🚨 المشكلة الحالية
فشل في جلب التصنيفات والأخبار على الموقع المنشور على DigitalOcean

## 🔍 الأسباب المحتملة

### 1. مشكلة في متغيرات البيئة
- `DATABASE_URL` غير صحيح أو مفقود
- مفاتيح Cloudinary مفقودة
- متغيرات JWT غير موجودة

### 2. مشكلة في قاعدة البيانات
- عدم الاتصال بـ Supabase
- جداول غير موجودة
- مشكلة في Prisma migration

### 3. مشكلة في البناء (Build)
- أخطاء في عملية البناء
- ملفات مفقودة
- مشكلة في Next.js

## 🛠️ خطوات الحل

### الخطوة 1: فحص متغيرات البيئة على DigitalOcean

1. اذهب إلى [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. اختر تطبيقك
3. اذهب إلى "Settings" → "Environment Variables"
4. تأكد من وجود هذه المتغيرات:

```bash
# قاعدة البيانات (Supabase)
DATABASE_URL=postgresql://...

# JWT & Auth
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# بيئة
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-app.ondigitalocean.app
```

### الخطوة 2: اختبار APIs من المتصفح

1. افتح متصفحك واذهب إلى:
```
https://your-app.ondigitalocean.app/api/debug/production
```

2. ستحصل على تقرير مفصل عن حالة النظام

3. اختبر APIs الأساسية:
```
https://your-app.ondigitalocean.app/api/health
https://your-app.ondigitalocean.app/api/categories
https://your-app.ondigitalocean.app/api/news/latest
```

### الخطوة 3: فحص Logs على DigitalOcean

1. في DigitalOcean App Platform
2. اذهب إلى "Runtime Logs"
3. ابحث عن أخطاء تحتوي على:
   - `PrismaClientInitializationError`
   - `Connection refused`
   - `Environment variable not found`

### الخطوة 4: إعادة النشر مع إصلاح المتغيرات

إذا وجدت مشكلة في المتغيرات:

1. احذف المتغيرات المكررة أو الخاطئة
2. أضف المتغيرات الصحيحة
3. اضغط "Save" 
4. انتظر إعادة النشر التلقائي

### الخطوة 5: فحص قاعدة البيانات Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى "Settings" → "Database"
4. انسخ `DATABASE_URL` الجديد
5. استبدله في DigitalOcean

### الخطوة 6: تشغيل Prisma Migration (إذا لزم الأمر)

إذا كانت قاعدة البيانات فارغة أو الجداول مفقودة:

1. في DigitalOcean Console:
```bash
npx prisma db push
npx prisma generate
```

## 🧪 اختبار سريع

استخدم هذا Script لاختبار APIs:

```javascript
// استبدل YOUR-DOMAIN بعنوان موقعك
const domain = 'https://your-app.ondigitalocean.app';

async function test() {
  try {
    const response = await fetch(`${domain}/api/categories`);
    const data = await response.json();
    console.log('Categories:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

## 🔥 حل سريع في حالة الطوارئ

### Option A: إعادة نشر سريع
```bash
# في terminal محلي
git add .
git commit -m "Fix production issues"
git push origin main
```

### Option B: استخدام Build من scratch
1. في DigitalOcean، اذهب إلى "Settings"
2. اضغط "Destroy" ثم "Create New App"
3. اربط GitHub repo مرة أخرى
4. أعد إدخال جميع متغيرات البيئة

## 📋 Checklist للتأكد من الحل

- [ ] متغيرات البيئة موجودة وصحيحة
- [ ] `/api/health` يعطي استجابة 200
- [ ] `/api/categories` يُرجع التصنيفات
- [ ] `/api/news/latest` يُرجع الأخبار  
- [ ] الموقع يعمل بدون أخطاء JavaScript
- [ ] قاعدة البيانات متصلة
- [ ] صور Cloudinary تعمل

## 🆘 إذا لم ينجح شيء

1. اتصل بـ DigitalOcean Support
2. أرسل Runtime Logs
3. أرسل متغيرات البيئة (بدون القيم الحساسة)
4. اذكر رقم الخطأ المحدد

## 📞 للدعم السريع

أرسل هذه المعلومات:
- عنوان الموقع على DigitalOcean
- رسالة الخطأ الدقيقة
- لقطة شاشة من Runtime Logs
- نتيجة `/api/debug/production` 