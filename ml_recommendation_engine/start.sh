#!/bin/bash
# محرك التوصيات الذكي - سبق الذكية
# نص بدء التشغيل
# Sabq AI Recommendation Engine - Startup Script

set -e

echo "🚀 بدء تشغيل محرك التوصيات الذكي - سبق"
echo "==============================================="

# ألوان للإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# التحقق من Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 غير مثبت"
    exit 1
fi

print_status "تم العثور على Python $(python3 --version)"

# التحقق من pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 غير مثبت"
    exit 1
fi

print_status "تم العثور على pip"

# إنشاء البيئة الافتراضية إذا لم تكن موجودة
if [ ! -d "venv" ]; then
    print_info "إنشاء البيئة الافتراضية..."
    python3 -m venv venv
    print_status "تم إنشاء البيئة الافتراضية"
fi

# تفعيل البيئة الافتراضية
print_info "تفعيل البيئة الافتراضية..."
source venv/bin/activate
print_status "تم تفعيل البيئة الافتراضية"

# تحديث pip
print_info "تحديث pip..."
pip install --upgrade pip

# تثبيت المتطلبات
if [ -f "requirements.txt" ]; then
    print_info "تثبيت المتطلبات..."
    pip install -r requirements.txt
    print_status "تم تثبيت جميع المتطلبات"
else
    print_warning "ملف requirements.txt غير موجود"
fi

# إنشاء المجلدات المطلوبة
print_info "إنشاء المجلدات..."
mkdir -p models logs data backups

print_status "تم إنشاء المجلدات"

# التحقق من المتغيرات البيئية
if [ ! -f ".env" ]; then
    print_warning "ملف .env غير موجود، سيتم استخدام الإعدادات الافتراضية"
    print_info "يمكنك نسخ .env.example إلى .env وتعديل الإعدادات"
fi

# التحقق من Docker (اختياري)
if command -v docker &> /dev/null; then
    print_status "تم العثور على Docker"
    
    # التحقق من تشغيل خدمات Docker
    if [ "$1" = "--with-docker" ]; then
        print_info "بدء خدمات Docker..."
        docker-compose up -d postgres redis
        print_status "تم بدء خدمات قاعدة البيانات"
        
        # انتظار تشغيل الخدمات
        print_info "انتظار تشغيل الخدمات..."
        sleep 10
    fi
else
    print_warning "Docker غير مثبت - ستحتاج لتشغيل PostgreSQL و Redis يدوياً"
fi

# التحقق من الاتصال بقاعدة البيانات
print_info "التحقق من الاتصالات..."

# تشغيل اختبار سريع
python3 -c "
import asyncio
import sys
from config import settings
print(f'البيئة: {settings.environment}')
print(f'مسار النماذج: {settings.model_path}')
print(f'مستوى السجلات: {settings.log_level}')
print('✓ تم تحميل الإعدادات بنجاح')
" || {
    print_error "خطأ في تحميل الإعدادات"
    exit 1
}

print_status "تم التحقق من الإعدادات"

# خيارات التشغيل
echo
echo "خيارات التشغيل:"
echo "================"
echo "1. تدريب النماذج:    python train_models.py"
echo "2. تشغيل الخادم:     python main.py"
echo "3. مع uvicorn:       uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "4. مع Docker:        docker-compose up"
echo

# تشغيل تلقائي إذا تم طلبه
if [ "$1" = "--run" ]; then
    print_info "بدء تشغيل الخادم..."
    python main.py
elif [ "$1" = "--train" ]; then
    print_info "بدء تدريب النماذج..."
    python train_models.py
elif [ "$1" = "--dev" ]; then
    print_info "بدء وضع التطوير..."
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
    print_status "جاهز للتشغيل! استخدم إحدى الخيارات أعلاه"
fi

echo
print_status "تم إكمال الإعداد بنجاح! 🎉"
