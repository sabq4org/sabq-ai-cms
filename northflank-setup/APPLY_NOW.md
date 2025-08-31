# 🚀 تطبيق فوري - قاعدة البيانات جاهزة!

## خطوات سريعة:

### 1️⃣ انسخ هذا إلى Northflank Environment Variables:

```json
{
    "DATABASE_URL": "postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7",
    "DIRECT_URL": "postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7",
    "PORT": "8080",
    "NODE_ENV": "production",
    "NEXTAUTH_SECRET": "3fba94fd1803f7e72aebf109e4dcb3039c2fb094d3d94b9301e94feec00374c5",
    "JWT_SECRET": "LnGAxzzUwUeKi956rm54D6BqhugTxnyx2/1Hm1pdypXzZfmPPOja9E87IM0YLXbg0nrTzSMqrjTkfkzNU5XyEA==",
    "NEXT_PUBLIC_BASE_URL": "https://site--sabqai--7mcgps947hwt.code.run",
    "NEXT_PUBLIC_SITE_URL": "https://site--sabqai--7mcgps947hwt.code.run",
    "DISABLE_REDIS": "true",
    "REDIS_ENABLED": "false"
}
```

### 2️⃣ أعد نشر الخدمة

### 3️⃣ شغّل Prisma Migrations:
أنشئ Job في Northflank:
- نفس Image الخدمة
- نفس Environment Variables
- Command: `npx prisma migrate deploy`

### 4️⃣ اختبر النتائج:

```bash
# قاعدة البيانات
curl https://site--sabqai--7mcgps947hwt.code.run/api/test-db

# الأخبار
curl https://site--sabqai--7mcgps947hwt.code.run/api/news/optimized?status=published&limit=5

# الصحة
curl https://site--sabqai--7mcgps947hwt.code.run/api/health
```

## ✅ النتائج المتوقعة:
- قاعدة البيانات متصلة ✅
- الأخبار تظهر ✅
- لا يوجد أخطاء ECONNREFUSED ✅
- الموقع يعمل بشكل كامل ✅

الموقع: https://site--sabqai--7mcgps947hwt.code.run
