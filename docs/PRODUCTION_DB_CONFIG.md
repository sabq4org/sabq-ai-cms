# إعدادات قاعدة البيانات للإنتاج

## 🔐 متغيرات البيئة المطلوبة

### DATABASE_URL - للاستخدام في التطبيق (عبر Connection Pooler)
```bash
DATABASE_URL="postgres://postgres:[PASSWORD]@db.uopckyrdhlvsxnvcobbw.supabase.co:6543/postgres?pgbouncer=true"
```

### DIRECT_URL - للاستخدام في Migrations فقط
```bash
DIRECT_URL="postgres://postgres:[PASSWORD]@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
```

### معاملات URL الموصى بها:
- `pgbouncer=true` - لتفعيل connection pooling
- `sslmode=require` - لضمان اتصال آمن
- `connect_timeout=30` - مهلة الاتصال 30 ثانية
- `pool_timeout=30` - مهلة انتظار الاتصال من pool
- `statement_timeout=10000` - مهلة تنفيذ الاستعلام 10 ثواني
- `idle_in_transaction_session_timeout=30000` - مهلة الجلسة الخاملة

## 🔧 إعدادات Supabase الموصى بها

### 1. Connection Pooling عبر pgBouncer
في لوحة تحكم Supabase:
- استخدم **Transaction mode** لأفضل أداء مع Prisma
- المنفذ 6543 للاتصال عبر pgBouncer
- المنفذ 5432 للاتصال المباشر (للmigrations فقط)
- حد أقصى للاتصالات: 100 (حسب الخطة)

### 2. Connection String Types
```bash
# Pooled connection (للإنتاج - استخدم هذا في DATABASE_URL)
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true

# Direct connection (للmigrations فقط - استخدم هذا في DIRECT_URL)
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 3. لماذا نستخدم كلا الاتصالين؟
- **DATABASE_URL (Pooled)**: للاستعلامات العادية في التطبيق، يوفر أداء أفضل وإدارة محسنة للاتصالات
- **DIRECT_URL**: مطلوب للmigrations لأن pgBouncer في Transaction mode لا يدعم prepared statements المطلوبة للmigrations

## 📊 إعدادات الأداء

### 1. في ملف .env.production
```bash
# Database - Connection Pooling
DATABASE_URL="postgres://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_STATEMENT_TIMEOUT=10000

# Cache
CACHE_TTL_CATEGORIES=300000  # 5 دقائق
CACHE_GRACE_PERIOD=3600000   # ساعة واحدة

# Monitoring
HEALTH_CHECK_INTERVAL=30000  # 30 ثانية
KEEP_ALIVE_INTERVAL=60000    # دقيقة واحدة
```

### 2. في Prisma Schema
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // استخدم Pooled connection
  directUrl = env("DIRECT_URL")      // استخدم Direct connection للmigrations
}
```

## 🚀 نصائح للإنتاج

### 1. فوائد استخدام pgBouncer
- ✅ يقلل عدد الاتصالات المباشرة مع قاعدة البيانات
- ✅ يحسن الأداء بشكل كبير (أسرع 10x في بعض الحالات)
- ✅ يمنع تجاوز حد الاتصالات
- ✅ يعيد استخدام الاتصالات بكفاءة
- ✅ يحل مشكلة "too many connections"

### 2. راقب الاستخدام
```bash
# فحص عدد الاتصالات النشطة
SELECT count(*) FROM pg_stat_activity;

# فحص الاستعلامات البطيئة
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 3. تحسين الاستعلامات
- استخدم `select` لتحديد الحقول المطلوبة فقط
- استخدم `take` و `skip` للـ pagination
- استخدم indexes على الحقول المستخدمة في البحث

## 🔍 مراقبة الصحة

### Health Check Endpoint
```bash
# فحص صحة قاعدة البيانات
curl https://your-domain.com/api/health/db

# الاستجابة المتوقعة
{
  "status": "healthy",
  "database": {
    "connected": true,
    "responseTime": 45,
    "uptimePercent": 99
  }
}
```

### مؤشرات الأداء
- **Response Time**: < 50ms مع pgBouncer
- **Connection Pool Usage**: < 60%
- **Cache Hit Rate**: > 90%
- **Error Rate**: < 0.1%

## 🛡️ الأمان

1. **لا تضع كلمة المرور في الكود**
2. **استخدم SSL دائماً في الإنتاج**
3. **قم بتدوير كلمات المرور دورياً**
4. **استخدم Row Level Security في Supabase**
5. **راقب محاولات الاتصال المشبوهة**

## 📞 الدعم

في حالة وجود مشاكل:
1. راجع سجلات Supabase
2. تحقق من حالة الخدمة على status.supabase.com
3. راجع الـ health check endpoint
4. تواصل مع دعم Supabase إذا لزم الأمر 