# 🔧 إعدادات Cloudinary لرفع الصور

## ⚠️ المشكلة الحالية

يبدو أن بيانات الاعتماد الحالية لـ Cloudinary غير صحيحة أو منتهية الصلاحية، مما يسبب:
- خطأ 401 (غير مصرح)
- خطأ 500 عند رفع الصور

## 📋 الخطوات المطلوبة

### 1. إنشاء حساب Cloudinary (إذا لم يكن لديك)
1. اذهب إلى [cloudinary.com](https://cloudinary.com)
2. اضغط على "Sign up for free"
3. أكمل التسجيل

### 2. الحصول على بيانات الاعتماد
1. ادخل إلى [Cloudinary Console](https://console.cloudinary.com)
2. من Dashboard، ستجد:
   - **Cloud Name**: اسم السحابة الخاص بك
   - **API Key**: مفتاح API
   - **API Secret**: مفتاح السر (اضغط "Reveal" لإظهاره)

### 3. تحديث ملف `.env.local`
```env
# Cloudinary Settings
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### 4. تحديث الكود (مؤقتاً)

حتى يتم إضافة البيانات الصحيحة في `.env.local`، قم بتحديث الملفات التالية:

#### `/app/api/upload/cloudinary/route.ts`
```typescript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

### 5. اختبار الاتصال
```bash
# تشغيل سكريبت الاختبار
node scripts/test-cloudinary-connection.js
```

## 🎯 الحل الفوري

إذا كنت تريد استخدام حساب Cloudinary مؤقت للاختبار:

1. **أنشئ حساب مجاني** على Cloudinary
2. **احصل على البيانات** من Dashboard
3. **أضفها إلى `.env.local`**
4. **أعد تشغيل السيرفر**: `npm run dev`

## 📝 ملاحظات مهمة

- **حد الحجم**: تم تحديثه إلى 10MB بدلاً من 5MB
- **الصيغ المدعومة**: JPG, PNG, GIF, WebP, SVG
- **المجلدات**: يتم تنظيم الصور في مجلدات حسب النوع (articles, categories, etc.)

## 🔍 التحقق من المشكلة

عند محاولة رفع صورة، افتح Console في المتصفح وتحقق من:
1. هل تظهر رسالة خطأ 401؟ = مشكلة في بيانات الاعتماد
2. هل تظهر رسالة خطأ 500؟ = تحقق من سجلات السيرفر

## 🚀 بعد الإصلاح

1. يجب أن تتمكن من رفع صور حتى 10MB
2. ستحصل على روابط محسنة تلقائياً
3. ستحصل على صور مصغرة تلقائياً 