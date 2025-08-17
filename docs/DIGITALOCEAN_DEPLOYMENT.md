# 🚀 دليل نشر SABQ AI CMS على DigitalOcean

## 🎯 المشكلة المحلولة

**المشكلة السابقة:**
```
[Error: Could not find a production build in the '.next' directory. 
Try building your app with 'next build' before starting the production server.
```

**الحل المطبق:**
✅ Build commands محسنة  
✅ Health checks متقدمة  
✅ Environment variables محددة  
✅ تكوين app.yaml محسن  

---

## 📋 متطلبات ما قبل النشر

### 1. إعداد Secrets في DigitalOcean

اذهب إلى DigitalOcean Dashboard → Settings → App Platform → Environment:

```bash
# قاعدة البيانات
DATABASE_URL=postgresql://user:password@host:5432/database

# المصادقة  
NEXTAUTH_SECRET=your-super-secret-key-here
JWT_SECRET=another-secret-key

# Cloudinary (إذا كان مطلوب)
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### 2. تأكد من GitHub Integration

✅ Repository: `sabq4org/sabq-ai-cms`  
✅ Branch: `main`  
✅ Auto-deploy: مفعل  

---

## 🏗️ Build Process الجديد

### المراحل التلقائية:

```bash
# 1. بدء البناء
echo '🚀 Production deployment build...'

# 2. تنظيف البناء السابق  
rm -rf .next

# 3. إنشاء Prisma
prisma generate

# 4. بناء Next.js
SKIP_EMAIL_VERIFICATION=true next build

# 5. بدء التشغيل
npm run start
```

### Scripts الجديدة المضافة:

```json
{
  "build:deploy": "rm -rf .next && prisma generate && SKIP_EMAIL_VERIFICATION=true next build",
  "start:do": "npm run build:deploy && npm run start",
  "deploy:do": "npm run build:deploy && npm run start"
}
```

---

## 🔧 تكوين DigitalOcean App

### ملف `.do/app.yaml`:

```yaml
name: sabq-ai-cms
services:
- name: web
  build_command: npm run build:deploy  # ✅ جديد
  run_command: npm run start           # ✅ محسن
  health_check:
    http_path: /api/health            # ✅ متقدم
    initial_delay_seconds: 90         # ✅ زمن كافي
    failure_threshold: 5              # ✅ مرونة أكثر
```

### Environment Variables:

```yaml
envs:
- key: NODE_ENV
  value: production
- key: SKIP_EMAIL_VERIFICATION  # ✅ جديد
  value: "true"
- key: NEXT_TELEMETRY_DISABLED  # ✅ تحسين الأداء
  value: "1"
```

---

## 🚨 استكشاف الأخطاء

### 1. خطأ "No build found":

**الحل:**
```bash
# تأكد من أن build_command في app.yaml هو:
build_command: npm run build:deploy
```

### 2. خطأ Health Check:

**الحل:**
```bash
# تأكد من أن /api/health يعمل:
curl https://your-app.ondigitalocean.app/api/health

# يجب أن يعطي:
{"status": "ok", "checks": {...}}
```

### 3. خطأ Database Connection:

**الحل:**
```bash
# تأكد من DATABASE_URL في Secrets:
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 4. خطأ Prisma:

**الحل:**
```bash
# تأكد من PRISMA_CLI_BINARY_TARGETS:
PRISMA_CLI_BINARY_TARGETS=["debian-openssl-3.0.x"]
```

---

## 📊 مراقبة النشر

### 1. فحص Deployment Logs:

```bash
# في DigitalOcean Dashboard:
Apps → sabq-ai-cms → Runtime Logs

# ابحث عن:
✅ "🚀 Production deployment build..."
✅ "✅ Prisma generated" 
✅ "✅ Next.js build completed"
✅ "▲ Next.js 15.4.1"
✅ "✓ Ready in XXXms"
```

### 2. فحص Health Status:

```bash
# تأكد من:
✅ Build Status: Success
✅ Health Check: Passing  
✅ Instance Status: Running
✅ HTTP Response: 200 OK
```

### 3. اختبار API Endpoints:

```bash
# الصحة العامة
GET /api/health
→ {"status": "ok"}

# التشخيص المتقدم
GET /api/debug/articles  
→ {"database_connected": true}

# جلب المقالات
GET /api/articles
→ {"success": true, "data": [...]}
```

---

## 🎯 خطوات النشر اليدوي

### إذا فشل Auto-deploy:

```bash
# 1. في DigitalOcean Dashboard
Apps → sabq-ai-cms → Settings

# 2. اضغط "Create Deployment"
Manual Deploy → Deploy Latest Commit

# 3. تابع Logs
Runtime Logs → Build Logs → Deploy Logs
```

### إعادة تشغيل سريعة:

```bash
# في Dashboard:
Apps → sabq-ai-cms → More → Restart
```

---

## 💡 نصائح للحفاظ على الأداء

### 1. Instance Size:

```yaml
# للبداية:
instance_size_slug: basic-xxs  # $5/شهر

# للإنتاج:
instance_size_slug: professional-xs  # $12/شهر
```

### 2. Database Optimization:

```bash
# استخدم Connection Pooling:
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=5
```

### 3. Caching:

```bash
# فعل Redis إذا متوفر:
REDIS_URL=redis://your-redis-host:6379
```

---

## ✅ Checklist النشر النهائي

- [ ] ✅ GitHub repository متصل
- [ ] ✅ Environment variables محددة في Secrets  
- [ ] ✅ `build:deploy` script موجود
- [ ] ✅ `.do/app.yaml` مححدث
- [ ] ✅ Health check يعمل `/api/health`
- [ ] ✅ Database connection نشط
- [ ] ✅ Prisma schema مزامن
- [ ] ✅ Auto-deploy مفعل
- [ ] ✅ Logs تظهر "Ready"

---

## 🆘 إذا استمرت المشاكل

### اتصل بـ Support:

```bash
# أرسل هذه المعلومات:
1. 📋 Deployment Logs (كامل)
2. 🔍 Runtime Logs (آخر 100 سطر)  
3. ⚙️ Environment Variables List
4. 📱 Error Screenshots
5. 🌐 Domain/URL للتطبيق
```

**🎉 مبروك! تطبيقك الآن جاهز على DigitalOcean! 🚀** 