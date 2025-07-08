# حل مشكلة المصادقة - المستخدمون في جدول مخصص

## المشكلة:
- لديك 0 مستخدمين في `auth.users` (Supabase Auth)
- لديك 11 مستخدم في `public.users` (جدولك المخصص)
- تسجيل الدخول يستخدم Supabase Auth الذي لا يجد المستخدمين

## الحلول:

### الحل السريع: السماح للمستخدمين بإعادة التسجيل

1. **أخبر المستخدمين الحاليين بإعادة التسجيل** باستخدام نفس البريد الإلكتروني
2. **سيتم إنشاء حساباتهم في Supabase Auth**
3. **أضف trigger لمزامنة البيانات**

```sql
-- إنشاء trigger لمزامنة المستخدمين الجدد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- تحديث المستخدم الموجود أو إنشاء جديد
  INSERT INTO public.users (id, email, name, created_at, updated_at, is_verified)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now(),
    now(),
    new.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (email) DO UPDATE SET
    id = new.id::text,
    is_verified = new.email_confirmed_at IS NOT NULL,
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- trigger للتحديث
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    email = new.email,
    is_verified = new.email_confirmed_at IS NOT NULL,
    updated_at = now()
  WHERE id = new.id::text;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_updated();
```

### الحل المؤقت: تعطيل التحقق من Supabase Auth

في ملف `app/api/auth/login/route.ts`، يمكنك مؤقتاً:

```typescript
// بدلاً من استخدام Supabase Auth
// استخدم Prisma مباشرة للتحقق من المستخدم

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // البحث في جدول users مباشرة
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (!user || !user.password_hash) {
    return NextResponse.json(
      { success: false, error: 'بيانات الدخول غير صحيحة' },
      { status: 401 }
    );
  }
  
  // التحقق من كلمة المرور
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'بيانات الدخول غير صحيحة' },
      { status: 401 }
    );
  }
  
  // إنشاء JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  // ... باقي الكود
}
```

### الحل الدائم: استيراد المستخدمين إلى Supabase Auth

هذا يتطلب:
1. إنشاء مستخدمين جدد في Supabase Auth
2. إرسال رابط إعادة تعيين كلمة المرور لكل مستخدم
3. تحديث الكود لاستخدام Supabase Auth

```javascript
// سكريبت لاستيراد المستخدمين
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // مفتاح الخدمة
);

async function importUsers() {
  // جلب المستخدمين من جدول users
  const users = await prisma.users.findMany();
  
  for (const user of users) {
    try {
      // إنشاء مستخدم في Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          imported_at: new Date().toISOString()
        }
      });
      
      if (error) {
        console.error(`خطأ في استيراد ${user.email}:`, error);
      } else {
        console.log(`✅ تم استيراد ${user.email}`);
        
        // إرسال رابط إعادة تعيين كلمة المرور
        await supabase.auth.resetPasswordForEmail(user.email);
      }
    } catch (err) {
      console.error(`خطأ:`, err);
    }
  }
}
```

## التوصية:

1. **للحل السريع**: استخدم الحل المؤقت (تعديل كود تسجيل الدخول)
2. **للحل طويل المدى**: اطلب من المستخدمين إعادة التسجيل أو استورد المستخدمين

## الخطوات التالية:

1. شغّل أوامر SQL لإنشاء triggers
2. اختر أحد الحلول المناسبة لوضعك
3. اختبر تسجيل مستخدم جديد للتأكد من أن المزامنة تعمل 