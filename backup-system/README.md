# 🛡️ دليل نظام النسخ الاحتياطية الشامل
# Comprehensive Backup System Guide

## 📋 نظرة عامة

نظام النسخ الاحتياطية الشامل المصمم خصيصاً لمشروع صبق AI CMS. يوفر حماية كاملة للبيانات مع إمكانيات الاسترجاع المتقدمة.

### ✨ الميزات الرئيسية

- **🔄 النسخ التلقائي**: جدولة يومية/أسبوعية/شهرية
- **🛡️ حماية شاملة**: قاعدة البيانات + الكود + الأصول
- **🔐 الأمان**: تشفير AES-256-GCM + checksums
- **☁️ التخزين المتعدد**: AWS S3 + نسخ محلية
- **📧 الإشعارات**: تقارير مفصلة بالبريد الإلكتروني
- **🔄 الاسترجاع الآمن**: استرجاع تفاعلي مع خيارات التراجع
- **📊 المراقبة**: سجلات مفصلة + إحصائيات الأداء

## 🚀 البدء السريع

### 1. تثبيت المتطلبات

```bash
# تثبيت dependencies المطلوبة
npm install winston nodemailer archiver @octokit/rest node-cron aws-sdk cloudinary

# تثبيت أدوات النظام المطلوبة (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql-client-common postgresql-client-15 git tar gzip

# تثبيت أدوات النظام المطلوبة (macOS)
brew install postgresql git
```

### 2. إعداد متغيرات البيئة

إنشاء ملف `.env` أو إضافة المتغيرات التالية:

```bash
# قاعدة البيانات
DATABASE_URL="postgresql://username:password@host:5432/database"
POSTGRES_HOST="your-host"
POSTGRES_PORT="5432"
POSTGRES_USER="your-username"
POSTGRES_PASSWORD="your-password"
POSTGRES_DB="your-database"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-backup-bucket"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# GitHub
GITHUB_TOKEN="your-github-token"
GITHUB_OWNER="sabq4org"
GITHUB_REPO="sabq-ai-cms"

# البريد الإلكتروني للإشعارات
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
NOTIFICATION_EMAIL="admin@example.com"

# التشفير
BACKUP_ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 3. اختبار النظام

```bash
# اختبار الاتصالات
node backup-system/scripts/backup-orchestrator.js test

# إنشاء نسخة احتياطية تجريبية
node backup-system/scripts/backup-orchestrator.js manual --type=database

# اختبار النسخة الاحتياطية الشاملة
node backup-system/scripts/backup-orchestrator.js manual --type=full
```

## 📖 دليل الاستخدام التفصيلي

### 🔧 إعداد النظام

#### 1. هيكل المشروع

```
backup-system/
├── config/
│   ├── backup-config.js           # الإعدادات الرئيسية
│   └── pm2-backup.config.json     # إعدادات PM2
├── scripts/
│   ├── backup-orchestrator.js     # المنسق الرئيسي
│   ├── database-backup.js         # نسخ قاعدة البيانات
│   ├── codebase-backup.js         # نسخ الكود
│   ├── assets-backup.js           # نسخ الأصول
│   ├── restore-backup.js          # استرجاع النسخ
│   └── utils.js                   # الأدوات المساعدة
└── logs/                          # ملفات السجلات
```

#### 2. تخصيص الإعدادات

قم بتعديل `backup-config.js` حسب احتياجاتك:

```javascript
// مثال على التخصيص
const config = {
  project: {
    name: 'مشروعك',
    environment: 'production' // أو 'development'
  },
  
  // إعدادات الجدولة
  schedule: {
    daily: '0 2 * * *',        // 2:00 صباحاً يومياً
    weekly: '0 3 * * 0',       // 3:00 صباحاً كل أحد
    monthly: '0 4 1 * *'       // 4:00 صباحاً أول كل شهر
  },
  
  // سياسات الاحتفاظ
  retention: {
    daily: 7,     // 7 أيام
    weekly: 4,    // 4 أسابيع
    monthly: 12   // 12 شهر
  }
};
```

### 🎯 العمليات الأساسية

#### 1. إنشاء نسخة احتياطية يدوية

```bash
# نسخة شاملة
node backup-system/scripts/backup-orchestrator.js manual

# قاعدة البيانات فقط
node backup-system/scripts/backup-orchestrator.js manual --type=database

# الكود فقط
node backup-system/scripts/backup-orchestrator.js manual --type=codebase

# الأصول فقط
node backup-system/scripts/backup-orchestrator.js manual --type=assets

# نسخة مخصصة
node backup-system/scripts/backup-orchestrator.js manual --components=database,codebase
```

#### 2. استرجاع النسخ الاحتياطية

```bash
# استرجاع تفاعلي (مُوصى به)
node backup-system/scripts/restore-backup.js

# استرجاع مباشر (متقدم)
node backup-system/scripts/restore-backup.js --backup=backup-20250814-020000.tar.gz --type=full
```

#### 3. إدارة الجدولة

```bash
# تشغيل النسخ المجدولة مع PM2
pm2 start backup-system/config/pm2-backup.config.json

# عرض حالة العمليات
pm2 status

# عرض السجلات
pm2 logs sabq-backup-daily

# إيقاف النسخ المجدولة
pm2 stop sabq-backup-daily
pm2 stop sabq-backup-weekly
pm2 stop sabq-backup-database-hourly
```

### 📊 مراقبة النظام

#### 1. عرض السجلات

```bash
# السجلات الحية
tail -f logs/backup-combined.log

# البحث في السجلات
grep "ERROR" logs/backup-*.log

# إحصائيات الأداء
grep "Performance" logs/backup-combined.log
```

#### 2. فحص حالة النسخ

```bash
# فحص النسخ في S3
aws s3 ls s3://your-backup-bucket/backups/ --recursive

# فحص حجم النسخ
aws s3 ls s3://your-backup-bucket/backups/ --recursive --human-readable --summarize

# التحقق من سلامة النسخ
node backup-system/scripts/backup-orchestrator.js verify --date=2025-08-14
```

## 🔧 الصيانة والاستكشاف

### ❗ حل المشاكل الشائعة

#### 1. فشل اتصال قاعدة البيانات

```bash
# اختبار الاتصال يدوياً
PGPASSWORD="password" psql -h host -p 5432 -U username -d database -c "SELECT 1;"

# التحقق من متغيرات البيئة
echo $DATABASE_URL
echo $POSTGRES_HOST
```

#### 2. مشاكل AWS S3

```bash
# التحقق من الصلاحيات
aws s3 ls s3://your-backup-bucket/

# اختبار رفع ملف تجريبي
echo "test" | aws s3 cp - s3://your-backup-bucket/test.txt
aws s3 rm s3://your-backup-bucket/test.txt
```

#### 3. مشاكل الذاكرة

```bash
# زيادة حد الذاكرة في PM2
pm2 restart sabq-backup-daily --max-memory-restart 4G

# مراقبة استخدام الذاكرة
pm2 monit
```

### 🧹 التنظيف والصيانة

#### 1. تنظيف النسخ القديمة

```bash
# تنظيف تلقائي (حسب سياسة الاحتفاظ)
node backup-system/scripts/backup-orchestrator.js cleanup

# تنظيف يدوي للنسخ الأقدم من 30 يوم
node backup-system/scripts/backup-orchestrator.js cleanup --older-than=30

# تنظيف الملفات المؤقتة
rm -rf /tmp/sabq-backup-*
```

#### 2. ضغط السجلات

```bash
# ضغط السجلات القديمة
find logs/ -name "*.log" -mtime +7 -exec gzip {} \;

# حذف السجلات الأقدم من شهر
find logs/ -name "*.log.gz" -mtime +30 -delete
```

## 🔐 الأمان والامتثال

### 🛡️ أفضل الممارسات الأمنية

1. **التشفير**: جميع النسخ مشفرة بـ AES-256-GCM
2. **المصادقة**: استخدام IAM roles لـ AWS، tokens محدودة الصلاحيات لـ GitHub
3. **النقل الآمن**: HTTPS/TLS لجميع عمليات النقل
4. **التدوير**: تدوير مفاتيح التشفير دورياً
5. **المراجعة**: سجلات مفصلة لجميع العمليات

### 📋 قائمة التحقق الأمنية

- [ ] تشفير جميع النسخ الاحتياطية
- [ ] حماية مفاتيح التشفير
- [ ] تقييد صلاحيات الوصول
- [ ] مراجعة السجلات دورياً
- [ ] اختبار الاسترجاع شهرياً
- [ ] تحديث كلمات المرور دورياً
- [ ] مراقبة محاولات الوصول غير المصرح

## 📈 التحسين والأداء

### ⚡ تحسين الأداء

1. **الضغط**: استخدام gzip للملفات الكبيرة
2. **التوازي**: تنفيذ النسخ بشكل متوازي
3. **التخزين المؤقت**: cache للملفات المتكررة
4. **الشبكة**: تحسين سرعة الرفع/التحميل
5. **الموارد**: مراقبة استخدام CPU/RAM

### 📊 مؤشرات الأداء

```bash
# قياس سرعة النسخ
time node backup-system/scripts/backup-orchestrator.js manual --type=database

# مراقبة استخدام الموارد
top -p $(pgrep -f backup-orchestrator)

# إحصائيات الشبكة
iftop -i eth0
```

## 🚨 خطة الطوارئ

### 🔥 إجراءات الطوارئ

#### 1. فقدان البيانات الكامل

```bash
# 1. تقييم الوضع
node backup-system/scripts/restore-backup.js --list-available

# 2. اختيار أحدث نسخة سليمة
node backup-system/scripts/restore-backup.js --interactive

# 3. التحقق من سلامة الاسترجاع
node backup-system/scripts/backup-orchestrator.js verify
```

#### 2. فشل نظام النسخ

```bash
# 1. تشخيص المشكلة
node backup-system/scripts/backup-orchestrator.js diagnose

# 2. إنشاء نسخة طوارئ يدوية
pg_dump $DATABASE_URL > emergency-backup-$(date +%Y%m%d).sql

# 3. إصلاح النظام واستكمال النسخ
```

### 📞 جهات الاتصال للطوارئ

- **مدير النظام**: [البريد الإلكتروني]
- **فريق DevOps**: [البريد الإلكتروني]
- **الدعم التقني**: [رقم الهاتف]

## 📚 مراجع إضافية

### 📖 الوثائق التقنية

- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/s3/latest/userguide/security-best-practices.html)
- [Node.js Performance Guidelines](https://nodejs.org/en/docs/guides/simple-profiling/)

### 🛠️ أدوات مساعدة

- **pgAdmin**: إدارة قاعدة البيانات
- **AWS CLI**: إدارة خدمات AWS
- **PM2 Monitor**: مراقبة العمليات
- **CloudWatch**: مراقبة AWS

## 📝 سجل التحديثات

### v1.0.0 (أغسطس 2025)
- ✅ إطلاق النظام الأساسي
- ✅ نسخ قاعدة البيانات والكود والأصول
- ✅ نظام الاسترجاع التفاعلي
- ✅ التشفير والأمان
- ✅ الجدولة التلقائية

### خطة التطوير المستقبلية
- 🔄 نسخ تدريجية (Incremental backups)
- 🌐 دعم مناطق متعددة
- 📱 تطبيق جوال للمراقبة
- 🤖 ذكاء اصطناعي لتحسين الأداء

---

## 🎯 الخلاصة

نظام النسخ الاحتياطية الشامل يوفر حماية موثوقة وقابلة للتطوير لمشروع صبق AI CMS. باتباع هذا الدليل، ستتمكن من:

- ✅ إعداد نظام نسخ احتياطي متقدم
- ✅ جدولة النسخ التلقائية
- ✅ مراقبة حالة النظام
- ✅ استرجاع البيانات بأمان
- ✅ التعامل مع حالات الطوارئ

للدعم التقني أو المساعدة، يرجى مراجعة قسم استكشاف الأخطاء أو التواصل مع فريق التطوير.

**تذكر**: النسخ الاحتياطية ليست مفيدة إلا إذا تم اختبار الاسترجاع بانتظام! 🔄
