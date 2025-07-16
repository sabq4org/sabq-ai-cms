#!/bin/bash

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 فحص قاعدة البيانات المباشرة على Digital Ocean${NC}"
echo "================================================"

# معلومات الاتصال - يجب تحديثها حسب بياناتك
DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_app_pool"

# التحقق من وجود كلمة المرور
if [ -z "$DO_DB_PASSWORD" ]; then
    echo -e "${RED}❌ يرجى تعيين كلمة المرور:${NC}"
    echo "export DO_DB_PASSWORD='your-password'"
    exit 1
fi

echo -e "${GREEN}📊 الاتصال بقاعدة البيانات...${NC}"
echo "Host: $DO_HOST"
echo "Database: $DO_DB"
echo ""

# 1. التحقق من الاتصال
echo -e "${YELLOW}1. فحص الاتصال...${NC}"
if PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -c "SELECT 1" &>/dev/null; then
    echo -e "${GREEN}✅ الاتصال ناجح${NC}"
else
    echo -e "${RED}❌ فشل الاتصال${NC}"
    exit 1
fi

# 2. عد السجلات
echo -e "\n${YELLOW}2. إحصائيات قاعدة البيانات:${NC}"
echo "----------------------------"

# المستخدمون
USER_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
echo "👥 المستخدمون: $USER_COUNT"

# المقالات
ARTICLE_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM articles;" 2>/dev/null || echo "0")
echo "📰 المقالات: $ARTICLE_COUNT"

# التصنيفات
CATEGORY_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "0")
echo "🏷️ التصنيفات: $CATEGORY_COUNT"

# التفاعلات
INTERACTION_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM interactions;" 2>/dev/null || echo "0")
echo "💬 التفاعلات: $INTERACTION_COUNT"

# 3. آخر المقالات
echo -e "\n${YELLOW}3. آخر 5 مقالات:${NC}"
echo "----------------"
PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -A -F" | " -c "
SELECT 
    id,
    SUBSTRING(title, 1, 50) || '...' as title,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as date
FROM articles 
ORDER BY created_at DESC 
LIMIT 5;
" 2>/dev/null || echo "لا توجد مقالات"

# 4. التحقق من الجداول
echo -e "\n${YELLOW}4. الجداول الموجودة:${NC}"
echo "-------------------"
PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
" 2>/dev/null | head -20

# 5. معلومات إضافية
echo -e "\n${YELLOW}5. معلومات إضافية:${NC}"
echo "-------------------"

# حجم قاعدة البيانات
DB_SIZE=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "
SELECT pg_size_pretty(pg_database_size('$DO_DB'));
" 2>/dev/null || echo "غير متاح")
echo "💾 حجم قاعدة البيانات: $DB_SIZE"

# آخر نشاط
LAST_ACTIVITY=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "
SELECT MAX(created_at) FROM articles;
" 2>/dev/null || echo "غير متاح")
echo "⏰ آخر مقال: $LAST_ACTIVITY"

echo -e "\n${GREEN}✅ انتهى الفحص${NC}"

# نصائح
echo -e "\n${BLUE}💡 نصائح:${NC}"
echo "1. إذا كانت الأعداد صفر، قد تكون قاعدة البيانات فارغة"
echo "2. تحقق من DATABASE_URL في Digital Ocean App Platform"
echo "3. تأكد من أن التطبيق يستخدم نفس قاعدة البيانات" 