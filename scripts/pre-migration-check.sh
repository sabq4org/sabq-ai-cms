#!/bin/bash

# ================================================================================
# سكريبت التحقق من الجاهزية قبل نقل قاعدة البيانات
# Pre-Migration Readiness Check
# ================================================================================

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo -e "🔍 فحص الجاهزية لنقل قاعدة البيانات"
echo -e "======================================${NC}\n"

# متغيرات للتتبع
READY=true
WARNINGS=0

# ================================================================================
# 1. التحقق من الأدوات المطلوبة
# ================================================================================

echo -e "${YELLOW}1️⃣ التحقق من الأدوات المطلوبة:${NC}"

# PostgreSQL tools
if command -v pg_dump &> /dev/null; then
    echo -e "${GREEN}✅ pg_dump${NC} - $(pg_dump --version | head -1)"
else
    echo -e "${RED}❌ pg_dump غير مثبت${NC}"
    echo "   تثبيت: brew install postgresql (macOS) أو apt install postgresql-client (Ubuntu)"
    READY=false
fi

if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ psql${NC} - $(psql --version)"
else
    echo -e "${RED}❌ psql غير مثبت${NC}"
    READY=false
fi

# Node.js & Package managers
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js${NC} - $(node --version)"
else
    echo -e "${RED}❌ Node.js غير مثبت${NC}"
    READY=false
fi

if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✅ pnpm${NC} - $(pnpm --version)"
elif command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm موجود لكن pnpm مفضل${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${RED}❌ لا يوجد package manager${NC}"
    READY=false
fi

# أدوات مساعدة
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq${NC} - لمعالجة JSON"
else
    echo -e "${YELLOW}⚠️  jq غير مثبت (اختياري)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ================================================================================
# 2. التحقق من المساحة المتوفرة
# ================================================================================

echo -e "\n${YELLOW}2️⃣ التحقق من المساحة المتوفرة:${NC}"

AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "المساحة المتوفرة: ${BLUE}${AVAILABLE_SPACE}${NC}"

# تحويل إلى GB للمقارنة (متوافق مع macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SPACE_GB=$(df -g . | awk 'NR==2 {print $4}')
else
    # Linux
    SPACE_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
fi

if [ -n "$SPACE_GB" ] && [ "$SPACE_GB" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  قد تحتاج مساحة أكبر (يُنصح بـ 10GB على الأقل)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ================================================================================
# 3. التحقق من ملفات البيئة
# ================================================================================

echo -e "\n${YELLOW}3️⃣ التحقق من ملفات البيئة:${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env موجود${NC}"
    
    # التحقق من وجود DATABASE_URL
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL موجود في .env${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL غير موجود في .env${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  .env غير موجود${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ================================================================================
# 4. التحقق من Prisma
# ================================================================================

echo -e "\n${YELLOW}4️⃣ التحقق من Prisma:${NC}"

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ prisma/schema.prisma موجود${NC}"
    
    # التحقق من صحة الـ schema
    if command -v npx &> /dev/null; then
        if npx prisma validate &> /dev/null; then
            echo -e "${GREEN}✅ Prisma schema صحيح${NC}"
        else
            echo -e "${RED}❌ خطأ في Prisma schema${NC}"
            READY=false
        fi
    fi
else
    echo -e "${RED}❌ prisma/schema.prisma غير موجود${NC}"
    READY=false
fi

# ================================================================================
# 5. التحقق من مجلد النسخ الاحتياطية
# ================================================================================

echo -e "\n${YELLOW}5️⃣ التحقق من مجلد النسخ الاحتياطية:${NC}"

if [ -d "backups" ]; then
    echo -e "${GREEN}✅ مجلد backups موجود${NC}"
    BACKUP_COUNT=$(find backups -name "*.sql" -o -name "*.dump" | wc -l)
    echo -e "   عدد النسخ الموجودة: ${BLUE}${BACKUP_COUNT}${NC}"
else
    echo -e "${YELLOW}⚠️  مجلد backups غير موجود - سيتم إنشاؤه${NC}"
    mkdir -p backups
fi

# ================================================================================
# 6. اختبار الاتصال بـ DigitalOcean (اختياري)
# ================================================================================

echo -e "\n${YELLOW}6️⃣ اختبار الاتصال بـ DigitalOcean:${NC}"

DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"

# اختبار DNS
if host $DO_HOST &> /dev/null; then
    echo -e "${GREEN}✅ DNS resolution يعمل${NC}"
else
    echo -e "${YELLOW}⚠️  لا يمكن resolve الـ hostname${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# اختبار المنفذ
if command -v nc &> /dev/null; then
    if nc -zw5 $DO_HOST $DO_PORT &> /dev/null; then
        echo -e "${GREEN}✅ المنفذ $DO_PORT مفتوح${NC}"
    else
        echo -e "${YELLOW}⚠️  لا يمكن الوصول للمنفذ $DO_PORT${NC}"
        echo "   تأكد من إضافة IP address في trusted sources"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# ================================================================================
# 7. معلومات النظام
# ================================================================================

echo -e "\n${YELLOW}7️⃣ معلومات النظام:${NC}"
echo -e "نظام التشغيل: ${BLUE}$(uname -s) $(uname -r)${NC}"
echo -e "المستخدم: ${BLUE}$(whoami)${NC}"
echo -e "المسار الحالي: ${BLUE}$(pwd)${NC}"

# ================================================================================
# النتيجة النهائية
# ================================================================================

echo -e "\n${BLUE}======================================"
echo -e "📊 نتيجة الفحص"
echo -e "======================================${NC}\n"

if [ "$READY" = true ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ البيئة جاهزة تماماً لعملية النقل!${NC}"
    else
        echo -e "${GREEN}✅ البيئة جاهزة للنقل${NC}"
        echo -e "${YELLOW}⚠️  لكن هناك $WARNINGS تحذيرات يُنصح بمراجعتها${NC}"
    fi
    
    echo -e "\n${BLUE}الخطوة التالية:${NC}"
    echo -e "1. تأكد من وجود بيانات الاتصال لـ Supabase"
    echo -e "2. شغل: ${GREEN}./scripts/migrate-to-digitalocean.sh${NC}"
else
    echo -e "${RED}❌ البيئة غير جاهزة للنقل${NC}"
    echo -e "يرجى حل المشاكل المذكورة أعلاه أولاً"
fi

echo -e "\n${BLUE}======================================${NC}"

# إرجاع exit code مناسب
if [ "$READY" = true ]; then
    exit 0
else
    exit 1
fi 