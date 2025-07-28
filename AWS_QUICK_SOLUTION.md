# 🚀 الحل السريع والمضمون على AWS

## الخيار 1: **AWS Lightsail في 15 دقيقة** ✅

### خطوات سريعة:
```bash
# 1. إنشاء Lightsail instance ($10/شهر)
# 2. SSH إلى السيرفر
# 3. نفذ هذه الأوامر:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
npm install -g pm2

git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms
npm install

# إنشاء .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=http://YOUR-IP:3000
EOF

npm run build
pm2 start npm --name sabq -- start
```

**✅ خلال 15 دقيقة سيعمل الموقع!**

## الخيار 2: **استخدم قاعدة بيانات Supabase** 🔄

### المشكلة الحقيقية:
Amplify + Prisma + RDS = مشاكل كثيرة

### الحل:
1. انقل البيانات إلى **Supabase** (مجاني)
2. Supabase يعطيك:
   - Connection string يعمل مع Amplify
   - Connection pooling مدمج
   - REST API جاهز

### خطوات النقل:
```bash
# 1. إنشاء حساب Supabase
# 2. إنشاء مشروع جديد
# 3. استخدم Migration tool:

pg_dump postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms > backup.sql

# رفع إلى Supabase
psql YOUR_SUPABASE_URL < backup.sql
```

## الخيار 3: **استضافة مختلطة** 🎯

### الفكرة:
- **Frontend**: على Amplify (يعمل ممتاز)
- **Backend API**: على Lightsail أو EC2
- **Database**: RDS (كما هو)

### التطبيق:
1. اقسم المشروع:
   - `frontend/` - Next.js static
   - `api/` - Express.js + Prisma

2. انشر Frontend على Amplify:
   ```json
   // next.config.js
   {
     output: 'export',
     images: { unoptimized: true }
   }
   ```

3. انشر API على Lightsail:
   ```javascript
   // server.js
   const express = require('express');
   const { PrismaClient } = require('@prisma/client');
   
   const app = express();
   const prisma = new PrismaClient();
   
   app.get('/api/articles', async (req, res) => {
     const articles = await prisma.articles.findMany();
     res.json(articles);
   });
   
   app.listen(3001);
   ```

## 🎯 توصيتي النهائية:

### للحل السريع اليوم:
**استخدم Lightsail** - 15 دقيقة وينتهي الموضوع

### للحل طويل المدى:
**انقل إلى Supabase** - يحل جميع مشاكل الاتصال

### للأداء الأفضل:
**الاستضافة المختلطة** - أفضل من كلا العالمين

## 📝 ملاحظة مهمة:
Amplify ممتاز للمواقع الـ static، لكن مع قواعد البيانات و Prisma يصبح معقد جداً. لا تضيع وقتك أكثر - اختر حل يعمل وانطلق! 🚀 