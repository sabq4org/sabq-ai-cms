# متغيرات البيئة المطلوبة لـ DigitalOcean App Platform

## 1. قاعدة البيانات (مطلوب - استخدم المنفذ الصحيح)
```
DATABASE_URL=postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require
```

## 2. متغيرات Supabase (حقيقية)
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
NEXT_PUBLIC_SITE_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app
NEXT_PUBLIC_SITE_NAME=صحيفة سبق الإلكترونية
```

## 5. متغيرات Cloudinary (مطلوب للصور)
```
CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=vuiA8rLNm7dqLv7B9f2xoqClm6E
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
NEXT_PUBLIC_CLOUDINARY_API_KEY=559894124915114
```

## 6. متغيرات البريد الإلكتروني (اختياري)
```
SMTP_HOST=mail.jur3a.ai
SMTP_PORT=465
SMTP_USER=noreplay@jur3a.ai
SMTP_PASS=oFWD[H,A8~8;iw7(
SMTP_SECURE=true
EMAIL_FROM_NAME=سبق
EMAIL_FROM_ADDRESS=sabqai@sabq.ai
```

## 7. متغيرات البيئة (مطلوب)
```
NODE_ENV=production
SKIP_EMAIL_VERIFICATION=true
ENABLE_DB_PROTECTION=true
```

## 8. متغيرات إضافية
```
API_SECRET_KEY=X9yZ1aC3eF5gH7jK9mN2pQ4rS6tV8wX0yZ1aC3eF5gH7j
```

## كيفية الإضافة في DigitalOcean:

1. اذهب إلى [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. افتح تطبيقك `sabq-ai-cms`
3. اذهب إلى **Settings** > **App-Level Environment Variables**
4. اضغط **Edit**
5. أضف كل متغير من القائمة أعلاه
6. اضغط **Save**

## ملاحظات مهمة:

- استخدم `private-` في عنوان قاعدة البيانات للاتصال الداخلي في DigitalOcean
- تأكد من أن DATABASE_URL يستخدم المنفذ 25060 وليس 5432
- متغيرات Supabase الآن حقيقية وستعمل بشكل صحيح
- سيبدأ النشر تلقائياً بعد حفظ المتغيرات 