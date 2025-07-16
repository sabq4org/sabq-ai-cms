#!/bin/bash

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔗 إعداد الاتصال بقاعدة بيانات Digital Ocean${NC}"
echo "============================================="

# التحقق من وجود ملف .env.local
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  ملف .env.local موجود بالفعل${NC}"
    echo -n "هل تريد نسخه احتياطياً؟ (y/n): "
    read backup_choice
    if [ "$backup_choice" = "y" ]; then
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${GREEN}✅ تم حفظ نسخة احتياطية${NC}"
    fi
fi

# إنشاء ملف .env.local جديد
echo -e "\n${GREEN}📝 إنشاء ملف .env.local${NC}"

cat > .env.local << 'EOF'
# قاعدة بيانات Digital Ocean
# ⚠️ استبدل YOUR_PASSWORD بكلمة المرور الفعلية
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require
DIRECT_URL=postgresql://doadmin:YOUR_PASSWORD@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
CLOUDINARY_API_KEY=559894124915114
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Development Settings
NODE_ENV=development

# Redis (اختياري)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SMTP_HOST=mail.jur3a.ai
SMTP_PORT=465
SMTP_USER=noreplay@jur3a.ai
SMTP_PASS=oFWD[H,A8~8;iw7(
EMAIL_FROM_NAME=صحيفة سبق
EMAIL_FROM_ADDRESS=sabqai@sabq.ai

# AI Services (اختياري)
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
EOF

echo -e "${GREEN}✅ تم إنشاء ملف .env.local${NC}"

echo -e "\n${YELLOW}⚠️  تنبيهات مهمة:${NC}"
echo "1. استبدل YOUR_PASSWORD بكلمة المرور الفعلية لقاعدة البيانات"
echo "2. استبدل your-cloudinary-api-secret بالمفتاح الفعلي"
echo "3. أضف مفاتيح API الأخرى إذا كنت تحتاجها"

echo -e "\n${GREEN}📋 الخطوات التالية:${NC}"
echo "1. افتح ملف .env.local وأضف كلمة المرور الصحيحة"
echo "2. أعد تشغيل السيرفر: npm run dev"
echo "3. تحقق من الاتصال بتشغيل: node scripts/check-current-db.js"

echo -e "\n${BLUE}💡 نصيحة:${NC}"
echo "للتبديل بين قواعد البيانات:"
echo "- Digital Ocean: استخدم .env.local"
echo "- محلي: احذف أو أعد تسمية .env.local" 