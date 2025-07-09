# حل مشكلة متغيرات البيئة في Vercel

## المشكلة
```
Error: supabaseUrl is required.
```

## الحل

### 1. تحديث ملفات API
تم تحديث جميع ملفات API لاستخدام ملف مركزي للتعامل مع Supabase:

```typescript
// قبل
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// بعد
import { getSupabaseClient } from '@/lib/supabase';
const supabase = getSupabaseClient();
```

### 2. إنشاء ملف Supabase المركزي
تم إنشاء ملف `/lib/supabase.ts` للتعامل مع حالات عدم وجود متغيرات البيئة.

### 3. إضافة متغيرات البيئة في Vercel

يجب إضافة المتغيرات التالية في إعدادات المشروع في Vercel:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع sabq-ai-cms
3. اذهب إلى Settings > Environment Variables
4. أضف المتغيرات التالية:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### 4. إعادة النشر
بعد إضافة المتغيرات، قم بإعادة نشر المشروع:

```bash
git add .
git commit -m "Fix Supabase environment variables for Vercel"
git push origin main && git push sabq-cms main
```

### 5. التحقق من النشر
- تحقق من سجلات البناء في Vercel
- تأكد من عدم وجود أخطاء متعلقة بمتغيرات البيئة

## ملاحظات مهمة
- المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` متاحة في المتصفح
- المتغيرات الأخرى متاحة فقط في الخادم
- تأكد من عدم مشاركة المتغيرات الحساسة في Git 