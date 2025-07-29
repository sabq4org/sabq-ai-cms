# دليل حل مشكلة Supabase Pooling في Digital Ocean

## 🚨 المشكلة
عند استخدام Supabase Pooling، قد لا تظهر البيانات في الموقع المباشر رغم تحديث متغيرات البيئة.

## 🔍 التشخيص السريع

### 1. تحقق من متغيرات البيئة في Digital Ocean

```bash
# في Digital Ocean App Platform
# تأكد من وجود المتغيرين التاليين:

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.uopckyrdhlvsxnvcobbw.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres
```

⚠️ **ملاحظات مهمة:**
- `DATABASE_URL` يستخدم المنفذ **6543** (Pooling)
- `DIRECT_URL` يستخدم المنفذ **5432** (Direct)
- يجب إضافة `?pgbouncer=true` في نهاية `DATABASE_URL`

### 2. تحديث Prisma Schema

تأكد من أن ملف `prisma/schema.prisma` يحتوي على:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // مهم جداً للـ Pooling
}
```

### 3. إعدادات Prisma Client

في ملف `lib/prisma.ts` أو حيث تقوم بإنشاء Prisma Client:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// مهم: في الإنتاج، تأكد من إغلاق الاتصالات بشكل صحيح
export async function disconnect() {
  await prisma.$disconnect()
}
```

## 🛠️ خطوات الحل

### الخطوة 1: تحديث متغيرات البيئة في Digital Ocean

1. اذهب إلى Digital Ocean App Platform
2. اختر تطبيقك
3. اذهب إلى Settings > App-Level Environment Variables
4. أضف/حدث المتغيرات التالية:

```env
# Pooling connection (للقراءة)
DATABASE_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection (للكتابة والـ migrations)
DIRECT_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres

# تأكد من إضافة
NODE_ENV=production
```

### الخطوة 2: تحديث Build Command

في Digital Ocean، تأكد من أن Build Command يتضمن:

```bash
npm install && npx prisma generate && npm run build
```

### الخطوة 3: إضافة Health Check

أنشئ endpoint للتحقق من الاتصال:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // اختبار الاتصال
    const result = await prisma.$queryRaw`SELECT 1`;
    
    // اختبار استعلام حقيقي
    const count = await prisma.article.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      articlesCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    }, { status: 500 });
  }
}
```

### الخطوة 4: تحديث معالجات الأخطاء

في ملفات API الخاصة بك، أضف معالجة أفضل للأخطاء:

```typescript
// مثال: app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 10
    });
    
    return NextResponse.json({ 
      success: true, 
      articles,
      count: articles.length 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // تحقق من نوع الخطأ
    if (error.code === 'P2024') {
      return NextResponse.json({
        success: false,
        error: 'Connection pool timeout. Please try again.',
        code: 'POOL_TIMEOUT'
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
```

## 🔧 إعدادات إضافية للأداء

### 1. Connection Pool Settings

أضف هذه المعاملات لـ DATABASE_URL:

```
?pgbouncer=true&connection_limit=1&pool_timeout=0
```

### 2. Prisma Connection Management

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// للـ API Routes في Next.js 13+
export async function withPrisma<T>(
  handler: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await handler(prisma);
  } finally {
    // في الإنتاج، لا نريد إغلاق الاتصال
    if (process.env.NODE_ENV !== 'production') {
      await prisma.$disconnect();
    }
  }
}
```

### 3. استخدام Middleware للتحقق من الاتصال

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // تسجيل معلومات الطلب للتشخيص
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  
  // يمكنك إضافة headers مخصصة
  const response = NextResponse.next();
  response.headers.set('X-Database-Mode', 'pooling');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## 🚀 نصائح للنشر

### 1. قبل النشر
- تأكد من تشغيل `npx prisma generate`
- تأكد من أن جميع الـ migrations محدثة
- اختبر الاتصال محلياً باستخدام نفس connection string

### 2. بعد النشر
- تحقق من logs في Digital Ocean
- اختبر endpoint الصحة: `https://your-app.ondigitalocean.app/api/health`
- راقب استخدام connection pool في Supabase dashboard

### 3. مراقبة الأداء
في Supabase Dashboard، راقب:
- عدد الاتصالات النشطة
- استخدام Pool
- أوقات الاستجابة

## 🆘 استكشاف الأخطاء

### خطأ: "Connection pool timeout"
```bash
# الحل: زيادة pool_timeout
DATABASE_URL="...?pgbouncer=true&pool_timeout=60"
```

### خطأ: "Too many connections"
```bash
# الحل: تقليل connection_limit
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

### خطأ: "prepared statement does not exist"
```bash
# الحل: إضافة pgbouncer=true وإعادة نشر التطبيق
DATABASE_URL="...?pgbouncer=true&statement_cache_size=0"
```

## 📞 الدعم

إذا استمرت المشكلة:
1. تحقق من Supabase Status: https://status.supabase.com/
2. راجع logs في Digital Ocean App Platform
3. تأكد من أن جميع المتغيرات محدثة بشكل صحيح
4. جرب الاتصال المباشر (بدون pooling) مؤقتاً للتأكد من عمل قاعدة البيانات 