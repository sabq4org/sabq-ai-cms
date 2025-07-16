#!/bin/bash

# ================================================================================
# سكريبت الهجرة البسيطة
# ================================================================================

set +e

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}الهجرة من Supabase إلى DigitalOcean${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# الإعدادات
SUPABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
DO_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool"

# 1. تصدير البنية من Supabase
echo -e "${GREEN}📋 تصدير البنية من Supabase...${NC}"
pg_dump "$SUPABASE_URL" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --no-security-labels \
    --no-tablespaces \
    --no-comments \
    --exclude-schema='supabase*' \
    --exclude-schema='auth' \
    --exclude-schema='storage' \
    --exclude-schema='vault' \
    --exclude-schema='graphql*' \
    --exclude-schema='realtime' \
    --exclude-schema='extensions' \
    | sed '/CREATE POLICY/d' \
    | sed '/ENABLE ROW LEVEL SECURITY/d' \
    | sed '/CREATE SCHEMA/d' \
    | sed '/ALTER SCHEMA/d' \
    | sed '/GRANT/d' \
    | sed '/REVOKE/d' \
    | sed '/ALTER DEFAULT PRIVILEGES/d' \
    | sed '/CREATE EXTENSION/d' \
    | sed '/COMMENT ON EXTENSION/d' \
    | sed '/CREATE PUBLICATION/d' \
    | sed '/CREATE SUBSCRIPTION/d' \
    | sed '/CREATE TRIGGER/d' \
    | sed '/CREATE FUNCTION/d' \
    | sed '/CREATE PROCEDURE/d' \
    | sed '/CREATE TYPE/d' \
    | sed '/SET default_table_access_method/d' \
    > ./backups/schema_clean.sql

echo -e "${GREEN}✅ تم التصدير${NC}"

# 2. تطبيق البنية على DigitalOcean
echo -e "${GREEN}🏗️  تطبيق البنية على DigitalOcean...${NC}"
psql "$DO_URL" -f ./backups/schema_clean.sql -v ON_ERROR_STOP=0 &> ./backups/schema_import.log

echo -e "${GREEN}✅ تم تطبيق البنية (تحقق من schema_import.log للتفاصيل)${NC}"

# 3. تصدير البيانات من Supabase
echo -e "${GREEN}💾 تصدير البيانات من Supabase...${NC}"
pg_dump "$SUPABASE_URL" \
    --data-only \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    --exclude-schema='supabase*' \
    --exclude-schema='auth' \
    --exclude-schema='storage' \
    | sed '/SET SESSION AUTHORIZATION/d' \
    | sed '/ALTER TABLE.*OWNER TO/d' \
    > ./backups/data_clean.sql

echo -e "${GREEN}✅ تم تصدير البيانات${NC}"

# 4. استيراد البيانات إلى DigitalOcean
echo -e "${GREEN}📥 استيراد البيانات إلى DigitalOcean...${NC}"
psql "$DO_URL" -f ./backups/data_clean.sql -v ON_ERROR_STOP=0 &> ./backups/data_import.log

echo -e "${GREEN}✅ تم استيراد البيانات (تحقق من data_import.log للتفاصيل)${NC}"

# 5. التحقق النهائي
echo ""
echo -e "${GREEN}🔍 التحقق من النتائج...${NC}"

# عد الجداول
TABLES_COUNT=$(psql "$DO_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "${GREEN}📊 عدد الجداول: $TABLES_COUNT${NC}"

# عرض بعض الإحصائيات
echo -e "${GREEN}📈 إحصائيات البيانات:${NC}"
psql "$DO_URL" -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
ORDER BY table_name;
" 2>/dev/null || echo -e "${YELLOW}⚠️  لا يمكن عرض الإحصائيات${NC}"

# 6. إنشاء ملف البيئة
echo ""
echo -e "${GREEN}📝 إنشاء ملف البيئة...${NC}"
cat > .env.digitalocean.final << EOF
# قاعدة بيانات DigitalOcean
DATABASE_URL="$DO_URL?sslmode=require"
DIRECT_URL="$DO_URL?sslmode=require"
EOF

# نسخ المتغيرات الأخرى
grep -v "DATABASE_URL\|DIRECT_URL" .env >> .env.digitalocean.final

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ اكتملت الهجرة!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📁 ملفات النسخ الاحتياطية:${NC}"
echo -e "${YELLOW}  - ./backups/schema_clean.sql${NC}"
echo -e "${YELLOW}  - ./backups/data_clean.sql${NC}"
echo -e "${YELLOW}  - ./backups/schema_import.log${NC}"
echo -e "${YELLOW}  - ./backups/data_import.log${NC}"
echo ""
echo -e "${YELLOW}⚠️  الخطوات التالية:${NC}"
echo -e "${YELLOW}  1. تحقق من سجلات الاستيراد${NC}"
echo -e "${YELLOW}  2. استخدم: cp .env.digitalocean.final .env${NC}"
echo -e "${YELLOW}  3. أعد بناء Prisma: npx prisma generate${NC}"
echo -e "${YELLOW}  4. أعد تشغيل التطبيق: npm run dev${NC}" 