# إصلاح مشاكل Redis SSL

## المشكلة
```
[ioredis] Unhandled error event: Error: ... ssl3_get_record:wrong version number
```

## الحلول

### 1. التحقق من متغيرات البيئة في Vercel
تأكد من أن إعدادات Redis في Vercel تطابق ما يلي:

```bash
# إذا كان Redis بدون SSL
REDIS_URL=redis://your-redis-host:6379
DISABLE_REDIS_SSL=true

# إذا كان Redis مع SSL
REDIS_URL=rediss://your-redis-host:6380
REDIS_TLS_ENABLED=true
```

### 2. إصلاح مؤقت - تعطيل Redis في Production
إذا استمرت المشاكل، يمكنك تعطيل Redis مؤقتاً:

```bash
DISABLE_REDIS=true
```

### 3. إعدادات SSL محسنة
تم تحديث ملف `redis-client.ts` بإعدادات SSL محسنة:
- `rejectUnauthorized: false` لتجاوز مشاكل الشهادات
- تقليل timeout periods
- إيقاف reconnection عند فشل SSL

### 4. اختبار الاتصال
```bash
# اختبار محلي
npm run dev

# مراقبة لوجات Redis
grep "Redis" .vercel/output/logs/*.log
```

## التوصيات
1. استخدم Redis Labs أو Vercel KV للاستقرار
2. تأكد من مطابقة بروتوكول الاتصال (redis:// vs rediss://)
3. راقب لوجات الأخطاء بعد النشر
