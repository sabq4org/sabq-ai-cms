# نظام إدارة المستخدمين المتقدم - سبق الذكية

## نظرة عامة

تم تطوير نظام إدارة المستخدمين المتقدم ليكون متكاملاً مع مشروع سبق الذكية الحالي، باستخدام نفس قاعدة البيانات والتقنيات الموجودة مع إضافة معايير أمان متقدمة وأفضل الممارسات العالمية.

## الخصائص الرئيسية

### 🔒 الأمان المتقدم
- تشفير كلمات المرور باستخدام bcrypt مع salt rounds عالية (12)
- JWT tokens مع تواقيت انتهاء قصيرة للأمان
- Refresh tokens آمنة مع تشفير في قاعدة البيانات
- حماية من Rate Limiting للحماية من هجمات brute force
- تسجيل شامل للأحداث الأمنية
- تشفير البيانات الحساسة (PII) باستخدام AES-256-GCM

### 👤 إدارة المستخدمين
- تسجيل مستخدمين جدد مع التحقق من البيانات
- تسجيل الدخول والخروج الآمن
- إدارة الجلسات المتعددة
- تحديث الملف الشخصي
- تغيير كلمة المرور مع التحقق من القوة
- إعادة تعيين كلمة المرور عبر البريد الإلكتروني

### 🛡️ الحماية المتقدمة
- كشف النشاط المشبوه
- حظر الحسابات بعد محاولات فاشلة متكررة
- تحليل أنماط الوصول
- حد أقصى للجلسات المتزامنة
- انتهاء صلاحية الجلسات تلقائياً

## هيكل المشروع

```
lib/auth/
├── user-management.ts          # الخدمات الأساسية
├── middleware.ts               # وسطاء المصادقة
└── security-standards.ts       # معايير الأمان المتقدمة

app/api/auth/
├── register/route.ts           # تسجيل المستخدمين
├── login/route.ts              # تسجيل الدخول
├── logout/route.ts             # تسجيل الخروج
├── refresh/route.ts            # تجديد الرموز
├── profile/route.ts            # إدارة الملف الشخصي
├── change-password/route.ts    # تغيير كلمة المرور
└── reset-password/route.ts     # إعادة تعيين كلمة المرور

__tests__/
├── auth/user-management.test.ts # اختبارات الخدمات
└── api/auth.test.ts            # اختبارات APIs
```

## التكامل مع النظام الحالي

النظام مبني للتكامل الكامل مع:
- ✅ نموذج `users` الموجود في Prisma
- ✅ نموذج `RefreshToken` للأمان
- ✅ نموذج `UserSessions` لإدارة الجلسات
- ✅ نموذج `password_reset_tokens` لإعادة التعيين
- ✅ نموذج `activity_logs` للمراقبة

## الاستخدام

### 1. تسجيل مستخدم جديد

```typescript
import { UserManagementService } from '@/lib/auth/user-management';

const result = await UserManagementService.registerUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'اسم المستخدم',
  role: 'user',
  phone: '+966501234567',
  city: 'الرياض',
  country: 'SA',
  interests: ['تقنية', 'أخبار'],
  preferred_language: 'ar'
});
```

### 2. تسجيل الدخول

```typescript
const result = await UserManagementService.loginUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  remember_me: false
}, {
  ip_address: '192.168.1.1',
  user_agent: 'Browser/1.0',
  device_type: 'desktop'
});
```

### 3. استخدام Middleware

```typescript
import { authMiddleware, adminMiddleware } from '@/lib/auth/middleware';

// في API route
export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  
  if (!authResult.success) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
  
  // متابعة المعالجة...
}
```

## APIs المتاحة

### POST `/api/auth/register`
تسجيل مستخدم جديد

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "اسم المستخدم",
  "role": "user",
  "phone": "+966501234567",
  "city": "الرياض"
}
```

### POST `/api/auth/login`
تسجيل الدخول

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

### GET `/api/auth/profile`
الحصول على بيانات المستخدم الحالي

**Headers:**
```
Authorization: Bearer <access_token>
```

### PUT `/api/auth/profile`
تحديث الملف الشخصي

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "name": "اسم جديد",
  "city": "جدة",
  "phone": "+966509876543"
}
```

### POST `/api/auth/change-password`
تغيير كلمة المرور

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!",
  "confirm_password": "NewPass123!"
}
```

### POST `/api/auth/reset-password`
إعادة تعيين كلمة المرور

**لطلب الإعادة:**
```json
{
  "email": "user@example.com"
}
```

**لتأكيد الإعادة:**
```json
{
  "token": "reset_token_here",
  "new_password": "NewPass123!"
}
```

### POST `/api/auth/refresh`
تجديد access token

**Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

### POST `/api/auth/logout`
تسجيل الخروج

**Headers:**
```
Authorization: Bearer <access_token>
```

## معايير الأمان

### كلمات المرور
- حد أدنى 8 أحرف
- يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، رمز خاص
- تشفير باستخدام bcrypt مع 12 salt rounds
- فحص قوة كلمة المرور عند التسجيل

### الجلسات
- انتهاء صلاحية تلقائي بعد 30 دقيقة من عدم النشاط
- حد أقصى 5 جلسات متزامنة لكل مستخدم
- تسجيل جميع أنشطة الجلسة

### الحماية من الهجمات
- Rate limiting: 5 محاولات تسجيل دخول كل 15 دقيقة
- حظر مؤقت للحسابات بعد 10 محاولات فاشلة
- كشف ومنع النشاط المشبوه
- تسجيل شامل للأحداث الأمنية

### تشفير البيانات
- البيانات الحساسة مشفرة باستخدام AES-256-GCM
- مفاتيح التشفير منفصلة ومحمية
- تشفير cookies ومحتوياتها

## الاختبارات

```bash
# تشغيل جميع اختبارات المصادقة
npm test -- __tests__/auth/

# تشغيل اختبارات APIs
npm test -- __tests__/api/auth.test.ts

# تشغيل اختبارات الخدمات
npm test -- __tests__/auth/user-management.test.ts
```

## المراقبة والتحليل

النظام يوفر:
- تسجيل شامل للأحداث الأمنية في `activity_logs`
- تحليل أنماط الوصول المشبوهة
- تنبيهات للأحداث الأمنية الخطيرة
- إحصائيات الجلسات والمستخدمين

## التكوين

قم بإضافة المتغيرات التالية إلى `.env`:

```env
# JWT Security
JWT_SECRET="your-super-secret-jwt-key-min-64-chars"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"

# تشفير البيانات
PII_ENCRYPTION_KEY="your-pii-encryption-key-min-32-chars"

# معايير الأمان
ENABLE_RATE_LIMITING="true"
ENABLE_SECURITY_LOGGING="true"
SESSION_TIMEOUT_MINUTES="30"
MAX_CONCURRENT_SESSIONS="5"
```

## الصيانة

### تنظيف الجلسات المنتهية الصلاحية
```typescript
import { SessionManager } from '@/lib/auth/security-standards';

// يُنصح بتشغيله يومياً
await SessionManager.cleanupExpiredSessions();
```

### مراجعة الأحداث الأمنية
```sql
-- الأحداث الأمنية في آخر 24 ساعة
SELECT * FROM activity_logs 
WHERE entity_type = 'security_event' 
AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## التطوير المستقبلي

- [ ] المصادقة الثنائية (2FA)
- [ ] تسجيل الدخول بوسائل التواصل الاجتماعي
- [ ] إدارة الأذونات المتقدمة (RBAC)
- [ ] تحليل سلوك المستخدم بالذكاء الاصطناعي
- [ ] تكامل مع خدمات أمان خارجية

## الدعم والمساهمة

للاستفسارات أو الإبلاغ عن مشاكل أمنية:
- البريد الإلكتروني: security@sabq.ai
- في حالة الطوارئ الأمنية: فوري عبر القنوات الداخلية

---

**تم تطوير هذا النظام وفقاً لأفضل الممارسات العالمية في الأمان وإدارة المستخدمين.**
