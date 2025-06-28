#!/bin/bash

echo "🔧 إصلاح مشكلة تسجيل الدخول..."

# 1. سحب آخر التحديثات
echo "📥 سحب التحديثات..."
git pull

# 2. حذف ملفات البناء القديمة
echo "🗑️  حذف ملفات البناء القديمة..."
rm -rf .next
rm -rf node_modules/.cache

# 3. التأكد من وجود postcss.config.js
if [ ! -f "postcss.config.js" ]; then
  echo "📝 إنشاء postcss.config.js..."
  cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# 4. البناء مع تعطيل التتبع
echo "🏗️  بناء المشروع..."
NEXT_TELEMETRY_DISABLED=1 npm run build

# 5. إعادة تشغيل PM2
echo "🔄 إعادة تشغيل التطبيق..."
pm2 restart sabq-cms

# 6. مسح ذاكرة التخزين المؤقت للمتصفح
echo ""
echo "⚠️  مهم: يجب على المستخدمين مسح ذاكرة التخزين المؤقت للمتصفح:"
echo "  1. افتح المتصفح على الموقع"
echo "  2. اضغط F12 لفتح أدوات المطور"
echo "  3. انقر بزر الماوس الأيمن على زر إعادة التحميل"
echo "  4. اختر 'Empty Cache and Hard Reload'"
echo ""

echo "✅ تم إصلاح مشكلة تسجيل الدخول!" 