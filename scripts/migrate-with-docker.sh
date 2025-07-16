#!/bin/bash

# ================================================================================
# سكريبت نقل قاعدة البيانات باستخدام Docker
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
echo -e "${GREEN}نقل قاعدة البيانات باستخدام Docker${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# التحقق من Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker غير مثبت. يرجى تثبيت Docker Desktop${NC}"
    echo "زيارة: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# ================================================================================
# 1. تصدير من Supabase باستخدام Docker
# ================================================================================

echo -e "${GREEN}📋 تصدير قاعدة البيانات من Supabase باستخدام Docker...${NC}"

docker run --rm \
    -v "$PWD/$BACKUP_DIR":/backup \
    postgres:17 \
    pg_dump "$SUPABASE_URL" \
    --no-owner \
    --no-privileges \
    --no-comments \
    --if-exists \
    --clean \
    --exclude-schema='supabase_*' \
    --exclude-schema='auth' \
    --exclude-schema='storage' \
    --exclude-schema='vault' \
    --exclude-schema='graphql*' \
    --exclude-schema='realtime' \
    --exclude-schema='extensions' \
    -f /backup/full_backup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم التصدير بنجاح${NC}"
else
    echo -e "${RED}❌ فشل التصدير${NC}"
    exit 1
fi

# ================================================================================
# 2. تنظيف الملف
# ================================================================================

echo -e "${GREEN}🧹 تنظيف الملف المصدر...${NC}"

# إزالة الأوامر الخاصة بـ Supabase
sed -i '' '/CREATE POLICY/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/ALTER TABLE.*ENABLE ROW LEVEL SECURITY/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/CREATE SCHEMA IF NOT EXISTS/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/GRANT/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true
sed -i '' '/ALTER DEFAULT PRIVILEGES/d' "$BACKUP_DIR/full_backup.sql" 2>/dev/null || true

echo -e "${GREEN}✅ تم التنظيف${NC}"

# ================================================================================
# 3. استيراد إلى DigitalOcean
# ================================================================================

echo -e "${GREEN}📥 استيراد البيانات إلى DigitalOcean...${NC}"

docker run --rm \
    -v "$PWD/$BACKUP_DIR":/backup \
    postgres:17 \
    psql "$DO_URL" \
    -f /backup/full_backup.sql \
    -v ON_ERROR_STOP=0

echo -e "${GREEN}✅ تم الاستيراد${NC}"

# ================================================================================
# 4. التحقق
# ================================================================================

echo -e "${GREEN}🔍 التحقق من النقل...${NC}"

# عد الجداول
TABLES_COUNT=$(docker run --rm postgres:17 psql "$DO_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${GREEN}📊 عدد الجداول: $TABLES_COUNT${NC}"

# ================================================================================
# 5. إنشاء ملف البيئة
# ================================================================================

echo -e "${GREEN}📝 إنشاء ملف البيئة...${NC}"

cat > .env.digitalocean << EOF
# قاعدة بيانات DigitalOcean
DATABASE_URL="$DO_URL"
DIRECT_URL="$DO_URL"

# نسخة احتياطية من Supabase
SUPABASE_DATABASE_URL="$SUPABASE_URL"
EOF

# نسخ المتغيرات الأخرى
if [ -f .env ]; then
    echo "" >> .env.digitalocean
    echo "# متغيرات أخرى من .env الأصلي" >> .env.digitalocean
    grep -v "DATABASE_URL\|DIRECT_URL" .env >> .env.digitalocean
fi

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