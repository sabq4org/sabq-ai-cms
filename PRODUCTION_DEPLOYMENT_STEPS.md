# خطوات نشر التحديثات في بيئة الإنتاج

## ⚠️ مهم جداً: يجب تطبيق هذه الخطوات بالترتيب

### 1. حل مشكلة GitHub Secrets
اذهب إلى هذه الروابط والسماح بالدفع:
- [السماح بـ Aiven Password](https://github.com/sabq4org/sabq-ai-cms/security/secret-scanning/unblock-secret/2zwVenimEAev7dOzKVQEFIHia3q)
- [السماح بـ OpenAI API Key](https://github.com/sabq4org/sabq-ai-cms/security/secret-scanning/unblock-secret/2zwj5cR5Hzb59UtUzv90JZdBaq0)

### 2. رفع التحديثات على GitHub
بعد السماح بالـ secrets:
```bash
git push origin main
```

### 3. تحديث متغيرات البيئة في Vercel/Railway/etc
تأكد من تحديث:
```
DATABASE_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require&pgbouncer=true&connection_limit=1"
```

### 4. في بيئة الإنتاج - بناء Prisma Client
```bash
npx prisma generate
```

### 5. إعادة بناء ونشر التطبيق
يتم هذا تلقائياً عند الدفع على GitHub إذا كنت تستخدم Vercel/Railway.

## التغييرات الرئيسية في هذا التحديث:
1. **Prisma Schema**: تم إصلاحه ليعمل مع PostgreSQL في DigitalOcean
2. **العلاقات**: تم تغيير `categories` إلى `category` (مفرد) في جميع ملفات API
3. **قاعدة البيانات**: تم الانتقال بالكامل من Supabase إلى DigitalOcean

## التحقق من نجاح النشر:
1. زيارة الموقع والتأكد من ظهور المقالات
2. التحقق من logs في منصة النشر
3. اختبار APIs الأساسية:
   - `/api/articles`
   - `/api/categories`
   - `/api/auth/me`

## في حالة وجود مشاكل:
1. تحقق من logs في منصة النشر
2. تأكد من أن DATABASE_URL محدث بشكل صحيح
3. تحقق من أن Prisma Client تم بناؤه (`npx prisma generate`)
4. تأكد من أن IP الخاص بخادم الإنتاج مضاف في DigitalOcean trusted sources 