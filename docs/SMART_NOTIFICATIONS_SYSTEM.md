# 🔔 نظام الإشعارات الذكية (Smart Notifications System)

## 📋 نظرة عامة

نظام متكامل لإرسال إشعارات ذكية للمستخدمين بناءً على اهتماماتهم وتفضيلاتهم، مع دعم البث المباشر عبر Server-Sent Events (SSE).

---

## 🎯 الميزات الرئيسية

### 1. **أنواع الإشعارات**
- ✅ **خبر جديد** (`ARTICLE_PUBLISHED`) - عند نشر مقال يطابق اهتمامات المستخدم
- ✅ **خبر عاجل** (`ARTICLE_BREAKING`) - أخبار عاجلة لجميع المستخدمين
- ✅ **خبر مميز** (`ARTICLE_FEATURED`) - مقالات مميزة
- ✅ **يزداد نقاشه** (`COMMENTS_SPIKE`) - مقالات تتزايد تعليقاتها
- ✅ **الأكثر تداولاً** (`READS_TOP`) - مقالات ضمن الأكثر قراءة
- ✅ **رد على تعليق** (`USER_REPLY`) - ردود على تعليقات المستخدم
- ✅ **إعلان نظام** (`SYSTEM_ANNOUNCEMENT`) - إعلانات إدارية

### 2. **نظام الأولويات**
```typescript
enum NotificationPriority {
  HIGH    // عاجل/مهم - لون أحمر + Toast
  MEDIUM  // عادي - ألوان متنوعة
  LOW     // منخفض - ألوان هادئة
}
```

### 3. **التخصيص الذكي**
- ✅ **توجيه بالاهتمامات** - إرسال للمستخدمين المهتمين فقط
- ✅ **منع التكرار** (Deduplication) - لا إرسال مكرر خلال 60 دقيقة
- ✅ **التحكم في المعدل** (Throttling) - حد أقصى 8 إشعارات/ساعة
- ✅ **تفضيلات المستخدم** - تمكين/تعطيل لكل نوع

### 4. **البث المباشر**
- ✅ **Server-Sent Events (SSE)** - إشعارات فورية بدون تحديث
- ✅ **إعادة الاتصال التلقائي** - في حالة انقطاع الاتصال
- ✅ **Heartbeat** - للحفاظ على الاتصال نشطاً

---

## 🗄️ قاعدة البيانات

### النماذج (Prisma Models)

#### 1. `Notification`
```prisma
model Notification {
  id          String               @id @default(cuid())
  userId      String
  type        NotificationType
  title       String               @db.VarChar(200)
  body        String               @db.VarChar(400)
  link        String               @db.VarChar(300)
  icon        String               @db.VarChar(40)
  color       String               @db.VarChar(24)
  priority    NotificationPriority
  metadata    Json?
  isRead      Boolean              @default(false)
  createdAt   DateTime             @default(now())
  
  user        users                @relation(fields: [userId], references: [id])
}
```

#### 2. `UserNotificationPreference`
```prisma
model UserNotificationPreference {
  userId            String   @unique
  articlePublished  Boolean  @default(true)
  articleBreaking   Boolean  @default(true)
  articleFeatured   Boolean  @default(true)
  commentsSpike     Boolean  @default(true)
  readsTop          Boolean  @default(true)
  userReply         Boolean  @default(true)
  throttlePerHour   Int      @default(8)
  enableToast       Boolean  @default(true)
  enableSound       Boolean  @default(false)
}
```

#### 3. `NotificationDedup`
```prisma
model NotificationDedup {
  userId      String
  type        String
  resourceId  String
  sentAt      DateTime @default(now())
  expiresAt   DateTime
  
  @@unique([userId, type, resourceId])
}
```

---

## 🔧 API Endpoints

### 1. جلب الإشعارات
```http
GET /api/smart-notifications?limit=30&unreadOnly=false
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "type": "ARTICLE_BREAKING",
      "title": "خبر عاجل",
      "body": "عاجل في السياسة: ...",
      "link": "/article/breaking-news",
      "icon": "flash",
      "color": "red",
      "priority": "HIGH",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. عدد غير المقروءة
```http
GET /api/smart-notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

### 3. تعليم كمقروء
```http
PATCH /api/smart-notifications/[id]/read
```

**Response:** `204 No Content`

### 4. تعليم الكل كمقروء
```http
POST /api/smart-notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

### 5. البث المباشر (SSE)
```http
GET /api/smart-notifications/stream
```

**Events:**
```
event: notify
data: {"id":"clx...","type":"ARTICLE_BREAKING",...}
```

---

## 💻 الاستخدام

### في الخادم (Server-Side)

#### إرسال إشعار عند نشر مقال
```typescript
import { getSmartNotificationService } from '@/lib/services/smartNotificationService';

const service = getSmartNotificationService();

// عند نشر مقال عادي
await service.notifyArticlePublished({
  id: article.id,
  title: article.title,
  slug: article.slug,
  categoryId: article.categoryId,
  categoryName: article.categoryName,
  tags: article.tags
});

// عند نشر خبر عاجل
if (article.isBreaking) {
  await service.notifyArticleBreaking({
    id: article.id,
    title: article.title,
    slug: article.slug,
    categoryName: article.categoryName
  });
}

// عند تمييز مقال
if (article.isFeatured) {
  await service.notifyArticleFeatured({
    id: article.id,
    title: article.title,
    slug: article.slug,
    categoryId: article.categoryId,
    tags: article.tags
  });
}
```

#### إرسال إشعار مخصص
```typescript
await service.sendNotification({
  userId: 'user-123',
  type: 'ARTICLE_PUBLISHED',
  title: 'خبر جديد',
  body: 'نُشر قبل قليل في الرياضة: الهلال يفوز بالدوري',
  link: '/article/alhilal-wins',
  icon: 'bell',
  color: 'sky',
  priority: 'MEDIUM',
  resourceId: 'article-456',
  metadata: {
    articleId: 'article-456',
    categoryId: 'sports'
  }
});
```

### في العميل (Client-Side)

#### استخدام Hook
```typescript
'use client';

import { useSmartNotifications } from '@/hooks/useSmartNotifications';

export default function Header() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useSmartNotifications();

  return (
    <SmartNotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      isConnected={isConnected}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
    />
  );
}
```

---

## 🎨 التصميم والألوان

### خريطة الأيقونات
```typescript
const ICON_MAP = {
  flash: Zap,           // ⚡ عاجل
  star: Star,           // ⭐ مميز
  'message-circle': MessageCircle, // 💬 تعليقات
  flame: Flame,         // 🔥 الأكثر قراءة
  reply: Reply,         // ↩️ رد
  bell: Bell            // 🔔 عام
};
```

### خريطة الألوان
```typescript
const COLOR_MAP = {
  red: 'text-red-600 bg-red-50',       // عاجل
  amber: 'text-amber-600 bg-amber-50', // تعليقات
  violet: 'text-violet-600 bg-violet-50', // مميز
  sky: 'text-sky-600 bg-sky-50',       // عادي
  emerald: 'text-emerald-600 bg-emerald-50', // رد
  orange: 'text-orange-600 bg-orange-50'  // الأكثر قراءة
};
```

---

## 🔄 سير العمل (Workflow)

### 1. نشر مقال جديد
```
1. المحرر ينشر مقال
   ↓
2. Webhook يستدعي notifyArticlePublished()
   ↓
3. الخدمة تجلب المستخدمين المهتمين
   ↓
4. لكل مستخدم:
   - التحقق من التفضيلات ✓
   - التحقق من التكرار ✓
   - التحقق من الحد الأقصى ✓
   - حفظ في DB ✓
   - بث عبر SSE ✓
```

### 2. استقبال إشعار في المتصفح
```
1. EventSource متصل بـ /api/smart-notifications/stream
   ↓
2. عند وصول event: notify
   ↓
3. تحديث قائمة الإشعارات
   ↓
4. تحديث Badge العدد
   ↓
5. عرض Toast (اختياري)
```

---

## 📊 الإحصائيات والمراقبة

### عدد الاتصالات النشطة
```typescript
import { notificationBus } from '@/lib/services/smartNotificationService';

const activeConnections = notificationBus.getActiveConnections();
console.log(`🔌 ${activeConnections} مستخدم متصل`);
```

### تنظيف السجلات المنتهية
```typescript
const service = getSmartNotificationService();
const cleaned = await service.cleanupExpiredDedup();
console.log(`🧹 تم حذف ${cleaned} سجل منتهي`);
```

---

## 🧪 الاختبار

### حالات الاختبار الأساسية

1. ✅ **نشر خبر عادي** - يصل للمهتمين فقط
2. ✅ **نشر خبر عاجل** - يصل لجميع المستخدمين النشطين
3. ✅ **منع التكرار** - لا إرسال مكرر خلال 60 دقيقة
4. ✅ **التحكم في المعدل** - لا تجاوز 8 إشعارات/ساعة
5. ✅ **SSE** - إشعار يصل خلال ≤2 ثانية
6. ✅ **تعليم كمقروء** - يحدث Badge العدد
7. ✅ **RTL** - النصوص عربية والتوجيه صحيح

### سكربت اختبار
```bash
# تشغيل migrations
npx prisma migrate dev --name add_smart_notifications

# اختبار API
curl -X GET http://localhost:3000/api/smart-notifications \
  -H "Cookie: auth-token=..."

# اختبار SSE
curl -N http://localhost:3000/api/smart-notifications/stream \
  -H "Cookie: auth-token=..."
```

---

## 🚀 النشر

### 1. تطبيق Migrations
```bash
npx prisma migrate deploy
```

### 2. إعادة توليد Prisma Client
```bash
npx prisma generate
```

### 3. إعادة تشغيل الخادم
```bash
npm run build
npm start
```

---

## 📈 التحسينات المستقبلية

### المرحلة 2
- [ ] دعم Web Push Notifications
- [ ] دعم الإشعارات الصوتية
- [ ] تجميع الإشعارات المتشابهة
- [ ] إحصائيات متقدمة

### المرحلة 3
- [ ] Machine Learning للتخصيص
- [ ] A/B Testing للرسائل
- [ ] تحليلات التفاعل
- [ ] API عام للمطورين

---

## 🔒 الأمان

- ✅ **المصادقة** - جميع endpoints محمية
- ✅ **التفويض** - المستخدم يرى إشعاراته فقط
- ✅ **Rate Limiting** - حماية من الإساءة
- ✅ **Validation** - التحقق من جميع المدخلات
- ✅ **SQL Injection** - Prisma يحمي تلقائياً

---

## 📞 الدعم

للأسئلة أو المشاكل:
- 📧 Email: dev@sabq.io
- 💬 Slack: #notifications-support
- 📚 Docs: https://docs.sabq.io/notifications

---

## 📝 الترخيص

© 2024 SABQ - جميع الحقوق محفوظة

