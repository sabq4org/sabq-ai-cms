# 🚑 دليل حل مشاكل السيرفر الشخصي - سبق AI CMS

## 📋 جدول المحتويات
1. [المشاكل الشائعة](#المشاكل-الشائعة)
2. [حلول سريعة](#حلول-سريعة)
3. [تحسين الأداء](#تحسين-الأداء)
4. [النسخ الاحتياطي والاستعادة](#النسخ-الاحتياطي-والاستعادة)
5. [المراقبة والصيانة](#المراقبة-والصيانة)

## 🔴 المشاكل الشائعة

### 1. السيرفر لا يستجيب (502 Bad Gateway)

**الأسباب المحتملة:**
- التطبيق متوقف
- Nginx لا يستطيع الوصول للتطبيق
- نفاد الذاكرة

**الحلول:**
```bash
# تحقق من حالة Docker
docker ps -a

# أعد تشغيل الحاويات
docker-compose -f docker-compose.prod.yml restart

# أو باستخدام PM2
pm2 restart all

# تحقق من السجلات
docker logs jur3a-cms-app --tail 100
pm2 logs --lines 100
```

### 2. استهلاك عالي للذاكرة

**الحلول:**
```bash
# قتل العمليات المعلقة
pm2 kill
pm2 start ecosystem.config.js

# تنظيف Docker
docker system prune -a --volumes
docker-compose -f docker-compose.prod.yml up -d

# زيادة حد الذاكرة في ecosystem.config.js
# max_memory_restart: '2G'  # بدلاً من 1G
```

### 3. بطء في الاستجابة

**الأسباب:**
- قاعدة بيانات بطيئة
- عدم وجود فهارس
- كثرة الطلبات

**الحلول:**
```bash
# تحسين قاعدة البيانات
npx prisma db push --force-reset
npx prisma generate

# إضافة Redis للتخزين المؤقت
docker run -d --name redis -p 6379:6379 redis:alpine

# تفعيل التخزين المؤقت في Nginx
# أضف في nginx.conf:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;
```

### 4. مشاكل SSL/HTTPS

**الحلول:**
```bash
# تجديد شهادة Let's Encrypt
certbot renew --force-renewal

# أو استخدام Cloudflare لـ SSL مجاني
# قم بتوجيه DNS عبر Cloudflare وفعّل SSL
```

### 5. امتلاء القرص الصلب

**الحلول:**
```bash
# تنظيف السجلات القديمة
find ./logs -name "*.log" -mtime +30 -delete
find ./backups -name "*.sql" -mtime +30 -delete

# تنظيف Docker
docker system prune -a --volumes

# ضغط السجلات
tar -czf logs-$(date +%Y%m%d).tar.gz logs/*.log
rm logs/*.log
```

## ⚡ حلول سريعة

### إعادة تشغيل كاملة للنظام
```bash
#!/bin/bash
# restart-all.sh

echo "🔄 إعادة تشغيل جميع الخدمات..."

# إيقاف كل شيء
docker-compose -f docker-compose.prod.yml down
pm2 stop all

# تنظيف
docker system prune -f
pm2 flush

# إعادة التشغيل
docker-compose -f docker-compose.prod.yml up -d
# أو
pm2 start ecosystem.config.js

echo "✅ تمت إعادة التشغيل"
```

### فحص صحة النظام
```bash
#!/bin/bash
# health-check.sh

# فحص التطبيق
curl -f http://localhost:3000/api/health || echo "❌ التطبيق لا يستجيب"

# فحص قاعدة البيانات
npx prisma db pull || echo "❌ قاعدة البيانات لا تستجيب"

# فحص Nginx
nginx -t || echo "❌ خطأ في إعدادات Nginx"
```

## 🚀 تحسين الأداء

### 1. تفعيل Cluster Mode في PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sabq-cms',
    script: 'npm',
    args: 'start',
    instances: 'max', // استخدم جميع النوى
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    // ...
  }]
};
```

### 2. تحسين إعدادات Nginx
```nginx
# nginx.conf إضافات
# تفعيل HTTP/2
listen 443 ssl http2;

# تحسين Buffer
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
output_buffers 1 32k;
postpone_output 1460;

# Caching للملفات الثابتة
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. إضافة مراقب للصحة
```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // فحص قاعدة البيانات
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

## 💾 النسخ الاحتياطي والاستعادة

### نسخ احتياطي تلقائي
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/home/backups"

# نسخ قاعدة البيانات
pg_dump $DATABASE_URL > $BACKUP_DIR/db-$DATE.sql

# نسخ الملفات
tar -czf $BACKUP_DIR/files-$DATE.tar.gz uploads/ .env

# رفع إلى السحابة (اختياري)
# aws s3 cp $BACKUP_DIR/db-$DATE.sql s3://my-backup-bucket/

# حذف النسخ القديمة
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### استعادة من نسخة احتياطية
```bash
# استعادة قاعدة البيانات
psql $DATABASE_URL < backup.sql

# استعادة الملفات
tar -xzf files-backup.tar.gz
```

## 📊 المراقبة والصيانة

### 1. إعداد مراقبة بـ PM2
```bash
# تثبيت PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# مراقبة في الوقت الفعلي
pm2 monit
```

### 2. إعداد تنبيهات
```bash
# إرسال إيميل عند توقف الخدمة
pm2 set pm2-health-check:smtp-host smtp.gmail.com
pm2 set pm2-health-check:smtp-port 587
pm2 set pm2-health-check:mail-from your-email@gmail.com
pm2 set pm2-health-check:mail-to admin@sabq.ai
```

### 3. جدولة الصيانة
```bash
# إضافة في crontab
crontab -e

# تنظيف يومي
0 2 * * * /home/sabq/cleanup.sh

# نسخ احتياطي يومي
0 3 * * * /home/sabq/backup.sh

# إعادة تشغيل أسبوعية
0 4 * * 0 /home/sabq/restart-all.sh
```

## 🆘 حلول الطوارئ

### في حالة توقف كامل:
1. **الوصول عبر SSH**
   ```bash
   ssh user@server-ip
   ```

2. **فحص الموارد**
   ```bash
   free -h
   df -h
   htop
   ```

3. **إعادة تشغيل الخدمات الأساسية**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart docker
   ```

4. **الوضع الآمن**
   ```bash
   # تشغيل بحد أدنى من الموارد
   NODE_ENV=production PORT=3001 npm start
   ```

## 📞 الدعم الفني

إذا استمرت المشكلة:
1. احفظ السجلات: `pm2 logs > debug.log`
2. خذ لقطة من الموارد: `top -b -n 1 > system.log`
3. اتصل بالدعم الفني مع هذه المعلومات

---

💡 **نصيحة:** احتفظ بنسخة من هذا الدليل على السيرفر في `/home/docs/` 