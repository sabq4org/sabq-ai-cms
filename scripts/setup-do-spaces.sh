#!/bin/bash

# سكريبت إعداد DigitalOcean Spaces
# يساعد في إعداد متغيرات البيئة بسرعة

echo "🚀 إعداد DigitalOcean Spaces لسجلات البناء"
echo "========================================="
echo ""

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# التحقق من وجود .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ ملف .env.local غير موجود${NC}"
    echo "يجب إنشاء ملف .env.local أولاً"
    exit 1
fi

echo -e "${BLUE}📝 سيتم إضافة متغيرات DigitalOcean Spaces إلى .env.local${NC}"
echo ""

# قراءة المعلومات من المستخدم
echo "أدخل معلومات DigitalOcean Spaces:"
echo ""

read -p "Access Key: " DO_SPACES_KEY
read -s -p "Secret Key: " DO_SPACES_SECRET
echo ""
read -p "Region (مثال: fra1): " DO_SPACES_REGION
read -p "Bucket Name (مثال: sabq-ai-spaces): " DO_SPACES_BUCKET

# تحديد Endpoint بناءً على المنطقة
DO_SPACES_ENDPOINT="https://${DO_SPACES_REGION}.digitaloceanspaces.com"

# إضافة المتغيرات إلى .env.local
echo "" >> .env.local
echo "# DigitalOcean Spaces Configuration" >> .env.local
echo "DO_SPACES_KEY=${DO_SPACES_KEY}" >> .env.local
echo "DO_SPACES_SECRET=${DO_SPACES_SECRET}" >> .env.local
echo "DO_SPACES_REGION=${DO_SPACES_REGION}" >> .env.local
echo "DO_SPACES_BUCKET=${DO_SPACES_BUCKET}" >> .env.local
echo "DO_SPACES_ENDPOINT=${DO_SPACES_ENDPOINT}" >> .env.local

echo ""
echo -e "${GREEN}✅ تم إضافة متغيرات Spaces إلى .env.local${NC}"
echo ""

# سؤال عن اختبار الاتصال
echo -e "${YELLOW}هل تريد اختبار الاتصال الآن؟ (y/n)${NC}"
read -p "> " test_connection

if [ "$test_connection" = "y" ] || [ "$test_connection" = "Y" ]; then
    echo ""
    echo -e "${BLUE}🔍 اختبار الاتصال...${NC}"
    node scripts/test-spaces-connection.js
fi

echo ""
echo -e "${GREEN}✅ اكتمل الإعداد!${NC}"
echo ""
echo "الخطوات التالية:"
echo "1. انشر التحديثات على GitHub"
echo "2. أضف نفس المتغيرات في DigitalOcean App Platform"
echo "3. أعد نشر التطبيق"
echo ""
echo -e "${BLUE}💡 نصيحة: يمكنك تشغيل 'npm run build' محلياً لاختبار رفع السجلات${NC}" 