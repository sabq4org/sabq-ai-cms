# نظام تتبع سلوك المستخدم - سبق الذكية
# User Behavior Tracking System - Docker Image

FROM python:3.11-slim

# إعداد معلومات البناء
LABEL maintainer="Sabq AI Team <tech@sabq.ai>"
LABEL description="User Behavior Tracking System for Sabq AI Platform"
LABEL version="1.0.0"

# إعداد متغيرات البيئة
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# إعداد دليل العمل
WORKDIR /app

# تثبيت متطلبات النظام
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# نسخ ملف المتطلبات وتثبيتها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ كود التطبيق
COPY . .

# إنشاء مجلد السجلات
RUN mkdir -p logs

# إنشاء مستخدم غير مميز لتشغيل التطبيق
RUN groupadd -r sabquser && useradd -r -g sabquser sabquser
RUN chown -R sabquser:sabquser /app
USER sabquser

# فحص صحة التطبيق
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# تعريض المنفذ
EXPOSE 8000

# أمر تشغيل التطبيق
CMD ["python", "start_server.py"]
