#!/bin/bash

# ألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔄 استعادة سريعة للنسخة الاحتياطية${NC}"
echo "===================================="

# التحقق من DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL غير محدد${NC}"
    echo "يرجى تشغيل:"
    echo "export DATABASE_URL='postgresql://doadmin:[PASSWORD]@...'"
    exit 1
fi

# عرض معلومات الاتصال
echo -e "${YELLOW}📊 معلومات الاتصال:${NC}"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

# التحقق من الملف
BACKUP_FILE="data/articles_backup_20250623_161538.json"
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ ملف النسخة الاحتياطية غير موجود${NC}"
    exit 1
fi

echo -e "\n${GREEN}📁 استخدام: $BACKUP_FILE${NC}"

# تأكيد
echo -e "\n${YELLOW}⚠️  تحذير: سيتم حذف جميع البيانات الحالية!${NC}"
read -p "هل تريد المتابعة؟ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ تم إلغاء العملية${NC}"
    exit 0
fi

echo -e "\n${GREEN}🚀 بدء الاستعادة...${NC}"

# تشغيل Node script مع تمرير الإجابات تلقائياً
echo -e "1\nنعم" | node scripts/restore-to-digitalocean.js

echo -e "\n${GREEN}✅ انتهت العملية${NC}" 