#!/bin/bash

echo "🚀 إصلاح سريع للإنتاج"
echo "===================="

# 1. توليد Prisma Client
echo "1️⃣ توليد Prisma Client..."
npx prisma generate

# 2. بناء التطبيق إذا لزم
if [ ! -d ".next" ]; then
    echo "2️⃣ بناء التطبيق..."
    npm run build
else
    echo "2️⃣ التطبيق مبني مسبقاً ✅"
fi

# 3. إعادة تشغيل التطبيق
echo "3️⃣ إعادة تشغيل التطبيق..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    pm2 save
    echo "✅ تم إعادة التشغيل عبر PM2"
else
    # إذا لم يكن PM2 موجوداً، حاول إيقاف وتشغيل العملية
    pkill -f "node.*next" || true
    sleep 2
    npm start &
    echo "✅ تم تشغيل التطبيق"
fi

# 4. انتظار بدء التطبيق
echo "⏳ انتظار بدء التطبيق..."
sleep 5

# 5. اختبار سريع
echo "🔍 اختبار سريع..."
curl -s http://localhost:3000/api/health | grep -q "healthy" && echo "✅ API يعمل!" || echo "❌ API لا يعمل"

echo ""
echo "✨ اكتمل الإصلاح السريع!"
echo "🔗 اختبر الموقع: https://jur3a.ai" 