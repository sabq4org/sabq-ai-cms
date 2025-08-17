# دليل حل مشكلة "جاري تحميل المقالات"

## المشكلة
عند فتح الموقع، يظهر "جاري تحميل المقالات..." ولا تظهر المقالات.

## الأسباب المحتملة

### 1. مشاكل اتصال قاعدة البيانات
- التحقق من متغير `DATABASE_URL` في DigitalOcean
- التأكد من أن قاعدة البيانات تقبل الاتصالات من خادم التطبيق

### 2. مشاكل Redis
- التحقق من متغير `REDIS_URL` 
- إذا كان Redis يسبب مشاكل، يمكن تعطيله مؤقتاً

### 3. مشاكل CORS
- التحقق من إعدادات CORS في API routes
- التأكد من أن الـ frontend يمكنه الوصول للـ API

### 4. أخطاء في الـ API
- فحص سجلات الخادم في DigitalOcean
- التحقق من وجود أخطاء JavaScript في console المتصفح

## خطوات التشخيص

### 1. فحص الـ APIs مباشرة
```bash
# فحص health check
curl https://your-app.ondigitalocean.app/api/health

# فحص API المقالات
curl https://your-app.ondigitalocean.app/api/articles?status=published&limit=5

# فحص API الأخبار
curl https://your-app.ondigitalocean.app/api/news/latest?limit=5
```

### 2. فحص console المتصفح
1. افتح الموقع
2. اضغط F12 لفتح Developer Tools
3. اذهب إلى تبويب Console
4. ابحث عن أخطاء حمراء

### 3. فحص Network tab
1. في Developer Tools، اذهب إلى Network
2. أعد تحميل الصفحة
3. ابحث عن طلبات API فاشلة (باللون الأحمر)

## الحلول

### 1. تعطيل Redis مؤقتاً
في `lib/redis.ts`:
```typescript
// بدلاً من الاتصال الحقيقي، استخدم mock
export const cache = {
  get: async (key: string) => null,
  set: async (key: string, value: any, ttl?: number) => {},
  del: async (key: string) => {},
  clear: async () => {},
  exists: async (key: string) => false,
  keys: async (pattern: string) => []
}
```

### 2. إضافة معالجة أخطاء أفضل
في `app/page.tsx`:
```typescript
const fetchArticles = async () => {
  try {
    setArticlesLoading(true);
    const res = await fetch('/api/articles?status=published&limit=12');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json.data ?? json.articles ?? []);
    setArticles(list);
    
    if (list.length === 0) {
      console.warn("No articles were fetched from the API.");
      setError("لا توجد مقالات متاحة حالياً");
    }
  } catch (err) {
    console.error('خطأ في جلب المقالات:', err);
    setError("حدث خطأ في تحميل المقالات. يرجى المحاولة لاحقاً.");
  } finally {
    setArticlesLoading(false);
  }
};
```

### 3. إنشاء صفحة تشخيص
إنشاء `/api/debug/status`:
```typescript
export async function GET() {
  const status = {
    database: false,
    redis: false,
    apis: {}
  };
  
  // فحص قاعدة البيانات
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = true;
  } catch (e) {
    status.database = e.message;
  }
  
  // فحص Redis
  try {
    await cache.set('test', 'test', 10);
    await cache.get('test');
    status.redis = true;
  } catch (e) {
    status.redis = e.message;
  }
  
  return NextResponse.json(status);
}
```

### 4. متغيرات البيئة المطلوبة
تأكد من وجود هذه المتغيرات في DigitalOcean:
```env
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=...
NEXT_PUBLIC_API_URL=https://your-app.ondigitalocean.app
```

### 5. إعدادات Build في DigitalOcean
```yaml
build_command: npm run build
run_command: npm start
environment_slug: node-js
http_port: 3000
```

## نصائح إضافية

1. **استخدم سجلات DigitalOcean**:
   - اذهب إلى Runtime Logs في DigitalOcean
   - ابحث عن أخطاء أثناء تشغيل التطبيق

2. **تفعيل وضع Debug**:
   - أضف `DEBUG=*` في متغيرات البيئة
   - سيعطيك معلومات أكثر تفصيلاً

3. **فحص حجم البناء**:
   - تأكد من أن حجم التطبيق لا يتجاوز حدود DigitalOcean
   - استخدم `npm run analyze` لفحص حجم الحزم

4. **استخدم Fallback Data**:
   - أضف بيانات احتياطية في حالة فشل API
   - يساعد في تحسين تجربة المستخدم

## سكريبت فحص شامل
استخدم `scripts/check-production-api.js` لفحص جميع APIs:
```bash
PRODUCTION_URL="https://your-app.ondigitalocean.app" node scripts/check-production-api.js
``` 