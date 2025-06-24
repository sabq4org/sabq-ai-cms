# دليل البناء مع إعدادات البريد الإلكتروني الصحيحة

## المشكلة
عند تشغيل `npm run build`، يحاول النظام استخدام Gmail SMTP بدلاً من خادم mail.jur3a.ai المطلوب.

## الحل

### 1. تعيين متغيرات البيئة قبل البناء

#### الطريقة الأولى: استخدام السكريبت المساعد
```bash
source scripts/set-email-env.sh
npm run build
```

#### الطريقة الثانية: تعيين المتغيرات يدوياً
```bash
export SMTP_HOST="mail.jur3a.ai"
export SMTP_PORT="465"
export SMTP_USER="noreplay@jur3a.ai"
export SMTP_PASS="oFWD[H,A8~8;iw7("
export SMTP_FROM_EMAIL="noreplay@jur3a.ai"
export SMTP_FROM_NAME="منصة جُرعة"
export SMTP_SECURE="true"
export EMAIL_DEBUG="false"

npm run build
```

#### الطريقة الثالثة: البناء مع المتغيرات مباشرة
```bash
SMTP_HOST=mail.jur3a.ai \
SMTP_PORT=465 \
SMTP_USER=noreplay@jur3a.ai \
SMTP_PASS="oFWD[H,A8~8;iw7(" \
SMTP_FROM_EMAIL=noreplay@jur3a.ai \
SMTP_FROM_NAME="منصة جُرعة" \
npm run build
```

### 2. إنشاء ملف .env.production.local
أنشئ ملف `.env.production.local` في جذر المشروع:

```env
# إعدادات البريد الإلكتروني
SMTP_HOST=mail.jur3a.ai
SMTP_PORT=465
SMTP_USER=noreplay@jur3a.ai
SMTP_PASS=oFWD[H,A8~8;iw7(
SMTP_FROM_EMAIL=noreplay@jur3a.ai
SMTP_FROM_NAME=منصة جُرعة
SMTP_SECURE=true
EMAIL_DEBUG=false
```

### 3. التحقق من البناء الناجح
بعد البناء الناجح، يجب أن ترى في السجلات:
```
📧 إعدادات البريد المصححة: {
  host: 'mail.jur3a.ai',
  port: 465,
  secure: true,
  requireTLS: false,
  user: 'noreplay@jur3a.ai'
}
```

## معلومات خادم البريد

### الخادم الصادر (SMTP)
- **الخادم**: mail.jur3a.ai
- **المنفذ**: 465 (SSL/TLS)
- **الأمان**: SSL/TLS
- **المستخدم**: noreplay@jur3a.ai
- **كلمة المرور**: oFWD[H,A8~8;iw7(

### الخادم الوارد (للمعلومات فقط)
- **IMAP**: mail.jur3a.ai:993 (SSL)
- **POP3**: mail.jur3a.ai:995 (SSL)

## استكشاف الأخطاء

### إذا ظهر خطأ "Invalid login"
1. تأكد من صحة كلمة المرور
2. تأكد من أن الخادم يسمح بالاتصالات من عنوان IP الخاص بك
3. تحقق من عدم وجود جدار حماية يحجب المنفذ 465

### إذا استمر استخدام Gmail
1. تأكد من عدم وجود متغيرات بيئة محلية تتجاوز الإعدادات
2. امسح مجلد `.next` وأعد البناء:
   ```bash
   rm -rf .next
   source scripts/set-email-env.sh
   npm run build
   ```

## نصائح للإنتاج

1. **استخدم متغيرات البيئة**: لا تضع كلمة المرور مباشرة في الكود
2. **أمان الخادم**: تأكد من تفعيل SSL/TLS دائماً
3. **المراقبة**: راقب سجلات البريد للتأكد من عمل النظام بشكل صحيح 