# محرك التوصيات الذكي - سبق الذكية
# Sabq AI Recommendation Engine - Configuration

import os
from typing import Optional
from pydantic import BaseSettings, Field
from functools import lru_cache

class Settings(BaseSettings):
    """إعدادات محرك التوصيات الذكي"""
    
    # ===== إعدادات قاعدة البيانات =====
    db_host: str = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    db_name: str = Field(default="sabq_ai_recommendations", env="DB_NAME")
    db_user: str = Field(default="sabq_user", env="DB_USER")
    db_password: str = Field(default="sabq_password_2024", env="DB_PASSWORD")
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    # ===== إعدادات Redis =====
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_password: Optional[str] = Field(default="sabq_redis_2024", env="REDIS_PASSWORD")
    
    @property
    def redis_url(self) -> str:
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/0"
    
    # ===== إعدادات AWS S3 =====
    aws_access_key_id: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    s3_bucket: str = Field(default="sabq-ai-models", env="S3_BUCKET")
    aws_region: str = Field(default="us-east-1", env="AWS_REGION")
    
    # ===== إعدادات النظام =====
    environment: str = Field(default="development", env="ENVIRONMENT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    secret_key: str = Field(default="your_secret_key_here_change_in_production", env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # ===== إعدادات المسارات =====
    model_path: str = Field(default="./models", env="MODEL_PATH")
    log_path: str = Field(default="./logs", env="LOG_PATH")
    data_path: str = Field(default="./data", env="DATA_PATH")
    backup_path: str = Field(default="./backups", env="BACKUP_PATH")
    
    # ===== إعدادات محرك التوصيات =====
    max_recommendations: int = Field(default=20, env="MAX_RECOMMENDATIONS")
    min_interactions: int = Field(default=5, env="MIN_INTERACTIONS")
    similarity_threshold: float = Field(default=0.1, env="SIMILARITY_THRESHOLD")
    update_frequency_hours: int = Field(default=24, env="UPDATE_FREQUENCY_HOURS")
    batch_size: int = Field(default=1000, env="BATCH_SIZE")
    max_workers: int = Field(default=4, env="MAX_WORKERS")
    
    # ===== إعدادات التعلم المستمر =====
    learning_rate: float = Field(default=0.01, env="LEARNING_RATE")
    retrain_threshold: int = Field(default=1000, env="RETRAIN_THRESHOLD")
    concept_drift_threshold: float = Field(default=0.05, env="CONCEPT_DRIFT_THRESHOLD")
    max_memory_size: int = Field(default=10000, env="MAX_MEMORY_SIZE")
    
    # ===== إعدادات الأداء =====
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")
    max_concurrent_requests: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    health_check_interval: int = Field(default=60, env="HEALTH_CHECK_INTERVAL")
    
    # ===== إعدادات المراقبة =====
    enable_prometheus: bool = Field(default=True, env="ENABLE_PROMETHEUS")
    prometheus_port: int = Field(default=9090, env="PROMETHEUS_PORT")
    metrics_collection_interval: int = Field(default=60, env="METRICS_COLLECTION_INTERVAL")
    
    # ===== إعدادات الأمان =====
    allowed_hosts: list = Field(default=["localhost", "127.0.0.1", "sabq.ai"], env="ALLOWED_HOSTS")
    cors_origins: list = Field(default=["http://localhost:3000", "https://sabq.ai"], env="CORS_ORIGINS")
    rate_limit_per_minute: int = Field(default=100, env="RATE_LIMIT_PER_MINUTE")
    
    # ===== إعدادات التطوير =====
    debug: bool = Field(default=True, env="DEBUG")
    reload: bool = Field(default=True, env="RELOAD")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def is_production(self) -> bool:
        """التحقق من بيئة الإنتاج"""
        return self.environment.lower() == "production"
    
    def is_development(self) -> bool:
        """التحقق من بيئة التطوير"""
        return self.environment.lower() == "development"

@lru_cache()
def get_settings() -> Settings:
    """الحصول على إعدادات النظام"""
    return Settings()

# إعدادات عامة
settings = get_settings()

# إعدادات خاصة بالنماذج
MODEL_CONFIG = {
    "collaborative_filtering": {
        "factors": 50,
        "regularization": 0.01,
        "iterations": 15,
        "alpha": 40,
        "use_gpu": False
    },
    "content_based": {
        "min_df": 2,
        "max_df": 0.8,
        "ngram_range": (1, 2),
        "max_features": 10000
    },
    "deep_learning": {
        "embedding_dim": 64,
        "hidden_dims": [128, 64, 32],
        "dropout": 0.3,
        "learning_rate": 0.001,
        "batch_size": 256,
        "epochs": 100
    },
    "neural_collaborative": {
        "num_users": 100000,
        "num_items": 50000,
        "embed_dim": 64,
        "hidden_dim": 128,
        "dropout": 0.2
    }
}

# إعدادات التخزين المؤقت
CACHE_CONFIG = {
    "user_recommendations": 3600,  # ساعة واحدة
    "popular_items": 7200,         # ساعتان
    "item_similarities": 86400,    # 24 ساعة
    "user_profiles": 1800,         # 30 دقيقة
    "trending_topics": 600         # 10 دقائق
}

# إعدادات السجلات
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "[{asctime}] {levelname} in {module}: {message}",
            "style": "{"
        },
        "detailed": {
            "format": "[{asctime}] {levelname} {name}:{lineno} - {message}",
            "style": "{"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": settings.log_level,
            "formatter": "default",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "class": "logging.FileHandler",
            "level": "INFO",
            "formatter": "detailed",
            "filename": f"{settings.log_path}/recommendation_engine.log",
            "encoding": "utf8"
        }
    },
    "loggers": {
        "recommendation_engine": {
            "level": settings.log_level,
            "handlers": ["console", "file"],
            "propagate": False
        }
    },
    "root": {
        "level": "WARNING",
        "handlers": ["console"]
    }
}
