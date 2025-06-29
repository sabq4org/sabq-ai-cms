#!/bin/bash
# سكريبت الطوارئ لتشغيل بيئة التطوير المحلية

echo "🚨 بدء تشغيل بيئة التطوير المحلية للطوارئ..."
echo "هذا السكريبت سيضمن أنك تستطيع العمل محلياً بينما يتم حل مشكلة Vercel."
echo "------------------------------------------------------------------"

# 1. التأكد من وجود ملف .env.local
if [ ! -f .env.local ]; then
    echo "❌ لم يتم العثور على ملف .env.local. يرجى تشغيل 'scripts/setup-environment.sh' أولاً والتأكد من وضع رابط قاعدة البيانات الصحيح فيه."
    exit 1
fi
echo "✅ تم العثور على .env.local."

# 2. التأكد من أن node_modules موجودة
if [ ! -d "node_modules" ]; then
    echo "📦 مجلد node_modules غير موجود. يتم التثبيت الآن..."
    npm install
fi
echo "✅ مجلد node_modules موجود."

# 3. التأكد من أن Prisma Client محدّث
echo "🔧 يتم التأكد من تحديث Prisma Client..."
npx prisma generate
echo "✅ Prisma Client محدّث."

# 4. اختبار الاتصال بالداتابيس مرة أخيرة
echo "🔌 اختبار الاتصال بقاعدة البيانات..."
node -e "require('dotenv').config({ path: '.env.local' }); const { PrismaClient } = require('./lib/generated/prisma'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅✅✅ الاتصال بقاعدة البيانات يعمل بنجاح!'); process.exit(0); }).catch((e) => { console.error('❌❌❌ فشل الاتصال بقاعدة البيانات! الخطأ:', e.message); process.exit(1); });"
if [ $? -ne 0 ]; then
    echo "🛑 توقف! لا يمكن تشغيل الخادم لأن الاتصال بقاعدة البيانات فشل. يرجى مراجعة ملف .env.local."
    exit 1
fi

# 5. تشغيل خادم التطوير
echo "🚀 تشغيل خادم التطوير المحلي على http://localhost:3000"
echo "ℹ️ لإيقاف الخادم، اضغط على CTRL+C في هذا التيرمنال."
echo "------------------------------------------------------------------"

# فتح المتصفح (يعمل على macOS وبعض أنظمة Linux)
# open http://localhost:3000/dashboard

# بدء الخادم
npm run dev 