# إعداد الذكاء الاصطناعي في بيئة الإنتاج 🚀

## 1. Vercel (الأكثر شيوعاً)

### عبر لوحة التحكم:
1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع `sabq-ai-cms`
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف متغير جديد:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-openai-api-key-here`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

### عبر Vercel CLI:
```bash
# تسجيل دخول
npx vercel login

# إضافة المتغير
npx vercel env add OPENAI_API_KEY production
# ستطلب منك كتابة المفتاح

# إعادة نشر
npx vercel --prod
```

---

## 2. Netlify

### عبر لوحة التحكم:
1. اذهب إلى: https://app.netlify.com
2. اختر المشروع
3. اذهب إلى **Site Settings** → **Environment Variables**
4. **Add variable**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-openai-api-key-here`

### عبر Netlify CLI:
```bash
# تسجيل دخول
npx netlify login

# إضافة المتغير
npx netlify env:set OPENAI_API_KEY "sk-proj-your-actual-openai-api-key-here"

# إعادة نشر
npx netlify deploy --prod
```

---

## 3. Railway

### عبر لوحة التحكم:
1. اذهب إلى: https://railway.app
2. اختر المشروع
3. اذهب إلى **Variables** tab
4. **Add Variable**:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-openai-api-key-here`

---

## 4. DigitalOcean App Platform

### عبر لوحة التحكم:
1. اذهب إلى: https://cloud.digitalocean.com/apps
2. اختر التطبيق
3. اذهب إلى **Settings** → **Environment Variables**
4. **Add Variable**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-openai-api-key-here`
   - **Scope**: All Components

---

## 5. AWS Amplify

### عبر لوحة التحكم:
1. اذهب إلى: AWS Console → Amplify
2. اختر التطبيق
3. اذهب إلى **Environment Variables**
4. **Add variable**:
   - **Variable**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-openai-api-key-here`

---

## 6. Heroku

### عبر Heroku CLI:
```bash
# تسجيل دخول
heroku login

# إضافة المتغير
heroku config:set OPENAI_API_KEY="sk-proj-your-actual-openai-api-key-here" -a your-app-name

# التحقق
heroku config -a your-app-name
```

---

## 7. Docker/Kubernetes

### Docker Compose:
```yaml
# docker-compose.yml
services:
  sabq-ai-cms:
    build: .
    environment:
      - OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
      - NODE_ENV=production
    ports:
      - "3000:3000"
```

### Kubernetes Secret:
```bash
# إنشاء secret
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="sk-proj-your-actual-openai-api-key-here"

# في deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: sabq-ai-cms
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: OPENAI_API_KEY
```

---

## ✅ التحقق من نجاح الإعداد

بعد إضافة المتغير في الإنتاج، تحقق من عمل الذكاء الاصطناعي:

1. **افتح الموقع في الإنتاج**
2. **اذهب إلى أي مقال** 
3. **ابحث عن بلوك "🤖 مخصص لك بذكاء"**
4. **انتظر التحميل** (5-10 ثواني)
5. **تحقق من وجود توصيات حقيقية**

### علامات النجاح:
- ✅ توصيات من مقالات حقيقية (ليس "لم نتمكن...")
- ✅ أسباب ذكية مثل: "مقال مترابط"، "تحليل مشابه"
- ✅ نسبة ثقة عالية (85%+)
- ✅ زمن استجابة سريع

---

## 🔧 نصائح للإنتاج

### 1. أمان API Key:
```bash
# لا تضع المفتاح في الكود أبداً ❌
const apiKey = "sk-proj-xxx"; // خطر!

# استخدم متغيرات البيئة دائماً ✅
const apiKey = process.env.OPENAI_API_KEY;
```

### 2. تحديد الحدود:
```javascript
// في API route
const usage = completion.usage?.total_tokens || 0;
if (usage > 2000) {
  console.warn(`High token usage: ${usage}`);
}
```

### 3. مراقبة التكلفة:
- راقب الاستخدام في: https://platform.openai.com/usage
- ضع حد أقصى للشهر ($50-100)
- فعّل تنبيهات البريد الإلكتروني

### 4. نسخ احتياطية:
- النظام يعمل حتى لو فشل OpenAI
- يعود تلقائياً للخوارزمية التقليدية
- لا توجد أخطاء للمستخدم النهائي

---

## 📞 الدعم

إذا واجهت مشاكل:
1. **تحقق من logs الإنتاج**
2. **اختبر المفتاح محلياً أولاً**  
3. **تأكد من وجود رصيد في OpenAI**
4. **راجع حالة خوادم OpenAI**: https://status.openai.com

---

💡 **نصيحة**: ابدأ بـ $20 في OpenAI وراقب الاستخدام لأول شهر، ثم اضبط الحد حسب الحاجة.
