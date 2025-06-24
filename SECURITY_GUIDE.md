# دليل الأمان - نظام سبق الإخباري

## 🔐 نظام الحماية الجديد

تم تطبيق نظام حماية شامل لحماية لوحة التحكم والمسارات الحساسة.

### 1. Middleware Protection

تم إضافة `middleware.ts` لحماية:
- جميع مسارات `/dashboard/*`
- جميع مسارات API الحساسة
- التحقق من صلاحيات المدير للصفحات الخاصة

### 2. نظام المصادقة

#### الكوكيز الآمنة:
- **user cookie**: معلومات المستخدم (httpOnly, secure, sameSite: strict)
- **auth-token cookie**: JWT token للمصادقة

#### JWT Token:
- مدة الصلاحية: 7 أيام
- يحتوي على: id, email, role, is_admin
- يتطلب JWT_SECRET في متغيرات البيئة

### 3. المسارات المحمية

#### مسارات المدراء فقط:
```
/dashboard/users
/dashboard/roles
/dashboard/team
/dashboard/console
/dashboard/system
/dashboard/analytics
```

#### مسارات تتطلب تسجيل دخول:
```
/dashboard/*
/api/users/*
/api/roles/*
/api/team-members/*
/api/templates/* (عدا active-header)
/api/analytics/*
```

### 4. Security Headers

تم إضافة headers أمنية:
- `X-Frame-Options: DENY` - منع Clickjacking
- `X-Content-Type-Options: nosniff` - منع MIME sniffing
- `X-XSS-Protection: 1; mode=block` - حماية XSS
- `Content-Security-Policy` - سياسة أمان المحتوى

### 5. إعداد متغيرات البيئة

أنشئ ملف `.env.local` وأضف:

```env
# JWT Secret - مهم جداً!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Environment
NODE_ENV=production
```

### 6. تسجيل الدخول والخروج

#### تسجيل الدخول:
- POST `/api/auth/login`
- يتطلب: email, password
- يعيد: user data + يضع cookies

#### تسجيل الخروج:
- POST `/api/auth/logout`
- يحذف جميع cookies المصادقة

### 7. نصائح أمنية إضافية

1. **تغيير JWT_SECRET**: استخدم مفتاح قوي وعشوائي
2. **HTTPS**: تأكد من استخدام HTTPS في الإنتاج
3. **تحديث المكتبات**: حدث المكتبات بانتظام
4. **مراجعة الصلاحيات**: راجع صلاحيات المستخدمين دورياً
5. **نسخ احتياطية**: احتفظ بنسخ احتياطية منتظمة

### 8. اختبار النظام

1. حاول الوصول لـ `/dashboard` بدون تسجيل دخول
2. يجب أن يتم توجيهك لصفحة تسجيل الدخول
3. بعد تسجيل الدخول، ستعود للصفحة المطلوبة

### 9. معالجة المشاكل

إذا واجهت مشاكل:
1. تأكد من وجود JWT_SECRET في `.env.local`
2. امسح cookies المتصفح وأعد تسجيل الدخول
3. تأكد من صلاحيات المستخدم في `data/users.json`

## 🚨 تحذير مهم

**لا تشارك أبداً**:
- JWT_SECRET
- كلمات المرور
- API Keys
- ملفات .env

احم هذه المعلومات بعناية فائقة! 