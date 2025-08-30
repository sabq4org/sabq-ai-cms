# 🚀 دليل النشر السريع على Northflank (10 دقائق)

## ✅ الخطوات المبسطة

### 1️⃣ إعداد المشروع على GitHub
```bash
git add .
git commit -m "Prepare for Northflank deployment"
git push origin main
```

### 2️⃣ في لوحة تحكم Northflank

#### أ) إنشاء مشروع جديد (إذا لم يكن موجوداً):
- اسم المشروع: `sabq-ai`
- المنطقة: `Europe West`

#### ب) إنشاء Combined Service:
1. اضغط على **"Create new service"**
2. اختر **"Combined service"**
3. الإعدادات:
   ```
   Name: sabq-app
   Git repository: alialhazmi/sabq-ai-cms
   Branch: main
   Build type: Dockerfile
   Dockerfile path: /Dockerfile.northflank
   Port: 3000
   Protocol: HTTP
   ```

#### ج) إضافة متغيرات البيئة:
1. اذهب إلى **Environment > Variables**
2. اضغط **"Bulk Edit"**
3. الصق:
```env
# قاعدة البيانات - استخدم هذا بالضبط
DATABASE_URL="${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"
DIRECT_URL="${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"

# المصادقة
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://sabq.me"

# البيئة
NODE_ENV="production"
```

### 3️⃣ ربط النطاق (Domain)
1. اذهب إلى **Ports & DNS**
2. أضف domain: `sabq.me`
3. اختر **"Verify later"** إذا لم يكن DNS جاهزاً

### 4️⃣ بدء النشر
1. اضغط **"Create service"**
2. انتظر حتى يكتمل البناء (5-10 دقائق)

## 🔍 التحقق من النشر

### في Terminal المحلي:
```bash
# فحص صحة التطبيق
curl https://sabq.me/api/health

# أو افتح في المتصفح
open https://sabq.me
```

### في Northflank:
- تحقق من **Logs** للأخطاء
- تحقق من **Metrics** للأداء
- تحقق من **Health checks**

## 🛠️ حل المشاكل الشائعة

### مشكلة: Database connection failed
**الحل**: تأكد من استخدام `POSTGRES_URI_INTERNAL` وليس `POSTGRES_URI`

### مشكلة: Build failed
**الحل**: تحقق من Dockerfile.northflank وتأكد من وجوده

### مشكلة: Application crashes
**الحل**: زد الذاكرة إلى 2GB على الأقل

## 📊 إعدادات الإنتاج الموصى بها

```yaml
Resources:
  CPU: 1-2 cores
  Memory: 2-4 GB
  
Scaling:
  Min instances: 2
  Max instances: 10
  Target CPU: 70%
  
Health Check:
  Path: /api/health
  Interval: 30s
  Timeout: 5s
```

## 🎉 تهانينا!
موقعك الآن يعمل على Northflank بنجاح!

### الخطوات التالية:
1. إعداد النسخ الاحتياطي التلقائي
2. إعداد المراقبة والتنبيهات
3. إعداد CI/CD مع GitHub Actions
4. تحسين الأداء والتخزين المؤقت
