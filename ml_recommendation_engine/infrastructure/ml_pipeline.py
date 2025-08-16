# بنية التحتية لـ ML - محرك التوصيات الذكي
# ML Infrastructure Pipeline for Intelligent Recommendation Engine

import asyncio
import asyncpg
import redis.asyncio as redis
import logging
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import os
from pathlib import Path
import aioboto3
import aiofiles
import yaml
from contextlib import asynccontextmanager
import threading
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import torch
import joblib

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========================= إعدادات النظام =========================

@dataclass
class DatabaseConfig:
    """إعدادات قاعدة البيانات"""
    host: str = "localhost"
    port: int = 5432
    database: str = "sabq_ai_recommendations"
    username: str = "postgres"
    password: str = ""
    pool_min_size: int = 5
    pool_max_size: int = 20
    timeout: int = 30

@dataclass
class RedisConfig:
    """إعدادات Redis"""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    pool_size: int = 10
    timeout: int = 30
    key_prefix: str = "sabq_ai_rec:"

@dataclass
class S3Config:
    """إعدادات Amazon S3"""
    bucket_name: str = "sabq-ai-models"
    region: str = "us-east-1"
    access_key: Optional[str] = None
    secret_key: Optional[str] = None
    endpoint_url: Optional[str] = None

@dataclass
class MLConfig:
    """إعدادات ML"""
    model_storage_path: str = "/models"
    batch_size: int = 1000
    training_frequency: int = 3600  # seconds
    model_backup_frequency: int = 86400  # seconds
    max_workers: int = 4
    gpu_enabled: bool = torch.cuda.is_available()
    model_version: str = "1.0.0"

@dataclass
class SystemConfig:
    """إعدادات النظام العامة"""
    database: DatabaseConfig
    redis: RedisConfig
    s3: S3Config
    ml: MLConfig
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"

# ========================= إدارة قاعدة البيانات =========================

class DatabaseManager:
    """مدير قاعدة البيانات PostgreSQL"""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.pool = None
        self._lock = asyncio.Lock()
    
    async def initialize(self):
        """تهيئة اتصال قاعدة البيانات"""
        try:
            logger.info("🗄️  تهيئة اتصال قاعدة البيانات...")
            
            dsn = f"postgresql://{self.config.username}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.database}"
            
            self.pool = await asyncpg.create_pool(
                dsn,
                min_size=self.config.pool_min_size,
                max_size=self.config.pool_max_size,
                command_timeout=self.config.timeout
            )
            
            # إنشاء الجداول إذا لم تكن موجودة
            await self._create_tables()
            
            logger.info("✅ تم تهيئة قاعدة البيانات بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة قاعدة البيانات: {str(e)}")
            raise
    
    async def _create_tables(self):
        """إنشاء الجداول المطلوبة"""
        
        tables_sql = """
        -- جدول تفاعلات المستخدمين
        CREATE TABLE IF NOT EXISTS user_interactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            item_id VARCHAR(255) NOT NULL,
            interaction_type VARCHAR(50) NOT NULL,
            rating FLOAT,
            context JSONB,
            features BYTEA,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed BOOLEAN DEFAULT FALSE,
            
            INDEX ON (user_id),
            INDEX ON (item_id),
            INDEX ON (timestamp),
            INDEX ON (processed)
        );
        
        -- جدول ملفات المستخدمين
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id VARCHAR(255) PRIMARY KEY,
            interests JSONB,
            personality_traits JSONB,
            behavior_patterns JSONB,
            preferences JSONB,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            confidence_score FLOAT DEFAULT 0.0
        );
        
        -- جدول التوصيات المخبأة
        CREATE TABLE IF NOT EXISTS cached_recommendations (
            cache_key VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            recommendations JSONB NOT NULL,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            
            INDEX ON (user_id),
            INDEX ON (expires_at)
        );
        
        -- جدول إحصائيات المقالات
        CREATE TABLE IF NOT EXISTS item_statistics (
            item_id VARCHAR(255) PRIMARY KEY,
            views_count INTEGER DEFAULT 0,
            likes_count INTEGER DEFAULT 0,
            saves_count INTEGER DEFAULT 0,
            shares_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            total_reading_time INTEGER DEFAULT 0,
            average_rating FLOAT DEFAULT 0.0,
            popularity_score FLOAT DEFAULT 0.0,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- جدول النماذج المدربة
        CREATE TABLE IF NOT EXISTS trained_models (
            model_id VARCHAR(255) PRIMARY KEY,
            model_type VARCHAR(100) NOT NULL,
            model_version VARCHAR(50) NOT NULL,
            model_path VARCHAR(500),
            s3_key VARCHAR(500),
            performance_metrics JSONB,
            training_data_info JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT FALSE,
            
            INDEX ON (model_type),
            INDEX ON (is_active),
            INDEX ON (created_at)
        );
        
        -- جدول سجلات التدريب
        CREATE TABLE IF NOT EXISTS training_logs (
            id SERIAL PRIMARY KEY,
            model_id VARCHAR(255) NOT NULL,
            training_type VARCHAR(100) NOT NULL,
            status VARCHAR(50) NOT NULL,
            start_time TIMESTAMP WITH TIME ZONE,
            end_time TIMESTAMP WITH TIME ZONE,
            metrics JSONB,
            error_message TEXT,
            data_size INTEGER,
            
            INDEX ON (model_id),
            INDEX ON (training_type),
            INDEX ON (status),
            INDEX ON (start_time)
        );
        
        -- جدول مراقبة الأداء
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id SERIAL PRIMARY KEY,
            metric_type VARCHAR(100) NOT NULL,
            metric_name VARCHAR(100) NOT NULL,
            metric_value FLOAT NOT NULL,
            metadata JSONB,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            INDEX ON (metric_type),
            INDEX ON (metric_name),
            INDEX ON (timestamp)
        );
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(tables_sql)
            logger.info("📋 تم إنشاء/تحديث جداول قاعدة البيانات")
    
    async def save_interaction(self, user_id: str, item_id: str, 
                             interaction_type: str, rating: Optional[float] = None,
                             context: Optional[Dict] = None, 
                             features: Optional[np.ndarray] = None) -> int:
        """حفظ تفاعل مستخدم"""
        
        features_bytes = None
        if features is not None:
            features_bytes = pickle.dumps(features)
        
        async with self.pool.acquire() as conn:
            interaction_id = await conn.fetchval("""
                INSERT INTO user_interactions 
                (user_id, item_id, interaction_type, rating, context, features)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            """, user_id, item_id, interaction_type, rating, 
                json.dumps(context) if context else None, features_bytes)
            
            return interaction_id
    
    async def get_user_interactions(self, user_id: str, 
                                  limit: int = 1000,
                                  since: Optional[datetime] = None) -> List[Dict]:
        """جلب تفاعلات المستخدم"""
        
        query = """
            SELECT user_id, item_id, interaction_type, rating, context, 
                   features, timestamp
            FROM user_interactions
            WHERE user_id = $1
        """
        params = [user_id]
        
        if since:
            query += " AND timestamp >= $2"
            params.append(since)
        
        query += " ORDER BY timestamp DESC LIMIT $" + str(len(params) + 1)
        params.append(limit)
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            
            interactions = []
            for row in rows:
                interaction = dict(row)
                
                # تحويل السياق من JSON
                if interaction['context']:
                    interaction['context'] = json.loads(interaction['context'])
                
                # تحويل المعالم من bytes
                if interaction['features']:
                    interaction['features'] = pickle.loads(interaction['features'])
                
                interactions.append(interaction)
            
            return interactions
    
    async def save_user_profile(self, user_id: str, profile_data: Dict):
        """حفظ ملف المستخدم"""
        
        async with self.pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO user_profiles 
                (user_id, interests, personality_traits, behavior_patterns, preferences)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id) 
                DO UPDATE SET
                    interests = EXCLUDED.interests,
                    personality_traits = EXCLUDED.personality_traits,
                    behavior_patterns = EXCLUDED.behavior_patterns,
                    preferences = EXCLUDED.preferences,
                    last_updated = NOW()
            """, user_id,
                json.dumps(profile_data.get('interests', {})),
                json.dumps(profile_data.get('personality_traits', {})),
                json.dumps(profile_data.get('behavior_patterns', {})),
                json.dumps(profile_data.get('preferences', {})))
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """جلب ملف المستخدم"""
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT interests, personality_traits, behavior_patterns, 
                       preferences, last_updated, confidence_score
                FROM user_profiles
                WHERE user_id = $1
            """, user_id)
            
            if row:
                profile = dict(row)
                # تحويل JSON fields
                for field in ['interests', 'personality_traits', 'behavior_patterns', 'preferences']:
                    if profile[field]:
                        profile[field] = json.loads(profile[field])
                
                return profile
            
            return None
    
    async def update_item_statistics(self, item_id: str, interaction_type: str, 
                                   reading_time: Optional[int] = None,
                                   rating: Optional[float] = None):
        """تحديث إحصائيات المقال"""
        
        update_fields = []
        if interaction_type == 'view':
            update_fields.append("views_count = views_count + 1")
        elif interaction_type == 'like':
            update_fields.append("likes_count = likes_count + 1")
        elif interaction_type == 'save':
            update_fields.append("saves_count = saves_count + 1")
        elif interaction_type == 'share':
            update_fields.append("shares_count = shares_count + 1")
        elif interaction_type == 'comment':
            update_fields.append("comments_count = comments_count + 1")
        
        if reading_time:
            update_fields.append(f"total_reading_time = total_reading_time + {reading_time}")
        
        if update_fields:
            query = f"""
                INSERT INTO item_statistics (item_id, {interaction_type}s_count)
                VALUES ($1, 1)
                ON CONFLICT (item_id)
                DO UPDATE SET {', '.join(update_fields)}, last_updated = NOW()
            """
            
            async with self.pool.acquire() as conn:
                await conn.execute(query, item_id)
    
    async def get_popular_items(self, limit: int = 100) -> List[Dict]:
        """جلب المقالات الأكثر شعبية"""
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT item_id, views_count, likes_count, saves_count, 
                       shares_count, comments_count, popularity_score
                FROM item_statistics
                ORDER BY popularity_score DESC
                LIMIT $1
            """, limit)
            
            return [dict(row) for row in rows]
    
    async def close(self):
        """إغلاق اتصال قاعدة البيانات"""
        if self.pool:
            await self.pool.close()
            logger.info("🗄️  تم إغلاق اتصال قاعدة البيانات")


# ========================= إدارة Redis =========================

class RedisManager:
    """مدير Redis للتخزين المؤقت"""
    
    def __init__(self, config: RedisConfig):
        self.config = config
        self.redis_client = None
        self.key_prefix = config.key_prefix
    
    async def initialize(self):
        """تهيئة اتصال Redis"""
        try:
            logger.info("📦 تهيئة اتصال Redis...")
            
            self.redis_client = await redis.Redis(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                decode_responses=False,  # للتعامل مع البيانات الثنائية
                socket_timeout=self.config.timeout,
                socket_connect_timeout=self.config.timeout
            )
            
            # اختبار الاتصال
            await self.redis_client.ping()
            
            logger.info("✅ تم تهيئة Redis بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة Redis: {str(e)}")
            raise
    
    def _get_key(self, key: str) -> str:
        """إنشاء مفتاح مع البادئة"""
        return f"{self.key_prefix}{key}"
    
    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """حفظ قيمة في Redis"""
        try:
            redis_key = self._get_key(key)
            
            # تسلسل القيمة
            if isinstance(value, (dict, list)):
                serialized_value = json.dumps(value, default=str)
            elif isinstance(value, np.ndarray):
                serialized_value = pickle.dumps(value)
            else:
                serialized_value = str(value)
            
            if expire:
                await self.redis_client.setex(redis_key, expire, serialized_value)
            else:
                await self.redis_client.set(redis_key, serialized_value)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ البيانات في Redis {key}: {str(e)}")
            return False
    
    async def get(self, key: str, default: Any = None) -> Any:
        """جلب قيمة من Redis"""
        try:
            redis_key = self._get_key(key)
            value = await self.redis_client.get(redis_key)
            
            if value is None:
                return default
            
            # محاولة إلغاء التسلسل
            try:
                # محاولة JSON أولاً
                return json.loads(value.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                try:
                    # محاولة pickle
                    return pickle.loads(value)
                except:
                    # إرجاع كنص
                    return value.decode('utf-8')
                    
        except Exception as e:
            logger.error(f"❌ فشل في جلب البيانات من Redis {key}: {str(e)}")
            return default
    
    async def delete(self, key: str) -> bool:
        """حذف قيمة من Redis"""
        try:
            redis_key = self._get_key(key)
            result = await self.redis_client.delete(redis_key)
            return result > 0
            
        except Exception as e:
            logger.error(f"❌ فشل في حذف البيانات من Redis {key}: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """فحص وجود مفتاح"""
        try:
            redis_key = self._get_key(key)
            return await self.redis_client.exists(redis_key) > 0
            
        except Exception as e:
            logger.error(f"❌ فشل في فحص وجود المفتاح {key}: {str(e)}")
            return False
    
    async def set_hash(self, key: str, field_values: Dict[str, Any], expire: Optional[int] = None) -> bool:
        """حفظ hash في Redis"""
        try:
            redis_key = self._get_key(key)
            
            # تحويل القيم للنصوص
            serialized_values = {}
            for field, value in field_values.items():
                if isinstance(value, (dict, list)):
                    serialized_values[field] = json.dumps(value, default=str)
                elif isinstance(value, np.ndarray):
                    serialized_values[field] = pickle.dumps(value).hex()
                else:
                    serialized_values[field] = str(value)
            
            await self.redis_client.hset(redis_key, mapping=serialized_values)
            
            if expire:
                await self.redis_client.expire(redis_key, expire)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ hash في Redis {key}: {str(e)}")
            return False
    
    async def get_hash(self, key: str, field: Optional[str] = None) -> Any:
        """جلب hash من Redis"""
        try:
            redis_key = self._get_key(key)
            
            if field:
                value = await self.redis_client.hget(redis_key, field)
                if value is None:
                    return None
                
                # محاولة إلغاء التسلسل
                try:
                    return json.loads(value.decode('utf-8'))
                except:
                    try:
                        return pickle.loads(bytes.fromhex(value.decode('utf-8')))
                    except:
                        return value.decode('utf-8')
            else:
                hash_data = await self.redis_client.hgetall(redis_key)
                if not hash_data:
                    return {}
                
                result = {}
                for k, v in hash_data.items():
                    key_str = k.decode('utf-8')
                    try:
                        result[key_str] = json.loads(v.decode('utf-8'))
                    except:
                        try:
                            result[key_str] = pickle.loads(bytes.fromhex(v.decode('utf-8')))
                        except:
                            result[key_str] = v.decode('utf-8')
                
                return result
                
        except Exception as e:
            logger.error(f"❌ فشل في جلب hash من Redis {key}: {str(e)}")
            return None if field else {}
    
    async def cache_recommendations(self, user_id: str, recommendations: List[Dict],
                                  recommendation_type: str, expire: int = 300) -> bool:
        """تخزين توصيات مؤقتاً"""
        cache_key = f"recommendations:{user_id}:{recommendation_type}"
        
        cache_data = {
            'recommendations': recommendations,
            'generated_at': datetime.now().isoformat(),
            'type': recommendation_type
        }
        
        return await self.set(cache_key, cache_data, expire)
    
    async def get_cached_recommendations(self, user_id: str, 
                                       recommendation_type: str) -> Optional[List[Dict]]:
        """جلب توصيات مخزنة مؤقتاً"""
        cache_key = f"recommendations:{user_id}:{recommendation_type}"
        
        cached_data = await self.get(cache_key)
        if cached_data and isinstance(cached_data, dict):
            return cached_data.get('recommendations')
        
        return None
    
    async def increment_counter(self, key: str, amount: int = 1) -> int:
        """زيادة عداد"""
        try:
            redis_key = self._get_key(key)
            return await self.redis_client.incrby(redis_key, amount)
        except Exception as e:
            logger.error(f"❌ فشل في زيادة العداد {key}: {str(e)}")
            return 0
    
    async def close(self):
        """إغلاق اتصال Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("📦 تم إغلاق اتصال Redis")


# ========================= إدارة التخزين =========================

class S3Manager:
    """مدير Amazon S3 للنماذج والبيانات"""
    
    def __init__(self, config: S3Config):
        self.config = config
        self.s3_client = None
        self.session = None
    
    async def initialize(self):
        """تهيئة اتصال S3"""
        try:
            logger.info("☁️  تهيئة اتصال Amazon S3...")
            
            self.session = aioboto3.Session()
            
            kwargs = {
                'region_name': self.config.region
            }
            
            if self.config.access_key and self.config.secret_key:
                kwargs.update({
                    'aws_access_key_id': self.config.access_key,
                    'aws_secret_access_key': self.config.secret_key
                })
            
            if self.config.endpoint_url:
                kwargs['endpoint_url'] = self.config.endpoint_url
            
            self.s3_client = self.session.client('s3', **kwargs)
            
            # التحقق من وجود البوكت
            await self._ensure_bucket_exists()
            
            logger.info("✅ تم تهيئة Amazon S3 بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة S3: {str(e)}")
            # S3 اختياري، لذا لن نثير الخطأ
            self.s3_client = None
    
    async def _ensure_bucket_exists(self):
        """التأكد من وجود البوكت"""
        if not self.s3_client:
            return
        
        try:
            async with self.s3_client as s3:
                await s3.head_bucket(Bucket=self.config.bucket_name)
        except:
            # إنشاء البوكت إذا لم يكن موجوداً
            try:
                async with self.s3_client as s3:
                    await s3.create_bucket(Bucket=self.config.bucket_name)
                logger.info(f"📦 تم إنشاء بوكت S3: {self.config.bucket_name}")
            except Exception as e:
                logger.warning(f"⚠️ فشل في إنشاء بوكت S3: {str(e)}")
    
    async def upload_model(self, model_path: str, s3_key: str) -> bool:
        """رفع نموذج إلى S3"""
        if not self.s3_client:
            logger.warning("⚠️ S3 غير متاح - تخطي رفع النموذج")
            return False
        
        try:
            async with aiofiles.open(model_path, 'rb') as f:
                model_data = await f.read()
            
            async with self.s3_client as s3:
                await s3.put_object(
                    Bucket=self.config.bucket_name,
                    Key=s3_key,
                    Body=model_data,
                    Metadata={
                        'uploaded_at': datetime.now().isoformat(),
                        'model_type': 'recommendation_model'
                    }
                )
            
            logger.info(f"☁️  تم رفع النموذج إلى S3: {s3_key}")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في رفع النموذج إلى S3: {str(e)}")
            return False
    
    async def download_model(self, s3_key: str, local_path: str) -> bool:
        """تحميل نموذج من S3"""
        if not self.s3_client:
            logger.warning("⚠️ S3 غير متاح - تخطي تحميل النموذج")
            return False
        
        try:
            async with self.s3_client as s3:
                response = await s3.get_object(
                    Bucket=self.config.bucket_name,
                    Key=s3_key
                )
                
                model_data = await response['Body'].read()
            
            # إنشاء المجلد إذا لم يكن موجوداً
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(local_path, 'wb') as f:
                await f.write(model_data)
            
            logger.info(f"☁️  تم تحميل النموذج من S3: {s3_key} -> {local_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النموذج من S3: {str(e)}")
            return False
    
    async def list_models(self, prefix: str = "models/") -> List[Dict]:
        """قائمة النماذج في S3"""
        if not self.s3_client:
            return []
        
        try:
            models = []
            async with self.s3_client as s3:
                response = await s3.list_objects_v2(
                    Bucket=self.config.bucket_name,
                    Prefix=prefix
                )
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        models.append({
                            'key': obj['Key'],
                            'size': obj['Size'],
                            'last_modified': obj['LastModified'],
                            'etag': obj['ETag']
                        })
            
            return models
            
        except Exception as e:
            logger.error(f"❌ فشل في قائمة النماذج من S3: {str(e)}")
            return []


# ========================= مدير ML الرئيسي =========================

class MLPipelineManager:
    """مدير خط إنتاج ML الرئيسي"""
    
    def __init__(self, config: SystemConfig):
        self.config = config
        
        # مديري الخدمات
        self.db_manager = DatabaseManager(config.database)
        self.redis_manager = RedisManager(config.redis)
        self.s3_manager = S3Manager(config.s3)
        
        # معالجات ML
        self.executor = ThreadPoolExecutor(max_workers=config.ml.max_workers)
        self.process_executor = ProcessPoolExecutor(max_workers=2)
        
        # نماذج ML محملة
        self.loaded_models = {}
        self.model_metadata = {}
        
        # مهام الخلفية
        self.background_tasks = []
        self.is_running = False
        
    async def initialize(self):
        """تهيئة جميع مكونات النظام"""
        logger.info("🚀 بدء تهيئة نظام ML...")
        
        try:
            # تهيئة قاعدة البيانات
            await self.db_manager.initialize()
            
            # تهيئة Redis
            await self.redis_manager.initialize()
            
            # تهيئة S3 (اختياري)
            await self.s3_manager.initialize()
            
            # تحميل النماذج
            await self._load_models()
            
            # بدء المهام الخلفية
            await self._start_background_tasks()
            
            self.is_running = True
            logger.info("✅ تم تهيئة نظام ML بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة نظام ML: {str(e)}")
            raise
    
    async def _load_models(self):
        """تحميل النماذج المحفوظة"""
        logger.info("📚 تحميل النماذج المدربة...")
        
        try:
            # البحث عن النماذج في قاعدة البيانات
            async with self.db_manager.pool.acquire() as conn:
                models = await conn.fetch("""
                    SELECT model_id, model_type, model_version, model_path, s3_key
                    FROM trained_models
                    WHERE is_active = true
                    ORDER BY created_at DESC
                """)
            
            for model_record in models:
                model_id = model_record['model_id']
                model_type = model_record['model_type']
                model_path = model_record['model_path']
                s3_key = model_record['s3_key']
                
                # محاولة تحميل النموذج محلياً أولاً
                if model_path and os.path.exists(model_path):
                    success = await self._load_model_from_file(model_id, model_type, model_path)
                    if success:
                        continue
                
                # محاولة تحميل من S3
                if s3_key:
                    local_path = os.path.join(self.config.ml.model_storage_path, f"{model_id}.pkl")
                    if await self.s3_manager.download_model(s3_key, local_path):
                        await self._load_model_from_file(model_id, model_type, local_path)
            
            logger.info(f"📚 تم تحميل {len(self.loaded_models)} نموذج")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النماذج: {str(e)}")
    
    async def _load_model_from_file(self, model_id: str, model_type: str, model_path: str) -> bool:
        """تحميل نموذج من ملف"""
        try:
            # تحميل النموذج في thread منفصل
            loop = asyncio.get_event_loop()
            model = await loop.run_in_executor(self.executor, joblib.load, model_path)
            
            self.loaded_models[model_id] = model
            self.model_metadata[model_id] = {
                'type': model_type,
                'path': model_path,
                'loaded_at': datetime.now()
            }
            
            logger.info(f"📚 تم تحميل النموذج: {model_id} ({model_type})")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النموذج {model_id}: {str(e)}")
            return False
    
    async def _start_background_tasks(self):
        """بدء المهام الخلفية"""
        logger.info("⚙️ بدء المهام الخلفية...")
        
        # مهمة معالجة التفاعلات الجديدة
        self.background_tasks.append(
            asyncio.create_task(self._process_interactions_worker())
        )
        
        # مهمة تحديث إحصائيات المقالات
        self.background_tasks.append(
            asyncio.create_task(self._update_statistics_worker())
        )
        
        # مهمة نسخ احتياطي للنماذج
        self.background_tasks.append(
            asyncio.create_task(self._model_backup_worker())
        )
        
        # مهمة تنظيف التخزين المؤقت
        self.background_tasks.append(
            asyncio.create_task(self._cache_cleanup_worker())
        )
    
    async def _process_interactions_worker(self):
        """معالج التفاعلات في الخلفية"""
        while self.is_running:
            try:
                # جلب التفاعلات غير المعالجة
                async with self.db_manager.pool.acquire() as conn:
                    interactions = await conn.fetch("""
                        SELECT id, user_id, item_id, interaction_type, rating, 
                               context, features, timestamp
                        FROM user_interactions
                        WHERE processed = false
                        ORDER BY timestamp
                        LIMIT 100
                    """)
                
                if interactions:
                    logger.info(f"⚡ معالجة {len(interactions)} تفاعل جديد...")
                    
                    # معالجة كل تفاعل
                    for interaction in interactions:
                        await self._process_single_interaction(interaction)
                        
                        # تحديث حالة المعالجة
                        async with self.db_manager.pool.acquire() as conn:
                            await conn.execute("""
                                UPDATE user_interactions
                                SET processed = true
                                WHERE id = $1
                            """, interaction['id'])
                
                # انتظار قبل الدورة التالية
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.error(f"❌ خطأ في معالج التفاعلات: {str(e)}")
                await asyncio.sleep(30)
    
    async def _process_single_interaction(self, interaction: Dict):
        """معالجة تفاعل واحد"""
        try:
            user_id = interaction['user_id']
            item_id = interaction['item_id']
            interaction_type = interaction['interaction_type']
            rating = interaction['rating']
            
            # تحديث إحصائيات المقال
            await self.db_manager.update_item_statistics(
                item_id, interaction_type, rating=rating
            )
            
            # تحديث عدادات Redis
            await self.redis_manager.increment_counter(f"item_interactions:{item_id}")
            await self.redis_manager.increment_counter(f"user_interactions:{user_id}")
            
            # إشعار نماذج التعلم المستمر (إذا كانت محملة)
            # يمكن إضافة منطق التعلم المستمر هنا
            
        except Exception as e:
            logger.error(f"❌ فشل في معالجة التفاعل: {str(e)}")
    
    async def _update_statistics_worker(self):
        """محدث الإحصائيات في الخلفية"""
        while self.is_running:
            try:
                # تحديث نقاط الشعبية
                async with self.db_manager.pool.acquire() as conn:
                    await conn.execute("""
                        UPDATE item_statistics
                        SET popularity_score = (
                            views_count * 1.0 +
                            likes_count * 3.0 +
                            saves_count * 4.0 +
                            shares_count * 5.0 +
                            comments_count * 4.5
                        ) / GREATEST(1, views_count + likes_count + saves_count + shares_count + comments_count)
                        WHERE last_updated < NOW() - INTERVAL '1 hour'
                    """)
                
                logger.info("📊 تم تحديث إحصائيات الشعبية")
                
                # انتظار ساعة قبل التحديث التالي
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"❌ خطأ في محدث الإحصائيات: {str(e)}")
                await asyncio.sleep(1800)  # انتظار نصف ساعة عند الخطأ
    
    async def _model_backup_worker(self):
        """عامل النسخ الاحتياطي للنماذج"""
        while self.is_running:
            try:
                # نسخ النماذج إلى S3
                for model_id, model in self.loaded_models.items():
                    local_path = os.path.join(
                        self.config.ml.model_storage_path, 
                        f"{model_id}_backup.pkl"
                    )
                    
                    # حفظ النموذج محلياً
                    await asyncio.get_event_loop().run_in_executor(
                        self.executor, joblib.dump, model, local_path
                    )
                    
                    # رفع إلى S3
                    s3_key = f"models/backups/{model_id}_{int(time.time())}.pkl"
                    await self.s3_manager.upload_model(local_path, s3_key)
                
                logger.info("💾 تم إجراء نسخ احتياطي للنماذج")
                
                # انتظار يوم كامل
                await asyncio.sleep(86400)
                
            except Exception as e:
                logger.error(f"❌ خطأ في النسخ الاحتياطي: {str(e)}")
                await asyncio.sleep(3600)
    
    async def _cache_cleanup_worker(self):
        """عامل تنظيف التخزين المؤقت"""
        while self.is_running:
            try:
                # تنظيف التوصيات المنتهية الصلاحية
                async with self.db_manager.pool.acquire() as conn:
                    deleted = await conn.execute("""
                        DELETE FROM cached_recommendations
                        WHERE expires_at < NOW()
                    """)
                
                if deleted:
                    logger.info(f"🧹 تم تنظيف {deleted} توصية منتهية الصلاحية")
                
                # انتظار ساعة
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"❌ خطأ في تنظيف التخزين المؤقت: {str(e)}")
                await asyncio.sleep(1800)
    
    async def get_recommendations(self, user_id: str, 
                                recommendation_type: str = "personalized",
                                count: int = 10,
                                context: Optional[Dict] = None) -> List[Dict]:
        """الحصول على توصيات للمستخدم"""
        
        # البحث في التخزين المؤقت أولاً
        cached_recs = await self.redis_manager.get_cached_recommendations(
            user_id, recommendation_type
        )
        
        if cached_recs:
            logger.info(f"📦 إرجاع توصيات مخزنة مؤقتاً للمستخدم {user_id}")
            return cached_recs[:count]
        
        # إنشاء توصيات جديدة
        recommendations = await self._generate_recommendations(
            user_id, recommendation_type, count, context
        )
        
        # حفظ في التخزين المؤقت
        await self.redis_manager.cache_recommendations(
            user_id, recommendations, recommendation_type, expire=300
        )
        
        return recommendations
    
    async def _generate_recommendations(self, user_id: str, 
                                      recommendation_type: str,
                                      count: int,
                                      context: Optional[Dict] = None) -> List[Dict]:
        """إنشاء توصيات جديدة"""
        
        try:
            # جلب ملف المستخدم
            user_profile = await self.db_manager.get_user_profile(user_id)
            
            # جلب تفاعلات المستخدم الحديثة
            user_interactions = await self.db_manager.get_user_interactions(
                user_id, limit=100
            )
            
            # جلب المقالات الشائعة كبديل
            popular_items = await self.db_manager.get_popular_items(count * 2)
            
            # تطبيق منطق التوصية (مبسط للتوضيح)
            recommendations = []
            
            if recommendation_type == "trending":
                # ترتيب حسب الشعبية
                for i, item in enumerate(popular_items[:count]):
                    recommendations.append({
                        'item_id': item['item_id'],
                        'score': 0.9 - (i * 0.05),
                        'reason': 'مقال رائج',
                        'metadata': {'rank': i + 1, 'type': 'trending'}
                    })
            
            elif recommendation_type == "personalized" and user_profile:
                # توصيات شخصية بناءً على الملف
                interests = user_profile.get('interests', {})
                
                for i in range(count):
                    recommendations.append({
                        'item_id': f"personal_{user_id}_{i+1}",
                        'score': 0.8 - (i * 0.03),
                        'reason': 'مخصص لاهتماماتك',
                        'metadata': {'interests': list(interests.keys())[:3]}
                    })
            
            else:
                # توصيات افتراضية
                for i in range(count):
                    recommendations.append({
                        'item_id': f"default_{i+1}",
                        'score': 0.7 - (i * 0.04),
                        'reason': 'توصية عامة',
                        'metadata': {'type': 'default'}
                    })
            
            logger.info(f"🎯 تم إنشاء {len(recommendations)} توصية للمستخدم {user_id}")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء التوصيات: {str(e)}")
            return []
    
    async def record_interaction(self, user_id: str, item_id: str,
                               interaction_type: str, rating: Optional[float] = None,
                               context: Optional[Dict] = None,
                               features: Optional[np.ndarray] = None) -> bool:
        """تسجيل تفاعل مستخدم"""
        
        try:
            # حفظ في قاعدة البيانات
            interaction_id = await self.db_manager.save_interaction(
                user_id, item_id, interaction_type, rating, context, features
            )
            
            # تحديث عدادات فورية في Redis
            await self.redis_manager.increment_counter(f"interactions_today:{item_id}")
            await self.redis_manager.increment_counter(f"user_activity_today:{user_id}")
            
            # إزالة التوصيات المخزنة مؤقتاً للمستخدم (لإعادة إنشائها)
            await self.redis_manager.delete(f"recommendations:{user_id}:personalized")
            
            logger.info(f"📝 تم تسجيل تفاعل: {user_id} {interaction_type} {item_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تسجيل التفاعل: {str(e)}")
            return False
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """الحصول على مقاييس النظام"""
        
        try:
            # مقاييس قاعدة البيانات
            async with self.db_manager.pool.acquire() as conn:
                db_stats = await conn.fetchrow("""
                    SELECT 
                        (SELECT COUNT(*) FROM user_interactions) as total_interactions,
                        (SELECT COUNT(*) FROM user_profiles) as total_users,
                        (SELECT COUNT(*) FROM item_statistics) as total_items,
                        (SELECT COUNT(*) FROM trained_models WHERE is_active = true) as active_models
                """)
            
            # مقاييس Redis
            redis_info = {
                'connected': self.redis_manager.redis_client is not None,
                'cached_recommendations': 0  # يمكن تطوير هذا
            }
            
            # مقاييس النماذج
            model_stats = {
                'loaded_models': len(self.loaded_models),
                'model_types': list(set(meta['type'] for meta in self.model_metadata.values()))
            }
            
            # مقاييس النظام
            system_stats = {
                'uptime_hours': (datetime.now() - datetime.now().replace(hour=0, minute=0, second=0)).total_seconds() / 3600,
                'background_tasks_running': len([t for t in self.background_tasks if not t.done()]),
                'is_healthy': self.is_running
            }
            
            return {
                'database': dict(db_stats) if db_stats else {},
                'redis': redis_info,
                'models': model_stats,
                'system': system_stats,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في جلب مقاييس النظام: {str(e)}")
            return {'error': str(e)}
    
    async def shutdown(self):
        """إغلاق النظام"""
        logger.info("🔚 بدء إغلاق نظام ML...")
        
        self.is_running = False
        
        # إلغاء المهام الخلفية
        for task in self.background_tasks:
            task.cancel()
        
        # انتظار انتهاء المهام
        await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        # إغلاق الاتصالات
        await self.db_manager.close()
        await self.redis_manager.close()
        
        # إغلاق معالجات الخيوط
        self.executor.shutdown(wait=True)
        self.process_executor.shutdown(wait=True)
        
        logger.info("✅ تم إغلاق نظام ML بنجاح")


# ========================= تهيئة النظام =========================

async def create_ml_pipeline(config_path: str = "config.yaml") -> MLPipelineManager:
    """إنشاء وتهيئة نظام ML"""
    
    # تحميل التكوين
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            config_dict = yaml.safe_load(f)
    else:
        # استخدام التكوين الافتراضي
        config_dict = {
            'database': {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': int(os.getenv('DB_PORT', 5432)),
                'database': os.getenv('DB_NAME', 'sabq_ai_recommendations'),
                'username': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD', '')
            },
            'redis': {
                'host': os.getenv('REDIS_HOST', 'localhost'),
                'port': int(os.getenv('REDIS_PORT', 6379)),
                'password': os.getenv('REDIS_PASSWORD')
            },
            's3': {
                'bucket_name': os.getenv('S3_BUCKET', 'sabq-ai-models'),
                'region': os.getenv('AWS_REGION', 'us-east-1'),
                'access_key': os.getenv('AWS_ACCESS_KEY_ID'),
                'secret_key': os.getenv('AWS_SECRET_ACCESS_KEY')
            },
            'ml': {
                'model_storage_path': os.getenv('MODEL_PATH', './models'),
                'gpu_enabled': torch.cuda.is_available()
            }
        }
    
    # إنشاء كائنات التكوين
    config = SystemConfig(
        database=DatabaseConfig(**config_dict.get('database', {})),
        redis=RedisConfig(**config_dict.get('redis', {})),
        s3=S3Config(**config_dict.get('s3', {})),
        ml=MLConfig(**config_dict.get('ml', {}))
    )
    
    # إنشاء وتهيئة المدير
    pipeline_manager = MLPipelineManager(config)
    await pipeline_manager.initialize()
    
    return pipeline_manager


# ========================= مثال على الاستخدام =========================

if __name__ == "__main__":
    async def main():
        # إنشاء نظام ML
        pipeline = await create_ml_pipeline()
        
        try:
            # تسجيل بعض التفاعلات التجريبية
            await pipeline.record_interaction(
                "user_123", "article_456", "view", 
                context={"device": "mobile", "time": "morning"}
            )
            
            await pipeline.record_interaction(
                "user_123", "article_456", "like", rating=4.5
            )
            
            # الحصول على توصيات
            recommendations = await pipeline.get_recommendations(
                "user_123", "personalized", count=5
            )
            
            print("🎯 التوصيات:")
            for rec in recommendations:
                print(f"  {rec['item_id']}: {rec['score']:.2f} - {rec['reason']}")
            
            # عرض مقاييس النظام
            metrics = await pipeline.get_system_metrics()
            print(f"\n📊 مقاييس النظام:")
            print(f"  المستخدمون: {metrics['database'].get('total_users', 0)}")
            print(f"  التفاعلات: {metrics['database'].get('total_interactions', 0)}")
            print(f"  النماذج المحملة: {metrics['models']['loaded_models']}")
            
            # انتظار قليل لمعالجة التفاعلات
            await asyncio.sleep(5)
            
        finally:
            # إغلاق النظام
            await pipeline.shutdown()
    
    # تشغيل المثال
    asyncio.run(main())
