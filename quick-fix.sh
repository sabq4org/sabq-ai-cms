#!/bin/bash

echo "🔧 سكريبت الإصلاح السريع - سبق AI CMS"
echo "======================================="
echo ""

# الألوان للإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# دالة لطباعة رسائل ملونة
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# دالة للتأكد من تشغيل السكريبت كـ root عند الحاجة
check_root() {
    if [ "$EUID" -ne 0 ] && [ "$1" = "required" ]; then 
        echo -e "${RED}يجب تشغيل هذا الأمر كـ root${NC}"
        exit 1
    fi
}

# القائمة الرئيسية
show_menu() {
    echo "اختر المشكلة التي تريد حلها:"
    echo ""
    echo "1) إعادة تشغيل جميع الخدمات"
    echo "2) تنظيف الذاكرة والموارد"
    echo "3) إصلاح مشاكل قاعدة البيانات"
    echo "4) إصلاح مشاكل المنافذ"
    echo "5) تحديث الشهادات SSL"
    echo "6) النسخ الاحتياطي العاجل"
    echo "7) استعادة من نسخة احتياطية"
    echo "8) فحص شامل للنظام"
    echo "9) وضع الصيانة (تفعيل/إلغاء)"
    echo "0) خروج"
    echo ""
    read -p "اختيارك: " choice
}

# 1. إعادة تشغيل جميع الخدمات
restart_all() {
    echo -e "${YELLOW}🔄 إعادة تشغيل جميع الخدمات...${NC}"
    
    # إيقاف الخدمات
    echo "إيقاف الخدمات..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null
    pm2 stop all 2>/dev/null
    
    # تنظيف سريع
    echo "تنظيف الموارد..."
    docker system prune -f 2>/dev/null
    
    # إعادة التشغيل
    echo "بدء الخدمات..."
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml up -d
        print_status $? "Docker Compose"
    elif command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js
        print_status $? "PM2"
    else
        npm run build && npm start &
        print_status $? "Node.js"
    fi
    
    # انتظار بدء الخدمات
    echo "انتظار بدء الخدمات..."
    sleep 10
    
    # فحص الحالة
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"
    print_status $? "التطبيق يعمل على المنفذ 3000"
}

# 2. تنظيف الذاكرة والموارد
clean_resources() {
    echo -e "${YELLOW}🧹 تنظيف الموارد...${NC}"
    
    # تنظيف Docker
    if command -v docker &> /dev/null; then
        echo "تنظيف Docker..."
        docker system prune -a -f --volumes
        print_status $? "تنظيف Docker"
    fi
    
    # تنظيف PM2
    if command -v pm2 &> /dev/null; then
        pm2 flush
        print_status $? "تنظيف سجلات PM2"
    fi
    
    # تنظيف السجلات القديمة
    if [ -d "logs" ]; then
        find logs -name "*.log" -mtime +7 -delete
        print_status $? "حذف السجلات القديمة"
    fi
    
    # تنظيف الملفات المؤقتة
    rm -rf /tmp/npm-* /tmp/yarn-* 2>/dev/null
    print_status $? "حذف الملفات المؤقتة"
    
    # تنظيف ذاكرة النظام
    if command -v sync &> /dev/null; then
        sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null
        print_status $? "تنظيف ذاكرة التخزين المؤقت"
    fi
}

# 3. إصلاح مشاكل قاعدة البيانات
fix_database() {
    echo -e "${YELLOW}🗄️ إصلاح قاعدة البيانات...${NC}"
    
    # التحقق من اتصال قاعدة البيانات
    npx prisma db pull 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "الاتصال بقاعدة البيانات"
        
        # تحديث المخطط
        npx prisma generate
        print_status $? "توليد عميل Prisma"
        
        # تشغيل الهجرات
        npx prisma migrate deploy 2>/dev/null
        print_status $? "تطبيق الهجرات"
    else
        print_status 1 "فشل الاتصال بقاعدة البيانات"
        echo -e "${RED}تحقق من DATABASE_URL في ملف .env${NC}"
    fi
}

# 4. إصلاح مشاكل المنافذ
fix_ports() {
    echo -e "${YELLOW}🔌 إصلاح مشاكل المنافذ...${NC}"
    
    # فحص المنافذ المستخدمة
    ports=(80 443 3000)
    for port in "${ports[@]}"; do
        pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}المنفذ $port مستخدم بواسطة PID: $pid${NC}"
            read -p "هل تريد إيقاف هذه العملية؟ (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $pid 2>/dev/null
                print_status $? "إيقاف العملية على المنفذ $port"
            fi
        else
            print_status 0 "المنفذ $port متاح"
        fi
    done
}

# 5. تحديث شهادات SSL
update_ssl() {
    echo -e "${YELLOW}🔒 تحديث شهادات SSL...${NC}"
    check_root "recommended"
    
    if command -v certbot &> /dev/null; then
        certbot renew --force-renewal
        print_status $? "تجديد شهادة Let's Encrypt"
        
        # إعادة تشغيل Nginx
        if command -v nginx &> /dev/null; then
            nginx -s reload
            print_status $? "إعادة تحميل Nginx"
        fi
    else
        echo -e "${RED}Certbot غير مثبت${NC}"
        echo "يمكنك استخدام Cloudflare لشهادات SSL مجانية"
    fi
}

# 6. النسخ الاحتياطي العاجل
emergency_backup() {
    echo -e "${YELLOW}💾 إنشاء نسخة احتياطية عاجلة...${NC}"
    
    backup_dir="backups/emergency-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $backup_dir
    
    # نسخ قاعدة البيانات
    if [ ! -z "$DATABASE_URL" ]; then
        pg_dump $DATABASE_URL > $backup_dir/database.sql 2>/dev/null || \
        mysqldump --single-transaction --routines --triggers $DATABASE_URL > $backup_dir/database.sql 2>/dev/null
        print_status $? "نسخ قاعدة البيانات"
    fi
    
    # نسخ الملفات المهمة
    tar -czf $backup_dir/files.tar.gz \
        .env* \
        uploads/ \
        public/uploads/ \
        prisma/schema.prisma \
        package.json \
        2>/dev/null
    print_status $? "نسخ الملفات المهمة"
    
    echo -e "${GREEN}✅ النسخة الاحتياطية محفوظة في: $backup_dir${NC}"
}

# 7. استعادة من نسخة احتياطية
restore_backup() {
    echo -e "${YELLOW}📥 استعادة من نسخة احتياطية...${NC}"
    
    # عرض النسخ المتاحة
    echo "النسخ الاحتياطية المتاحة:"
    ls -la backups/
    
    read -p "أدخل اسم مجلد النسخة الاحتياطية: " backup_name
    
    if [ -d "backups/$backup_name" ]; then
        # استعادة قاعدة البيانات
        if [ -f "backups/$backup_name/database.sql" ]; then
            psql $DATABASE_URL < backups/$backup_name/database.sql 2>/dev/null || \
            mysql $DATABASE_URL < backups/$backup_name/database.sql 2>/dev/null
            print_status $? "استعادة قاعدة البيانات"
        fi
        
        # استعادة الملفات
        if [ -f "backups/$backup_name/files.tar.gz" ]; then
            tar -xzf backups/$backup_name/files.tar.gz
            print_status $? "استعادة الملفات"
        fi
    else
        echo -e "${RED}مجلد النسخة الاحتياطية غير موجود${NC}"
    fi
}

# 8. فحص شامل للنظام
system_check() {
    echo -e "${YELLOW}🔍 فحص شامل للنظام...${NC}"
    
    # تشغيل سكريبت التشخيص
    if [ -f "server-diagnostic.sh" ]; then
        bash server-diagnostic.sh
    else
        # فحص أساسي
        echo "📊 الموارد:"
        free -h
        df -h | grep -E "^/dev/"
        
        echo -e "\n🔌 الخدمات:"
        systemctl is-active nginx >/dev/null 2>&1 && echo "✓ Nginx يعمل" || echo "✗ Nginx متوقف"
        docker ps >/dev/null 2>&1 && echo "✓ Docker يعمل" || echo "✗ Docker متوقف"
        pm2 status >/dev/null 2>&1 && echo "✓ PM2 يعمل" || echo "✗ PM2 متوقف"
    fi
}

# 9. وضع الصيانة
maintenance_mode() {
    echo -e "${YELLOW}🔧 وضع الصيانة...${NC}"
    
    maintenance_file="public/maintenance.html"
    
    if [ -f "$maintenance_file" ]; then
        rm $maintenance_file
        print_status $? "تم إلغاء وضع الصيانة"
    else
        cat > $maintenance_file << 'EOF'
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>الموقع تحت الصيانة - سبق</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; }
        .icon { font-size: 4rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>الموقع تحت الصيانة</h1>
        <p>نعمل على تحسين الخدمة. سنعود قريباً!</p>
        <p>شكراً لتفهمكم</p>
    </div>
</body>
</html>
EOF
        print_status $? "تم تفعيل وضع الصيانة"
        echo "لإلغاء وضع الصيانة، شغل هذا الخيار مرة أخرى"
    fi
}

# البرنامج الرئيسي
while true; do
    show_menu
    
    case $choice in
        1) restart_all ;;
        2) clean_resources ;;
        3) fix_database ;;
        4) fix_ports ;;
        5) update_ssl ;;
        6) emergency_backup ;;
        7) restore_backup ;;
        8) system_check ;;
        9) maintenance_mode ;;
        0) echo "👋 وداعاً!"; exit 0 ;;
        *) echo -e "${RED}خيار غير صحيح${NC}" ;;
    esac
    
    echo ""
    read -p "اضغط Enter للعودة للقائمة..."
    clear
done 