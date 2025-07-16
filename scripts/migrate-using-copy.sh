#!/bin/bash

# ================================================================================
# سكريبت نقل البيانات باستخدام COPY TO/FROM
# ================================================================================

set +e  # لا نوقف عند الأخطاء

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# الإعدادات
SUPABASE_HOST="db.uopckyrdhlvsxnvcobbw.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj"

DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_app_pool"
DO_PASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj"

BACKUP_DIR="./backups/migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}نقل البيانات باستخدام COPY${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ================================================================================
# 1. الحصول على قائمة الجداول من Supabase
# ================================================================================

echo -e "${GREEN}📋 الحصول على قائمة الجداول...${NC}"

TABLES=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h "$SUPABASE_HOST" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -t -c "
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE 'supabase_%'
ORDER BY tablename;
")

echo -e "${GREEN}✅ تم العثور على الجداول التالية:${NC}"
echo "$TABLES"

# حفظ قائمة الجداول
echo "$TABLES" > "$BACKUP_DIR/tables.txt"

# ================================================================================
# 2. إنشاء البنية في DigitalOcean
# ================================================================================

echo -e "${GREEN}🏗️  إنشاء بنية قاعدة البيانات في DigitalOcean...${NC}"

# استخدام pg_dump لتصدير البنية فقط (بدون بيانات)
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
    -h "$SUPABASE_HOST" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --no-comments \
    --exclude-schema='supabase_*' \
    --exclude-schema='auth' \
    --exclude-schema='storage' \
    | grep -v "CREATE POLICY" \
    | grep -v "ALTER TABLE.*ENABLE ROW LEVEL SECURITY" \
    | grep -v "CREATE SCHEMA" \
    | grep -v "SET default_table_access_method" \
    > "$BACKUP_DIR/schema.sql" 2>/dev/null

# محاولة استيراد البنية
echo -e "${GREEN}📥 استيراد البنية...${NC}"
PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -f "$BACKUP_DIR/schema.sql" &> "$BACKUP_DIR/schema_import.log"

echo -e "${GREEN}✅ تم استيراد البنية (قد تكون هناك تحذيرات)${NC}"

# ================================================================================
# 3. نقل البيانات جدول بجدول
# ================================================================================

echo -e "${GREEN}💾 بدء نقل البيانات...${NC}"
echo ""

# معالجة كل جدول
while IFS= read -r table; do
    # تجاهل الأسطر الفارغة
    [ -z "$table" ] && continue
    
    # تنظيف اسم الجدول
    table=$(echo "$table" | xargs)
    
    echo -n -e "${GREEN}نقل جدول $table...${NC} "
    
    # عد السجلات في المصدر
    SOURCE_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h "$SUPABASE_HOST" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
    
    if [ -z "$SOURCE_COUNT" ] || [ "$SOURCE_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}(فارغ)${NC}"
        continue
    fi
    
    # تصدير البيانات إلى ملف CSV
    PGPASSWORD="$SUPABASE_PASSWORD" psql -h "$SUPABASE_HOST" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -c "\COPY \"$table\" TO '$BACKUP_DIR/$table.csv' WITH CSV HEADER;" 2>/dev/null
    
    # حذف البيانات الموجودة في الهدف (إن وجدت)
    PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -c "TRUNCATE TABLE \"$table\" CASCADE;" &>/dev/null
    
    # استيراد البيانات
    PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -c "\COPY \"$table\" FROM '$BACKUP_DIR/$table.csv' WITH CSV HEADER;" 2>/dev/null
    
    # عد السجلات في الهدف
    DEST_COUNT=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
    
    if [ "$SOURCE_COUNT" = "$DEST_COUNT" ]; then
        echo -e "${GREEN}✅ ($SOURCE_COUNT سجل)${NC}"
    else
        echo -e "${RED}❌ (المصدر: $SOURCE_COUNT، الهدف: $DEST_COUNT)${NC}"
    fi
    
done < "$BACKUP_DIR/tables.txt"

# ================================================================================
# 4. التحقق النهائي
# ================================================================================

echo ""
echo -e "${GREEN}🔍 التحقق النهائي...${NC}"

# عد الجداول
DO_TABLES=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}📊 عدد الجداول في DigitalOcean: $DO_TABLES${NC}"

# ================================================================================
# 5. إنشاء ملف البيئة
# ================================================================================

echo -e "${GREEN}📝 إنشاء ملف البيئة...${NC}"

cat > .env.digitalocean << EOF
# قاعدة بيانات DigitalOcean
DATABASE_URL="postgresql://$DO_USER:$DO_PASSWORD@$DO_HOST:$DO_PORT/$DO_DB?sslmode=require"
DIRECT_URL="postgresql://$DO_USER:$DO_PASSWORD@$DO_HOST:$DO_PORT/$DO_DB?sslmode=require"

# معلومات إضافية
NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}

# بقية المتغيرات من .env الأصلي
EOF

# نسخ المتغيرات الأخرى من .env الأصلي
if [ -f .env ]; then
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
echo -e "${YELLOW}  1. تحقق من البيانات${NC}"
echo -e "${YELLOW}  2. انسخ .env الحالي: cp .env .env.supabase${NC}"
echo -e "${YELLOW}  3. استخدم البيئة الجديدة: cp .env.digitalocean .env${NC}"
echo -e "${YELLOW}  4. أعد بناء Prisma: npx prisma generate${NC}"
echo -e "${YELLOW}  5. أعد تشغيل التطبيق: npm run dev${NC}" 