# 🚀 حلول فورية لمشكلة رفع الصور

## الحل رقم 1: تعديل API الرفع (الأولوية القصوى)

### 📝 الملف: `/app/api/upload/route.ts`

استبدل الكود الحالي في السطور 88-120 بهذا:

```typescript
} catch (uploadError) {
  console.error('❌ خطأ في رفع الملف إلى Cloudinary:', uploadError);
  
  // إرجاع خطأ واضح بدلاً من نجاح زائف
  return NextResponse.json({ 
    success: false,  // ← تغيير مهم!
    error: 'فشل رفع الصورة إلى السحابة',
    message: 'سيتم استخدام صورة مؤقتة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.',
    details: uploadError instanceof Error ? uploadError.message : 'خطأ غير معروف',
    is_placeholder: true,
    placeholder_url: '/placeholder.jpg'
  }, { status: 400 });  // ← إرجاع كود خطأ
}
```

## الحل رقم 2: تعديل معالج رفع الصور في الواجهة

### 📝 الملف: `/app/dashboard/article/edit/[id]/page.tsx`

استبدل الكود في السطور 204-212 بهذا:

```typescript
if (response.ok && data.success) {
  // تحقق جديد: التأكد من أنها ليست صورة افتراضية
  if (data.is_placeholder) {
    toast.error('⚠️ فشل رفع الصورة إلى السحابة. يرجى المحاولة مرة أخرى.', { 
      id: 'upload',
      duration: 5000 
    });
    console.error('❌ Cloudinary upload failed, placeholder was used');
    return;
  }
  
  // تحقق من وجود رابط Cloudinary صحيح
  if (!data.url || !data.url.includes('cloudinary.com')) {
    toast.error('❌ لم يتم الحصول على رابط صحيح للصورة', { id: 'upload' });
    return;
  }
  
  setFormData(prev => ({ ...prev, featuredImage: data.url }));
  toast.success('✅ تم رفع الصورة بنجاح إلى السحابة', { id: 'upload' });
  console.log('✅ تم رفع الصورة:', data.url);
} else {
  // معالجة الخطأ الصريح
  toast.error(data.error || 'فشل في رفع الصورة', { 
    id: 'upload',
    duration: 5000 
  });
  
  // عرض تفاصيل الخطأ للمطورين
  if (data.details) {
    console.error('تفاصيل الخطأ:', data.details);
  }
}
```

## الحل رقم 3: إضافة سكريبت تشخيص Cloudinary

### 📝 إنشاء ملف جديد: `/scripts/test-cloudinary.js`

```javascript
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('🔍 فحص Cloudinary...\n');
  
  try {
    // اختبار بسيط
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testImage, {
      folder: 'sabq-cms/test',
      public_id: `test_${Date.now()}`
    });
    
    console.log('✅ Cloudinary يعمل بشكل صحيح!');
    console.log('URL:', result.secure_url);
    
    // حذف الصورة الاختبارية
    await cloudinary.uploader.destroy(result.public_id);
    
  } catch (error) {
    console.error('❌ فشل الاختبار!');
    console.error('السبب:', error.message);
    
    if (error.message.includes('Invalid')) {
      console.log('\n💡 الحل: تحقق من مفاتيح API في .env.local');
    } else if (error.message.includes('limit')) {
      console.log('\n💡 الحل: تجاوزت حد الاستخدام، راجع حسابك في Cloudinary');
    }
  }
}

testCloudinary();
```

ثم شغّل:
```bash
node scripts/test-cloudinary.js
```

## الحل رقم 4: إضافة نظام Retry تلقائي

### 📝 الملف: `/lib/cloudinary-server.ts`

أضف هذه الدالة بعد السطر 28:

```typescript
// دالة إعادة المحاولة
export const uploadWithRetry = async (
  file: File | Buffer,
  options: any,
  maxRetries: number = 3
): Promise<any> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 محاولة رفع ${attempt}/${maxRetries}...`);
      const result = await uploadToCloudinary(file, options);
      console.log(`✅ نجح الرفع من المحاولة ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ فشلت المحاولة ${attempt}: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        // انتظار تصاعدي: 1s, 2s, 3s
        const delay = attempt * 1000;
        console.log(`⏳ الانتظار ${delay}ms قبل المحاولة التالية...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`فشل الرفع بعد ${maxRetries} محاولات: ${lastError?.message}`);
};
```

ثم في `/app/api/upload/route.ts` استبدل:
```typescript
const result = await uploadToCloudinary(file, { folder, fileName });
```
بـ:
```typescript
const result = await uploadWithRetry(file, { folder, fileName }, 3);
```

## الحل رقم 5: إضافة تسجيل شامل

### 📝 الملف: `/app/api/upload/route.ts`

أضف بعد السطر 75:

```typescript
// تسجيل محاولة الرفع
await prisma.activity_logs.create({
  data: {
    id: crypto.randomUUID(),
    action: 'image_upload_attempt',
    entity_type: 'image',
    metadata: {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      folder: folder,
      timestamp: new Date().toISOString()
    }
  }
});
```

وفي catch block أضف:

```typescript
// تسجيل فشل الرفع
await prisma.activity_logs.create({
  data: {
    id: crypto.randomUUID(),
    action: 'image_upload_failed',
    entity_type: 'cloudinary_error',
    metadata: {
      error: uploadError.message,
      file_name: file.name,
      file_size: file.size,
      cloudinary_config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        has_api_key: !!process.env.CLOUDINARY_API_KEY,
        has_api_secret: !!process.env.CLOUDINARY_API_SECRET
      },
      timestamp: new Date().toISOString()
    }
  }
});
```

## الحل رقم 6: بديل مؤقت - استخدام Base64

### 📝 كحل مؤقت، يمكن حفظ الصور كـ Base64 في قاعدة البيانات:

في `/app/api/upload/route.ts`:

```typescript
// إذا فشل Cloudinary، احفظ كـ Base64 مؤقتاً
if (!hasCloudinary || uploadFailed) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;
  
  // حفظ في جدول مؤقت
  const tempImage = await prisma.temp_images.create({
    data: {
      id: crypto.randomUUID(),
      name: file.name,
      data: dataUri,
      size: file.size,
      type: file.type,
      created_at: new Date()
    }
  });
  
  return NextResponse.json({
    success: true,
    url: `/api/temp-images/${tempImage.id}`,
    temp_storage: true,
    message: 'تم حفظ الصورة مؤقتاً. سيتم رفعها للسحابة لاحقاً.'
  });
}
```

## 🚀 خطوات التنفيذ

1. **أولاً**: طبّق الحل رقم 1 و 2 (الأكثر أهمية)
2. **ثانياً**: شغّل سكريبت التشخيص (الحل رقم 3)
3. **ثالثاً**: أضف نظام إعادة المحاولة (الحل رقم 4)
4. **رابعاً**: فعّل التسجيل الشامل (الحل رقم 5)
5. **اختياري**: استخدم الحل المؤقت (الحل رقم 6) إذا استمرت المشكلة

## 📞 للدعم الفني

إذا استمرت المشكلة بعد تطبيق هذه الحلول، تحقق من:
- حساب Cloudinary (الحد الشهري، الصلاحيات)
- جدار الحماية (Firewall) قد يحجب الاتصال
- حجم الصور (جرب صور أصغر من 1MB)

---
تم إعداد هذه الحلول لتطبيق فوري ✨ 