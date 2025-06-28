# دليل رفع المشروع للبيئة الحية (Production Deployment Guide)

## معلومات النسخة
- **تاريخ التحضير**: يناير 2025
- **إصدار Next.js**: 15.3.3
- **إصدار Node.js المطلوب**: 18.x أو أحدث
- **قاعدة البيانات**: MySQL 8.0+

## المتطلبات الأساسية

### 1. متطلبات الخادم
- Node.js 18.x أو أحدث
- MySQL 8.0 أو أحدث
- PM2 أو مدير عمليات مشابه
- Nginx أو Apache للـ reverse proxy
- SSL Certificate (Let's Encrypt مجاني)
- RAM: 2GB كحد أدنى (4GB موصى به)
- Storage: 10GB كحد أدنى

### 2. متغيرات البيئة المطلوبة
قم بإنشاء ملف `.env.production` بالمتغيرات التالية:

```env
# قاعدة البيانات
DATABASE_URL="mysql://username:password@host:port/database_name"

# إعدادات التطبيق
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-secret-key"

# إعدادات البريد الإلكتروني
EMAIL_HOST="mail.jur3a.ai"
EMAIL_PORT="465"
EMAIL_SECURE="true"
EMAIL_USER="noreplay@jur3a.ai"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreplay@jur3a.ai"

# إعدادات AI (اختياري)
OPENAI_API_KEY="your-openai-api-key"

# إعدادات التخزين
UPLOAD_DIR="/var/www/uploads"
MAX_FILE_SIZE="10485760"
```

## خطوات الرفع

### 1. تحضير قاعدة البيانات
```bash
# تشغيل migrations
npx prisma migrate deploy

# توليد Prisma Client
npx prisma generate
```

### 2. بناء المشروع
```bash
# تثبيت الحزم
npm ci --production

# بناء المشروع
npm run build
```

### 3. إعداد PM2
```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# إنشاء ملف ecosystem.config.js
pm2 init
```

محتوى `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'sabq-ai-cms',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}
```

### 4. إعداد Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # تحسينات الأمان
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers الأمان
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # إعدادات الـ proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Uploads
    location /uploads {
        alias /var/www/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # حجم الرفع الأقصى
    client_max_body_size 10M;
}
```

### 5. بدء التطبيق
```bash
# بدء التطبيق مع PM2
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save

# تفعيل البدء التلقائي
pm2 startup
```

## الصيانة والمراقبة

### 1. مراقبة الأداء
```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs

# مراقبة الموارد
pm2 monit
```

### 2. النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# نسخ احتياطي للملفات المرفوعة
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/uploads
```

### 3. التحديثات
```bash
# إيقاف التطبيق
pm2 stop sabq-ai-cms

# سحب التحديثات
git pull origin main

# تثبيت الحزم الجديدة
npm ci

# تشغيل migrations
npx prisma migrate deploy

# بناء المشروع
npm run build

# إعادة تشغيل التطبيق
pm2 restart sabq-ai-cms
```

## قائمة التحقق قبل الرفع

- [ ] التأكد من جميع متغيرات البيئة
- [ ] اختبار الاتصال بقاعدة البيانات
- [ ] اختبار إعدادات البريد الإلكتروني
- [ ] التأكد من صلاحيات المجلدات (uploads)
- [ ] تفعيل SSL
- [ ] إعداد جدار الحماية
- [ ] تفعيل النسخ الاحتياطي التلقائي
- [ ] إعداد مراقبة الأداء
- [ ] اختبار جميع الوظائف الأساسية

## حل المشاكل الشائعة

### 1. خطأ في الاتصال بقاعدة البيانات
- تحقق من DATABASE_URL
- تأكد من أن المستخدم لديه الصلاحيات الكافية
- تحقق من جدار الحماية

### 2. مشاكل الأداء
- زيادة عدد instances في PM2
- تحسين استعلامات قاعدة البيانات
- تفعيل Redis للـ caching

### 3. مشاكل الرفع
- تحقق من صلاحيات مجلد uploads
- تأكد من حجم client_max_body_size في Nginx

## معلومات الاتصال للدعم
- **المطور**: علي الحازمي
- **البريد الإلكتروني**: [بريدك الإلكتروني]
- **رقم الهاتف**: [رقم هاتفك]

## ملاحظات مهمة
1. تأكد من تغيير NEXTAUTH_SECRET لقيمة آمنة وعشوائية
2. قم بتفعيل جدار الحماية وحدد المنافذ المفتوحة
3. راقب استخدام الموارد بانتظام
4. احتفظ بنسخ احتياطية منتظمة 