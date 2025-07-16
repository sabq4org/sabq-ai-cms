#!/bin/bash

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 فحص قاعدة البيانات على Digital Ocean${NC}"
echo "=========================================="

# يجب تعيين كلمة المرور
if [ -z "$DO_DB_PASSWORD" ]; then
    echo -e "${RED}❌ يجب تعيين متغير DO_DB_PASSWORD${NC}"
    echo "مثال: export DO_DB_PASSWORD='your-password'"
    exit 1
fi

# معلومات الاتصال
DO_HOST="db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com"
DO_PORT="25060"
DO_USER="doadmin"
DO_DB="sabq_app_pool"

echo -e "${YELLOW}📊 الاتصال بقاعدة البيانات...${NC}"

# عد السجلات في الجداول الرئيسية
echo -e "\n${GREEN}📈 إحصائيات قاعدة البيانات:${NC}"
echo "------------------------"

# عد المستخدمين
USER_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null)
echo "المستخدمون: $USER_COUNT"

# عد المقالات
ARTICLE_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM articles;" 2>/dev/null)
echo "المقالات: $ARTICLE_COUNT"

# عد التصنيفات
CATEGORY_COUNT=$(PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null)
echo "التصنيفات: $CATEGORY_COUNT"

# آخر 5 مقالات
echo -e "\n${GREEN}📰 آخر 5 مقالات:${NC}"
echo "----------------"
PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "
SELECT id, SUBSTRING(title, 1, 50) || '...', created_at 
FROM articles 
ORDER BY created_at DESC 
LIMIT 5;
" 2>/dev/null

# آخر نشاط
echo -e "\n${GREEN}⏰ آخر نشاط:${NC}"
echo "------------"
PGPASSWORD=$DO_DB_PASSWORD psql -h $DO_HOST -p $DO_PORT -U $DO_USER -d $DO_DB -t -c "
SELECT action, created_at, user_id 
FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 1;
" 2>/dev/null

echo -e "\n${GREEN}✅ انتهى الفحص${NC}" 