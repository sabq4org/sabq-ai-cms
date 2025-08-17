# صورة نظام تحليل المشاعر العربي
# Arabic Sentiment Analysis System Docker Image

FROM python:3.11-slim

# تعيين متغيرات البيئة
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Riyadh

# تحديث النظام وتثبيت المتطلبات الأساسية
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    unzip \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    gcc \
    g++ \
    libc6-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libwebp-dev \
    tcl8.6-dev \
    tk8.6-dev \
    python3-tk \
    libharfbuzz-dev \
    libfribidi-dev \
    libxcb1-dev \
    && rm -rf /var/lib/apt/lists/*

# إنشاء مستخدم غير جذر للأمان
RUN useradd --create-home --shell /bin/bash sentiment && \
    mkdir -p /app && \
    chown -R sentiment:sentiment /app

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملف المتطلبات
COPY requirements.txt .

# ترقية pip وتثبيت المتطلبات
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir wheel setuptools && \
    pip install --no-cache-dir -r requirements.txt

# تنزيل النماذج المطلوبة
RUN python -c "
import nltk
import transformers
from transformers import AutoTokenizer, AutoModel

# تنزيل بيانات NLTK
print('تنزيل بيانات NLTK...')
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# تنزيل النماذج العربية المدربة مسبقاً
print('تنزيل النماذج العربية...')
try:
    tokenizer = AutoTokenizer.from_pretrained('aubmindlab/bert-base-arabert')
    model = AutoModel.from_pretrained('aubmindlab/bert-base-arabert')
    print('✅ تم تنزيل BERT العربي بنجاح')
except Exception as e:
    print(f'⚠️ فشل في تنزيل BERT العربي: {e}')

try:
    tokenizer2 = AutoTokenizer.from_pretrained('aubmindlab/bert-base-arabertv02')
    model2 = AutoModel.from_pretrained('aubmindlab/bert-base-arabertv02')
    print('✅ تم تنزيل BERT العربي v2 بنجاح')
except Exception as e:
    print(f'⚠️ فشل في تنزيل BERT العربي v2: {e}')

print('✅ اكتملت عملية تنزيل النماذج')
"

# إنشاء المجلدات اللازمة
RUN mkdir -p /app/logs /app/models /app/data /app/cache && \
    chown -R sentiment:sentiment /app

# نسخ كامل التطبيق
COPY . .

# إعطاء صلاحيات للملفات
RUN chmod +x /app/start_server.py && \
    chown -R sentiment:sentiment /app

# التبديل للمستخدم غير الجذر
USER sentiment

# إنشاء ملف إعدادات الإنتاج
RUN echo "
# إعدادات الإنتاج
APP_NAME=Arabic Sentiment Analysis System
DEBUG=false
LOG_LEVEL=INFO

# قاعدة البيانات
DATABASE_URL=postgresql://sentiment_user:sentiment_pass@postgres:5432/sentiment_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# ClickHouse
CLICKHOUSE_HOST=clickhouse
CLICKHOUSE_PORT=9000
CLICKHOUSE_DB=sentiment_analytics
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_SENTIMENT_TOPIC=sentiment-analysis
KAFKA_EMOTIONS_TOPIC=emotion-analysis

# النماذج
ARABIC_BERT_MODEL=aubmindlab/bert-base-arabert
MAX_SEQUENCE_LENGTH=512
BATCH_SIZE=16

# الأداء
ENABLE_CACHING=true
CACHE_TTL=3600
MAX_CONCURRENT_REQUESTS=100
RATE_LIMIT_PER_MINUTE=1000

# الأمان
API_KEY_REQUIRED=false
" > /app/.env.production

# إنشاء نقطة صحة للتطبيق
RUN echo '#!/usr/bin/env python3
import requests
import sys
import time

def health_check():
    try:
        response = requests.get("http://localhost:8001/health", timeout=10)
        if response.status_code == 200:
            print("✅ النظام يعمل بشكل صحيح")
            return 0
        else:
            print(f"❌ فشل فحص الصحة: HTTP {response.status_code}")
            return 1
    except requests.exceptions.RequestException as e:
        print(f"❌ فشل في الاتصال: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(health_check())
' > /app/health_check.py && chmod +x /app/health_check.py

# تعريض المنفذ
EXPOSE 8001

# فحص الصحة
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python /app/health_check.py

# الأوامر الافتراضية
CMD ["python", "-m", "uvicorn", "api.sentiment_api:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]

# التسميات
LABEL maintainer="Arabic Sentiment Analysis Team" \
      version="1.0.0" \
      description="نظام تحليل المشاعر العربي المتقدم" \
      org.opencontainers.image.title="Arabic Sentiment Analysis System" \
      org.opencontainers.image.description="Advanced sentiment analysis system for Arabic text" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="2024-01-15" \
      org.opencontainers.image.authors="Sabq AI Team" \
      org.opencontainers.image.url="https://github.com/sabq-ai/sentiment-analysis" \
      org.opencontainers.image.documentation="https://docs.sabq-ai.com/sentiment" \
      org.opencontainers.image.vendor="Sabq AI" \
      org.opencontainers.image.licenses="MIT"
