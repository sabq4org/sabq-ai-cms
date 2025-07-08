# دليل حل مشاكل النشر على السيرفر

## المشكلة الحالية
- **محلياً**: كل شيء يعمل بشكل مثالي ✅
- **على السيرفر**: 
  - تسجيل العضوية: يعمل ✅
  - تسجيل الدخول: لا يعمل ❌
  - جلب البيانات من Supabase: لا يعمل ❌

## الأسباب المحتملة والحلول

### 1. مشكلة في متغيرات البيئة

#### التحقق من المتغيرات المطلوبة:
```bash
# المتغيرات الأساسية المطلوبة
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require"
JWT_SECRET="مفتاح-سري-قوي-جداً"
NEXT_PUBLIC_API_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

#### خطوات التحقق:
1. تأكد من وجود جميع المتغيرات في لوحة تحكم السيرفر
2. تأكد من أن `DATABASE_URL` يحتوي على `?sslmode=require` للاتصال الآمن
3. تأكد من أن `JWT_SECRET` نفسه في جميع البيئات

### 2. مشكلة CORS

#### الحل:
تأكد من أن إعدادات CORS تسمح بالطلبات من النطاق الخاص بك:

```javascript
// في lib/cors.ts
export function addCorsHeaders(response: NextResponse): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-domain.com',
    process.env.NEXT_PUBLIC_SITE_URL
  ];
  
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
```

### 3. مشكلة الكوكيز (Cookies)

#### المشكلة:
الكوكيز قد لا تعمل بشكل صحيح على HTTPS بسبب إعدادات `SameSite` و `Secure`.

#### الحل في `app/api/auth/login/route.ts`:
```javascript
// تحديد إعدادات الكوكيز بناءً على البيئة
const isProduction = process.env.NODE_ENV === 'production';
const isHttps = request.headers.get('x-forwarded-proto') === 'https';

response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: isProduction && isHttps, // Secure فقط على HTTPS
  sameSite: isProduction ? 'none' : 'lax', // none للـ cross-site على الإنتاج
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  domain: undefined // دع المتصفح يحدد النطاق
});
```

### 4. مشكلة SSL مع قاعدة البيانات

#### التحقق:
```bash
# اختبر الاتصال بقاعدة البيانات
npx prisma db pull
```

#### الحل:
إذا كانت هناك مشكلة SSL، جرب:
```
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require&sslcert=server-ca.pem"
```

### 5. مشكلة في Prisma Client

#### الحل:
```bash
# على السيرفر، تأكد من توليد Prisma Client
npx prisma generate

# أو أضف هذا إلى package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

### 6. مشكلة في Next.js Runtime

#### تأكد من استخدام Node.js runtime:
```javascript
// في كل API route
export const runtime = 'nodejs';
```

### 7. التحقق من السجلات (Logs)

#### على DigitalOcean App Platform:
1. اذهب إلى لوحة التحكم
2. اختر التطبيق
3. اذهب إلى "Runtime Logs"
4. ابحث عن أخطاء محددة

### 8. اختبار API مباشرة

#### استخدم curl أو Postman:
```bash
# اختبر تسجيل الدخول
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# اختبر جلب التصنيفات
curl https://your-domain.com/api/categories
```

### 9. التحقق من الصلاحيات

#### تأكد من أن المستخدم في قاعدة البيانات له الصلاحيات الكافية:
```sql
-- في Supabase SQL Editor
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### 10. إعدادات خاصة بـ DigitalOcean

#### في App Spec:
```yaml
name: sabq-ai-cms
services:
- environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: your-username/sabq-ai-cms
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs
  name: web
  run_command: npm start
  build_command: npm run build
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: your-secret-key
  - key: NEXT_PUBLIC_API_URL
    value: https://${APP_URL}
```

## خطوات التشخيص المنهجية

### 1. تحقق من البيئة:
```bash
# على السيرفر
echo $NODE_ENV
echo $DATABASE_URL | sed 's/:.*@/:***@/'
```

### 2. اختبر قاعدة البيانات:
```javascript
// أنشئ ملف test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ اتصال قاعدة البيانات ناجح');
    
    const userCount = await prisma.users.count();
    console.log(`عدد المستخدمين: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
  }
}

testConnection();
```

### 3. تحقق من API Routes:
```javascript
// أضف هذا في بداية كل API route للتشخيص
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: !!process.env.DATABASE_URL,
  JWT_SECRET: !!process.env.JWT_SECRET,
  API_URL: process.env.NEXT_PUBLIC_API_URL
});
```

## الحل السريع

### 1. أنشئ ملف `.env.production` بالإعدادات الصحيحة
### 2. تأكد من build command:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start"
  }
}
```

### 3. أضف middleware للتعامل مع CORS:
```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }

  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## للمساعدة الإضافية

إذا استمرت المشكلة، شارك:
1. سجلات الأخطاء من السيرفر
2. نتائج اختبار curl
3. محتوى Runtime Logs من DigitalOcean 