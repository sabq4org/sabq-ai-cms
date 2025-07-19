# دليل استخدام SmartImage

## المشكلة المحلولة
يحل مكون `SmartImage` مشكلة رسائل الخطأ المزعجة الناتجة عن فشل تحميل الصور الخارجية (404 errors).

## الاستخدام الأساسي

### 1. استخدام المكون SmartImage

```tsx
import SmartImage from '@/components/ui/SmartImage';

// صورة أفاتار
<SmartImage
  src={user.avatar}
  alt={user.name}
  width={50}
  height={50}
  fallbackType="avatar"
  className="rounded-full"
/>

// صورة مقال
<SmartImage
  src={article.featuredImage}
  alt={article.title}
  width={800}
  height={400}
  fallbackType="article"
  priority
/>

// صورة عامة مع fallback مخصص
<SmartImage
  src={imageUrl}
  alt="وصف الصورة"
  width={300}
  height={200}
  fallbackSrc="/custom-placeholder.jpg"
  retryCount={2}
/>
```

### 2. استخدام Hook useSmartImage

```tsx
import { useSmartImage } from '@/hooks/useSmartImage';
import Image from 'next/image';

function UserAvatar({ avatarUrl, userName }) {
  const { src, isLoading, hasError, onError } = useSmartImage(avatarUrl, {
    fallbackType: 'avatar',
    checkAvailability: true,
  });

  if (isLoading) {
    return <div className="skeleton-avatar" />;
  }

  return (
    <Image
      src={src}
      alt={userName}
      width={50}
      height={50}
      onError={onError}
      className={`rounded-full ${hasError ? 'opacity-50' : ''}`}
    />
  );
}
```

## الخصائص المتاحة

### SmartImage Props

| الخاصية | النوع | الافتراضي | الوصف |
|---------|--------|-----------|---------|
| `fallbackSrc` | string | حسب النوع | مسار الصورة البديلة |
| `fallbackType` | 'avatar' \| 'article' \| 'general' | 'general' | نوع الصورة البديلة |
| `retryCount` | number | 1 | عدد محاولات إعادة التحميل |
| `silentFail` | boolean | true | إخفاء رسائل الخطأ |

### useSmartImage Options

| الخيار | النوع | الافتراضي | الوصف |
|---------|--------|-----------|---------|
| `fallbackType` | 'avatar' \| 'article' \| 'general' | 'general' | نوع الصورة البديلة |
| `retryCount` | number | 1 | عدد محاولات إعادة التحميل |
| `checkAvailability` | boolean | false | التحقق من توفر الصورة قبل عرضها |

## الصور البديلة الافتراضية

- **Avatar**: `/default-avatar.png`
- **Article**: `/images/placeholder-featured.jpg`
- **General**: `/images/placeholder.jpg`

## السجلات

يتم حفظ أخطاء الصور في:
- **Development**: Console logs + `/logs/image-errors.log`
- **Production**: `/logs/image-errors.log` فقط (إذا كان `LOG_IMAGE_ERRORS=true`)

## أمثلة متقدمة

### مع Skeleton Loading

```tsx
function ArticleCard({ article }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative">
      {!imageLoaded && <div className="skeleton-image" />}
      <SmartImage
        src={article.image}
        alt={article.title}
        width={400}
        height={200}
        fallbackType="article"
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? 'fade-in' : 'opacity-0'}
      />
    </div>
  );
}
```

### مع Lazy Loading

```tsx
<SmartImage
  src={imageUrl}
  alt="وصف"
  width={800}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/images/blur-placeholder.jpg"
/>
```

## نصائح للأداء

1. **استخدم `priority` للصور المهمة** (above the fold)
2. **حدد `sizes` للصور المتجاوبة**
3. **استخدم `placeholder="blur"` مع `blurDataURL`**
4. **فعّل `checkAvailability` فقط عند الضرورة**

## استكشاف الأخطاء

### الصورة لا تظهر
- تأكد من وجود الصور البديلة في `public/`
- تحقق من إعدادات `remotePatterns` في `next.config.js`

### رسائل خطأ ما زالت تظهر
- تأكد من استخدام `SmartImage` بدلاً من `Image`
- تحقق من قيمة `silentFail={true}`

### أداء بطيء
- قلل `retryCount` للصور غير الحرجة
- استخدم `loading="lazy"` للصور خارج الشاشة 