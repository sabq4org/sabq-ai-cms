# متغيرات البيئة المطلوبة لـ DigitalOcean App Platform

## تحديث مهم: 17 يوليو 2025
تأكد من إضافة جميع هذه المتغيرات في DigitalOcean App Settings

## 1. قاعدة البيانات (مطلوب)
```
DATABASE_URL=postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require
```

## 2. متغيرات Supabase (مطلوبة للبناء)
```
NEXT_PUBLIC_SUPABASE_URL=https://uopckyrdhlvsxnvcobbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDYxNDksImV4cCI6MjA2NzM4MjE0OX0.CcFv-usNHho5NZD_HiGLVT9wF-CYCyv9xwaNEcvDRa4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwNjE0OSwiZXhwIjoyMDY3MzgyMTQ5fQ.iilpTh2E6XwkGyKnFzG7a_xRjyt9ORaT3saJKSHhgYw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwNjE0OSwiZXhwIjoyMDY3MzgyMTQ5fQ.iilpTh2E6XwkGyKnFzG7a_xRjyt9ORaT3saJKSHhgYw
```

## 3. متغيرات المصادقة (مطلوب)
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
NEXTAUTH_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app
```

## 4. متغيرات الموقع (مطلوب)
```
NEXT_PUBLIC_APP_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app
NEXT_PUBLIC_API_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app/api
NODE_ENV=production
```

## 5. متغيرات Cloudinary (اختياري - للصور)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=[احصل عليه من Cloudinary]
```

## 6. متغيرات البريد الإلكتروني (اختياري)
```
EMAIL_HOST=mail.jur3a.ai
EMAIL_PORT=465
EMAIL_USER=noreplay@jur3a.ai
EMAIL_PASSWORD=[كلمة المرور]
EMAIL_FROM=noreplay@jur3a.ai
EMAIL_SECURE=true
```

## 7. متغيرات الذكاء الاصطناعي (اختياري)
```
OPENAI_API_KEY=[مفتاح OpenAI API]
ELEVENLABS_API_KEY=[مفتاح ElevenLabs API]
```

## 8. متغيرات النظام
```
PORT=8080
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
```

## خطوات الإضافة في DigitalOcean:

1. افتح [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. اختر التطبيق: `sabq-ai-cms`
3. اذهب إلى: Settings > App-Level Environment Variables
4. انقر على "Edit" 
5. أضف كل متغير بالضغط على "Add Variable"
6. احفظ التغييرات بالضغط على "Save"
7. انتظر إعادة النشر التلقائي

## ملاحظات مهمة:
- تأكد من إضافة المتغيرات بدون علامات التنصيص
- لا تضع مسافات زائدة قبل أو بعد القيم
- متغيرات Supabase مطلوبة حتى لو لم تكن تستخدمها حالياً
- بعد إضافة المتغيرات، سيبدأ النشر تلقائياً 