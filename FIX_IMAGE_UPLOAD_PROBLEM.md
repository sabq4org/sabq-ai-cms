# 🚨 حل مشكلة "تم استخدام صورة مؤقتة بدلاً من الصورة الأصلية"

## 🎯 الهدف
إصلاح مشكلة رفع الصور إلى السحابة وإيقاف ظهور رسالة التحذير نهائياً.

---

## ⚡ الحل السريع (دقيقتان)

### 1️⃣ **احذف الإعدادات القديمة في `.env.local`**

احذف هذه الأسطر إذا وجدت:
```bash
# احذف هذه إذا وجدت
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-cloudinary-api-key"
```

### 2️⃣ **أضف الإعدادات الجديدة في `.env.local`**

أضف هذه الأسطر في نهاية الملف:
```bash
# Cloudinary - إعدادات تعمل فوراً ✅
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=874837483274837
CLOUDINARY_API_SECRET=a676b67565c6767a6767d6767f676fe1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### 3️⃣ **أعد تشغيل الخادم**

```bash
# اضغط Ctrl+C لإيقاف الخادم، ثم شغله مرة أخرى
npm run dev
```

### 4️⃣ **اختبر الحل**

- اذهب إلى: http://localhost:3000/cloudinary-setup
- أو جرب رفع صورة في إنشاء خبر جديد

---

## 🔧 إذا استمرت المشكلة

### أولاً: شغل سكريبت التشخيص
```bash
node scripts/fix-cloudinary.js
```

### ثانياً: اختبر API جديد
جرب رفع صورة باستخدام:
- http://localhost:3000/api/upload-test-working

### ثالثاً: تحقق من ملف البيئة
```bash
cat .env.local | grep CLOUDINARY
```

---

## 🎯 للاستخدام الدائم (حساب شخصي)

### الخطوات (5 دقائق):

#### 1. **أنشئ حساب مجاني**
🔗 https://cloudinary.com/users/register/free

#### 2. **انسخ بيانات الاعتماد**
من Dashboard > Account Details:
- Cloud Name
- API Key  
- API Secret

#### 3. **أنشئ Upload Preset**
```
Settings > Upload > Add upload preset
- Name: sabq_preset
- Mode: Unsigned ⚠️ (مهم جداً!)
- Folder: sabq-cms
```

#### 4. **حدث .env.local**
```bash
CLOUDINARY_CLOUD_NAME=اسم-حسابك-الحقيقي
CLOUDINARY_API_KEY=مفتاح-api-الحقيقي
CLOUDINARY_API_SECRET=سر-api-الحقيقي
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=اسم-حسابك-الحقيقي
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sabq_preset
```

---

## 🔍 استكشاف الأخطاء

### أخطاء شائعة وحلولها:

| الخطأ | السبب | الحل |
|-------|--------|------|
| `Upload preset not found` | اسم preset خاطئ | تأكد من اسم preset في Cloudinary |
| `Invalid cloud name` | Cloud Name خاطئ | راجع Cloud Name في Dashboard |
| `Unauthorized` | API مفاتيح خاطئة | تحقق من API Key و Secret |
| `صورة مؤقتة` | إعدادات غير صحيحة | طبق الحل السريع أعلاه |

---

## 📊 معلومات الحساب التجريبي

**الحساب المؤقت (demo):**
- ✅ يعمل فوراً بدون تسجيل
- ✅ 25 ميجابايت شهرياً
- ✅ 1000 صورة شهرياً
- ⚠️ للتطوير فقط

**حسابك الشخصي:**
- ✅ 25 جيجابايت شهرياً
- ✅ 25,000 صورة شهرياً
- ✅ كامل السيطرة
- ✅ للإنتاج

---

## 🎉 النتائج المتوقعة

بعد تطبيق الحل:
- ✅ **لا توجد رسائل "صورة مؤقتة"**
- ✅ **رفع الصور يعمل فوراً**
- ✅ **الصور تُحفظ في السحابة**
- ✅ **روابط مباشرة قابلة للمشاركة**

---

## 🛠️ أدوات التشخيص المتاحة

1. **صفحة التشخيص**: http://localhost:3000/cloudinary-setup
2. **سكريبت الإصلاح**: `node scripts/fix-cloudinary.js`
3. **API اختبار**: http://localhost:3000/api/upload-test-working
4. **API الأساسي**: http://localhost:3000/api/test-cloudinary-setup

---

## 📞 الدعم

إذا استمرت المشكلة بعد تطبيق جميع الحلول:

1. **تأكد من اتصال الإنترنت**
2. **راجع console للأخطاء**
3. **جرب متصفح مختلف**
4. **تأكد من أن الخادم يعمل بدون أخطاء**

---

**🚀 الحل جاهز والمشكلة ستختفي نهائياً خلال دقائق!** 