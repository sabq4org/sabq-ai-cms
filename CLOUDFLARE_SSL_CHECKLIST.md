# قائمة فحص Cloudflare SSL

## ✅ الإعدادات المطلوبة:

### 1. SSL/TLS > Overview
- [ ] **Full (strict)** - مهم جداً!

### 2. SSL/TLS > Edge Certificates
- [x] Always Use HTTPS: **On**
- [ ] HTTP Strict Transport Security (HSTS): **Enable**
- [ ] Minimum TLS Version: **1.2**
- [ ] Opportunistic Encryption: **On**
- [ ] TLS 1.3: **On**
- [ ] Automatic HTTPS Rewrites: **On**

### 3. SSL/TLS > Origin Server
- [ ] Authenticated Origin Pulls: **On** (اختياري)

### 4. Speed > Optimization
- [ ] Auto Minify: CSS, JS, HTML
- [ ] Brotli: **On**

### 5. Caching > Configuration
- [ ] Caching Level: **Standard**
- [ ] Browser Cache TTL: **4 hours**

## بعد التطبيق:

### مسح Cache في Cloudflare:
1. Caching > Configuration
2. Purge Cache > **Purge Everything**

### مسح Cache في المتصفح:
- Safari: ⌘ + Option + E
- Chrome: ⌘ + Shift + Delete

### اختبار الموقع:
1. افتح في نافذة خاصة/incognito
2. تحقق من القفل الأخضر في شريط العنوان
3. Developer Tools > Console (يجب ألا تكون هناك أخطاء SSL)

## مؤشرات النجاح:
- ✅ لا توجد أخطاء SSL
- ✅ القفل الأخضر يظهر
- ✅ الموقع يحمل بسرعة
- ✅ جميع الموارد تحمل عبر HTTPS
