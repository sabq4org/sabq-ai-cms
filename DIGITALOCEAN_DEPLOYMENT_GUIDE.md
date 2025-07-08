# دليل نشر مشروع سبق على DigitalOcean

## الخطوات الكاملة لحل مشكلة تسجيل الدخول وجلب البيانات

### 1. إعداد قاعدة البيانات (Supabase)

#### في لوحة تحكم Supabase:
1. اذهب إلى **Settings** > **Database**
2. انسخ **Connection string** (Direct connection)
3. تأكد من إضافة `?sslmode=require` في نهاية الرابط

مثال:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

### 2. إعداد متغيرات البيئة في DigitalOcean

#### في لوحة تحكم DigitalOcean App Platform:
1. اذهب إلى تطبيقك
2. اضغط على **Settings** > **App-Level Environment Variables**
3. أضف المتغيرات التالية:

```bash
# قاعدة البيانات (مطلوب)
DATABASE_URL=[نسخ من Supabase مع ?sslmode=require]

# المصادقة (مطلوب)
JWT_SECRET=your-super-secret-key-min-32-chars-long-change-this

# عناوين الموقع (مطلوب)
NEXT_PUBLIC_API_URL=https://sabq-ai-cms-xxxxx.ondigitalocean.app
NEXT_PUBLIC_SITE_URL=https://sabq-ai-cms-xxxxx.ondigitalocean.app
NEXT_PUBLIC_SITE_NAME=صحيفة سبق الإلكترونية

# Node.js (مطلوب)
NODE_ENV=production

# Cloudinary (اختياري)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key

# البريد الإلكتروني (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. تحديث إعدادات App Spec

#### في **Settings** > **App Spec**:
قم بتحديث الملف ليكون:

```yaml
name: sabq-ai-cms
region: nyc
services:
- build_command: npm run build:server
  environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: sabq4org/sabq-ai-cms
  http_port: 3000
  instance_count: 1
  instance_size_slug: professional-xs
  name: web
  run_command: npm start
  source_dir: /
  envs:
  - key: NODE_ENV
    scope: RUN_AND_BUILD_TIME
    value: production
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
    value: EV[1:xxx:xxx]
  - key: JWT_SECRET
    scope: RUN_AND_BUILD_TIME
    type: SECRET
    value: EV[1:xxx:xxx]
  - key: NEXT_PUBLIC_API_URL
    scope: RUN_AND_BUILD_TIME
    value: ${APP_URL}
  - key: NEXT_PUBLIC_SITE_URL
    scope: RUN_AND_BUILD_TIME
    value: ${APP_URL}
```

### 4. إصلاحات الكود المطلوبة

#### أ. تحديث CORS (lib/cors.ts):
```typescript
import { NextResponse } from 'next/server';

export function addCorsHeaders(response: NextResponse): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_API_URL
  ].filter(Boolean);
  
  // في الإنتاج، استخدم origin محدد
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
```

#### ب. تحديث إعدادات الكوكيز (app/api/auth/login/route.ts):
```typescript
// في نهاية دالة POST، عند إنشاء الكوكيز:
const isProduction = process.env.NODE_ENV === 'production';
const appUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
const domain = isProduction ? `.${appUrl.hostname}` : undefined;

response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  domain: domain
});

response.cookies.set('user', JSON.stringify(responseUser), {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  domain: domain
});
```

### 5. إنشاء middleware.ts في جذر المشروع:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // معالجة طلبات OPTIONS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 6. اختبار الاتصال

#### أ. اختبر قاعدة البيانات محلياً:
```bash
# استخدم نفس DATABASE_URL من DigitalOcean
export DATABASE_URL="postgresql://..."
node scripts/test-database-connection.js
```

#### ب. اختبر API بعد النشر:
```bash
# تسجيل الدخول
curl -X POST https://your-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v

# جلب التصنيفات
curl https://your-app.ondigitalocean.app/api/categories -v
```

### 7. التحقق من السجلات

في لوحة تحكم DigitalOcean:
1. اذهب إلى **Runtime Logs**
2. ابحث عن:
   - أخطاء Prisma
   - أخطاء في الاتصال بقاعدة البيانات
   - أخطاء في JWT
   - أخطاء CORS

### 8. نصائح مهمة

1. **تأكد من أن جميع المتغيرات موجودة قبل النشر**
2. **استخدم `professional-xs` أو أكبر لتجنب مشاكل الذاكرة**
3. **تأكد من أن `postinstall` في package.json يولد Prisma**
4. **لا تنس `?sslmode=require` في DATABASE_URL**

### 9. في حالة استمرار المشكلة

#### أضف هذا في بداية كل API route للتشخيص:
```typescript
console.log('🔍 Debug Info:', {
  NODE_ENV: process.env.NODE_ENV,
  HAS_DATABASE_URL: !!process.env.DATABASE_URL,
  HAS_JWT_SECRET: !!process.env.JWT_SECRET,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  HEADERS: Object.fromEntries(request.headers.entries())
});
```

### 10. الحل النهائي

إذا استمرت المشكلة، قم بـ:
1. حذف التطبيق وإعادة إنشائه
2. استخدم هذا الأمر للبناء: `prisma generate && next build`
3. تأكد من أن الـ region نفسه لقاعدة البيانات والتطبيق

## خطوات سريعة للنشر

```bash
# 1. في مجلد المشروع
git add .
git commit -m "Fix production deployment"
git push origin main

# 2. في DigitalOcean
# - تأكد من المتغيرات
# - راقب Build Logs
# - راقب Runtime Logs

# 3. بعد النشر
# اختبر مباشرة:
curl https://your-app.ondigitalocean.app/api/health
```

## الإعدادات الحالية
- **Branch**: `main` (تم تحديثه من clean-main)
- **Auto Deploy**: مفعّل - سينشر تلقائياً عند كل push
- **Build Command**: `npm run build:do`
- **Run Command**: `npm start`

## كيفية النشر

### 1. النشر التلقائي (Auto Deploy)
بما أن `deploy_on_push: true` مفعّل، فإن التطبيق سينشر تلقائياً عند:
```bash
git push origin main
```

### 2. النشر اليدوي من لوحة التحكم
1. اذهب إلى: https://cloud.digitalocean.com/apps
2. اختر تطبيقك: `sabq-ai-cms`
3. اضغط على زر **"Deploy"** الأزرق
4. اختر **"Deploy from main branch"**

### 3. Force Rebuild (في حالة المشاكل)
1. اذهب إلى **Settings** > **App Settings**
2. ابحث عن **"Force Rebuild & Deploy"**
3. اضغط على الزر

## التحقق من حالة النشر
1. في لوحة التحكم، اذهب إلى **"Activity"** tab
2. ستجد سجل بجميع عمليات النشر
3. اضغط على أي deployment لرؤية التفاصيل والـ logs

## معلومات مهمة
- **آخر commit**: `5d0f4c7` - تحديث branch النشر إلى main
- **Build Time**: حوالي 10-15 دقيقة
- **Instance**: Professional XS (1 vCPU, 2GB RAM)

## في حالة فشل البناء
1. تحقق من Build Logs في Activity tab
2. تأكد من أن جميع environment variables مضبوطة
3. تحقق من أن `npm run build:do` يعمل محلياً

## Environment Variables المطلوبة
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - للمصادقة
- `NEXTAUTH_SECRET` - لـ NextAuth
- `CLOUDINARY_API_SECRET` - لرفع الصور

---
تم التحديث: 2024-07-06 