# نظام إدارة الصور السحابية

## نظرة عامة

تم تطوير نظام متكامل لإدارة الصور يمنع تماماً حفظ أي صور محلياً ويعتمد بالكامل على الخدمات السحابية.

## المميزات الرئيسية

### 1. عدم حفظ الصور محلياً
- ✅ جميع الصور تُحمل من CDN خارجي
- ✅ لا يتم حفظ أي صور على السيرفر
- ✅ لا يتم تخزين الصور في cache المتصفح إلا مؤقتاً

### 2. دعم مصادر متعددة
- Cloudinary (المصدر الرئيسي)
- Unsplash (للصور المجانية)
- UI Avatars (لصور المستخدمين)
- Placeholder services (للصور البديلة)

### 3. تحسين الأداء
- تحميل كسول (Lazy Loading)
- صور محسنة تلقائياً (WebP/AVIF)
- تحديد الأبعاد المناسبة حسب الجهاز
- Blur placeholders أثناء التحميل

### 4. معالجة الأخطاء
- صور بديلة تلقائية عند فشل التحميل
- أنواع مختلفة من الصور البديلة (مقالات، مؤلفين، تصنيفات)
- التحقق من صحة الروابط قبل العرض

## كيفية الاستخدام

### 1. استخدام مكون CloudImage

```tsx
import CloudImage from '@/components/ui/CloudImage';

// صورة عادية
<CloudImage
  src={imageUrl}
  alt="وصف الصورة"
  width={800}
  height={600}
  fallbackType="article"
/>

// صورة تملأ الحاوية
<CloudImage
  src={imageUrl}
  alt="وصف الصورة"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={true}
/>
```

### 2. استخدام دوال المعالجة

```tsx
import { getImageUrl } from '@/lib/image-utils';

// الحصول على رابط محسن
const optimizedUrl = getImageUrl(originalUrl, {
  width: 1200,
  height: 630,
  quality: 85,
  format: 'webp',
  fallbackType: 'article'
});
```

### 3. رفع الصور

```tsx
import ImageUploader from '@/components/ui/ImageUploader';

<ImageUploader
  onUpload={(url) => console.log('تم رفع:', url)}
  maxSize={5} // 5 ميجابايت
  acceptedFormats={['image/jpeg', 'image/png']}
/>
```

### 4. رفع صور متعددة

```tsx
import { MultiImageUploader } from '@/components/ui/ImageUploader';

<MultiImageUploader
  onUpload={(url) => console.log('صورة جديدة:', url)}
  maxImages={5}
/>
```

## إعداد Cloudinary

### 1. إنشاء حساب
1. اذهب إلى [cloudinary.com](https://cloudinary.com)
2. أنشئ حساب مجاني
3. احصل على بيانات الاعتماد من Dashboard

### 2. إعداد Upload Preset
1. اذهب إلى Settings > Upload
2. أنشئ Upload Preset جديد
3. اختر "Unsigned" للرفع من المتصفح
4. قم بتفعيل الخيارات المطلوبة:
   - Auto format
   - Auto quality
   - Eager transformations

### 3. إضافة متغيرات البيئة

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

## أفضل الممارسات

### 1. تحديد الأبعاد المناسبة
```tsx
// للصور الرئيسية
width={1200} height={630}

// للصور المصغرة
width={400} height={300}

// لصور المؤلفين
width={100} height={100}
```

### 2. استخدام sizes للصور المتجاوبة
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

### 3. تحديد الأولوية للصور المهمة
```tsx
priority={true} // للصور above the fold
```

### 4. استخدام fallbackType المناسب
- `article` - للمقالات والأخبار
- `author` - لصور المؤلفين
- `category` - لصور التصنيفات
- `default` - للحالات العامة

## معالجة الأخطاء

### التحقق من صحة الروابط

```tsx
// API endpoint للتحقق
const response = await fetch('/api/images/validate', {
  method: 'POST',
  body: JSON.stringify({ url: imageUrl })
});

const { valid } = await response.json();
```

### التحقق من عدة روابط

```tsx
const response = await fetch('/api/images/validate', {
  method: 'PUT',
  body: JSON.stringify({ urls: [url1, url2, url3] })
});

const { results } = await response.json();
```

## الأمان

### 1. منع التحميل المباشر
- جميع عمليات الرفع تتم عبر Cloudinary API
- لا يتم حفظ أي ملفات على السيرفر

### 2. التحقق من أنواع الملفات
- فقط الصور المسموح بها (JPEG, PNG, WebP, GIF)
- التحقق من حجم الملف قبل الرفع

### 3. Content Security Policy
```javascript
// في next.config.js
contentSecurityPolicy: "default-src 'self'; img-src * data: blob:;"
```

## استكشاف الأخطاء

### الصورة لا تظهر
1. تحقق من Console للأخطاء
2. تأكد من أن الرابط صحيح
3. تحقق من إعدادات remotePatterns في next.config.js

### الصورة بطيئة التحميل
1. استخدم priority للصور المهمة
2. حدد sizes بشكل صحيح
3. استخدم quality أقل للصور الكبيرة

### فشل رفع الصورة
1. تحقق من حجم الملف
2. تأكد من نوع الملف المدعوم
3. تحقق من إعدادات Cloudinary

## الترحيل من النظام القديم

### 1. تحديث استخدامات Image
```tsx
// قديم
<Image src="/api/placeholder/400/300" />

// جديد
<CloudImage src={null} fallbackType="article" />
```

### 2. تحديث دوال المعالجة
```tsx
// قديم
getValidImageUrl(url)

// جديد
getImageUrl(url, { fallbackType: 'article' })
```

### 3. تحديث الرفع
```tsx
// بدلاً من الرفع المحلي
<ImageUploader onUpload={handleCloudinaryUpload} />
```

## الموارد

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web.dev Image Best Practices](https://web.dev/fast/#optimize-your-images) 