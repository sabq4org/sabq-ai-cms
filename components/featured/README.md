# Featured Components

مكونات خاصة بعرض الأخبار المميزة (Featured News) بمنهجية معيارية.

## useFeaturedCarousel
Hook مسؤول عن التحكم في فهرس الكاروسيل والتحريك التلقائي مع احترام تفضيل تقليل الحركة.

### الخصائص
- `length`: عدد العناصر.
- `autoPlayInterval` (اختياري، افتراضي 5000ms)
- `paused`: لإيقاف التشغيل التلقائي مؤقتاً.

### إرجاع
- `index`
- `setIndex(i)`
- `next()`
- `prev()`
- `isReducedMotion`

## خطة التفكيك (Applied Partially)
- تم استخراج الهوك.
- لاحقاً: تفكيك مزيد من الأجزاء (Media / Meta / Indicators).
