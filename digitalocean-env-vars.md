# متغيرات البيئة المطلوبة لـ DigitalOcean App Platform

## تحديث مهم: 17 يوليو 2025
تأكد من إضافة المتغيرات المطلوبة في DigitalOcean App Settings

## 1. متغيرات إلزامية (مطلوبة للبناء)

### قاعدة البيانات
```
DATABASE_URL=postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require
```

### المصادقة
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
NEXTAUTH_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app
```

### الموقع
```
NEXT_PUBLIC_APP_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app
NEXT_PUBLIC_API_URL=https://sabq-ai-cms-ckg9d.ondigitalocean.app/api
NODE_ENV=production
```

## 2. متغيرات اختيارية (موصى بها)

### Supabase (اختياري - للميزات المتقدمة)
```
NEXT_PUBLIC_SUPABASE_URL=https://uopckyrdhlvsxnvcobbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDYxNDksImV4cCI6MjA2NzM4MjE0OX0.CcFv-usNHho5NZD_HiGLVT9wF-CYCyv9xwaNEcvDRa4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwNjE0OSwiZXhwIjoyMDY3MzgyMTQ5fQ.iilpTh2E6XwkGyKnFzG7a_xRjyt9ORaT3saJKSHhgYw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGNreXJkaGx2c3hudmNvYmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwNjE0OSwiZXhwIjoyMDY3MzgyMTQ5fQ.iilpTh2E6XwkGyKnFzG7a_xRjyt9ORaT3saJKSHhgYw
```

**ملاحظة**: إذا لم تُضف متغيرات Supabase، سيستخدم التطبيق Mock Client تلقائيًا.

### Cloudinary (اختياري - للصور)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=[احصل عليه من Cloudinary]
```

### البريد الإلكتروني (اختياري)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=صحيفة سبق
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### Redis (اختياري - للتخزين المؤقت)
```
REDIS_URL=redis://default:password@localhost:6379
```

### OpenAI/Anthropic (اختياري - للذكاء الاصطناعي)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## 3. خطوات الإضافة في DigitalOcean

1. اذهب إلى **App Settings**
2. اختر **Environment Variables** 
3. أضف كل متغير مع قيمته
4. احفظ التغييرات
5. انتظر إعادة البناء التلقائي

## 4. ملاحظات مهمة

- **المتغيرات الإلزامية**: يجب إضافتها وإلا سيفشل البناء
- **المتغيرات الاختيارية**: يمكن إضافتها لاحقًا حسب الحاجة
- **Supabase**: إذا لم تُضف، سيعمل التطبيق بدونه باستخدام Mock Client
- **الأمان**: لا تشارك هذه المفاتيح مع أي شخص 