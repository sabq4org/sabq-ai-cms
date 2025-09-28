# دليل نشر مشروع سبق الذكية

هذا الدليل يشرح خطوات نشر مشروع سبق الذكية على بيئات مختلفة.

## المتطلبات الأساسية

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- حساب على منصة استضافة (Vercel، AWS، أو أي منصة أخرى)
- مفاتيح API للخدمات المستخدمة (OpenAI، وغيرها)

## خيارات النشر

### 1. النشر على Vercel (موصى به)

Vercel هي المنصة المثالية لتطبيقات Next.js وتوفر تكاملاً سلساً.

#### الخطوات:

1. **إنشاء حساب على Vercel**:
   - قم بالتسجيل على [Vercel](https://vercel.com)
   - قم بربط حسابك على GitHub

2. **استيراد المشروع**:
   - انقر على "Import Project" في لوحة التحكم
   - اختر مستودع `sabq-ai-cms` من GitHub

3. **تكوين المشروع**:
   - أضف متغيرات البيئة المطلوبة:
     ```
     OPENAI_API_KEY=your_openai_api_key
     NEXT_PUBLIC_API_URL=your_api_url
     DATABASE_URL=your_database_connection_string
     ```
   - اختر فرع `main` للنشر

4. **النشر**:
   - انقر على "Deploy"
   - انتظر اكتمال عملية البناء والنشر

5. **تكوين المجال المخصص** (اختياري):
   - انتقل إلى إعدادات المشروع
   - أضف مجالك المخصص (مثل `ai.sabq.org`)
   - اتبع التعليمات لتكوين سجلات DNS

### 2. النشر على AWS

#### الخطوات:

1. **إعداد خدمة AWS Amplify**:
   - قم بتسجيل الدخول إلى وحدة تحكم AWS
   - انتقل إلى خدمة AWS Amplify
   - انقر على "New app" ثم "Host web app"

2. **ربط المستودع**:
   - اختر GitHub كمصدر للمستودع
   - اختر مستودع `sabq-ai-cms`

3. **تكوين البناء**:
   - قم بتعديل ملف `amplify.yml` إذا لزم الأمر:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm ci
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: .next
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```

4. **إضافة متغيرات البيئة**:
   - أضف جميع متغيرات البيئة المطلوبة في إعدادات التطبيق

5. **النشر**:
   - انقر على "Save and deploy"

### 3. النشر على خادم مخصص

#### الخطوات:

1. **إعداد الخادم**:
   - قم بتثبيت Node.js والنسخة المناسبة من npm
   - قم بتثبيت PM2 لإدارة العمليات: `npm install -g pm2`
   - قم بتثبيت Nginx كخادم ويب أمامي

2. **نسخ المشروع إلى الخادم**:
   ```bash
   git clone https://github.com/sabq4org/sabq-ai-cms.git
   cd sabq-ai-cms
   npm install
   ```

3. **إنشاء ملف البيئة**:
   ```bash
   cp .env.example .env
   # قم بتعديل ملف .env بالقيم المناسبة
   ```

4. **بناء المشروع**:
   ```bash
   npm run build
   ```

5. **تشغيل التطبيق باستخدام PM2**:
   ```bash
   pm2 start npm --name "sabq-ai" -- start
   ```

6. **تكوين Nginx**:
   ```nginx
   server {
     listen 80;
     server_name ai.sabq.org;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

7. **تفعيل تكوين Nginx وإعادة تشغيله**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sabq-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **إعداد SSL باستخدام Certbot** (موصى به):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d ai.sabq.org
   ```

## النشر المستمر (CI/CD)

### إعداد GitHub Actions

1. **إنشاء ملف تدفق العمل**:
   - أنشئ ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy Sabq AI CMS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

2. **إضافة الأسرار إلى GitHub**:
   - انتقل إلى إعدادات المستودع > Secrets > Actions
   - أضف الأسرار المطلوبة:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

## تحديث النشر

### تحديث النشر على Vercel

- الدفع إلى فرع `main` سيؤدي تلقائياً إلى إعادة النشر
- يمكنك أيضاً إعادة النشر يدوياً من لوحة تحكم Vercel

### تحديث النشر على خادم مخصص

```bash
cd /path/to/sabq-ai-cms
git pull
npm install
npm run build
pm2 restart sabq-ai
```

## مراقبة الأداء بعد النشر

### إعداد مراقبة الأداء

1. **تكوين New Relic أو Datadog** (اختياري):
   - قم بإنشاء حساب على New Relic أو Datadog
   - اتبع تعليمات التكامل مع تطبيق Next.js

2. **تكوين Sentry لتتبع الأخطاء** (موصى به):
   - قم بإنشاء حساب على [Sentry](https://sentry.io)
   - قم بتثبيت SDK الخاص بـ Sentry:
     ```bash
     npm install @sentry/nextjs
     ```
   - قم بتكوين Sentry في ملفات المشروع

## استكشاف الأخطاء وإصلاحها

### مشاكل شائعة وحلولها

1. **خطأ في بناء المشروع**:
   - تحقق من وجود جميع التبعيات: `npm install`
   - تحقق من توافق إصدارات Node.js و npm

2. **مشاكل في API الذكاء الاصطناعي**:
   - تحقق من صحة مفتاح API
   - تحقق من حدود الاستخدام والرصيد المتبقي

3. **مشاكل الأداء**:
   - قم بتفعيل مكون `PerformanceMonitorEnhanced` للتشخيص
   - استخدم أدوات Chrome DevTools لتحديد نقاط الاختناق

4. **مشاكل التوافق مع المتصفحات**:
   - تحقق من دعم المتصفحات القديمة في ملف `next.config.js`
   - أضف polyfills إذا لزم الأمر

## الأمان والامتثال

### أفضل ممارسات الأمان

1. **حماية نقاط نهاية API**:
   - تأكد من تنفيذ المصادقة والتفويض المناسبين
   - استخدم حدود معدل الطلبات لمنع هجمات DDoS

2. **حماية البيانات**:
   - تشفير البيانات الحساسة في قاعدة البيانات
   - استخدام HTTPS لجميع الاتصالات

3. **تحديثات الأمان**:
   - تحديث التبعيات بانتظام: `npm audit fix`
   - مراقبة تنبيهات الأمان من GitHub

---

للمزيد من المعلومات أو المساعدة، يرجى التواصل مع فريق الدعم الفني على devops@sabq.org.
