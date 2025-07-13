# دليل إعداد Cloudinary للصور

## حل مشكلة "حدث خطأ أثناء رفع الصورة" على الموقع المباشر

### 1. إعدادات Upload Preset في Cloudinary:

1. **سجل دخول إلى [Cloudinary Dashboard](https://console.cloudinary.com/dashboard)**

2. **اذهب إلى Settings (الإعدادات) > Upload**

3. **أضف Upload preset جديد:**
   - اضغط على "Add upload preset"
   - **Preset name**: `ml_default` (مهم جداً أن يكون بهذا الاسم بالضبط)
   - **Signing Mode**: `Unsigned` ✅
   - **Folder**: `categories` (اختياري)

4. **إعدادات إضافية (مهمة):**
   - **Allowed formats**: `jpg, png, gif, webp, svg`
   - **Max file size**: `5MB`
   - **Unique filename**: `true`
   - **Access mode**: `public`

5. **اضغط Save**

### 2. تحقق من CORS Settings:

في Cloudinary Dashboard:
- Settings > Security
- تأكد من أن **"Allow unsigned uploads"** مفعّل ✅

### 3. متغيرات البيئة في Vercel:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
```

⚠️ **مهم**: يجب أن يبدأ اسم المتغير بـ `NEXT_PUBLIC_` حتى يكون متاحاً في المتصفح

### 4. خطوات التحقق في Vercel:

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع `sabq-ai-cms`
3. Settings > Environment Variables
4. تأكد من وجود:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dybhezmvb
   ```
5. **Redeploy** المشروع

### 5. اختبار الرفع:

افتح Console في المتصفح (F12) وجرب رفع صورة. ستظهر رسائل مثل:
```
محاولة رفع الصورة إلى: https://api.cloudinary.com/v1_1/dybhezmvb/image/upload
```

### 6. أخطاء شائعة وحلولها:

#### خطأ 401 (Unauthorized):
- تأكد من أن Upload Preset اسمه `ml_default` بالضبط
- تأكد من أنه `Unsigned`

#### خطأ 400 (Bad Request):
- تأكد من حجم الصورة (أقل من 5MB)
- تأكد من نوع الملف (صورة فقط)

#### خطأ CORS:
- تأكد من السماح بـ Unsigned uploads في Cloudinary

### 7. بديل مؤقت:

إذا استمرت المشكلة، يمكنك استخدام Upload Widget من Cloudinary:

```javascript
// في CategoryFormModal.tsx
const handleCloudinaryWidget = () => {
  window.cloudinary.openUploadWidget({
    cloudName: 'dybhezmvb',
    uploadPreset: 'ml_default',
    sources: ['local', 'url'],
    multiple: false,
    maxFileSize: 5000000,
  }, (error, result) => {
    if (!error && result && result.event === "success") {
      setImagePreview(result.info.secure_url);
      setFormData(prev => ({ 
        ...prev, 
        cover_image: result.info.secure_url 
      }));
    }
  });
};
```

### 8. للتحقق من الإعدادات:

يمكنك زيارة:
```
https://res.cloudinary.com/dybhezmvb/image/upload/v1/test.jpg
```

إذا ظهرت صفحة 404 من Cloudinary، فهذا يعني أن الحساب يعمل بشكل صحيح. 