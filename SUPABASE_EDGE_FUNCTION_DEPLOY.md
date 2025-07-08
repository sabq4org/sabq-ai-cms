# دليل نشر Supabase Edge Function للتشخيص

## الخطوات:

### 1. تثبيت Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# أو باستخدام npm
npm install -g supabase
```

### 2. تسجيل الدخول إلى Supabase
```bash
supabase login
```

### 3. ربط المشروع
```bash
# احصل على Project ID من Supabase Dashboard
supabase link --project-ref your-project-id
```

### 4. نشر دالة SQL
```bash
# نشر دالة فحص RLS
supabase db push < supabase/sql/check-rls-function.sql
```

### 5. نشر Edge Function
```bash
# نشر الدالة
supabase functions deploy test-auth-db

# أو مع المتغيرات
supabase functions deploy test-auth-db --no-verify-jwt
```

### 6. اختبار Edge Function

#### أ. بدون مصادقة:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/test-auth-db \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key"
```

#### ب. مع مصادقة:
```bash
# احصل على JWT token من تسجيل الدخول
curl -X POST https://your-project.supabase.co/functions/v1/test-auth-db \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token"
```

## تفسير النتائج:

### نتيجة ناجحة:
```json
{
  "timestamp": "2024-01-08T10:00:00Z",
  "environment": {
    "hasUrl": true,
    "hasAnonKey": true,
    "hasServiceKey": true
  },
  "tests": {
    "anonymousAccess": {
      "status": "success",
      "data": [{"id": 1, "name": "أخبار"}],
      "error": null
    },
    "authenticatedAccess": {
      "status": "success",
      "data": {
        "user": "test@example.com",
        "userData": {"id": "123", "email": "test@example.com", "name": "Test User"}
      },
      "error": null
    },
    "serviceRoleAccess": {
      "status": "success",
      "data": {"userCount": 10},
      "error": null
    },
    "rlsCheck": {
      "status": "success",
      "data": [
        {"table_name": "users", "rls_enabled": true, "policy_count": 2},
        {"table_name": "articles", "rls_enabled": true, "policy_count": 3}
      ],
      "error": null
    }
  }
}
```

### نتيجة فاشلة مع RLS:
```json
{
  "tests": {
    "anonymousAccess": {
      "status": "failed",
      "data": null,
      "error": "new row violates row-level security policy for table \"categories\""
    }
  }
}
```

## الحلول بناءً على النتائج:

### 1. إذا فشل `anonymousAccess`:
- تحقق من سياسات RLS على جدول categories
- أضف سياسة للقراءة العامة

### 2. إذا فشل `authenticatedAccess`:
- تحقق من صحة JWT token
- تحقق من سياسات RLS للمستخدمين المصادق عليهم

### 3. إذا فشل `serviceRoleAccess`:
- تحقق من وجود SUPABASE_SERVICE_ROLE_KEY
- تحقق من صلاحيات المفتاح

### 4. إذا كان `rlsCheck` يظهر `rls_enabled: false`:
- قم بتفعيل RLS على الجداول المطلوبة
- أضف السياسات المناسبة

## أوامر مفيدة:

```bash
# عرض سجلات Edge Function
supabase functions logs test-auth-db

# حذف Edge Function
supabase functions delete test-auth-db

# تحديث Edge Function
supabase functions deploy test-auth-db --no-verify-jwt
``` 