# 🔍 استكشاف أخطاء AWS Amplify - خطأ 503 مستمر

## 🚨 الحالة الحالية (مُحدثة: 28 يوليو 2025)
```
Status: 503 Service Unavailable ❌ (مش متحل لسه)
Error: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-1.0.x"
تأكيد: AWS Amplify مش مطبق عليه إصلاح Prisma
```

## ⚠️ الحل المطلوب فوراً

### 🚨 أنت لازم تعمل هذا في AWS Amplify Console:
**الرابط المباشر:** https://console.aws.amazon.com/amplify/

```
1. اختر: sabq-ai-cms
2. App settings → Build settings  
3. اضغط: Edit build specification
4. في Build specification، أضف الكود التالي بالضبط:
```

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "🔧 تطبيق إصلاح Prisma..."
        - sed -i 's/binaryTargets.*=.*\["native"\]/binaryTargets = ["native", "rhel-openssl-1.0.x"]/' prisma/schema.prisma
        - npx prisma generate
        - echo "✅ Prisma client مُحدث للـ AWS Lambda"
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

## 📋 خطوات استكشاف الأخطاء

### 1. تحقق من Build Status في Amplify Console
```
AWS Amplify → sabq-ai-cms → Hosting → View build details
```
**ابحث عن:**
- ✅ Build succeeded
- ❌ Build failed
- 🟡 Build in progress

### 2. فحص Environment Variables
```
AWS Amplify → sabq-ai-cms → App settings → Environment variables
```

**تحقق من وجود هذه المتغيرات بالضبط:**
- `DATABASE_URL` ✅
- `NEXTAUTH_SECRET` ✅  
- `NEXTAUTH_URL` ✅
- `S3_ACCESS_KEY_ID` ✅
- `S3_SECRET_ACCESS_KEY` ✅
- `S3_REGION` ✅
- `S3_BUCKET_NAME` ✅

### 3. فحص Build Logs
```
AWS Amplify → Hosting → Build details → View logs
```

**ابحث عن أخطاء مثل:**
- `Prisma generate failed`
- `Environment variable missing`
- `Database connection failed`

### 4. إعادة النشر اليدوي
```
AWS Amplify → Hosting → Redeploy this version
```

### 5. اختبار DATABASE_URL
**تأكد من أن DATABASE_URL صحيح:**
```
postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
```

**العلامات المهمة:**
- ✅ `%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq` (كلمة المرور مُرمزة)
- ✅ `database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com` (العنوان)
- ✅ `:5432` (المنفذ)
- ✅ `/sabqcms` (اسم قاعدة البيانات)

## 🛠️ خطة الحل الصحيحة (بالترتيب)

### خطوة 1: تطبيق إصلاح Prisma في Build Settings ⚠️
```yaml
# اذهب إلى: App settings → Build settings → Edit
# أضف في preBuild commands:
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - sed -i 's/binaryTargets   = \["native"\]/binaryTargets   = ["native", "rhel-openssl-1.0.x"]/' prisma/schema.prisma
        - npx prisma generate
    build:
      commands:
        - npm run build
```

### خطوة 2: إعادة النشر
**جرب هذه الطرق بالترتيب:**
1. **App overview** → Deploy dropdown → Redeploy
2. **Hosting** → View builds → Latest build → Actions → Redeploy  
3. **App settings** → General → Manual deploy section
4. **اجبار build جديد**: غير أي environment variable مؤقت ثم ارجعه

### خطوة 5: احفظ ونشّط التغييرات
```
1. Save build specification
2. اذهب إلى: Hosting → View builds
3. اضغط: "Deploy latest" أو أي زر deploy
4. انتظر 5-10 دقائق للـ build
5. راقب logs للتأكد من ظهور "rhel-openssl-1.0.x"
```

### 📞 بعد Build يخلص:
- اختبر: https://main.dvdwfd4vy831i.amplifyapp.com/api/categories
- يجب أن ترجع: `{"success":true,"categories":[...]}` 
- بدلاً من: 503 Service Unavailable

## 🔴 إذا مش شغال برضه:
1. ارجع هنا واكتب "مش شغال"
2. ارسل screenshot من Build logs
3. سنجرب حل آخر

### الحل 1: تطبيق إصلاح Prisma أولاً ⚠️ (مهم جداً)
```
1. AWS Amplify → sabq-ai-cms
2. App settings → Build settings  
3. Edit build specification
4. أضف هذا الكود في preBuild:
   - sed -i 's/binaryTargets   = \["native"\]/binaryTargets   = ["native", "rhel-openssl-1.0.x"]/' prisma/schema.prisma
   - npx prisma generate
5. Save
```

### الحل 2: إعادة Build بعد التعديل
**خيارات إعادة النشر:**
- **الطريقة 1**: App overview → Deploy dropdown → Redeploy
- **الطريقة 2**: Hosting → View builds → Latest build → Redeploy  
- **الطريقة 3**: App settings → General → Manual deploy
- **الطريقة 4**: استخدم أي commit جديد للتشغيل التلقائي

### الحل 2: تحديث Environment Variables
```
1. احذف جميع المتغيرات الموجودة
2. أضفها مرة أخرى واحداً تلو الآخر
3. احفظ بين كل إضافة
4. أعد النشر
```

### الحل 3: فحص Database Connection
```
1. تأكد من أن AWS RDS database متاح
2. تحقق من Security Groups
3. اختبر الاتصال من خدمة أخرى
```

## 🕐 التوقيتات المتوقعة

| العملية | الوقت |
|---------|--------|
| إضافة Environment Variables | 2 دقيقة |
| Build جديد | 3-5 دقائق |
| Deploy كامل | 5-8 دقائق |
| Propagation في CloudFront | 2-3 دقائق |

**إجمالي**: 10-15 دقيقة من بداية التغيير حتى الظهور

## 🔍 اختبارات سريعة

### اختبار 1: فحص Build Status
```bash
# زيارة مباشرة:
https://console.aws.amazon.com/amplify/
```

### اختبار 2: فحص API مباشرة
```bash
curl https://main.dvdwfd4vy831i.amplifyapp.com/api/categories
```

### اختبار 3: فحص الصفحة الرئيسية
```bash
https://main.dvdwfd4vy831i.amplifyapp.com
```

## 📞 إذا استمرت المشكلة

1. **أرسل screenshot** من Environment Variables في Amplify
2. **أرسل screenshot** من Build Logs
3. **أرسل نتيجة** `curl` للـ API

---

**💡 تذكير**: النظام المحلي يعمل بشكل مثالي، فالمشكلة فقط في إعدادات Amplify!
