#!/bin/bash

# ================================================================================
# سكريبت نقل قاعدة البيانات باستخدام psql
# ================================================================================

set -e

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# الإعدادات
SUPABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
DO_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"

BACKUP_DIR="./backups/migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}نقل قاعدة البيانات باستخدام psql${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ================================================================================
# 1. تصدير البيانات من Supabase باستخدام pg_dump مع تجاهل الإصدار
# ================================================================================

echo -e "${GREEN}📋 تصدير قاعدة البيانات من Supabase...${NC}"
PGPASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj" pg_dump \
    -h "db.uopckyrdhlvsxnvcobbw.supabase.co" \
    -p 5432 \
    -U "postgres" \
    -d "postgres" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --no-comments \
    --if-exists \
    --clean \
    --disable-triggers \
    --quote-all-identifiers \
    --exclude-schema='supabase_functions' \
    --exclude-schema='storage' \
    --exclude-schema='vault' \
    --exclude-schema='auth' \
    --exclude-schema='graphql' \
    --exclude-schema='graphql_public' \
    --exclude-schema='realtime' \
    --exclude-schema='extensions' \
    -f "$BACKUP_DIR/full_backup.sql" 2>&1 | tee "$BACKUP_DIR/export.log"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ تم التصدير بنجاح${NC}"
else
    echo -e "${YELLOW}⚠️  قد تكون هناك تحذيرات، نتابع...${NC}"
fi

# ================================================================================
# 2. تنظيف الملف المصدر
# ================================================================================

echo -e "${GREEN}🧹 تنظيف الملف المصدر...${NC}"

# إزالة الإشارات الخاصة بـ Supabase
sed -i '' '/^-- Dumped by pg_dump version/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^CREATE SCHEMA IF NOT EXISTS supabase/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^CREATE SCHEMA IF NOT EXISTS auth/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^ALTER DEFAULT PRIVILEGES/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^GRANT ALL ON SCHEMA/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^CREATE POLICY/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/^ALTER TABLE.*ENABLE ROW LEVEL SECURITY/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true

echo -e "${GREEN}✅ تم التنظيف${NC}"

# ================================================================================
# 3. الاستيراد إلى DigitalOcean
# ================================================================================

echo -e "${GREEN}📥 استيراد البيانات إلى DigitalOcean...${NC}"

# تشغيل الملف في قاعدة البيانات
PGPASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj" psql \
    -h "db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com" \
    -p 25060 \
    -U "doadmin" \
    -d "sabq_app_pool" \
    -f "$BACKUP_DIR/full_backup.sql" \
    -v ON_ERROR_STOP=0 &> "$BACKUP_DIR/import.log"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم الاستيراد بنجاح${NC}"
else
    echo -e "${YELLOW}⚠️  اكتمل الاستيراد مع بعض التحذيرات${NC}"
fi

# ================================================================================
# 4. التحقق من النجاح
# ================================================================================

echo -e "${GREEN}🔍 التحقق من النقل...${NC}"

# عد الجداول
DO_TABLES=$(PGPASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj" psql -h "db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com" -p 25060 -U "doadmin" -d "sabq_app_pool" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}📊 عدد الجداول في DigitalOcean: $DO_TABLES${NC}"

# التحقق من الجداول المهمة
echo -e "${GREEN}📋 الجداول الموجودة:${NC}"
for table in users articles categories interactions loyalty_points user_preferences; do
    if PGPASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj" psql -h "db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com" -p 25060 -U "doadmin" -d "sabq_app_pool" -c "SELECT 1 FROM $table LIMIT 1;" &>/dev/null; then
        COUNT=$(PGPASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj" psql -h "db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com" -p 25060 -U "doadmin" -d "sabq_app_pool" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        echo -e "  ${GREEN}✅ $table: $COUNT سجل${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $table: غير موجود${NC}"
    fi
done

# ================================================================================
# 5. إنشاء ملف البيئة الجديد
# ================================================================================

echo -e "${GREEN}📝 إنشاء ملف البيئة...${NC}"

cat > .env.digitalocean << EOF
# قاعدة بيانات DigitalOcean
DATABASE_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"
DIRECT_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require"

# نسخة احتياطية من Supabase
SUPABASE_DATABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ اكتملت عملية النقل!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}📁 مجلد النسخ الاحتياطية: $BACKUP_DIR${NC}"
echo -e "${GREEN}📝 ملف البيئة الجديد: .env.digitalocean${NC}"
echo ""
echo -e "${YELLOW}⚠️  الخطوات التالية:${NC}"
echo -e "${YELLOW}  1. انسخ .env.digitalocean إلى .env${NC}"
echo -e "${YELLOW}  2. أعد بناء Prisma: npx prisma generate${NC}"
echo -e "${YELLOW}  3. أعد تشغيل التطبيق: npm run dev${NC}" 