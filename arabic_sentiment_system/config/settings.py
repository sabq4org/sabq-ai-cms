# إعدادات نظام تحليل المشاعر العربي
# Arabic Sentiment Analysis System Configuration

from pydantic import BaseSettings, Field
from typing import List, Dict, Any, Optional
import os
from pathlib import Path

class SentimentConfig(BaseSettings):
    """إعدادات نظام تحليل المشاعر"""
    
    # إعدادات التطبيق
    app_name: str = Field(default="Arabic Sentiment Analysis System", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # إعدادات قاعدة البيانات
    database_url: str = Field(
        default="postgresql://postgres:password@localhost:5432/sabq_sentiment",
        env="DATABASE_URL"
    )
    database_pool_size: int = Field(default=20, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=10, env="DATABASE_MAX_OVERFLOW")
    
    # إعدادات Redis
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_db: int = Field(default=1, env="REDIS_DB")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    redis_key_prefix: str = Field(default="sentiment:", env="REDIS_KEY_PREFIX")
    
    # إعدادات ClickHouse للتحليلات
    clickhouse_host: str = Field(default="localhost", env="CLICKHOUSE_HOST")
    clickhouse_port: int = Field(default=9000, env="CLICKHOUSE_PORT")
    clickhouse_database: str = Field(default="sentiment_analytics", env="CLICKHOUSE_DB")
    clickhouse_username: str = Field(default="default", env="CLICKHOUSE_USER")
    clickhouse_password: str = Field(default="", env="CLICKHOUSE_PASSWORD")
    
    # إعدادات Kafka
    kafka_bootstrap_servers: str = Field(
        default="localhost:9092", 
        env="KAFKA_BOOTSTRAP_SERVERS"
    )
    kafka_sentiment_topic: str = Field(
        default="sentiment-analysis", 
        env="KAFKA_SENTIMENT_TOPIC"
    )
    kafka_emotions_topic: str = Field(
        default="emotion-analysis", 
        env="KAFKA_EMOTIONS_TOPIC"
    )
    kafka_trends_topic: str = Field(
        default="sentiment-trends", 
        env="KAFKA_TRENDS_TOPIC"
    )
    
    # إعدادات النماذج
    models_path: str = Field(default="./models", env="MODELS_PATH")
    
    # نماذج BERT العربية
    arabic_bert_model: str = Field(
        default="aubmindlab/bert-base-arabert", 
        env="ARABIC_BERT_MODEL"
    )
    arabic_bert_sentiment_model: str = Field(
        default="aubmindlab/bert-base-arabertv02", 
        env="ARABIC_BERT_SENTIMENT_MODEL"
    )
    
    # نماذج التحليل العاطفي
    emotion_model_path: str = Field(
        default="./models/emotion_classifier.pt", 
        env="EMOTION_MODEL_PATH"
    )
    
    # نماذج التحليل الضمني
    implicit_sentiment_model: str = Field(
        default="./models/implicit_sentiment.pt",
        env="IMPLICIT_SENTIMENT_MODEL"
    )
    
    # إعدادات معالجة النصوص
    max_sequence_length: int = Field(default=512, env="MAX_SEQUENCE_LENGTH")
    batch_size: int = Field(default=32, env="BATCH_SIZE")
    max_text_length: int = Field(default=5000, env="MAX_TEXT_LENGTH")
    
    # إعدادات التحليل
    sentiment_threshold: float = Field(default=0.6, env="SENTIMENT_THRESHOLD")
    emotion_threshold: float = Field(default=0.5, env="EMOTION_THRESHOLD")
    confidence_threshold: float = Field(default=0.7, env="CONFIDENCE_THRESHOLD")
    
    # أنواع المشاعر المدعومة
    sentiment_labels: List[str] = Field(
        default=["positive", "negative", "neutral"],
        env="SENTIMENT_LABELS"
    )
    
    # أنواع العواطف المدعومة
    emotion_labels: List[str] = Field(
        default=["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"],
        env="EMOTION_LABELS"
    )
    
    # أنواع المزاج للمحتوى
    mood_categories: List[str] = Field(
        default=["uplifting", "informative", "entertaining", "serious", "emotional", "neutral"],
        env="MOOD_CATEGORIES"
    )
    
    # إعدادات اللهجات العربية
    arabic_dialects: List[str] = Field(
        default=["saudi", "egyptian", "levantine", "gulf", "maghrebi", "msa"],
        env="ARABIC_DIALECTS"
    )
    
    # إعدادات الأداء
    enable_caching: bool = Field(default=True, env="ENABLE_CACHING")
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # ثواني
    max_concurrent_requests: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")  # ثواني
    
    # إعدادات التحليل المجمع
    batch_processing_size: int = Field(default=1000, env="BATCH_PROCESSING_SIZE")
    batch_processing_interval: int = Field(default=60, env="BATCH_PROCESSING_INTERVAL")  # ثواني
    
    # إعدادات مراقبة الأداء
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_retention_days: int = Field(default=30, env="METRICS_RETENTION_DAYS")
    
    # إعدادات التدريب والتحديث
    model_update_frequency: int = Field(default=7, env="MODEL_UPDATE_FREQUENCY")  # أيام
    training_data_path: str = Field(default="./data/training", env="TRAINING_DATA_PATH")
    
    # إعدادات الأمان
    api_key_required: bool = Field(default=False, env="API_KEY_REQUIRED")
    rate_limit_per_minute: int = Field(default=1000, env="RATE_LIMIT_PER_MINUTE")
    
    # إعدادات تحليل الاتجاهات
    trend_analysis_window: int = Field(default=24, env="TREND_ANALYSIS_WINDOW")  # ساعات
    min_samples_for_trend: int = Field(default=100, env="MIN_SAMPLES_FOR_TREND")
    
    # إعدادات الرأي العام
    public_opinion_categories: List[str] = Field(
        default=["politics", "economy", "sports", "technology", "health", "education"],
        env="PUBLIC_OPINION_CATEGORIES"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# إنشاء instance من الإعدادات
settings = SentimentConfig()

# إعدادات التسجيل
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": settings.log_level,
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": settings.log_level,
            "formatter": "detailed",
            "filename": "logs/sentiment_system.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "sentiment_system": {
            "level": settings.log_level,
            "handlers": ["console", "file"],
            "propagate": False,
        },
    },
    "root": {
        "level": settings.log_level,
        "handlers": ["console"],
    },
}

# معلومات النماذج المدعومة
SUPPORTED_MODELS = {
    "bert_base": {
        "name": "BERT Base Arabic",
        "model_name": "aubmindlab/bert-base-arabert",
        "tasks": ["sentiment", "emotion"],
        "languages": ["arabic"],
        "dialects": ["msa", "saudi", "egyptian"]
    },
    "bert_large": {
        "name": "BERT Large Arabic",
        "model_name": "aubmindlab/bert-large-arabertv02",
        "tasks": ["sentiment", "emotion", "implicit"],
        "languages": ["arabic"],
        "dialects": ["msa", "gulf", "levantine"]
    },
    "camel_bert": {
        "name": "CAMeL BERT",
        "model_name": "CAMeL-Lab/bert-base-arabic-camelbert-msa",
        "tasks": ["sentiment", "dialectal"],
        "languages": ["arabic"],
        "dialects": ["msa", "maghrebi"]
    }
}

# تعيينات اللهجات
DIALECT_MAPPINGS = {
    "saudi": ["سعودي", "نجدي", "حجازي"],
    "egyptian": ["مصري", "قاهري"],
    "levantine": ["شامي", "لبناني", "سوري", "أردني", "فلسطيني"],
    "gulf": ["خليجي", "إماراتي", "كويتي", "قطري", "بحريني", "عماني"],
    "maghrebi": ["مغربي", "جزائري", "تونسي", "ليبي"],
    "msa": ["فصحى", "عربية فصحى", "فصيح"]
}

# قوائم كلمات المشاعر العربية
ARABIC_SENTIMENT_LEXICON = {
    "positive_words": [
        "ممتاز", "رائع", "جميل", "مفيد", "مبهر", "استثنائي", "ناجح", "فعال",
        "محبوب", "مقبول", "إيجابي", "سعيد", "مسرور", "راضي", "مطمئن", "متفائل"
    ],
    "negative_words": [
        "سيء", "فظيع", "مؤلم", "محزن", "مخيف", "غاضب", "مقلق", "محبط",
        "فاشل", "ضعيف", "سلبي", "مرفوض", "مزعج", "مؤذي", "خطير", "متشائم"
    ],
    "neutral_words": [
        "عادي", "طبيعي", "متوسط", "مقبول", "محايد", "عام", "أساسي", "منتظم"
    ]
}

# أوزان المشاعر حسب نوع المحتوى
CONTENT_TYPE_WEIGHTS = {
    "news": {"sentiment": 0.8, "emotion": 0.6, "urgency": 0.9},
    "opinion": {"sentiment": 0.9, "emotion": 0.8, "urgency": 0.5},
    "sports": {"sentiment": 0.7, "emotion": 0.9, "urgency": 0.7},
    "entertainment": {"sentiment": 0.6, "emotion": 0.9, "urgency": 0.3},
    "technology": {"sentiment": 0.7, "emotion": 0.5, "urgency": 0.6},
    "politics": {"sentiment": 0.9, "emotion": 0.7, "urgency": 0.8}
}
