# 🚀 بدائل AWS مع دعم GitHub

## 1️⃣ AWS App Runner (الأسهل)
- ✅ **يدعم GitHub مباشرة**
- ✅ يعمل مع Docker
- ✅ أسهل من Amplify لقواعد البيانات
- 💰 السعر: حسب الاستخدام

### خطوات سريعة:
1. أضف `Dockerfile` للمشروع (موجود)
2. اذهب إلى AWS App Runner Console
3. اضغط "Create service"
4. اختر "Source code repository" → GitHub
5. اربط مع repository
6. أضف environment variables
7. Deploy!

## 2️⃣ AWS Elastic Beanstalk
- ✅ **يدعم GitHub عبر CodePipeline**
- ✅ خادم EC2 كامل
- ✅ يدعم Node.js مباشرة
- 💰 السعر: $20-40/شهر

### خطوات:
1. إنشاء تطبيق Elastic Beanstalk
2. ربط CodePipeline مع GitHub
3. نشر تلقائي مع كل push

## 3️⃣ AWS CodeDeploy + EC2
- ✅ **GitHub Actions للنشر**
- ✅ تحكم كامل
- ✅ مثل DigitalOcean
- 💰 السعر: حسب حجم EC2

## 4️⃣ البقاء مع Amplify (آخر محاولة)

### تحديثات جديدة:
```bash
# أضفنا:
- scripts/amplify-env-setup.js
- تحديث amplify.yml
- إعدادات Prisma الصحيحة
```

### المتغيرات المطلوبة (3 فقط):
1. DATABASE_URL (الاتصال المباشر)
2. NEXTAUTH_SECRET  
3. NEXTAUTH_URL

## 🎯 ترشيحي:
**AWS App Runner** - أسهل من Amplify ويدعم GitHub مباشرة! 