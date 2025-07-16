#!/bin/bash

# ================================================================================
# سكريبت الهجرة المباشرة باستخدام Prisma
# ================================================================================

set -e

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}الهجرة المباشرة من Supabase إلى DigitalOcean${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. نسخ ملف البيئة الحالي
echo -e "${GREEN}📋 حفظ البيئة الحالية...${NC}"
cp .env .env.supabase.backup

# 2. إنشاء البنية في DigitalOcean باستخدام Prisma
echo -e "${GREEN}🏗️  إنشاء البنية في DigitalOcean...${NC}"
cat > .env << EOF
DATABASE_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
DIRECT_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
EOF

# نسخ المتغيرات الأخرى
grep -v "DATABASE_URL\|DIRECT_URL" .env.supabase.backup >> .env

# تطبيق البنية
echo -e "${GREEN}⚡ تطبيق البنية باستخدام Prisma...${NC}"
npx prisma db push --force-reset --skip-generate

# 3. نسخ البيانات من ملفات CSV الموجودة
echo -e "${GREEN}💾 استيراد البيانات من CSV...${NC}"

BACKUP_DIR="./backups/migration_20250716_083938"
DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_app_pool"
DO_PASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj"

# الجداول بالترتيب الصحيح (بسبب العلاقات)
TABLES=(
    "users"
    "categories"
    "articles"
    "activity_logs"
    "deep_analyses"
    "email_verification_codes"
)

for table in "${TABLES[@]}"; do
    if [ -f "$BACKUP_DIR/$table.csv" ]; then
        echo -n -e "${GREEN}استيراد $table...${NC} "
        
        # استيراد من CSV
        PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" \
            -c "\COPY \"$table\" FROM '$BACKUP_DIR/$table.csv' WITH CSV HEADER;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            COUNT=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
            echo -e "${GREEN}✅ ($COUNT سجل)${NC}"
        else
            echo -e "${YELLOW}⚠️  تخطي${NC}"
        fi
    fi
done

# 4. التحقق النهائي
echo ""
echo -e "${GREEN}🔍 التحقق النهائي...${NC}"
TABLES_COUNT=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}📊 عدد الجداول: $TABLES_COUNT${NC}"

# 5. إنشاء ملف البيئة النهائي
echo -e "${GREEN}📝 إنشاء ملف البيئة النهائي...${NC}"
cp .env .env.digitalocean

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ اكتملت الهجرة!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  الخطوات التالية:${NC}"
echo -e "${YELLOW}  1. تحقق من البيانات${NC}"
echo -e "${YELLOW}  2. أعد بناء Prisma: npx prisma generate${NC}"
echo -e "${YELLOW}  3. أعد تشغيل التطبيق: npm run dev${NC}" 