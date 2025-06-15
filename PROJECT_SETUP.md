# 🚀 إعداد وتشغيل المشروع - صحيفة سبق AI CMS

## 📋 المتطلبات الأساسية

### البرمجيات المطلوبة
- **Node.js**: v18.0.0 أو أحدث
- **npm**: v9.0.0 أو أحدث
- **PostgreSQL**: v14.0 أو أحدث
- **Git**: أي إصدار حديث

### المتطلبات الاختيارية
- **Docker**: لتشغيل قاعدة البيانات في حاوية
- **VS Code**: محرر الكود الموصى به

## 🛠️ خطوات التثبيت

### 1. استنساخ المشروع
```bash
# استنساخ المشروع من GitHub
git clone https://github.com/sabq4org/sabq-ai-cms.git

# الدخول إلى مجلد المشروع
cd sabq-ai-cms
```

### 2. إعداد قاعدة البيانات

#### خيار أ: استخدام PostgreSQL المحلي
```bash
# إنشاء قاعدة البيانات
createdb sabq_cms

# تشغيل ملفات الترحيل (migrations)
cd database/migrations
psql -d sabq_cms -f 001_initial_schema.sql
psql -d sabq_cms -f 002_create_users_table.sql
psql -d sabq_cms -f 003_create_roles_table.sql
psql -d sabq_cms -f 005_ai_console_tables.sql
psql -d sabq_cms -f 006_create_templates_table.sql
```

#### خيار ب: استخدام Docker
```bash
# تشغيل PostgreSQL في Docker
docker run --name sabq-postgres \
  -e POSTGRES_PASSWORD=sabq123 \
  -e POSTGRES_DB=sabq_cms \
  -p 5432:5432 \
  -d postgres:14

# انتظر 30 ثانية ثم شغّل الترحيلات
sleep 30
cd database/migrations
docker exec -i sabq-postgres psql -U postgres -d sabq_cms < 001_initial_schema.sql
docker exec -i sabq-postgres psql -U postgres -d sabq_cms < 002_create_users_table.sql
# ... كرر للملفات الأخرى
```

### 3. إعداد Backend
```bash
# الذهاب إلى مجلد backend
cd backend

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env

# تعديل ملف .env
nano .env
```

محتوى ملف `.env`:
```env
# قاعدة البيانات
DATABASE_URL=postgresql://postgres:sabq123@localhost:5432/sabq_cms

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. إعداد Frontend
```bash
# الذهاب إلى مجلد frontend
cd ../frontend

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env.local

# تعديل ملف .env.local
nano .env.local
```

محتوى ملف `.env.local`:
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App
NEXT_PUBLIC_APP_NAME=صحيفة سبق
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏃‍♂️ تشغيل المشروع

### تشغيل في وضع التطوير

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# سيعمل على http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# سيعمل على http://localhost:3000
```

### تشغيل في وضع الإنتاج

#### بناء المشروع
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

#### تشغيل الإنتاج
```bash
# Backend
cd backend
npm start

# Frontend
cd ../frontend
npm start
```

## 🔐 البيانات الافتراضية

### حساب المدير
- **البريد**: admin@sabq.org
- **كلمة المرور**: Admin@123

### حسابات تجريبية
- **رئيس تحرير**: editor@sabq.org / Editor@123
- **محرر**: writer@sabq.org / Writer@123

## 🐛 حل المشاكل الشائعة

### مشكلة: npm run dev لا يعمل
```bash
# تأكد أنك في المجلد الصحيح
pwd
# يجب أن يكون: /path/to/sabq-ai-cms/frontend

# إذا لم تكن، اذهب للمجلد الصحيح
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
```

### مشكلة: خطأ في Tailwind CSS
```bash
# حذف مجلد .next وإعادة التشغيل
rm -rf .next
npm run dev
```

### مشكلة: Port 3000 قيد الاستخدام
```bash
# إيقاف العملية على المنفذ 3000
lsof -ti:3000 | xargs kill -9

# أو استخدم منفذ آخر
npm run dev -- -p 3001
```

### مشكلة: لا يمكن الاتصال بقاعدة البيانات
```bash
# تحقق من تشغيل PostgreSQL
pg_isready

# تحقق من بيانات الاتصال
psql -U postgres -d sabq_cms -c "SELECT 1"
```

## 📦 البناء للنشر

### إنشاء Docker Images
```bash
# Backend
cd backend
docker build -t sabq-backend .

# Frontend  
cd ../frontend
docker build -t sabq-frontend .
```

### استخدام Docker Compose
```bash
# من المجلد الرئيسي
docker-compose up -d
```

## 🔄 التحديثات

### تحديث المكتبات
```bash
# Backend
cd backend
npm update

# Frontend
cd ../frontend
npm update
```

### تحديث قاعدة البيانات
```bash
cd database/migrations
# شغّل أي ملفات ترحيل جديدة
psql -d sabq_cms -f xxx_new_migration.sql
```

## 📊 مراقبة الأداء

### سجلات Backend
```bash
cd backend
tail -f logs/app.log
```

### مراقبة قاعدة البيانات
```sql
-- عرض الاتصالات النشطة
SELECT count(*) FROM pg_stat_activity;

-- عرض الاستعلامات البطيئة
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## 🌐 النشر على الخادم

### إعداد Nginx
```nginx
server {
    listen 80;
    server_name sabq.org;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### إعداد PM2
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل Backend
cd backend
pm2 start npm --name "sabq-backend" -- start

# تشغيل Frontend
cd ../frontend
pm2 start npm --name "sabq-frontend" -- start

# حفظ إعدادات PM2
pm2 save
pm2 startup
```

## 📱 تطبيق الجوال

### تشغيل تطبيق React Native
```bash
cd mobile
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

📅 آخر تحديث: ديسمبر 2024
🏢 صحيفة سبق الإلكترونية
📧 للدعم: tech@sabq.org 