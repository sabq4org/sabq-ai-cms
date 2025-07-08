# دليل حل مشاكل Supabase RLS و JWT في الإنتاج

## المشكلة
- التسجيل يعمل ✅ (لأنه لا يتطلب مصادقة)
- تسجيل الدخول لا يعمل ❌
- جلب البيانات لا يعمل ❌
- الخطأ: "FATAL: Tenant or user not found"

## السبب الجذري
المشكلة تكمن في أن Supabase يستخدم Row Level Security (RLS) وهناك عدم تطابق بين:
1. كيفية إرسال JWT tokens في الإنتاج
2. كيفية تقييم سياسات RLS في بيئة الإنتاج

## الحلول

### 1. التحقق من سياسات RLS في Supabase

اذهب إلى Supabase Dashboard > SQL Editor وشغل:

```sql
-- عرض جميع سياسات RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- التحقق من حالة RLS للجداول
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. إضافة سياسات RLS الصحيحة

```sql
-- تعطيل RLS مؤقتاً للاختبار (غير موصى به للإنتاج)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- أو إضافة سياسات صحيحة
-- سياسة للمستخدمين
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- سياسة للمقالات
CREATE POLICY "Anyone can view published articles" ON articles
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can manage own articles" ON articles
    FOR ALL USING (author_id = auth.uid()::text);

-- سياسة للتصنيفات
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);
```

### 3. تحديث Supabase Client في المشروع

أنشئ ملف `lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// للعميل (Client-side)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// للخادم (Server-side)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // مفتاح الخدمة يتجاوز RLS
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// دالة مساعدة لإنشاء عميل مع JWT
export function createServerSupabaseClient(jwt?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : ''
        }
      }
    }
  );
}
```

### 4. تحديث API Routes لاستخدام Supabase

#### أ. تحديث `app/api/auth/login/route.ts`:

```typescript
import { supabase } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // استخدام Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // جلب بيانات المستخدم الإضافية
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'خطأ في جلب بيانات المستخدم' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      session: authData.session
    });

    // حفظ الجلسة في الكوكيز
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });

      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}
```

#### ب. تحديث `app/api/categories/route.ts`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // الحصول على JWT من الكوكيز أو الهيدر
    const token = request.cookies.get('sb-access-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // إنشاء عميل Supabase مع JWT
    const supabase = createServerSupabaseClient(token);

    // جلب التصنيفات
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Categories fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: data || []
    });
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب التصنيفات' },
      { status: 500 }
    );
  }
}
```

### 5. إضافة Middleware للمصادقة

أنشئ `middleware.ts` في جذر المشروع:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

export async function middleware(request: NextRequest) {
  // معالجة CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // للمسارات المحمية
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // التحقق من صحة التوكن
    const supabase = createServerSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

### 6. متغيرات البيئة المطلوبة

تأكد من وجود هذه المتغيرات في DigitalOcean:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # للعمليات الإدارية

# قاعدة البيانات (للـ Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1

# Direct connection (بدون pooling)
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

### 7. تحديث Prisma Schema

في `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // للمايجريشن
}
```

### 8. سكريبت اختبار Supabase

أنشئ `scripts/test-supabase-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 اختبار اتصال Supabase...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ متغيرات Supabase مفقودة!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // اختبار جلب التصنيفات
  console.log('📊 اختبار جلب التصنيفات...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (catError) {
    console.error('❌ خطأ:', catError.message);
  } else {
    console.log(`✅ تم جلب ${categories.length} تصنيف`);
  }

  // اختبار المصادقة
  console.log('\n🔐 اختبار المصادقة...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword'
  });

  if (authError) {
    console.error('❌ خطأ في المصادقة:', authError.message);
  } else {
    console.log('✅ تسجيل الدخول نجح');
    console.log('User ID:', authData.user?.id);
  }
}

testSupabaseConnection().catch(console.error);
```

## الخطوات التالية

1. **قم بتطبيق التغييرات المذكورة أعلاه**
2. **اختبر محلياً أولاً**
3. **ارفع التغييرات وانشر على DigitalOcean**
4. **راقب السجلات بعناية**

## نصائح إضافية

- استخدم Supabase Dashboard لمراقبة الطلبات
- تحقق من Auth Logs في Supabase
- استخدم Database Logs لتتبع استعلامات SQL
- فعّل Query Performance في Supabase لتحليل الأداء 