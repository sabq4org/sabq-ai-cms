# حلول مشاكل SSL

## 1. للتطوير المحلي

### استخدم HTTP بدلاً من HTTPS:
```bash
npm run dev
# افتح http://localhost:3000
```

### أو أضف استثناء في المتصفح:
1. في Safari: 
   - افتح https://localhost:3000
   - اضغط "Show Details" > "visit this website"
   
2. في Chrome:
   - اكتب: thisisunsafe
   - أو اضغط Advanced > Proceed to localhost

## 2. لبيئة الإنتاج

### في Vercel:
1. تحقق من Domain Settings
2. تأكد من تفعيل "Force HTTPS"
3. تحقق من صحة شهادة SSL

### في إعدادات المشروع:
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

## 3. تعطيل فحص SSL مؤقتاً (للتطوير فقط!)

### في .env.local:
```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### أو عند تشغيل التطبيق:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

## 4. مسح ذاكرة التخزين المؤقت

### في Safari:
- Develop > Empty Caches
- أو: ⌘ + Option + E

### في Chrome:
- Developer Tools > Application > Clear Storage

## 5. التحقق من إعدادات CSP

تأكد من أن Content Security Policy لا يحجب الموارد:

```javascript
// middleware.ts
const csp = [
  "default-src 'self' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  // ...
];
```

## 6. للإنتاج - تحقق من Cloudflare

إذا كنت تستخدم Cloudflare:
1. SSL/TLS > Overview > Full (strict)
2. SSL/TLS > Edge Certificates > Always Use HTTPS: On
3. SSL/TLS > Edge Certificates > Minimum TLS Version: 1.2

## الحل الموصى به:

للتطوير: استخدم **HTTP** العادي
```bash
npm run dev
# http://localhost:3000
```

للإنتاج: تأكد من إعدادات SSL في Vercel/Cloudflare
