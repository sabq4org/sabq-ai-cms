# دليل حل مشاكل قاعدة البيانات على Digital Ocean

## المشكلة: الموقع المباشر لا يعرض البيانات الحقيقية

### 1. التحقق من DATABASE_URL

#### في Digital Ocean:
1. App Platform → Settings → Environment Variables
2. ابحث عن `DATABASE_URL`
3. تأكد من أنه يحتوي على:
   ```
   postgresql://doadmin:[PASSWORD]@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require
   ```

#### نقاط مهمة:
- تأكد من وجود `?sslmode=require` في نهاية الرابط
- تأكد من أن كلمة المرور صحيحة
- تأكد من أن اسم قاعدة البيانات صحيح (`sabq_app_pool`)

### 2. فحص سجلات الأخطاء

#### في Digital Ocean:
1. Activity → Deployments → آخر deployment
2. اضغط على **Runtime Logs**
3. ابحث عن:
   - `Database connection failed`
   - `PrismaClientInitializationError`
   - `Connection refused`
   - `ECONNREFUSED`

### 3. الأسباب الشائعة والحلول

#### أ) قاعدة بيانات فارغة
**السبب**: تم إنشاء قاعدة بيانات جديدة أو تم مسح البيانات
**الحل**: 
```bash
# استعادة من النسخة الاحتياطية
node scripts/restore-from-backup.ts backups/[latest-backup].json
```

#### ب) خطأ في الاتصال
**السبب**: إعدادات SSL أو كلمة مرور خاطئة
**الحل**: 
- تأكد من إضافة `?sslmode=require`
- تحقق من كلمة المرور
- جرب الاتصال من الطرفية:
  ```bash
  psql "postgresql://doadmin:[PASSWORD]@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
  ```

#### ج) استخدام قاعدة بيانات مختلفة
**السبب**: DATABASE_URL يشير لقاعدة بيانات أخرى
**الحل**: 
- تحقق من اسم قاعدة البيانات
- قارن مع الإعدادات المحلية

#### د) مشكلة في Prisma
**السبب**: Prisma Client غير متزامن مع قاعدة البيانات
**الحل**:
```bash
# أعد توليد Prisma وادفع التغييرات
npx prisma generate
npx prisma db push
```

### 4. خطة الطوارئ

إذا فقدت البيانات نهائياً:

#### أ) استعادة من Digital Ocean
1. اتصل بدعم Digital Ocean
2. اطلب استعادة من نسخة احتياطية تلقائية
3. لديهم نسخ يومية لآخر 7 أيام

#### ب) استعادة من النسخ المحلية
```bash
# من ملفات CSV
node scripts/restore-from-csv.js backups/migration_20250716_083938/

# من ملفات JSON
node scripts/restore-from-backup.ts data/articles_backup_20250623_161538.json
```

### 5. منع المشكلة مستقبلاً

1. **نسخ احتياطية يومية**:
   ```bash
   # أضف في cron
   0 2 * * * /path/to/scripts/auto-backup.js
   ```

2. **مراقبة صحة قاعدة البيانات**:
   - أضف endpoint للتحقق: `/api/health/db`
   - راقب عدد السجلات يومياً

3. **فصل البيئات**:
   - Production: قاعدة بيانات منفصلة
   - Staging: قاعدة بيانات تجريبية
   - Development: قاعدة بيانات محلية

### 6. أوامر مفيدة للتشخيص

```bash
# فحص قاعدة البيانات
./scripts/check-do-live-db.sh

# عرض آخر 10 مقالات
psql $DATABASE_URL -c "SELECT id, title, created_at FROM articles ORDER BY created_at DESC LIMIT 10;"

# عد جميع السجلات
psql $DATABASE_URL -c "SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'articles', COUNT(*) FROM articles UNION ALL SELECT 'categories', COUNT(*) FROM categories;"

# فحص حجم قاعدة البيانات
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
``` 