# إعداد متغيرات البيئة على Vercel

## لحل مشكلة عدم ظهور الصور في الموقع المباشر، يجب إضافة المتغيرات التالية في Vercel:

### 1. تحديث رابط الموقع:
```
NEXT_PUBLIC_SITE_URL=https://sabq-ai-cms.vercel.app
```

### 2. إعدادات Cloudinary (للصور):
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=[احصل عليه من حسابك في Cloudinary]
```

### 3. قاعدة البيانات (من Supabase):
```
DATABASE_URL=postgresql://postgres:[YOUR_SUPABASE_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres
```

### 4. مفتاح JWT للمصادقة:
```
JWT_SECRET=[أنشئ مفتاح آمن عشوائي]
NEXTAUTH_SECRET=[نفس المفتاح أو مفتاح آخر]
```

## خطوات الإعداد في Vercel:

1. اذهب إلى Dashboard في Vercel
2. اختر مشروع `sabq-ai-cms`
3. اذهب إلى Settings > Environment Variables
4. أضف المتغيرات أعلاه
5. اضغط Save
6. أعد نشر المشروع (Redeploy)

## ملاحظات مهمة:

### للصور المرفوعة حديثاً:
- ستُرفع تلقائياً إلى Cloudinary
- ستظهر في جميع البيئات (المحلية والمباشرة)

### للصور القديمة:
- يجب إعادة رفعها من لوحة التحكم
- أو تحديث روابطها في قاعدة البيانات

### إنشاء Upload Preset في Cloudinary:
1. سجل دخول إلى Cloudinary
2. اذهب إلى Settings > Upload
3. أضف Upload Preset جديد باسم `ml_default`
4. اختر Unsigned uploading
5. احفظ الإعدادات 