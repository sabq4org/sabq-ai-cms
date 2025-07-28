# 🚨 حل سريع لمشكلة Amplify

## ✅ الحل المباشر:

### 1️⃣ في AWS Amplify Console:

اذهب إلى: **App settings** → **Build settings** → **Edit**

### 2️⃣ احذف كل شيء واستبدله بهذا:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - rm -rf node_modules/.prisma
        - rm -rf node_modules/@prisma/client
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
```

### 3️⃣ اضغط **Save** ثم **Redeploy this version**

## 🔍 بعد النشر:

تحقق من:
- https://production-branch.dvdwfd4vy831i.amplifyapp.com/api/health/db
- https://production-branch.dvdwfd4vy831i.amplifyapp.com

## ⚠️ إذا لم يعمل:

### جرب Vercel (الأسرع والأسهل):

1. اذهب إلى https://vercel.com
2. اربط حسابك بـ GitHub
3. اضغط "Import Project"
4. اختر `sabq-ai-cms`
5. أضف Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
   NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
   ```
6. اضغط Deploy

**Vercel يدعم Prisma بشكل ممتاز ولن تواجه أي مشاكل!**
