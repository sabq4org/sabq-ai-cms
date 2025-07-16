#!/bin/bash

# ================================================================================
# سكريبت نقل قاعدة البيانات من Supabase إلى DigitalOcean PostgreSQL
# نسخة تلقائية - لا تحتاج إدخال كلمة مرور
# ================================================================================

set -e  # توقف عند أي خطأ

# الألوان للرسائل
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================================================================
# الإعدادات
# ================================================================================

# Supabase (المصدر)
SUPABASE_HOST="db.uopckyrdhlvsxnvcobbw.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PASSWORD="AVNS_Br4uKMaWR6wxTIpZ7xj"

# DigitalOcean (الهدف) - يحتاج إلى كلمة المرور الفعلية
DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_app_pool"
DO_PASSWORD="${DO_DB_PASSWORD:-}"  # من متغير البيئة

# التحقق من كلمة مرور DigitalOcean
if [ -z "$DO_PASSWORD" ]; then
    echo -e "${RED}خطأ: يجب تعيين متغير DO_DB_PASSWORD${NC}"
    echo "مثال: export DO_DB_PASSWORD='your-password'"
    exit 1
fi

# مسارات الملفات
BACKUP_DIR="./backups/migration_$(date +%Y%m%d_%H%M%S)"
SCHEMA_FILE="$BACKUP_DIR/schema.sql"
DATA_FILE="$BACKUP_DIR/data.sql"
FULL_BACKUP="$BACKUP_DIR/full_backup.sql"
LOG_FILE="$BACKUP_DIR/migration.log"

# إنشاء مجلد النسخ الاحتياطية
mkdir -p "$BACKUP_DIR"

# ================================================================================
# الدوال المساعدة
# ================================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# ================================================================================
# البدء
# ================================================================================

echo "========================================" | tee "$LOG_FILE"
echo "نقل قاعدة البيانات من Supabase إلى DigitalOcean" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

log "معلومات الاتصال:"
log "  Supabase: $SUPABASE_HOST:$SUPABASE_PORT/$SUPABASE_DB"
log "  DigitalOcean: $DO_HOST:$DO_PORT/$DO_DB"
echo "" | tee -a "$LOG_FILE"

# ================================================================================
# 1. النسخ الاحتياطي من Supabase
# ================================================================================

log "🔄 بدء النسخ الاحتياطي من Supabase..."

# تصدير البنية
log "📋 تصدير بنية قاعدة البيانات..."
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --no-comments \
    --if-exists \
    --clean \
    -f "$SCHEMA_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ تم تصدير البنية بنجاح"
else
    error "❌ فشل تصدير البنية"
fi

# تصدير البيانات
log "💾 تصدير البيانات..."
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --data-only \
    --disable-triggers \
    --no-owner \
    --no-privileges \
    -f "$DATA_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ تم تصدير البيانات بنجاح"
else
    error "❌ فشل تصدير البيانات"
fi

# نسخة احتياطية كاملة
log "📦 إنشاء نسخة احتياطية كاملة..."
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --no-owner \
    --no-privileges \
    --if-exists \
    --clean \
    -f "$FULL_BACKUP" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ تم إنشاء النسخة الاحتياطية الكاملة"
else
    warning "⚠️  لم يتم إنشاء النسخة الاحتياطية الكاملة"
fi

# ================================================================================
# 2. تنظيف الملفات المصدرة
# ================================================================================

log "🧹 تنظيف الملفات المصدرة..."

# إزالة إشارات Supabase الخاصة
sed -i '' 's/POLICY ".*" ON/-- POLICY REMOVED/g' "$SCHEMA_FILE" 2>/dev/null || true
sed -i '' 's/CREATE POLICY/-- CREATE POLICY/g' "$SCHEMA_FILE" 2>/dev/null || true
sed -i '' 's/ALTER TABLE .* ENABLE ROW LEVEL SECURITY/-- ROW LEVEL SECURITY DISABLED/g' "$SCHEMA_FILE" 2>/dev/null || true

log "✅ تم تنظيف الملفات"

# ================================================================================
# 3. الاستيراد إلى DigitalOcean
# ================================================================================

log "📥 بدء الاستيراد إلى DigitalOcean..."

# استيراد البنية
log "🏗️  استيراد بنية قاعدة البيانات..."
PGPASSWORD="$DO_PASSWORD" psql \
    -h "$DO_HOST" \
    -p "$DO_PORT" \
    -U "$DO_USER" \
    -d "$DO_DB" \
    -f "$SCHEMA_FILE" \
    -v ON_ERROR_STOP=1 >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "✅ تم استيراد البنية بنجاح"
else
    error "❌ فشل استيراد البنية"
fi

# استيراد البيانات
log "💾 استيراد البيانات..."
PGPASSWORD="$DO_PASSWORD" psql \
    -h "$DO_HOST" \
    -p "$DO_PORT" \
    -U "$DO_USER" \
    -d "$DO_DB" \
    -f "$DATA_FILE" \
    -v ON_ERROR_STOP=1 >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "✅ تم استيراد البيانات بنجاح"
else
    error "❌ فشل استيراد البيانات"
fi

# ================================================================================
# 4. التحقق من النجاح
# ================================================================================

log "🔍 التحقق من عملية النقل..."

# عد الجداول
SUPABASE_TABLES=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
DO_TABLES=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

log "📊 عدد الجداول:"
log "  Supabase: $SUPABASE_TABLES"
log "  DigitalOcean: $DO_TABLES"

# التحقق من بعض الجداول المهمة
for table in users articles categories interactions loyalty_points; do
    if PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -c "SELECT 1 FROM $table LIMIT 1;" &>/dev/null; then
        COUNT=$(PGPASSWORD="$DO_PASSWORD" psql -h "$DO_HOST" -p "$DO_PORT" -U "$DO_USER" -d "$DO_DB" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        log "  ✅ $table: $COUNT سجل"
    else
        warning "  ⚠️  $table: غير موجود أو فارغ"
    fi
done

# ================================================================================
# 5. تحديث ملف البيئة
# ================================================================================

log "📝 تحديث ملف البيئة..."

# نسخ احتياطية من .env
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env.backup"
    log "✅ تم حفظ نسخة احتياطية من .env"
fi

# إنشاء ملف .env جديد
cat > .env.digitalocean << EOF
# قاعدة بيانات DigitalOcean
DATABASE_URL="postgresql://$DO_USER:$DO_PASSWORD@$DO_HOST:$DO_PORT/$DO_DB?sslmode=require"
DIRECT_URL="postgresql://$DO_USER:$DO_PASSWORD@$DO_HOST:$DO_PORT/$DO_DB?sslmode=require"

# نسخة احتياطية من Supabase (للرجوع إليها)
SUPABASE_DATABASE_URL="postgresql://$SUPABASE_USER:$SUPABASE_PASSWORD@$SUPABASE_HOST:$SUPABASE_PORT/$SUPABASE_DB"
EOF

log "✅ تم إنشاء .env.digitalocean"

# ================================================================================
# 6. الخلاصة
# ================================================================================

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "✅ اكتملت عملية النقل بنجاح!" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
log "📁 مجلد النسخ الاحتياطية: $BACKUP_DIR"
log "📝 ملف البيئة الجديد: .env.digitalocean"
echo "" | tee -a "$LOG_FILE"
log "⚠️  الخطوات التالية:"
log "  1. تحقق من الاتصال: npx prisma db pull"
log "  2. انسخ .env.digitalocean إلى .env"
log "  3. أعد تشغيل التطبيق: npm run dev"
log "  4. اختبر جميع الوظائف الأساسية"
echo "" | tee -a "$LOG_FILE" 