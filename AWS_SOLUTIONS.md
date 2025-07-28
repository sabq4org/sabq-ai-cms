# 🔧 حلول البقاء على Amazon AWS

## الخيار 1: **AWS Elastic Beanstalk** ✅ (الأسهل)

### المميزات:
- ✅ يدعم Node.js و Prisma بشكل ممتاز
- ✅ سهل مثل Amplify لكن أكثر مرونة
- ✅ يستخدم EC2 تحت الغطاء
- ✅ Auto-scaling مدمج

### خطوات النشر:
```bash
# 1. تثبيت EB CLI
brew install awsebcli

# 2. تهيئة التطبيق
eb init -p node.js-18 sabq-ai-cms

# 3. إنشاء البيئة
eb create production-env

# 4. تعيين متغيرات البيئة
eb setenv DATABASE_URL="postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms" NEXTAUTH_SECRET="sabq-ai-cms-secret-key-2025"

# 5. النشر
eb deploy
```

## الخيار 2: **AWS App Runner** 🚀

### المميزات:
- ✅ مصمم لـ containerized apps
- ✅ يدعم Docker
- ✅ أسهل من ECS
- ✅ يتعامل مع Prisma بشكل ممتاز

### خطوات النشر:

#### 1. إنشاء Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ package files
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت التبعيات
RUN npm ci

# توليد Prisma Client
RUN npx prisma generate

# نسخ باقي الملفات
COPY . .

# البناء
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. النشر على App Runner:
- اذهب إلى AWS App Runner Console
- Create service → Source: GitHub
- اختر repository
- أضف Environment variables
- Deploy!

## الخيار 3: **إصلاح Amplify نفسه** 🔨

### حل جذري - استخدام Lambda Layer:

#### 1. إنشاء Lambda Layer لـ Prisma:
```bash
mkdir prisma-layer
cd prisma-layer
npm init -y
npm install @prisma/client prisma
npx prisma generate --schema=../prisma/schema.prisma
zip -r prisma-layer.zip .
```

#### 2. رفع Layer إلى AWS:
```bash
aws lambda publish-layer-version \
  --layer-name prisma-engine-layer \
  --zip-file fileb://prisma-layer.zip \
  --compatible-runtimes nodejs18.x
```

#### 3. ربط Layer بـ Amplify:
في `amplify.yml`:
```yaml
backend:
  phases:
    build:
      commands:
        - amplifyPush --simple
        - aws lambda update-function-configuration \
          --function-name YOUR_FUNCTION_NAME \
          --layers arn:aws:lambda:REGION:ACCOUNT:layer:prisma-engine-layer:1
```

## الخيار 4: **AWS EC2 مع PM2** 💪

### نفس إعداد DigitalOcean لكن على AWS:

```bash
# 1. إنشاء EC2 instance (Ubuntu 22.04)
# 2. SSH إلى السيرفر

# 3. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone المشروع
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms

# 5. تثبيت التبعيات
npm install

# 6. إضافة .env
echo "DATABASE_URL=postgresql://..." > .env

# 7. البناء والتشغيل
npm run build
pm2 start npm --name sabq-ai-cms -- start
```

## 🎯 توصيتي:

**AWS Elastic Beanstalk** - لأنه:
1. يبقيك في عائلة AWS
2. أسهل من EC2 المباشر
3. يدعم Prisma بدون مشاكل
4. له نفس مرونة EC2
5. Auto-scaling و Load balancing مدمج

## 📝 ملاحظة مهمة:
Amplify مصمم أساساً لـ static sites و serverless. المشاريع التي تستخدم Prisma (مثل مشروعك) تحتاج بيئة server كاملة، لذلك Elastic Beanstalk أو App Runner أفضل! 