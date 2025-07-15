# SABQ AI CMS - Vercel Deployment

هذا مستودع منفصل لنشر مشروع SABQ AI CMS على Vercel.

## رابط المستودع الأصلي
[https://github.com/sabq4org/sabq-ai-cms](https://github.com/sabq4org/sabq-ai-cms)

## الغرض من هذا المستودع
تم إنشاء هذا المستودع لحل مشاكل النشر على Vercel وتسهيل عملية النشر المباشر.

## الإعداد على Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط على "New Project"
3. قم باستيراد هذا المستودع: `sabq4org/sabq`
4. اختر Next.js كـ Framework
5. أضف متغيرات البيئة المطلوبة من ملف `.env.example`

## متغيرات البيئة المطلوبة

```
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_API_URL=
```

## ملاحظات مهمة

- تم استبعاد مجلد `.github` مؤقتاً لتجنب مشاكل الصلاحيات
- يتم تحديث هذا المستودع بشكل دوري من المستودع الأصلي
- للمساهمة في التطوير، يُرجى استخدام المستودع الأصلي

## البناء والتشغيل

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```

## الدعم

للدعم والمساعدة، يرجى فتح issue في المستودع الأصلي. 