# 🛡️ دليل حماية البيانات الحية في الإنتاج

## 🔴 المشكلة الحرجة
عند رفع نسخة جديدة من GitHub، يتم استبدال البيانات الحقيقية (الأخبار، المقالات، الصور) بالبيانات التجريبية، مما يؤدي إلى **ضياع المحتوى التحريري الحي**.

## ✅ الحل الشامل

### 1. فصل الكود عن البيانات

#### أ. إنشاء قاعدة بيانات منفصلة
```bash
# PostgreSQL (موصى به)
DATABASE_URL=postgres://user:password@db.jur3a.ai:5432/jur3a_production

# أو MySQL
DATABASE_URL=mysql://user:password@db.jur3a.ai:3306/jur3a_production

# أو Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres
```

#### ب. هيكلة المجلدات
```
sabq-ai-cms/
├── src/                    # الكود فقط
├── public/                 # الملفات الثابتة
├── data/                   # يُحذف من الإنتاج
│   ├── mock/              # بيانات تجريبية للتطوير فقط
│   └── seed/              # سكريبتات التهيئة
├── uploads/               # يُنقل إلى S3 أو CDN
└── .env.production        # إعدادات الإنتاج
```

### 2. إعدادات البيئة

#### أ. ملف `.env.production`
```env
# قاعدة البيانات الحية
DATABASE_URL=postgres://prod_user:secure_pass@db.jur3a.ai:5432/jur3a_prod
REDIS_URL=redis://redis.jur3a.ai:6379

# تخزين الملفات
S3_BUCKET=jur3a-production-media
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
S3_REGION=me-south-1

# تعطيل البيانات التجريبية
SEED_FAKE_DATA=false
USE_MOCK_DATA=false
NODE_ENV=production
```

#### ب. ملف `.env.development`
```env
DATABASE_URL=postgres://dev:dev@localhost:5432/jur3a_dev
SEED_FAKE_DATA=true
USE_MOCK_DATA=true
NODE_ENV=development
```

### 3. حماية البيانات في الكود

#### أ. منع تشغيل البيانات التجريبية في الإنتاج
```typescript
// lib/seed-data.ts
export async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Skipping seed in production');
    return;
  }
  
  if (process.env.SEED_FAKE_DATA !== 'true') {
    console.log('ℹ️  SEED_FAKE_DATA is not true, skipping');
    return;
  }
  
  // كود البيانات التجريبية هنا
}
```

#### ب. فصل APIs البيانات
```typescript
// app/api/articles/route.ts
export async function GET() {
  // في الإنتاج - من قاعدة البيانات
  if (process.env.NODE_ENV === 'production') {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(articles);
  }
  
  // في التطوير - بيانات تجريبية
  if (process.env.USE_MOCK_DATA === 'true') {
    const mockArticles = await import('@/data/mock/articles.json');
    return NextResponse.json(mockArticles.default);
  }
}
```

### 4. إعداد قاعدة البيانات

#### أ. Prisma Schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  slug        String   @unique
  published   Boolean  @default(false)
  authorId    String
  categoryId  String
  featuredImage String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      User     @relation(fields: [authorId], references: [id])
  category    Category @relation(fields: [categoryId], references: [id])
  
  @@index([slug])
  @@index([published, createdAt])
}
```

#### ب. سكريبت Migration
```bash
# تطوير - إعادة بناء كاملة
npm run db:reset

# إنتاج - migrations فقط
npm run db:migrate:deploy
```

### 5. تخزين الملفات الخارجي

#### أ. إعداد S3/Supabase Storage
```typescript
// lib/storage.ts
import { S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const storage = process.env.NODE_ENV === 'production' 
  ? new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    })
  : {
      upload: async (file: File) => {
        // حفظ محلي في التطوير
        return `/uploads/${file.name}`;
      }
    };
```

### 6. نظام النسخ الاحتياطي

#### أ. سكريبت النسخ الاحتياطي اليومي
```bash
#!/bin/bash
# scripts/backup-production.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="jur3a_production"

# نسخ احتياطي لقاعدة البيانات
pg_dump $DATABASE_URL > backups/db_${DATE}.sql

# نسخ احتياطي للملفات من S3
aws s3 sync s3://jur3a-production-media backups/media_${DATE}/

# ضغط وأرشفة
tar -czf backups/backup_${DATE}.tar.gz backups/db_${DATE}.sql backups/media_${DATE}/

# رفع إلى مكان آمن
aws s3 cp backups/backup_${DATE}.tar.gz s3://jur3a-backups/

# حذف النسخ المحلية القديمة (أكثر من 7 أيام)
find backups/ -mtime +7 -delete
```

### 7. CI/CD Pipeline الآمن

#### أ. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Backup Current Production
        run: |
          ssh ${{ secrets.PROD_SERVER }} 'cd /app && ./scripts/backup-production.sh'
      
      - name: Build without Mock Data
        env:
          SEED_FAKE_DATA: false
          USE_MOCK_DATA: false
        run: |
          npm ci
          npm run build
      
      - name: Deploy Code Only
        run: |
          rsync -avz --exclude='data/' --exclude='uploads/' \
            ./dist/ ${{ secrets.PROD_SERVER }}:/app/
      
      - name: Run Migrations Only
        run: |
          ssh ${{ secrets.PROD_SERVER }} 'cd /app && npm run db:migrate:deploy'
      
      - name: Restart Services
        run: |
          ssh ${{ secrets.PROD_SERVER }} 'pm2 restart jur3a-cms'
```

### 8. أوامر package.json المحدّثة

```json
{
  "scripts": {
    // تطوير
    "dev": "next dev",
    "dev:seed": "tsx scripts/seed-dev-data.ts && next dev",
    
    // قاعدة البيانات - تطوير
    "db:push": "prisma db push",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "tsx prisma/seed.ts",
    
    // قاعدة البيانات - إنتاج
    "db:migrate:create": "prisma migrate dev --name",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:backup": "bash scripts/backup-production.sh",
    
    // بناء
    "build": "next build",
    "build:production": "NODE_ENV=production SEED_FAKE_DATA=false next build",
    
    // نشر
    "deploy": "npm run build:production && npm run db:migrate:deploy",
    "deploy:safe": "npm run db:backup && npm run deploy"
  }
}
```

### 9. Middleware للحماية

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // منع الوصول لملفات البيانات التجريبية في الإنتاج
  if (process.env.NODE_ENV === 'production') {
    if (request.nextUrl.pathname.startsWith('/data/mock/') ||
        request.nextUrl.pathname.startsWith('/api/seed/')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  return NextResponse.next();
}
```

### 10. قائمة فحص ما قبل النشر

- [ ] تأكد من وجود نسخة احتياطية حديثة
- [ ] تحقق من `.env.production` لا يحتوي على `SEED_FAKE_DATA=true`
- [ ] تأكد من أن `data/` مضاف في `.gitignore`
- [ ] تحقق من أن migrations جاهزة
- [ ] اختبر على staging environment أولاً
- [ ] تأكد من أن S3/CDN يعمل للملفات

## 🚨 تحذيرات مهمة

1. **لا تشغل أبداً** هذه الأوامر في الإنتاج:
   - `npm run db:reset`
   - `npm run db:seed`
   - `prisma migrate reset`

2. **احذر من** دمج فروع تحتوي على:
   - تغييرات في `data/` 
   - ملفات `.sql` تحتوي على DROP TABLE
   - تعديلات على seed scripts

3. **دائماً** خذ نسخة احتياطية قبل:
   - تحديث كبير
   - تغيير في schema
   - نشر بعد فترة طويلة

## 📋 Checklist للتطبيق الفوري

1. **اليوم الأول**:
   - [ ] إنشاء قاعدة بيانات PostgreSQL منفصلة
   - [ ] نقل البيانات الحالية إليها
   - [ ] تحديث `.env.production`

2. **اليوم الثاني**:
   - [ ] إعداد S3 أو Supabase Storage
   - [ ] نقل المرفقات الحالية
   - [ ] تحديث كود رفع الملفات

3. **اليوم الثالث**:
   - [ ] إعداد نظام النسخ الاحتياطي
   - [ ] اختبار الاسترجاع
   - [ ] توثيق العملية

4. **اليوم الرابع**:
   - [ ] إعداد CI/CD pipeline
   - [ ] اختبار على staging
   - [ ] النشر الآمن الأول

## النتيجة المتوقعة

✅ **بعد التطبيق**:
- البيانات الحية محمية ومنفصلة
- التحديثات تؤثر على الكود فقط
- نسخ احتياطية تلقائية يومية
- لا مزيد من ضياع المحتوى التحريري
- نظام موثوق وقابل للتوسع 