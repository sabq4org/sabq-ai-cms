# 🔍 استكشاف أخطاء AWS Amplify - خطأ 503 مستمر

## 🚨 الحالة الحالية
```
Status: 503 Service Unavailable
Error: Prisma Client could not locate the Query Engine
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

## 🛠️ حلول محتملة

### الحل 1: إعادة Build من الصفر
```
1. AWS Amplify → Hosting
2. Actions → Redeploy app
3. انتظار 5-10 دقائق
```

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
