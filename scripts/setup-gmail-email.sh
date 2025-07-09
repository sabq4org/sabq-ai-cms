#!/bin/bash

# سكريبت إعداد البريد الإلكتروني مع Gmail
echo "📧 إعداد البريد الإلكتروني مع Gmail"
echo "=================================="
echo ""
echo "⚠️  قبل البدء، تأكد من:"
echo "1. تفعيل المصادقة الثنائية في حساب Gmail"
echo "2. إنشاء كلمة مرور التطبيق (App Password)"
echo "3. الحصول على كلمة المرور من: https://myaccount.google.com/apppasswords"
echo ""
echo "اضغط Enter للمتابعة..."
read

# قراءة المعلومات
echo ""
echo "📝 أدخل بريدك الإلكتروني في Gmail (مثل: sabqai@sabq.ai):"
read SMTP_USER

echo ""
echo "🔑 أدخل كلمة مرور التطبيق (16 حرف):"
read -s SMTP_PASS

echo ""
echo ""
echo "📝 أدخل اسم المرسل (افتراضي: صحيفة سبق):"
read EMAIL_FROM_NAME
EMAIL_FROM_NAME=${EMAIL_FROM_NAME:-"صحيفة سبق"}

# تحديث .env.local
echo ""
echo "📄 تحديث ملف .env.local..."

# نسخ احتياطية
if [ -f .env.local ]; then
    cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ تم حفظ نسخة احتياطية من .env.local"
fi

# إضافة أو تحديث إعدادات البريد
if [ -f .env.local ]; then
    # إزالة الإعدادات القديمة
    grep -v "^SMTP_" .env.local > .env.local.tmp
    grep -v "^EMAIL_" .env.local.tmp > .env.local
    rm .env.local.tmp
fi

# إضافة الإعدادات الجديدة
cat >> .env.local << EOF

# Gmail Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_SECURE=true
EMAIL_FROM_NAME=$EMAIL_FROM_NAME
EMAIL_FROM_ADDRESS=$SMTP_USER
ENABLE_EMAIL_VERIFICATION=true
SKIP_EMAIL_VERIFICATION=false

# IMAP Settings (for incoming mail)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=$SMTP_USER
IMAP_PASS=$SMTP_PASS
IMAP_SECURE=true
EOF

echo "✅ تم تحديث إعدادات البريد الإلكتروني"

# اختبار الإعدادات
echo ""
echo "🧪 اختبار الإعدادات..."
node scripts/test-gmail-email.js

echo ""
echo "📋 ملخص الإعدادات:"
echo "=================="
echo "📧 البريد الإلكتروني: $SMTP_USER"
echo "🔐 كلمة المرور: [مخفية]"
echo "📤 SMTP Server: smtp.gmail.com:465"
echo "📥 IMAP Server: imap.gmail.com:993"
echo "🔒 الأمان: SSL/TLS"
echo ""
echo "✅ تم إعداد البريد الإلكتروني بنجاح!"
echo "🚀 يمكنك الآن تشغيل: npm run dev" 