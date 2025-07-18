# متغيرات البيئة النهائية لـ DigitalOcean

## المتغيرات المطلوبة (REQUIRED)

### 1. قاعدة البيانات
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

### 2. المصادقة
```
NEXTAUTH_URL=https://YOUR-APP-NAME.ondigitalocean.app
NEXTAUTH_SECRET=PddNqvCDoV4JqU1/KSiuE9Vy/CUqu7NXyjjuoeqyym4=
```

### 3. Cloudinary (مطلوب للصور)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. البيئة
```
NODE_ENV=production
PORT=3000
```

## المتغيرات الاختيارية (OPTIONAL)

### 5. البريد الإلكتروني
```
EMAIL_HOST=mail.jur3a.ai
EMAIL_PORT=465
EMAIL_USER=noreplay@jur3a.ai
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreplay@jur3a.ai
```

### 6. Redis (اختياري)
```
REDIS_URL=redis://your-redis-url
```

### 7. OpenAI (للذكاء الاصطناعي)
```
OPENAI_API_KEY=your-openai-api-key
```

## ملاحظات مهمة

1. **متغيرات NEXT_PUBLIC_**: يجب إضافتها قبل البناء لأنها تُضمن في الكود
2. **DATABASE_URL**: احصل عليه من Supabase Dashboard
3. **NEXTAUTH_URL**: استخدم رابط التطبيق الكامل من DigitalOcean
4. **NEXTAUTH_SECRET**: يمكن توليد مفتاح جديد باستخدام: `openssl rand -base64 32`

## خطوات الإضافة في DigitalOcean

1. اذهب إلى **App Settings** → **Environment Variables**
2. أضف كل متغير بالضغط على **Add Variable**
3. اختر **Encrypt** للمتغيرات الحساسة (كلمات المرور والمفاتيح السرية)
4. احفظ وأعد النشر (Deploy) 