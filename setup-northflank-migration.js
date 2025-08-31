#!/usr/bin/env node

// سكريبت بسيط لتحديث إعدادات قاعدة البيانات

const fs = require('fs');
const path = require('path');

console.log('🔧 تحديث إعدادات قاعدة البيانات إلى Northflank');
console.log('='.repeat(60));

// قاعدة البيانات الجديدة
const NEW_DATABASE_URL = 'postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7';

// 1. تحديث .env.local
console.log('\n1️⃣ تحديث .env.local...');
const envLocalPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envLocalPath)) {
  let envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // استبدال DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL="[^"]*"/g,
    `DATABASE_URL="${NEW_DATABASE_URL}"`
  );
  
  // إضافة DIRECT_URL إذا لم يكن موجود
  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `\nDIRECT_URL="${NEW_DATABASE_URL}"\n`;
  } else {
    envContent = envContent.replace(
      /DIRECT_URL="[^"]*"/g,
      `DIRECT_URL="${NEW_DATABASE_URL}"`
    );
  }
  
  fs.writeFileSync(envLocalPath, envContent);
  console.log('   ✅ تم تحديث .env.local');
} else {
  console.log('   ⚠️ .env.local غير موجود - سيتم إنشاؤه');
  
  const newEnvContent = `# تحديث إعدادات قاعدة البيانات - ${new Date().toISOString()}
DATABASE_URL="${NEW_DATABASE_URL}"
DIRECT_URL="${NEW_DATABASE_URL}"

# إعدادات أخرى...
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key
`;

  fs.writeFileSync(envLocalPath, newEnvContent);
  console.log('   ✅ تم إنشاء .env.local جديد');
}

// 2. إنشاء ملف لمتغيرات Amplify
console.log('\n2️⃣ إنشاء متغيرات Amplify...');
const amplifyEnvContent = `# انسخ هذه المتغيرات إلى Amplify Console
# AWS Amplify > App > Environment variables

DATABASE_URL
${NEW_DATABASE_URL}

DIRECT_URL  
${NEW_DATABASE_URL}

NODE_ENV
production

NEXTAUTH_SECRET
sabq-ai-cms-secret-key-2025

NEXTAUTH_URL
https://production-branch.dvdwfd4vy831i.amplifyapp.com
`;

fs.writeFileSync('AMPLIFY_ENV_VARIABLES.txt', amplifyEnvContent);
console.log('   ✅ تم إنشاء AMPLIFY_ENV_VARIABLES.txt');

// 3. إنشاء خطة العمل
console.log('\n3️⃣ إنشاء خطة العمل...');
const actionPlan = `# 📋 خطة نقل قاعدة البيانات إلى Northflank

## ✅ مكتمل:
- [x] إنشاء نسخة احتياطية (38.22 MB, 2,298 سجل)
- [x] تحديث .env.local
- [x] إعداد متغيرات Amplify

## 🔄 التالي - اختر طريقة واحدة:

### الطريقة 1: النقل التلقائي (الأسهل) ⭐
\`\`\`bash
# سيتطلب اتصال خارجي لـ Northflank
./migrate-to-northflank.sh
\`\`\`

### الطريقة 2: النقل باستخدام Prisma (للخبراء)
\`\`\`bash
# تأكد أن Northflank DB يقبل اتصالات خارجية
node migrate-data-prisma.js
\`\`\`

### الطريقة 3: البداية من جديد (إذا فشل النقل)
\`\`\`bash
# إنشاء الجداول فقط بدون بيانات
npx prisma db push
# ثم إدخال البيانات المهمة يدوياً
\`\`\`

## 🚀 بعد نقل البيانات:

1. **اختبار محلي:**
   \`\`\`bash
   npm run dev
   # تحقق من: تسجيل الدخول، المقالات، التعليقات
   \`\`\`

2. **تحديث Amplify:**
   - افتح AWS Amplify Console
   - اذهب إلى Environment variables
   - انسخ المتغيرات من AMPLIFY_ENV_VARIABLES.txt

3. **النشر:**
   \`\`\`bash
   git add .
   git commit -m "Migrate to Northflank database"
   git push
   \`\`\`

## ⚠️ ملاحظات مهمة:

- قاعدة البيانات الجديدة قد لا تقبل اتصالات خارجية
- إذا فشل النقل، يمكن استعادة النسخة الاحتياطية
- تأكد من اختبار جميع الوظائف بعد النقل

## 🆘 في حالة وجود مشاكل:

1. **قاعدة البيانات لا تستجيب:**
   - تحقق من Northflank Dashboard
   - تأكد أن قاعدة البيانات تعمل
   - جرب Internal connection بدلاً من External

2. **أخطاء في البيانات:**
   - استخدم النسخة الاحتياطية للمقارنة
   - تحقق من Prisma schema compatibility

3. **أخطاء في Amplify:**
   - تحقق من متغيرات البيئة
   - راجع build logs في Amplify Console
`;

fs.writeFileSync('DATABASE_MIGRATION_PLAN.md', actionPlan);
console.log('   ✅ تم إنشاء DATABASE_MIGRATION_PLAN.md');

console.log('\n🎯 الملخص:');
console.log('='.repeat(40));
console.log('✅ تم تحديث إعدادات قاعدة البيانات المحلية');
console.log('✅ تم إعداد متغيرات Amplify');
console.log('✅ تم إنشاء خطة العمل التفصيلية');

console.log('\n📝 الخطوات التالية:');
console.log('1. اقرأ DATABASE_MIGRATION_PLAN.md');
console.log('2. اختر طريقة النقل المناسبة');
console.log('3. نفذ الخطة خطوة بخطوة');

console.log('\n💡 نصيحة:');
console.log('ابدأ بالطريقة 1 (الأسهل) أولاً');
console.log('إذا لم تعمل، جرب الطريقة 3 (البداية من جديد)');

console.log('\n🔗 ملف خطة العمل: DATABASE_MIGRATION_PLAN.md');
console.log('📄 متغيرات Amplify: AMPLIFY_ENV_VARIABLES.txt');
