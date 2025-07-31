# 📧 دليل إعداد App Password لـ Gmail

## المشكلة
Gmail يرفض تسجيل الدخول مع كلمة المرور العادية لأسباب أمنية ويعطي الخطأ:
```
Username and Password not accepted
```

## الحل: استخدام App Password

### الخطوات:

#### 1. تفعيل التحقق بخطوتين (2-Step Verification)
1. اذهب إلى: https://myaccount.google.com/security
2. ابحث عن "2-Step Verification" أو "التحقق بخطوتين"
3. اتبع التعليمات لتفعيله إذا لم يكن مفعلاً

#### 2. إنشاء App Password
1. اذهب إلى: https://myaccount.google.com/apppasswords
2. سجل الدخول إذا طُلب منك
3. في القائمة المنسدلة، اختر:
   - Select app: "Mail" أو "البريد"
   - Select device: "Other (Custom name)" أو "أخرى"
4. أدخل اسماً مثل "Sabq Email System"
5. انقر على "Generate" أو "إنشاء"
6. **انسخ كلمة المرور المكونة من 16 حرف**

#### 3. تحديث إعدادات المشروع

في ملف `.env.local` أو `.env`:
```env
# إعدادات البريد الإلكتروني
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # استخدم App Password هنا (بدون مسافات)
```

**ملاحظة**: أزل المسافات من App Password عند نسخه

### مثال كامل:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sabq.notifications@gmail.com
SMTP_PASS=abcd1234efgh5678
```

## إعدادات بديلة

### استخدام OAuth2 (أكثر أماناً)
```javascript
// في lib/email-config-fix.ts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.SMTP_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN
  }
});
```

### استخدام خدمات بديلة

#### 1. SendGrid (مجاني حتى 100 رسالة/يوم)
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

#### 2. Mailgun (مجاني حتى 5000 رسالة/شهر)
```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
```

#### 3. Amazon SES (رخيص جداً)
```env
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=xxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
AWS_REGION=us-east-1
```

## اختبار الإعدادات

### 1. سكريبت اختبار بسيط
```bash
npm run test:email
```

### 2. اختبار يدوي
```javascript
// scripts/test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email'
}, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
```

## نصائح أمنية

1. **لا تشارك App Password** أبداً
2. **استخدم متغيرات البيئة** - لا تضع كلمات المرور في الكود مباشرة
3. **قم بإلغاء App Passwords القديمة** عند عدم الحاجة إليها
4. **استخدم بريد إلكتروني منفصل** للإشعارات (ليس بريدك الشخصي)

## استكشاف الأخطاء

### خطأ: "Invalid login"
- تأكد من أن App Password صحيح (16 حرف بدون مسافات)
- تأكد من أن البريد الإلكتروني صحيح

### خطأ: "Connection timeout"
- تحقق من إعدادات الجدار الناري
- جرب استخدام port 465 مع secure: true

### خطأ: "Self signed certificate"
- أضف: `tls: { rejectUnauthorized: false }` (للتطوير فقط!)

## مراجع مفيدة
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail](https://nodemailer.com/usage/using-gmail/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)