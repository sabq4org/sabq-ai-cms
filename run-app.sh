#!/bin/bash
echo "🚀 بدء تشغيل سبق AI CMS..."
echo ""

# التحقق من Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge "22" ]; then
    echo "⚠️  تحذير: أنت تستخدم Node.js v$NODE_VERSION"
    echo "   يُنصح باستخدام Node.js v20 للحصول على أفضل أداء"
    echo ""
fi

# تنظيف الكاش
rm -rf .next

# تشغيل التطبيق
echo "⏳ بدء الخادم..."
echo "📍 سيعمل على: http://localhost:3000"
echo ""
npm run dev
