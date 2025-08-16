# محرك التوصيات الذكي - سبق الذكية
# Sabq AI Intelligent Recommendation Engine - Docker Image

FROM python:3.11-slim

# تعيين متغيرات البيئة
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# إنشاء مستخدم غير root
RUN useradd --create-home --shell /bin/bash sabq_ai

# تثبيت متطلبات النظام
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# إنشاء مجلدات العمل
WORKDIR /app
RUN mkdir -p /app/models /app/logs /app/data

# نسخ ملفات المتطلبات
COPY requirements.txt .

# تثبيت المكتبات Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# نسخ الكود
COPY . .

# تغيير الملكية للمستخدم الجديد
RUN chown -R sabq_ai:sabq_ai /app

# التبديل للمستخدم الجديد
USER sabq_ai

# تعريض المنافذ
EXPOSE 8000

# الأمر الافتراضي
CMD ["uvicorn", "api.recommendation_routes:app", "--host", "0.0.0.0", "--port", "8000"]
