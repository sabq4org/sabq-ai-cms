# 🚀 AWS Lightsail - الحل الأمثل لمشروع سبق

## 💡 لماذا Lightsail أفضل من Amplify؟
- ✅ خادم Linux كامل (مثل DigitalOcean)
- ✅ يعمل مع Prisma بدون مشاكل
- ✅ سهل جداً في الإعداد
- ✅ نفس شركة Amazon AWS
- ✅ السعر: $20/شهر فقط

## 🔧 خطوات النشر السريع (10 دقائق):

### 1️⃣ **إنشاء Instance جديد:**
1. اذهب إلى: https://lightsail.aws.amazon.com
2. اضغط **Create instance**
3. اختر:
   - **Platform**: Linux/Unix
   - **Blueprint**: Node.js
   - **Plan**: $20/month (2 GB RAM)
   - **Name**: sabq-production

### 2️⃣ **الاتصال بالخادم:**
```bash
# من Lightsail Console، اضغط Connect
# أو استخدم SSH
```

### 3️⃣ **نسخ الأوامر التالية (كلها مرة واحدة):**
```bash
# Clone المشروع
cd ~
git clone -b production-branch https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms

# إنشاء ملف .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms"
NEXTAUTH_SECRET="sabq-ai-cms-secret-key-2025"
NEXTAUTH_URL="http://YOUR-LIGHTSAIL-IP:3000"
NODE_ENV="production"
EOF

# تثبيت المكتبات
npm install

# توليد Prisma
npx prisma generate

# بناء التطبيق
npm run build

# تشغيل مع PM2
npm install -g pm2
pm2 start npm --name "sabq" -- start
pm2 save
pm2 startup
```

### 4️⃣ **فتح Port 3000:**
1. في Lightsail Console
2. اذهب إلى **Networking**
3. أضف Rule: **Custom TCP Port 3000**

### 5️⃣ **ربط Domain (اختياري):**
1. من Route 53 أو مدير النطاقات
2. أضف A Record يشير إلى Lightsail IP

## ✅ النتيجة:
- موقعك يعمل على: `http://YOUR-LIGHTSAIL-IP:3000`
- نفس الأداء مثل DigitalOcean
- لا مشاكل Prisma أبداً!

## 🎯 مميزات إضافية:
- تحديثات سهلة بـ `git pull`
- نسخ احتياطية تلقائية
- مراقبة مجانية
- SSL مجاني مع Let's Encrypt 