# دليل إعداد Redis Cloud

## معلومات الاتصال

### Redis Cloud (الإنتاج)
```env
REDIS_URL=rediss://sabqcms:SabqRedis2025!@redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com:10909
```

- **Database name**: database-MD2WU6NY
- **Public endpoint**: redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com:10909
- **Protocol**: rediss:// (مع TLS)

### Redis المحلي (التطوير)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## إعداد المشروع

### 1. تثبيت الحزم المطلوبة
```bash
npm install ioredis @types/ioredis
```

### 2. إضافة متغيرات البيئة

#### للإنتاج (.env.production)
```env
REDIS_URL=rediss://sabqcms:SabqRedis2025!@redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com:10909
```

#### للتطوير (.env.local)
```env
# خيار 1: استخدام Redis المحلي
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# خيار 2: استخدام Redis Cloud في التطوير
# REDIS_URL=rediss://sabqcms:SabqRedis2025!@redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com:10909
```

## أمثلة الاستخدام

### 1. تخزين مؤقت بسيط
```typescript
import { cache } from '@/lib/redis';

// حفظ البيانات
await cache.set('latest-news', newsData, 300); // 5 دقائق

// جلب البيانات
const cachedNews = await cache.get('latest-news');
```

### 2. تخزين مؤقت للمقالات
```typescript
// في app/api/articles/route.ts
const cacheKey = CACHE_KEYS.articles({ status: 'published', limit: 10 });

// محاولة جلب من Redis
const cached = await cache.get(cacheKey);
if (cached) {
  return NextResponse.json(cached);
}

// جلب من قاعدة البيانات
const articles = await fetchArticlesFromDB();

// حفظ في Redis
await cache.set(cacheKey, articles, CACHE_TTL.articles);
```

### 3. مسح التخزين المؤقت
```typescript
// مسح مفتاح واحد
await cache.del('latest-news');

// مسح جميع مفاتيح المقالات
await cache.delPattern('articles:*');
```

## مفاتيح التخزين المؤقت المستخدمة

| المفتاح | الوصف | مدة التخزين |
|---------|-------|--------------|
| `articles:{params}` | قائمة المقالات | 60 ثانية |
| `categories:all` | جميع التصنيفات | 300 ثانية |
| `users:all` | جميع المستخدمين | 600 ثانية |
| `article:{id}` | مقال واحد | 300 ثانية |
| `stats:dashboard` | إحصائيات لوحة التحكم | 60 ثانية |

## الأوامر المفيدة

### اختبار الاتصال
```bash
# باستخدام redis-cli
redis-cli -h redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com -p 10909 -a SabqRedis2025! --tls ping

# باستخدام Node.js
node -e "const Redis = require('ioredis'); const r = new Redis(process.env.REDIS_URL, {tls:{}}); r.ping().then(console.log).then(() => r.quit())"
```

### مراقبة الأداء
```bash
# عرض معلومات الخادم
redis-cli -h redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com -p 10909 -a SabqRedis2025! --tls info

# مراقبة الأوامر في الوقت الفعلي
redis-cli -h redis-10909.c273.us-east-1-2.ec2.redns.redis-cloud.com -p 10909 -a SabqRedis2025! --tls monitor
```

## حل المشاكل الشائعة

### 1. خطأ في الاتصال
```
Error: connect ECONNREFUSED
```
**الحل**: تأكد من أن Redis يعمل وأن المنفذ صحيح

### 2. خطأ في المصادقة
```
ReplyError: NOAUTH Authentication required
```
**الحل**: تأكد من كلمة المرور في REDIS_URL

### 3. خطأ TLS
```
Error: Redis connection to ... failed - read ECONNRESET
```
**الحل**: تأكد من إضافة `tls: {}` في إعدادات الاتصال

## نصائح الأداء

1. **استخدم TTL مناسب**: لا تخزن البيانات لفترة طويلة جداً
2. **استخدم مفاتيح منظمة**: مثل `articles:published:page1`
3. **راقب استخدام الذاكرة**: Redis Cloud محدود بـ 30MB في الخطة المجانية
4. **استخدم Pipeline**: لتنفيذ عدة أوامر في طلب واحد

## مراجع إضافية

- [Redis Cloud Documentation](https://docs.redis.com/latest/rc/)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/) 