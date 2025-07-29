#!/bin/bash

# 🚀 سكريبت نشر التحديثات على Digital Ocean
# ===================================

echo "🚀 بدء نشر التحديثات على Digital Ocean..."
echo "========================================"

# معلومات السيرفر - يُرجى تحديثها
SERVER_USER="root"  # أو المستخدم الخاص بك
SERVER_IP="YOUR_SERVER_IP"  # عنوان IP السيرفر
APP_DIR="/var/www/sabq-ai-cms"  # مسار التطبيق على السيرفر

echo "📋 الخطوات المطلوبة:"
echo ""
echo "1️⃣ تسجيل الدخول للسيرفر:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo ""
echo "2️⃣ الانتقال لمجلد التطبيق:"
echo "   cd $APP_DIR"
echo ""
echo "3️⃣ سحب آخر التحديثات:"
echo "   git pull origin main"
echo ""
echo "4️⃣ تثبيت التبعيات:"
echo "   npm ci"
echo ""
echo "5️⃣ إعادة بناء التطبيق:"
echo "   npm run build"
echo ""
echo "6️⃣ إعادة تشغيل التطبيق:"
echo "   pm2 restart sabq-ai-cms"
echo "   # أو"
echo "   systemctl restart sabq-ai-cms"
echo ""
echo "7️⃣ التحقق من حالة التطبيق:"
echo "   pm2 status"
echo "   # أو"
echo "   systemctl status sabq-ai-cms"
echo ""
echo "8️⃣ مراقبة السجلات:"
echo "   pm2 logs sabq-ai-cms --lines 50"
echo "   # أو"
echo "   journalctl -u sabq-ai-cms -f"
echo ""

# أمر مختصر لتنفيذ كل الخطوات مرة واحدة
echo "🎯 أمر سريع لتنفيذ كل الخطوات:"
echo ""
echo "ssh $SERVER_USER@$SERVER_IP 'cd $APP_DIR && git pull origin main && npm ci && npm run build && pm2 restart sabq-ai-cms && pm2 status'"
echo ""

echo "⚠️  ملاحظات مهمة:"
echo "  - تأكد من وجود متغيرات البيئة الصحيحة على السيرفر"
echo "  - تأكد من أن DATABASE_URL يشير إلى Supabase"
echo "  - تأكد من وجود متغيرات Cloudinary"
echo ""
echo "✅ انتهى!" 