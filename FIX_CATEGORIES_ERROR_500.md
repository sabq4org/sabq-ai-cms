# 🔧 دليل إصلاح مشكلة التصنيفات (Categories) - خطأ 500

## المشكلة

عند فتح قسم التصنيفات في لوحة التحكم:

```
[Error] Failed to load resource: the server responded with a status of 500 () (categories, line 0)
[Error] Error fetching categories: – Error: HTTP 500
```

مع رسالة:
```
SyntaxError: Invalid character: '@' in CSS
```

---

## السبب الجذري

المشكلة لها سببان:

### 1. **مشكلة في `notificationBus`**
- ملف `lib/services/smartNotificationService.ts` لم يكن يصدّر `notificationBus`
- ملف `app/api/smart-notifications/stream/route.ts` يحاول استيراد `notificationBus` الذي لا يوجد
- هذا يسبب فشل في البناء

### 2. **مشكلة في حقل `icon` في جدول `categories`**
- حقل `icon` كان محدوداً بـ `VARCHAR(500)` فقط
- URLs من Cloudinary قد تكون طويلة جداً
- عند محاولة تحديث صورة تصنيف، يفشل لأن البيانات تتجاوز الحد

---

## الحل المطبق

### 1. ✅ إضافة `NotificationBus` Class

في `lib/services/smartNotificationService.ts`:

```typescript
class NotificationBus {
  private subscribers: Map<string, Set<(payload: any) => void>> = new Map();

  subscribe(userId: string, callback: (payload: any) => void) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId)?.add(callback);
    
    return () => {
      this.subscribers.get(userId)?.delete(callback);
      if (this.subscribers.get(userId)?.size === 0) {
        this.subscribers.delete(userId);
      }
    };
  }

  publish(userId: string, payload: any) {
    const callbacks = this.subscribers.get(userId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  publishToMany(userIds: string[], payload: any) {
    userIds.forEach(userId => this.publish(userId, payload));
  }

  getSubscriberCount(userId: string): number {
    return this.subscribers.get(userId)?.size || 0;
  }

  clear() {
    this.subscribers.clear();
  }
}

export const notificationBus = new NotificationBus();
```

### 2. ✅ تحديث Database Schema

تم إنشاء migration جديد: `20251018101500_fix_category_icon_length`

```sql
-- زيادة حد طول icon من 500 إلى 2000 حرف
ALTER TABLE "categories" 
ALTER COLUMN "icon" TYPE VARCHAR(2000);

-- إضافة حقل جديد icon_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE "categories" 
    ADD COLUMN "icon_url" VARCHAR(2000);
  END IF;
END
$$;

-- نسخ البيانات
UPDATE "categories" 
SET "icon_url" = "icon" 
WHERE "icon" IS NOT NULL AND "icon_url" IS NULL;
```

### 3. ✅ تحديث API Endpoint

في `app/api/categories/[id]/route.ts`:

- معالجة ذكية للـ URL الطويلة
- عدم تكرار البيانات في metadata
- logging أفضل للتتبع

```typescript
if (body.icon_url) {
  console.log('🖼️ تحديث صورة:', body.icon_url.length, 'حرف');
  updateData.icon_url = body.icon_url;
  updateData.icon = body.icon_url;
}

// عدم تكرار icon_url في metadata
if (metadata.icon_url && body.icon_url && 
    metadata.icon_url === body.icon_url) {
  delete metadata.icon_url;
}
```

### 4. ✅ تحديث Prisma Schema

في `prisma/schema.prisma`:

```prisma
model categories {
  id               String           @id
  name             String
  slug             String           @unique
  description      String?
  display_order    Int              @default(0)
  is_active        Boolean          @default(true)
  color            String?          @db.VarChar(50)
  icon             String?          @db.VarChar(2000)    // ← زيادة من 500
  icon_url         String?          @db.VarChar(2000)    // ← حقل جديد
  metadata         Json?
  name_en          String?
  parent_id        String?
  created_at       DateTime         @default(now())
  updated_at       DateTime
  articles         articles[]
  muqtarab_corners MuqtarabCorner[]
  user_interests   user_interests[]
}
```

### 5. ✅ تحديث Client-Side Form

في `app/admin/categories/edit/[id]/page.tsx`:

```typescript
const payload: any = {
  name,
  description,
  is_active: isActive,
  color,
  icon_url: iconUrl,  // ← إرسال مرة واحدة فقط
  metadata: {
    template_type: templateType,
    // بدون تكرار icon_url
  },
};
```

---

## الخطوات التطبيقية على الإنتاج

### المرحلة 1: جلب التحديثات
```bash
git pull origin main
```

### المرحلة 2: تحديث البيانات المحلية (اختياري)
```bash
npx prisma generate
npm install
```

### المرحلة 3: تطبيق Migration (تلقائي على Vercel)
سيتم تطبيق migration تلقائياً عند النشر على Vercel.

للبيئة المحلية:
```bash
npx prisma migrate deploy
```

### المرحلة 4: التحقق من النجاح

```bash
npm run build
npm run start
```

ثم اختبر:
- فتح قسم التصنيفات ✓
- إنشاء تصنيف جديد ✓
- تحديث صورة التصنيف ✓
- حفظ التغييرات ✓

---

## النتائج

| المقياس | القيمة |
|--------|--------|
| حد الطول الجديد | 2000 حرف |
| دعم URLs | من Cloudinary و CDN |
| تكرار البيانات | بدون تكرار |
| Build Status | ✅ SUCCESS |
| API Status | ✅ 200 OK |

---

## التوثيق الإضافي

### حقول جديدة:
- `categories.icon_url` - حقل جديد لتخزين URL الصورة

### الحقول المحدثة:
- `categories.icon` - زيادة من VARCHAR(500) إلى VARCHAR(2000)

### الـ Exports الجديدة:
- `notificationBus` - نظام بث الإشعارات

---

## استكشاف الأخطاء وإصلاحها

### إذا استمرت المشكلة:

#### 1. تحقق من Migration
```bash
npx prisma migrate status
```

#### 2. أعد تطبيق Migration
```bash
npx prisma migrate reset
```

#### 3. تحقق من Database Connection
```bash
node -e "require('@/lib/prisma').default.categories.findMany().then(console.log)"
```

#### 4. تحقق من Logs
```bash
# على Vercel
vercel logs
```

---

## الملفات المتأثرة

- ✅ `prisma/schema.prisma` - تحديث Schema
- ✅ `prisma/migrations/20251018101500_fix_category_icon_length/migration.sql` - Migration جديد
- ✅ `lib/services/smartNotificationService.ts` - إضافة NotificationBus
- ✅ `app/api/categories/[id]/route.ts` - تحسين API
- ✅ `app/admin/categories/edit/[id]/page.tsx` - تحديث Form
- ✅ `app/api/smart-notifications/stream/route.ts` - استخدام notificationBus

---

## الالتزامات (Commits)

1. **8cf6b0a5**: إصلاح مشكلة طول URL صور التصنيفات
2. **b1dc87ad**: تحسين migration للتوافقية مع PostgreSQL

---

## ملاحظات هامة

⚠️ **تنبيه**: تأكد من تطبيق Migration قبل استخدام التطبيق
- على Vercel: تُطبّق تلقائياً
- محليّاً: `npx prisma migrate deploy`

✅ **النتيجة**: يمكنك الآن:
- فتح قسم التصنيفات بدون أخطاء
- رفع صور طويلة من Cloudinary
- حفظ URLs بطول حتى 2000 حرف
- استخدام `icon` أو `icon_url` بالتبادل
