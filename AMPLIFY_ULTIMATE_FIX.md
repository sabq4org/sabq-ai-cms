# 🚀 الحل النهائي لـ AWS Amplify

## 💡 محاولة أخيرة لإصلاح Amplify:

### 1️⃣ **استخدم Build Image مختلف:**

في Amplify Console → App settings → Build settings → Build image settings:

- **Build image**: اختر `Amazon Linux 2023` بدلاً من default
- أو جرب: `custom` واستخدم `public.ecr.aws/docker/library/node:18`

### 2️⃣ **أضف هذا إلى amplify.yml:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - yum install -y openssl openssl-devel
        - npm ci
        - chmod +x scripts/amplify-prisma-fix.sh
        - ./scripts/amplify-prisma-fix.sh
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

### 3️⃣ **أضف متغيرات بيئة إضافية:**

```
PRISMA_CLI_BINARY_TARGETS=["rhel-openssl-1.0.x"]
PRISMA_QUERY_ENGINE_BINARY=/var/task/node_modules/.prisma/client/query-engine-rhel-openssl-1.0.x
NODE_ENV=production
```

### 4️⃣ **حل جذري - استخدم Standalone Output:**

في `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
}
```

ثم في amplify.yml:
```yaml
build:
  commands:
    - npm run build
    - cp -r .next/standalone/* .
    - cp -r .next/static .next/standalone/.next/
    - cp -r public .next/standalone/
```

## 🎯 إذا كل هذا لم ينجح:

### استخدم AWS Elastic Beanstalk (15 دقيقة):

1. **من Terminal على جهازك:**
```bash
# تثبيت EB CLI
pip install awsebcli

# في مجلد المشروع
eb init -p node.js-18 sabq-ai-cms --region us-east-1

# إنشاء البيئة
eb create sabq-production --single --envvars DATABASE_URL="postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms",NEXTAUTH_SECRET="sabq-ai-cms-secret-key-2025"

# فتح الموقع
eb open
```

2. **هذا كل شيء!** Elastic Beanstalk سيتعامل مع كل شيء

## 📊 مقارنة سريعة:

| الخدمة | السهولة | دعم Prisma | التكلفة | Auto-scaling |
|--------|---------|------------|---------|--------------|
| Amplify | ⭐⭐⭐⭐⭐ | ⭐ | $ | ✅ |
| Elastic Beanstalk | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$ | ✅ |
| App Runner | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $$ | ✅ |
| EC2 + PM2 | ⭐⭐ | ⭐⭐⭐⭐⭐ | $ | ❌ |

## 🤝 أنا معك:
- Amplify رائع لكنه صعب مع Prisma
- Elastic Beanstalk نفس السهولة + يدعم كل شيء
- تبقى في عائلة AWS ✅
- نفس قوة وموثوقية Amazon ✅ 