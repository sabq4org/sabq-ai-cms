# دليل DATABASE_URL للسيرفر الإنتاجي 🚀

## 🌐 الخيارات الشائعة للإنتاج:

### 1️⃣ **VPS مع MySQL مثبت (DigitalOcean, AWS EC2, Linode)**
```env
DATABASE_URL="mysql://root:your_secure_password@localhost:3306/sabq_ai_cms"

# أو إذا أنشأت مستخدم خاص
DATABASE_URL="mysql://sabq_user:strong_password@localhost:3306/sabq_ai_cms"
```

### 2️⃣ **Vercel + PlanetScale (موصى به)**
```env
# من PlanetScale Dashboard > Connect
DATABASE_URL="mysql://xxxxxxxxxxxxx:***REMOVED***xxxxxxxxxxxxx@aws.connect.psdb.cloud/sabq-ai-cms?sslaccept=strict"
```

### 3️⃣ **Vercel + Supabase**
```env
# من Supabase > Settings > Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres"

# ⚠️ تحتاج تغيير provider في schema.prisma إلى "postgresql"
```

### 4️⃣ **Railway.app (سهل جداً)**
```env
# Railway ينشئ MySQL تلقائياً
DATABASE_URL="mysql://root:xxxxxxxxxxxxx@containers-us-west-123.railway.app:7894/railway"
```

### 5️⃣ **Netlify + Remote MySQL**
```env
# استخدم خدمة مثل FreeMySQLHosting أو db4free
DATABASE_URL="mysql://username:password@sql123.main-hosting.eu:3306/database_name"
```

### 6️⃣ **cPanel / Shared Hosting**
```env
# معلومات من cPanel > MySQL Databases
DATABASE_URL="mysql://cpanel_user:password@localhost:3306/cpanel_dbname"

# أحياناً يكون
DATABASE_URL="mysql://username_dbuser:password@localhost:3306/username_database"
```

## 🔧 خطوات الإعداد حسب المنصة:

### **Vercel + PlanetScale (الأسهل والأسرع)**
1. اذهب إلى https://planetscale.com
2. أنشئ حساب مجاني
3. أنشئ database جديدة
4. اضغط "Connect"
5. اختر "Prisma"
6. انسخ DATABASE_URL
7. في Vercel: Settings > Environment Variables
8. أضف DATABASE_URL

### **VPS (DigitalOcean مثلاً)**
```bash
# SSH إلى السيرفر
ssh root@your-server-ip

# أنشئ قاعدة البيانات
mysql -u root -p
CREATE DATABASE sabq_ai_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sabq_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON sabq_ai_cms.* TO 'sabq_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# في ملف .env على السيرفر
DATABASE_URL="mysql://sabq_user:strong_password_here@localhost:3306/sabq_ai_cms"
```

### **Railway (الأسرع للتجربة)**
1. اذهب إلى https://railway.app
2. اضغط "New Project"
3. اختر "Deploy from GitHub"
4. أضف "MySQL" كـ service
5. Railway سيضع DATABASE_URL تلقائياً!

## ⚡️ نصائح مهمة:

### 🔐 الأمان:
- **لا تستخدم** root في الإنتاج
- استخدم كلمات مرور قوية (16+ حرف)
- فعّل SSL دائماً في الإنتاج

### 🎯 اختبار الاتصال:
```bash
# على السيرفر
npx prisma db push
```

### 🚨 أخطاء شائعة:

**خطأ: Can't connect to MySQL**
- تأكد من أن MySQL يعمل
- تأكد من الـ port (عادة 3306)
- تأكد من أن المستخدم له صلاحيات

**خطأ: SSL required**
```env
# أضف في نهاية الرابط
DATABASE_URL="mysql://user:pass@host:3306/db?sslaccept=strict"
```

## 📱 أمثلة حقيقية:

### مشروع على Vercel:
```env
DATABASE_URL="mysql://b3kd9f0d9f0d9f:***REMOVED***AbCdEfGhIjKlMnOpQrStUvWxYz@aws-eu.connect.psdb.cloud/sabq-cms?ssl={"rejectUnauthorized":true}"
NEXTAUTH_URL="https://sabq-ai-cms.vercel.app"
NEXTAUTH_SECRET="your-production-secret-32-chars-min"
```

### مشروع على VPS:
```env
DATABASE_URL="mysql://sabq_prod:Str0ng!P@ssw0rd#2024@localhost:3306/sabq_production"
NEXTAUTH_URL="https://cms.sabq.ai"
NEXTAUTH_SECRET="production-secret-key-very-long-and-secure"
```

## 🎁 توصيتي الشخصية:

للمشاريع الحقيقية، أنصح بـ:
1. **Vercel + PlanetScale** = أداء ممتاز + سهولة
2. **Railway** = للتجربة السريعة
3. **VPS + MySQL** = تحكم كامل + تكلفة أقل

---

**ملاحظة**: احفظ DATABASE_URL في مكان آمن! 🔒 