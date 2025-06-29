# دليل إصلاح قاعدة البيانات في الإنتاج

## المشكلة
- خطأ: `Environment variable not found: DATABASE_URL`
- السبب: ملف `.env` غير موجود أو لا يحتوي على `DATABASE_URL`

## الحل السريع

### 1. ادخل للخادم عبر SSH
```bash
ssh j3uar@your-server-ip
cd ~/sabq-ai-cms
```

### 2. تحقق من وجود ملف .env
```bash
ls -la .env
```

### 3. إذا كان الملف غير موجود، أنشئه
```bash
nano .env
```

### 4. أضف المحتوى التالي (مع تعديل القيم):
```env
# قاعدة بيانات PlanetScale
DATABASE_URL="mysql://USERNAME:pscale_pw_XXXXXXXXXX@aws.connect.psdb.cloud/DATABASE_NAME?ssl={"rejectUnauthorized":true}"

# مفتاح JWT (استخدم مفتاح قوي)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"

# URL الموقع
NEXT_PUBLIC_BASE_URL="https://jur3a.ai"

# بيئة الإنتاج
NODE_ENV="production"
```

### 5. احفظ الملف (Ctrl+X ثم Y ثم Enter)

### 6. ولّد Prisma Client
```bash
npx prisma generate
```

### 7. أعد تشغيل التطبيق
```bash
pm2 restart all
# أو
pm2 restart sabq-cms
```

### 8. اختبر الموقع
```bash
curl https://jur3a.ai/api/health
curl https://jur3a.ai/api/categories
```

## الحصول على بيانات PlanetScale

1. اذهب إلى [PlanetScale Dashboard](https://app.planetscale.com)
2. اختر قاعدة بياناتك
3. اذهب إلى **Settings** > **Passwords**
4. انقر على **New password**
5. اختر **General** كـ Role
6. انقر **Create password**
7. انسخ **DATABASE_URL** المعروض

## نصائح مهمة

- **لا تشارك** ملف `.env` مع أحد
- **لا ترفع** ملف `.env` على GitHub
- احتفظ بنسخة احتياطية من بيانات الاتصال في مكان آمن
- استخدم كلمة مرور قوية لـ JWT_SECRET (32 حرف على الأقل)

## اختبار سريع بعد الإصلاح

```bash
# على الخادم
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected!'))
  .catch(e => console.error('❌ Connection failed:', e.message))
  .finally(() => prisma.\$disconnect());
"
``` 