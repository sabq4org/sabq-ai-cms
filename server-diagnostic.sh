#!/bin/bash

echo "🔍 تشخيص السيرفر - سبق AI CMS"
echo "================================"
echo ""

# 1. فحص موارد النظام
echo "📊 موارد النظام:"
echo "----------------"
echo "الذاكرة المتاحة:"
free -h 2>/dev/null || echo "أمر free غير متاح"
echo ""
echo "مساحة القرص:"
df -h | grep -E "^/dev/" 2>/dev/null || echo "معلومات القرص غير متاحة"
echo ""
echo "استخدام المعالج:"
top -bn1 | head -5 2>/dev/null || echo "أمر top غير متاح"
echo ""

# 2. فحص Docker
echo "🐳 حالة Docker:"
echo "-------------"
if command -v docker &> /dev/null; then
    echo "Docker مثبت ✅"
    docker --version
    echo ""
    echo "الحاويات النشطة:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "استخدام الموارد:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
else
    echo "Docker غير مثبت ❌"
fi
echo ""

# 3. فحص PM2
echo "⚙️ حالة PM2:"
echo "-----------"
if command -v pm2 &> /dev/null; then
    echo "PM2 مثبت ✅"
    pm2 --version
    echo ""
    pm2 status
else
    echo "PM2 غير مثبت ❌"
fi
echo ""

# 4. فحص المنافذ
echo "🔌 المنافذ المستخدمة:"
echo "-------------------"
netstat -tuln 2>/dev/null | grep -E ":(80|443|3000|5432|3306)" || \
    ss -tuln 2>/dev/null | grep -E ":(80|443|3000|5432|3306)" || \
    echo "لا يمكن فحص المنافذ"
echo ""

# 5. فحص Nginx
echo "🌐 حالة Nginx:"
echo "-------------"
if command -v nginx &> /dev/null; then
    echo "Nginx مثبت ✅"
    nginx -v 2>&1
    echo ""
    systemctl status nginx 2>/dev/null | head -5 || echo "لا يمكن فحص حالة Nginx"
else
    echo "Nginx غير مثبت ❌"
fi
echo ""

# 6. فحص اتصال قاعدة البيانات
echo "🗄️ اتصال قاعدة البيانات:"
echo "---------------------"
if [ -f ".env" ]; then
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
    if [ ! -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL موجود ✅"
        # يمكن إضافة اختبار اتصال فعلي هنا
    else
        echo "DATABASE_URL غير موجود ❌"
    fi
else
    echo "ملف .env غير موجود ❌"
fi
echo ""

# 7. فحص السجلات
echo "📝 آخر الأخطاء:"
echo "--------------"
echo "سجلات PM2:"
if [ -d "./logs" ]; then
    tail -n 10 ./logs/pm2-error.log 2>/dev/null || echo "لا توجد سجلات PM2"
fi
echo ""
echo "سجلات Docker:"
docker logs jur3a-cms-app --tail 10 2>/dev/null || echo "لا توجد سجلات Docker"
echo ""

echo "✅ انتهى التشخيص"
echo ""
echo "💡 نصائح سريعة:"
echo "- تحقق من أن جميع الخدمات تعمل"
echo "- تأكد من توفر مساحة كافية على القرص"
echo "- راجع السجلات بحثاً عن أخطاء"
echo "- تحقق من صحة إعدادات البيئة" 