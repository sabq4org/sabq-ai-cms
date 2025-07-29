# إعدادات البيئة للنشر - Environment Configurations

## 🔥 DigitalOcean App Platform

### في لوحة التحكم DigitalOcean → App Platform → Environment Variables:

```bash
# قاعدة البيانات
DATABASE_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
DIRECT_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms

# الموقع
NEXT_PUBLIC_API_URL=https://your-app.ondigitalocean.app
NEXT_PUBLIC_SITE_URL=https://your-app.ondigitalocean.app
NEXT_PUBLIC_APP_URL=https://your-app.ondigitalocean.app
APP_URL=https://your-app.ondigitalocean.app

# الأمان
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=https://your-app.ondigitalocean.app
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this

# اختياري
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## ☁️ AWS Amplify

### في AWS Console → Amplify → Environment Variables:

```bash
# قاعدة البيانات (URL encoded للأمان)
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
DIRECT_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms

# الموقع
NEXT_PUBLIC_API_URL=https://main.d1234abcd.amplifyapp.com
NEXT_PUBLIC_SITE_URL=https://main.d1234abcd.amplifyapp.com
NEXT_PUBLIC_APP_URL=https://main.d1234abcd.amplifyapp.com
APP_URL=https://main.d1234abcd.amplifyapp.com

# الأمان
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=https://main.d1234abcd.amplifyapp.com
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
```

---

## 🔺 Vercel

### في Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# قاعدة البيانات
DATABASE_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
DIRECT_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"

# الموقع
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app

# الأمان
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
```

---

## 🐳 Docker / Docker Compose

### في docker-compose.yml:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
      - DIRECT_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
      - NEXT_PUBLIC_API_URL=http://localhost:3000
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
```

### أو في .env.production:

```bash
DATABASE_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
DIRECT_URL="postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms?schema=public"
```

---

## 🚀 Netlify

### في Netlify Dashboard → Site Settings → Environment Variables:

```bash
# قاعدة البيانات
DATABASE_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
DIRECT_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms

# الموقع
NEXT_PUBLIC_API_URL=https://your-app.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-app.netlify.app
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app
APP_URL=https://your-app.netlify.app
```

---

## 🔧 Railway

### في Railway Dashboard → Variables:

```bash
DATABASE_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
DIRECT_URL=postgresql://postgres:*7gzOMPcDco8l4If:O-CVb9Ehztq@database-1.cluster-clugy244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
PORT=3000
```

---

## 📝 نصائح مهمة للنشر

### 1. أمان كلمة المرور:
- **الأمان العالي:** استخدم URL encoding في البيئات الحساسة
- **البساطة:** استخدم الصيغة العادية في البيئات المحلية

### 2. اختبار الاتصال:
```bash
# قبل النشر، اختبر الاتصال محلياً
npx prisma db push
```

### 3. متطلبات AWS RDS:
- تأكد من إعداد Security Groups
- السماح للـ IP ranges المطلوبة
- تفعيل SSL إذا لزم الأمر

### 4. متغيرات البيئة الأساسية:
```bash
# الحد الأدنى المطلوب
DATABASE_URL=...
NEXT_PUBLIC_SITE_URL=...
JWT_SECRET=...
NEXTAUTH_SECRET=...
```

### 5. اختبار النشر:
```bash
# تطبيق التحديثات
npx prisma migrate deploy

# توليد Prisma Client  
npx prisma generate

# اختبار البناء
npm run build
```

## 🎯 الحالة المُوصى بها

### للإنتاج:
✅ AWS RDS PostgreSQL (عالي الأداء والأمان)
✅ URL encoding لكلمة المرور  
✅ SSL/TLS مفعل
✅ متغيرات البيئة محمية

### للتطوير:
✅ Supabase PostgreSQL (سهل الاستخدام)
✅ اتصال مباشر
✅ أدوات تطوير متاحة
