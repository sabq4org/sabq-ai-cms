# اختبار رفع الصور مباشرة إلى Cloudinary

## في انتظار نشر صفحة التشخيص، جرب هذا:

### 1️⃣ **افتح Console (F12) في المتصفح**

### 2️⃣ **انسخ والصق هذا الكود**:

```javascript
// اختبار رفع صورة وهمية
async function testCloudinaryDirect() {
  // إنشاء blob صورة بسيطة
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4c6ef5';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = '#fff';
  ctx.font = '30px Arial';
  ctx.fillText('TEST', 10, 60);
  
  const blob = await new Promise(resolve => canvas.toBlob(resolve));
  const file = new File([blob], 'test.png', { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  
  console.log('🚀 بدء الاختبار...');
  
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dybhezmvb/image/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('📋 النتيجة:', data);
    
    if (response.ok) {
      console.log('✅ نجح الرفع!');
      console.log('🔗 الرابط:', data.secure_url);
      window.open(data.secure_url);
    } else {
      console.error('❌ فشل الرفع:', data);
      console.log('💡 السبب المحتمل:', data.error?.message);
    }
  } catch (error) {
    console.error('❌ خطأ في الشبكة:', error);
  }
}

// تشغيل الاختبار
testCloudinaryDirect();
```

### 3️⃣ **اضغط Enter**

### 📊 **النتائج المتوقعة**:

- ✅ **إذا نجح**: سيفتح رابط الصورة
- ❌ **إذا فشل**: ستظهر رسالة الخطأ في Console

### 🔍 **الأخطاء الشائعة**:

1. **401 Unauthorized**: 
   - Upload preset `ml_default` غير موجود أو ليس Unsigned

2. **403 Forbidden**: 
   - Unsigned uploads غير مسموح في Cloudinary

3. **CORS Error**: 
   - نفس مشكلة 403

### 💡 **الحل السريع**:

إذا ظهر أي من الأخطاء أعلاه:

1. سجل دخول إلى [Cloudinary](https://console.cloudinary.com)
2. Settings > Upload
3. Add upload preset
4. Name: `ml_default`
5. Signing Mode: `Unsigned`
6. Save

ثم أعد تشغيل الكود! 