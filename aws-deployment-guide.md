# 🚀 دليل النشر على AWS - سبق الذكية

## 📋 المتطلبات الأساسية

### 1. قاعدة البيانات - Amazon Aurora PostgreSQL

```bash
# إنشاء قاعدة بيانات Aurora PostgreSQL
aws rds create-db-cluster \
  --db-cluster-identifier sabq-ai-cms-cluster \
  --engine aurora-postgresql \
  --master-username sabqadmin \
  --master-user-password [كلمة مرور قوية] \
  --database-name sabqcms \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default
```

### 2. متغيرات البيئة المطلوبة

```env
# قاعدة البيانات
DATABASE_URL="postgresql://sabqadmin:PASSWORD@aurora-cluster-endpoint:5432/sabqcms"

# الأمان
JWT_SECRET="your-super-secure-jwt-secret-key"
NEXT_CRYPT_SECRET="32-character-secret-for-encryption"

# رفع الصور - Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# البريد الإلكتروني - AWS SES
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT=587
EMAIL_USER="your-ses-smtp-username"
EMAIL_PASS="your-ses-smtp-password"
EMAIL_FROM="noreply@sabq.org"

# AWS S3 (اختياري للملفات)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="sabq-cms-files"

# إعدادات الإنتاج
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
SKIP_EMAIL_VERIFICATION="false"
```

## 🔧 طرق النشر

### الطريقة 1: AWS Amplify (الموصى بها) ⭐

#### الخطوات:
1. **ربط مع GitHub:**
   ```bash
   # الكود موجود بالفعل على GitHub
   # سيتم سحبه تلقائياً من: https://github.com/sabq4org/sabq-ai-cms
   ```

2. **إعداد Build Settings:**
   ```yaml
   # amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **إضافة متغيرات البيئة في Amplify Console**

#### المميزات:
- ✅ نشر تلقائي مع كل push
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ دعم كامل لـ Next.js App Router

### الطريقة 2: Amazon EC2 مع Docker

#### ملف Dockerfile محسن:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose للتطوير:
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
    depends_on:
      - postgres
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sabqcms
      POSTGRES_USER: sabqadmin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### الطريقة 3: AWS ECS Fargate (للمشاريع الكبيرة)

#### ملف Task Definition:
```json
{
  "family": "sabq-ai-cms",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "sabq-cms",
      "image": "your-account.dkr.ecr.region.amazonaws.com/sabq-cms:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:DATABASE_URL"
        }
      ]
    }
  ]
}
```

## 🔍 سكريبت فحص الاستعداد للنشر

```bash
#!/bin/bash
# scripts/aws-deployment-check.sh

echo "🔍 فحص استعداد المشروع للنشر على AWS..."

# فحص متغيرات البيئة المطلوبة
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ متغير البيئة $1 غير موجود"
        return 1
    else
        echo "✅ $1 موجود"
        return 0
    fi
}

# المتغيرات الأساسية
check_env_var "DATABASE_URL"
check_env_var "JWT_SECRET"
check_env_var "CLOUDINARY_CLOUD_NAME"

# فحص قاعدة البيانات
echo "🔄 فحص الاتصال بقاعدة البيانات..."
npx prisma db push --accept-data-loss || echo "⚠️ تأكد من صحة DATABASE_URL"

# فحص البناء
echo "🏗️ فحص عملية البناء..."
npm run build || echo "❌ فشل في البناء"

echo "✅ انتهى فحص الاستعداد للنشر"
```

## 📈 توصيات الأداء

### 1. Amazon CloudFront (CDN)
```bash
# إعداد CloudFront للصور والملفات الثابتة
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 2. Amazon ElastiCache (Redis)
```bash
# إعداد Redis للتخزين المؤقت
aws elasticache create-cache-cluster \
  --cache-cluster-id sabq-cms-cache \
  --engine redis \
  --cache-node-type cache.t3.micro
```

### 3. AWS Lambda للمهام الخلفية
- معالجة الصور
- إرسال البريد الإلكتروني
- التحليلات الذكية

## 💰 تقدير التكلفة الشهرية

### البيئة الصغيرة (حتى 10,000 زائر/شهر):
- **Amplify**: $5-15/شهر
- **Aurora Serverless**: $10-30/شهر
- **CloudFront**: $2-5/شهر
- **المجموع**: ~$20-50/شهر

### البيئة المتوسطة (حتى 100,000 زائر/شهر):
- **EC2 t3.small**: $15-20/شهر
- **Aurora**: $50-100/شهر
- **CloudFront + S3**: $10-20/شهر
- **المجموع**: ~$75-140/شهر

## 🛡️ أفضل الممارسات الأمنية

1. **استخدام AWS Secrets Manager** لكلمات المرور
2. **تفعيل WAF** لحماية التطبيق
3. **مراقبة مع CloudWatch**
4. **نسخ احتياطية تلقائية** للقاعدة

## 🚀 النشر السريع

للبدء فوراً مع AWS Amplify:

```bash
# 1. تثبيت Amplify CLI
npm install -g @aws-amplify/cli

# 2. إعداد المشروع
amplify init

# 3. إضافة الاستضافة
amplify add hosting

# 4. النشر
amplify publish
```

**هذا الدليل يغطي جميع الطرق المناسبة للمشروع. ما رأيك في البدء بـ AWS Amplify للبساطة؟**
