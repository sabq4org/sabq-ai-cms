#!/bin/bash

# ================================================================================
# سكريبت نقل قاعدة البيانات من Supabase إلى DigitalOcean PostgreSQL
# التاريخ: 2025-01-16
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
SUPABASE_HOST="db.xxxxx.supabase.co"  # يجب تحديثه
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PASSWORD=""  # يجب تحديثه

# DigitalOcean (الهدف)
DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_production"
DO_PASSWORD="YOUR_PASSWORD"

# مسارات الملفات
BACKUP_DIR="./migration_backup_$(date +%Y%m%d_%H%M%S)"
SCHEMA_FILE="$BACKUP_DIR/schema.sql"
DATA_FILE="$BACKUP_DIR/data.sql"
LOG_FILE="$BACKUP_DIR/migration.log"

# ================================================================================
# الدوال المساعدة
# ================================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# ================================================================================
# المرحلة 1: التحقق من المتطلبات
# ================================================================================

check_requirements() {
    log "التحقق من المتطلبات..."
    
    # التحقق من وجود الأدوات المطلوبة
    for tool in pg_dump psql pg_restore; do
        if ! command -v $tool &> /dev/null; then
            error "$tool غير مثبت. يرجى تثبيته أولاً."
            exit 1
        fi
    done
    
    # إنشاء مجلد النسخ الاحتياطية
    mkdir -p "$BACKUP_DIR"
    
    log "✅ جميع المتطلبات متوفرة"
}

# ================================================================================
# المرحلة 2: أخذ نسخة احتياطية من Supabase
# ================================================================================

backup_supabase() {
    log "بدء أخذ نسخة احتياطية من Supabase..."
    
    # تصدير PGPASSWORD لتجنب طلب كلمة المرور
    export PGPASSWORD="$SUPABASE_PASSWORD"
    
    # أخذ نسخة من الـ Schema فقط
    log "استخراج Schema..."
    pg_dump \
        --host="$SUPABASE_HOST" \
        --port="$SUPABASE_PORT" \
        --username="$SUPABASE_USER" \
        --dbname="$SUPABASE_DB" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --no-security-labels \
        --no-tablespaces \
        --file="$SCHEMA_FILE" \
        --verbose 2>> "$LOG_FILE"
    
    # أخذ نسخة من البيانات فقط
    log "استخراج البيانات..."
    pg_dump \
        --host="$SUPABASE_HOST" \
        --port="$SUPABASE_PORT" \
        --username="$SUPABASE_USER" \
        --dbname="$SUPABASE_DB" \
        --data-only \
        --disable-triggers \
        --file="$DATA_FILE" \
        --verbose 2>> "$LOG_FILE"
    
    unset PGPASSWORD
    
    log "✅ تم أخذ النسخة الاحتياطية بنجاح"
}

# ================================================================================
# المرحلة 3: تحضير قاعدة البيانات في DigitalOcean
# ================================================================================

prepare_digitalocean() {
    log "تحضير قاعدة البيانات في DigitalOcean..."
    
    export PGPASSWORD="$DO_PASSWORD"
    
    # إنشاء قاعدة البيانات إذا لم تكن موجودة
    log "إنشاء قاعدة البيانات..."
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="defaultdb" \
        --command="CREATE DATABASE $DO_DB;" 2>> "$LOG_FILE" || warning "قاعدة البيانات قد تكون موجودة بالفعل"
    
    # تفعيل الـ Extensions المطلوبة
    log "تفعيل PostgreSQL extensions..."
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --command="
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
        CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";
        " 2>> "$LOG_FILE"
    
    unset PGPASSWORD
    
    log "✅ تم تحضير قاعدة البيانات"
}

# ================================================================================
# المرحلة 4: معالجة وتنظيف Schema
# ================================================================================

clean_schema() {
    log "معالجة وتنظيف Schema..."
    
    # إنشاء نسخة معدلة من Schema
    CLEANED_SCHEMA="$BACKUP_DIR/schema_cleaned.sql"
    
    # إزالة أي إشارات لـ Supabase-specific features
    sed -e '/POLICY/d' \
        -e '/ROW LEVEL SECURITY/d' \
        -e '/auth\./d' \
        -e '/storage\./d' \
        -e '/realtime\./d' \
        "$SCHEMA_FILE" > "$CLEANED_SCHEMA"
    
    log "✅ تم تنظيف Schema"
}

# ================================================================================
# المرحلة 5: استيراد Schema إلى DigitalOcean
# ================================================================================

import_schema() {
    log "استيراد Schema إلى DigitalOcean..."
    
    export PGPASSWORD="$DO_PASSWORD"
    
    # حذف الـ Schema الحالي إذا كان موجوداً (تحذير!)
    warning "سيتم حذف جميع الجداول الموجودة!"
    read -p "هل تريد المتابعة؟ (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        psql \
            --host="$DO_HOST" \
            --port="$DO_PORT" \
            --username="$DO_USER" \
            --dbname="$DO_DB" \
            --command="DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" 2>> "$LOG_FILE"
    else
        error "تم إلغاء العملية"
        exit 1
    fi
    
    # استيراد Schema
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --file="$CLEANED_SCHEMA" \
        --single-transaction \
        --set ON_ERROR_STOP=on 2>> "$LOG_FILE"
    
    unset PGPASSWORD
    
    log "✅ تم استيراد Schema بنجاح"
}

# ================================================================================
# المرحلة 6: استيراد البيانات
# ================================================================================

import_data() {
    log "استيراد البيانات إلى DigitalOcean..."
    
    export PGPASSWORD="$DO_PASSWORD"
    
    # تعطيل المؤقت لـ foreign key constraints
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --command="SET session_replication_role = replica;" 2>> "$LOG_FILE"
    
    # استيراد البيانات
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --file="$DATA_FILE" \
        --single-transaction \
        --set ON_ERROR_STOP=on 2>> "$LOG_FILE"
    
    # إعادة تفعيل foreign key constraints
    psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --command="SET session_replication_role = DEFAULT;" 2>> "$LOG_FILE"
    
    unset PGPASSWORD
    
    log "✅ تم استيراد البيانات بنجاح"
}

# ================================================================================
# المرحلة 7: التحقق من البيانات
# ================================================================================

verify_migration() {
    log "التحقق من نجاح عملية النقل..."
    
    export PGPASSWORD="$DO_PASSWORD"
    
    # عد الجداول
    TABLE_COUNT=$(psql \
        --host="$DO_HOST" \
        --port="$DO_PORT" \
        --username="$DO_USER" \
        --dbname="$DO_DB" \
        --tuples-only \
        --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>> "$LOG_FILE")
    
    # عد السجلات في الجداول المهمة
    for table in users articles categories comments interactions; do
        COUNT=$(psql \
            --host="$DO_HOST" \
            --port="$DO_PORT" \
            --username="$DO_USER" \
            --dbname="$DO_DB" \
            --tuples-only \
            --command="SELECT COUNT(*) FROM $table;" 2>> "$LOG_FILE" || echo "0")
        info "جدول $table: $COUNT سجل"
    done
    
    unset PGPASSWORD
    
    log "✅ تم التحقق من البيانات"
}

# ================================================================================
# المرحلة 8: تحديث Prisma
# ================================================================================

update_prisma() {
    log "تحديث Prisma للعمل مع قاعدة البيانات الجديدة..."
    
    # حفظ نسخة احتياطية من .env.local
    if [ -f ".env.local" ]; then
        cp .env.local "$BACKUP_DIR/.env.local.backup"
    fi
    
    # كتابة connection string الجديد
    cat > "$BACKUP_DIR/new_database_url.txt" << EOF
DATABASE_URL="postgresql://$DO_USER:$DO_PASSWORD@$DO_HOST:$DO_PORT/$DO_DB?sslmode=require"
EOF
    
    info "يرجى تحديث DATABASE_URL في .env.local بالقيمة الموجودة في:"
    info "$BACKUP_DIR/new_database_url.txt"
    
    # توليد Prisma Client
    log "توليد Prisma Client..."
    npx prisma generate
    
    log "✅ تم تحديث Prisma"
}

# ================================================================================
# المرحلة 9: إنشاء تقرير النقل
# ================================================================================

generate_report() {
    log "إنشاء تقرير النقل..."
    
    REPORT_FILE="$BACKUP_DIR/migration_report.md"
    
    cat > "$REPORT_FILE" << EOF
# تقرير نقل قاعدة البيانات

## معلومات النقل
- التاريخ: $(date)
- المصدر: Supabase ($SUPABASE_HOST)
- الهدف: DigitalOcean ($DO_HOST)
- قاعدة البيانات: $DO_DB

## النتائج
- عدد الجداول: $TABLE_COUNT
- مجلد النسخ الاحتياطية: $BACKUP_DIR

## الخطوات التالية
1. تحديث DATABASE_URL في .env.local
2. إعادة تشغيل التطبيق
3. اختبار جميع الوظائف
4. مراقبة الأداء

## ملاحظات
- يُنصح بالاحتفاظ بـ Supabase نشط لمدة أسبوع
- تأكد من أخذ نسخ احتياطية يومية من DigitalOcean
EOF
    
    log "✅ تم إنشاء التقرير: $REPORT_FILE"
}

# ================================================================================
# التنفيذ الرئيسي
# ================================================================================

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}نقل قاعدة البيانات من Supabase إلى DigitalOcean${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # التحقق من كلمة مرور Supabase
    if [ -z "$SUPABASE_PASSWORD" ]; then
        read -sp "أدخل كلمة مرور Supabase: " SUPABASE_PASSWORD
        echo
    fi
    
    # تنفيذ المراحل
    check_requirements
    backup_supabase
    prepare_digitalocean
    clean_schema
    import_schema
    import_data
    verify_migration
    update_prisma
    generate_report
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ تمت عملية النقل بنجاح!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "التقرير الكامل: $REPORT_FILE"
    echo -e "السجلات: $LOG_FILE"
}

# تشغيل السكريبت
main 