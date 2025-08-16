#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
إعدادات النظام والتكوين
User Behavior Tracking System - Configuration
"""

import os
from typing import Optional, List
from pydantic import BaseSettings, Field, validator
from functools import lru_cache

class TrackingSettings(BaseSettings):
    """إعدادات نظام التتبع"""
    
    # ===== إعدادات الطبق =====
    app_name: str = Field(default="Sabq User Tracking System", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    
    # ===== إعدادات قاعدة البيانات =====
    db_host: str = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    db_name: str = Field(default="sabq_tracking", env="DB_NAME")
    db_user: str = Field(default="sabq_user", env="DB_USER")
    db_password: str = Field(default="sabq_password_2024", env="DB_PASSWORD")
    db_pool_size: int = Field(default=20, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=30, env="DB_MAX_OVERFLOW")
    
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    @property
    def database_url_sync(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    # ===== إعدادات Redis =====
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_password: Optional[str] = Field(default="sabq_redis_2024", env="REDIS_PASSWORD")
    redis_db: int = Field(default=0, env="REDIS_DB")
    redis_max_connections: int = Field(default=100, env="REDIS_MAX_CONNECTIONS")
    
    @property
    def redis_url(self) -> str:
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    # ===== إعدادات Kafka =====
    kafka_bootstrap_servers: List[str] = Field(
        default=["localhost:9092"], 
        env="KAFKA_BOOTSTRAP_SERVERS"
    )
    kafka_client_id: str = Field(default="sabq-tracking-client", env="KAFKA_CLIENT_ID")
    kafka_group_id: str = Field(default="sabq-tracking-group", env="KAFKA_GROUP_ID")
    kafka_auto_offset_reset: str = Field(default="latest", env="KAFKA_AUTO_OFFSET_RESET")
    kafka_enable_auto_commit: bool = Field(default=True, env="KAFKA_ENABLE_AUTO_COMMIT")
    
    # Kafka Topics
    kafka_user_interactions_topic: str = Field(
        default="user-interactions", 
        env="KAFKA_USER_INTERACTIONS_TOPIC"
    )
    kafka_reading_behavior_topic: str = Field(
        default="reading-behavior", 
        env="KAFKA_READING_BEHAVIOR_TOPIC"
    )
    kafka_context_data_topic: str = Field(
        default="context-data", 
        env="KAFKA_CONTEXT_DATA_TOPIC"
    )
    kafka_processed_events_topic: str = Field(
        default="processed-events", 
        env="KAFKA_PROCESSED_EVENTS_TOPIC"
    )
    
    @validator('kafka_bootstrap_servers', pre=True)
    def parse_kafka_servers(cls, v):
        if isinstance(v, str):
            return [server.strip() for server in v.split(',')]
        return v
    
    # ===== إعدادات الأمان =====
    secret_key: str = Field(
        default="your-secret-key-change-in-production", 
        env="SECRET_KEY"
    )
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # إعدادات التشفير
    encryption_key: Optional[str] = Field(default=None, env="ENCRYPTION_KEY")
    data_retention_days: int = Field(default=365, env="DATA_RETENTION_DAYS")
    
    # ===== إعدادات التتبع =====
    # معدل جمع البيانات (بالثواني)
    tracking_batch_size: int = Field(default=100, env="TRACKING_BATCH_SIZE")
    tracking_flush_interval: int = Field(default=5, env="TRACKING_FLUSH_INTERVAL")
    tracking_max_retry_attempts: int = Field(default=3, env="TRACKING_MAX_RETRY_ATTEMPTS")
    
    # إعدادات تتبع القراءة
    reading_session_timeout: int = Field(default=300, env="READING_SESSION_TIMEOUT")  # 5 دقائق
    scroll_tracking_threshold: float = Field(default=0.1, env="SCROLL_TRACKING_THRESHOLD")  # 10%
    reading_time_update_interval: int = Field(default=10, env="READING_TIME_UPDATE_INTERVAL")  # 10 ثواني
    
    # إعدادات الخصوصية
    anonymize_ip: bool = Field(default=True, env="ANONYMIZE_IP")
    respect_do_not_track: bool = Field(default=True, env="RESPECT_DO_NOT_TRACK")
    gdpr_compliance: bool = Field(default=True, env="GDPR_COMPLIANCE")
    
    # ===== إعدادات المراقبة =====
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=8001, env="METRICS_PORT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # ===== إعدادات الأداء =====
    max_concurrent_requests: int = Field(default=1000, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    worker_processes: int = Field(default=4, env="WORKER_PROCESSES")
    
    # إعدادات Rate Limiting
    rate_limit_per_minute: int = Field(default=1000, env="RATE_LIMIT_PER_MINUTE")
    rate_limit_burst: int = Field(default=2000, env="RATE_LIMIT_BURST")
    
    # ===== إعدادات CORS =====
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "https://sabq.ai"], 
        env="ALLOWED_ORIGINS"
    )
    allowed_methods: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
        env="ALLOWED_METHODS"
    )
    allowed_headers: List[str] = Field(
        default=["*"], 
        env="ALLOWED_HEADERS"
    )
    
    @validator('allowed_origins', pre=True)
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # ===== إعدادات البيئة =====
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def is_production(self) -> bool:
        """التحقق من بيئة الإنتاج"""
        return self.environment.lower() == "production"
    
    def is_development(self) -> bool:
        """التحقق من بيئة التطوير"""
        return self.environment.lower() == "development"
    
    def is_testing(self) -> bool:
        """التحقق من بيئة الاختبار"""
        return self.environment.lower() == "testing"

@lru_cache()
def get_settings() -> TrackingSettings:
    """الحصول على إعدادات النظام"""
    return TrackingSettings()

# إعدادات عامة
settings = get_settings()

# إعدادات خاصة بالتتبع
TRACKING_CONFIG = {
    "interaction_types": [
        "like",
        "unlike", 
        "save",
        "unsave",
        "share",
        "comment",
        "view",
        "click"
    ],
    "reading_behavior_events": [
        "page_view",
        "scroll",
        "reading_start",
        "reading_pause",
        "reading_resume",
        "reading_end",
        "content_visible",
        "content_hidden"
    ],
    "context_data_fields": [
        "timestamp",
        "user_agent",
        "device_type",
        "screen_resolution",
        "viewport_size",
        "time_zone",
        "language",
        "referrer",
        "utm_source",
        "utm_medium",
        "utm_campaign"
    ]
}

# إعدادات قواعد البيانات المخصصة
DATABASE_CONFIG = {
    "pool_settings": {
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_max_overflow,
        "pool_timeout": 30,
        "pool_recycle": 3600,
        "pool_pre_ping": True
    },
    "session_settings": {
        "autocommit": False,
        "autoflush": False,
        "expire_on_commit": False
    }
}

# إعدادات التخزين المؤقت
CACHE_CONFIG = {
    "user_sessions": 3600,      # ساعة واحدة
    "reading_analytics": 1800,   # 30 دقيقة
    "interaction_counters": 300, # 5 دقائق
    "context_data": 600,        # 10 دقائق
    "rate_limiting": 60         # دقيقة واحدة
}

# إعدادات السجلات
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[{asctime}] {levelname} في {name}:{lineno} - {message}",
            "style": "{"
        },
        "json": {
            "()": "structlog.stdlib.ProcessorFormatter",
            "processor": "structlog.dev.ConsoleRenderer",
            "foreign_pre_chain": [
                "structlog.stdlib.add_log_level",
                "structlog.stdlib.add_logger_name",
            ],
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": settings.log_level,
            "formatter": "json" if settings.log_format == "json" else "standard",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "json" if settings.log_format == "json" else "standard",
            "filename": "logs/tracking_system.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "encoding": "utf8"
        }
    },
    "loggers": {
        "sabq.tracking": {
            "level": settings.log_level,
            "handlers": ["console", "file"],
            "propagate": False
        },
        "sqlalchemy.engine": {
            "level": "WARNING",
            "handlers": ["console"],
            "propagate": False
        }
    },
    "root": {
        "level": "WARNING",
        "handlers": ["console"]
    }
}
