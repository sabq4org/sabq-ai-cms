# 🚀 دليل مسح الكاش في الإنتاج

## 🎯 المشكلة
الأخبار الجديدة لا تظهر في الموقع اللايف بسرعة بسبب طبقات الكاش المتعددة.

## ⚡ الحلول الفورية

### 1️⃣ **مسح الكاش فوراً** (أسرع طريقة)
```bash
# من terminal المشروع
npm run clear:production
```

### 2️⃣ **مسح كاش محلي فقط**
```bash
npm run clear:cache
```

### 3️⃣ **مسح عبر API مباشرة**
```bash
curl -X POST https://sabq.io/api/cache/production-clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sabq-cache-clear-2025" \
  -d '{"type": "all", "url": "/"}'
```

### 4️⃣ **إجبار المتصفح على التحديث**
- اضغط `Ctrl + F5` (Windows) أو `Cmd + Shift + R` (Mac)
- أو أضف `?v=123456` في نهاية الرابط

## 📊 الإعدادات الجديدة

### قبل التحديث:
- **API المقالات**: 30 دقيقة
- **صفحات المقالات**: ساعة كاملة
- **الصفحة الرئيسية**: غير محدد

### بعد التحديث:
- **API المقالات**: دقيقة واحدة (60 ثانية)
- **صفحة مقال واحد**: 5 دقائق (300 ثانية)
- **الصفحة الرئيسية**: دقيقتان (120 ثانية)

## 🔧 طبقات الكاش في الإنتاج

### 1. **Redis Cache**
- **المدة**: 60 ثانية
- **المسح**: تلقائي عند النشر + يدوي عبر API

### 2. **Vercel Edge Cache**
- **المدة**: 60 ثانية للـ API
- **المسح**: عبر revalidatePath في API

### 3. **Browser Cache**
- **المدة**: حسب headers
- **المسح**: Ctrl+F5 أو ?v=timestamp

### 4. **CDN Cache (إن وُجد)**
- **Cloudflare**: يتبع Vercel headers
- **المسح**: تلقائي بعد انتهاء المدة

## 🧪 كيفية الاختبار

### 1. اختبار فوري:
```bash
# انشر خبر جديد، ثم مباشرة:
npm run clear:production

# انتظر 10 ثوان ثم تحقق من الموقع
```

### 2. اختبار آمن:
- افتح الموقع في نافذة تصفح خاصة
- اضغط F12 → Network → تفعيل "Disable cache"
- أعد تحميل الصفحة

### 3. اختبار دقيق:
```bash
# تحقق من headers
curl -I https://sabq.io/api/articles

# تحقق من وقت استجابة Redis
curl https://sabq.io/api/health
```

## ⚠️ ملاحظات مهمة

### لا تُستخدم إلا عند الحاجة:
- مسح الكاش يُبطء الموقع مؤقتاً
- استخدمه فقط للأخبار المهمة

### الأخبار العاجلة:
- أضف `"breaking": true` في metadata المقال
- سيظهر خلال 30 ثانية تلقائياً

### إذا لم تنجح الطرق:
1. تأكد أن `CACHE_CLEAR_SECRET` صحيح
2. تحقق من رابط الإنتاج في السكريبت
3. استخدم Developer Tools لفحص Network

## 🛠️ استكشاف الأخطاء

### خطأ "Unauthorized":
```bash
# اضبط token صحيح
export CACHE_CLEAR_SECRET="your-secret-token"
npm run clear:production
```

### خطأ "Connection failed":
```bash
# جرب URLs مختلفة
node scripts/clear-production-cache.js --help
```

### لا يزال الكاش موجود:
```bash
# مسح شامل لكل الطبقات
curl -X POST https://sabq.io/api/cache/production-clear \
  -H "Authorization: Bearer sabq-cache-clear-2025" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

## 📈 النتائج المتوقعة

### فورياً:
- ✅ مسح Redis cache
- ✅ مسح Vercel edge cache  
- ✅ headers منع browser cache

### خلال دقيقة:
- ✅ ظهور الخبر في الصفحة الرئيسية
- ✅ ظهور في قائمة المقالات
- ✅ ظهور في API responses

### خلال 5 دقائق:
- ✅ ظهور في صفحة المقال المفردة
- ✅ تحديث كل طبقات الكاش
- ✅ سرعة طبيعية للموقع

---

**💡 نصيحة**: احفظ هذا الدليل في المرجعيات للاستخدام السريع! 🔖 