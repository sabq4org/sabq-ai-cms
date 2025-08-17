# خطة استعادة البيانات الحقيقية على Digital Ocean

## المشكلة
- البيانات الحقيقية اختفت من الموقع المباشر
- ظهرت بيانات قديمة (4 مقالات تجريبية فقط)
- يبدو أن هناك ترحيل تم في 16 يوليو أدى لهذه المشكلة

## الخطوات الفورية

### 1. التحقق من قاعدة البيانات على Digital Ocean
```bash
# تعيين كلمة المرور
export DO_DB_PASSWORD='كلمة_المرور_الفعلية'

# فحص قاعدة البيانات
./scripts/check-do-database.sh
```

### 2. التحقق من DATABASE_URL في Digital Ocean
- اذهب إلى Digital Ocean App Platform
- Settings → Environment Variables
- تأكد من أن DATABASE_URL صحيح

### 3. البحث عن أحدث نسخة احتياطية
```bash
# البحث في مجلد data
ls -la data/*backup*.json

# البحث في مجلد backups
ls -la backups/
```

### 4. استعادة من نسخة احتياطية (إذا وُجدت)
```bash
# استخدام أحدث نسخة احتياطية
node scripts/restore-from-backup.ts backups/[اسم_الملف].json
```

### 5. استعادة من CSV (النسخة الأخيرة)
```bash
# الملفات موجودة في:
# backups/migration_20250716_083938/

# يمكن استعادتها باستخدام:
node scripts/restore-from-csv.js backups/migration_20250716_083938/
```

## إجراءات وقائية

### 1. نسخ احتياطي يومي تلقائي
```bash
# إضافة في crontab
0 2 * * * /path/to/scripts/auto-backup.js
```

### 2. التحقق قبل أي ترحيل
- دائماً خذ نسخة احتياطية قبل الترحيل
- تحقق من البيانات بعد الترحيل مباشرة
- احتفظ بنسخ احتياطية لمدة 30 يوم على الأقل

### 3. استخدام بيئات منفصلة
- Development: قاعدة بيانات محلية
- Staging: قاعدة بيانات تجريبية
- Production: قاعدة البيانات الحقيقية

## معلومات الاتصال بقاعدة البيانات

### Digital Ocean Production
```
Host: db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com
Port: 25060
Database: sabq_app_pool
User: doadmin
SSL: required
```

### للطوارئ
في حالة فقدان البيانات نهائياً:
1. تواصل مع دعم Digital Ocean
2. اطلب استعادة من نسخة احتياطية على مستوى الخادم
3. لديهم نسخ احتياطية تلقائية يومية 