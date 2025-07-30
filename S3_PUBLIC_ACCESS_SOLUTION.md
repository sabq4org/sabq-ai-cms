# حل مشكلة عرض الصور في بطاقات الأخبار على بيئة الإنتاج 🖼️

## 🔍 تشخيص المشكلة

### الأعراض:
- ❌ الصور لا تظهر في بطاقات الأخبار (الصفحة الرئيسية، آخر الأخبار، المحتوى المخصص)
- ✅ الصور تظهر بشكل طبيعي في صفحة تفاصيل الخبر
- 🔗 الصور مرفوعة على Amazon S3

### السبب الجذري:
المشكلة في استخدام **Presigned URLs** بدلاً من **Public URLs** للصور في S3. هذا يعني:
1. الروابط لها مدة صلاحية محدودة (تنتهي بعد فترة)
2. الروابط تحتوي على توقيعات معقدة قد تسبب مشاكل في CORS
3. البطاقات تحاول عرض صور بروابط منتهية الصلاحية

## ✅ الحل السريع (Hotfix)

### 1. تحديث دالة `uploadImageToS3` لإرجاع رابط عام
```typescript
// lib/aws-s3.ts
export async function uploadImageToS3(
  file: Buffer, 
  fileName: string, 
  contentType: string, 
  folder: string = 'uploads',
  customExpiresIn?: number
): Promise<{ url: string; key: string }> {
  try {
    // ... كود الرفع الموجود ...
    
    // بدلاً من إنشاء presigned URL، ارجع الرابط العام مباشرة
    const publicUrl = `${S3_DOMAIN}/${key}`;
    
    console.log(`✅ تم رفع الصورة بنجاح: ${publicUrl}`);
    
    return { url: publicUrl, key };
  } catch (error) {
    // ... معالجة الأخطاء ...
  }
}
```

### 2. تحديث معالج الصور لتنظيف الروابط
```typescript
// lib/image-utils.ts
export function cleanS3Url(url: string): string {
  if (!url || !url.includes('amazonaws.com')) return url;
  
  try {
    const urlObj = new URL(url);
    
    // إزالة جميع معاملات التوقيع
    const cleanParams = new URLSearchParams();
    // احتفظ فقط بالمعاملات المفيدة (إن وجدت)
    for (const [key, value] of urlObj.searchParams) {
      if (!['X-Amz-Algorithm', 'X-Amz-Credential', 'X-Amz-Date', 
            'X-Amz-Expires', 'X-Amz-SignedHeaders', 'X-Amz-Signature',
            'X-Amz-Security-Token'].includes(key)) {
        cleanParams.append(key, value);
      }
    }
    
    // إنشاء رابط نظيف بدون توقيع
    const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    return cleanUrl;
  } catch (error) {
    console.warn('خطأ في تنظيف رابط S3:', error);
    return url;
  }
}
```

## 🔧 الحل الشامل (Production Fix)

### 1. إعداد S3 Bucket Policy للوصول العام

قم بإضافة هذه السياسة إلى bucket في AWS S3 Console:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sabq-ai-cms-images/*",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "articles/*",
            "categories/*",
            "featured/*",
            "thumbnails/*"
          ]
        }
      }
    }
  ]
}
```

### 2. إعداد CORS Policy للـ Bucket

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
              "https://sabq.me",
        "https://www.sabq.me",
      "http://localhost:3000",
      "http://localhost:3002"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Type",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. إعداد CloudFront (موصى به)

لتحسين الأداء وتجنب مشاكل CORS:

```javascript
// .env.production
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
NEXT_PUBLIC_S3_PUBLIC_URL=https://sabq-ai-cms-images.s3.amazonaws.com
```

```typescript
// lib/image-utils.ts
export function getImageUrl(imageUrl: string | null | undefined, options: any = {}): string {
  // ... الكود الموجود ...
  
  // معالجة روابط S3
  if (imageUrl.includes('s3.amazonaws.com')) {
    // تنظيف الرابط من التوقيعات
    const cleanUrl = cleanS3Url(imageUrl);
    
    // إذا كان CloudFront متاح، استخدمه
    if (process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN) {
      const path = cleanUrl.split('.s3.amazonaws.com/')[1];
      return `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${path}`;
    }
    
    return cleanUrl;
  }
  
  // ... باقي الكود ...
}
```

## 🚀 خطوات التطبيق

### 1. على AWS Console:
1. اذهب إلى S3 > Buckets > sabq-ai-cms-images
2. Permissions > Bucket Policy > Edit
3. الصق سياسة الوصول العام
4. Permissions > CORS > Edit
5. الصق إعدادات CORS

### 2. في الكود:
1. حدث `lib/aws-s3.ts` لإرجاع روابط عامة
2. حدث `lib/image-utils.ts` لتنظيف الروابط
3. انشر التحديثات على بيئة الإنتاج

### 3. التحقق:
1. ارفع صورة جديدة
2. تأكد من ظهورها في البطاقات مباشرة
3. افحص Network tab في DevTools للتأكد من عدم وجود أخطاء CORS

## 📊 مؤشرات النجاح

بعد تطبيق الحل، يجب أن تلاحظ:
- ✅ ظهور جميع الصور في بطاقات الأخبار
- ✅ عدم وجود أخطاء CORS في console
- ✅ تحميل أسرع للصور (خاصة مع CloudFront)
- ✅ عدم انتهاء صلاحية روابط الصور

## ⚠️ ملاحظات أمنية

1. **الوصول العام محدود**: فقط للمجلدات المحددة (articles, categories, etc.)
2. **لا يمكن رفع ملفات**: السياسة تسمح بالقراءة فقط
3. **يُنصح باستخدام CloudFront**: لإضافة طبقة حماية وتحسين الأداء

## 🔍 استكشاف الأخطاء

إذا استمرت المشكلة:

1. **تحقق من Console**:
   ```javascript
   // في المتصفح
   document.querySelectorAll('img').forEach(img => {
     if (img.src.includes('amazonaws')) {
       console.log('Image:', img.src, 'Loaded:', img.complete);
     }
   });
   ```

2. **تحقق من Response Headers**:
   - `Access-Control-Allow-Origin` يجب أن يكون موجود
   - `Content-Type` يجب أن يكون صحيح (image/jpeg, etc.)

3. **جرب رابط مباشر**:
   - افتح رابط الصورة في تبويب جديد
   - إذا لم تفتح، المشكلة في إعدادات S3
   - إذا فتحت، المشكلة في الكود أو CORS 