# حل مشكلة خطأ 500 في API الفئات على DigitalOcean

## 🔍 تشخيص المشكلة

### 1. فحص سجلات DigitalOcean
1. اذهب إلى: https://cloud.digitalocean.com/apps
2. اضغط على تطبيق `sabq-ai-cms`
3. اذهب إلى **Runtime Logs** في القائمة الجانبية
4. ابحث عن أخطاء مثل:
   - `PrismaClientInitializationError`
   - `Cannot find module './8548.js'`
   - `DATABASE_URL` errors

### 2. الأسباب المحتملة

#### أ) مشكلة Prisma في الإنتاج
- Prisma Client غير متولد بشكل صحيح
- عدم تطابق binary targets

**الحل:**
```bash
# في .do/app.yaml أضف:
build_command: |
  npx prisma generate --schema=./prisma/schema.prisma
  npm run build
```

#### ب) مشكلة Webpack chunking
- ملفات chunk مفقودة (مثل 8548.js)

**الحل:**
أضف في `next.config.js`:
```javascript
module.exports = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/categories': ['./node_modules/@prisma/client/**/*'],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
}
```

#### ج) مشكلة اتصال قاعدة البيانات
- DATABASE_URL غير صحيح أو مفقود

**الحل:**
تحقق من متغيرات البيئة في DigitalOcean:
1. اذهب إلى **Settings** > **App-Level Environment Variables**
2. تأكد من وجود `DATABASE_URL` بالقيمة الصحيحة

### 3. الحل السريع

#### الخطوة 1: تحديث سكريبت البناء
```javascript
// scripts/digitalocean-build-fix.js
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء البناء لـ DigitalOcean...');

try {
  // 1. تنظيف مجلد .next القديم
  console.log('🧹 تنظيف الملفات القديمة...');
  execSync('rm -rf .next', { stdio: 'inherit' });
  
  // 2. توليد Prisma Client مع binary targets
  console.log('📦 توليد Prisma Client...');
  process.env.PRISMA_CLI_BINARY_TARGETS = '["debian-openssl-3.0.x"]';
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 3. البناء مع تعطيل optimizations للتشخيص
  console.log('🏗️ بناء Next.js...');
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ تم البناء بنجاح!');
} catch (error) {
  console.error('❌ فشل البناء:', error.message);
  process.exit(1);
}
```

#### الخطوة 2: إضافة API صحة مخصص للفئات
```typescript
// app/api/categories/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const count = await prisma.categories.count();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      categoriesCount: count,
      prismaVersion: (prisma as any)._engineConfig?.prismaVersion || 'unknown'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
```

#### الخطوة 3: تحديث .do/app.yaml
```yaml
build_command: |
  echo "🔧 إعداد البيئة..."
  export PRISMA_CLI_BINARY_TARGETS='["debian-openssl-3.0.x"]'
  echo "📦 توليد Prisma Client..."
  npx prisma generate
  echo "🏗️ بناء التطبيق..."
  npm run build
```

### 4. خطوات التطبيق

1. **احفظ التغييرات وارفعها:**
   ```bash
   git add .
   git commit -m "Fix DigitalOcean categories API 500 error"
   git push origin main
   ```

2. **انتظر إعادة البناء التلقائي** (5-10 دقائق)

3. **اختبر API:**
   ```bash
   curl https://sabq-ai-cms-s5gpr.ondigitalocean.app/api/categories/health
   ```

### 5. إذا استمرت المشكلة

#### أ) فحص مفصل للسجلات
```bash
# استخدم DigitalOcean CLI
doctl apps logs <APP_ID> --type=build
doctl apps logs <APP_ID> --type=run
```

#### ب) إعادة deploy يدوي
```bash
doctl apps create-deployment <APP_ID>
```

#### ج) التواصل مع الدعم
- قدم رقم التطبيق وسجلات الأخطاء
- اطلب فحص build logs الداخلية

## 📌 ملاحظات مهمة

1. **الخطأ 404 لـ /api/ads طبيعي** - هذا API غير موجود في المشروع
2. **تأكد من حفظ جميع التغييرات** قبل الدفع إلى GitHub
3. **راقب Build Logs** أثناء إعادة البناء

## 🎯 الحل المتوقع

بعد تطبيق هذه الخطوات، يجب أن:
- ✅ API الفئات يعمل بشكل صحيح
- ✅ لا يظهر خطأ 500
- ✅ صفحة الفئات تعرض البيانات بشكل طبيعي 