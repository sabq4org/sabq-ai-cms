#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
خدمة Redis للتخزين المؤقت والبيانات في الوقت الفعلي
User Behavior Tracking System - Redis Service
"""

import json
import logging
from typing import Optional, Dict, Any, List, Union
import asyncio
from datetime import datetime, timedelta

import aioredis
from aioredis import Redis
from aioredis.exceptions import RedisError, ConnectionError as RedisConnectionError

from config import settings, CACHE_CONFIG

# إعداد السجلات
logger = logging.getLogger("sabq.tracking.redis")

class RedisManager:
    """مدير Redis للتخزين المؤقت والبيانات الفورية"""
    
    def __init__(self):
        self.redis: Optional[Redis] = None
        self._is_initialized = False
        self._connection_pool = None
        
    async def initialize(self) -> None:
        """تهيئة اتصال Redis"""
        if self._is_initialized:
            logger.warning("Redis مهيأ مسبقاً")
            return
            
        try:
            logger.info("بدء تهيئة اتصال Redis...")
            
            # إنشاء pool الاتصالات
            self._connection_pool = aioredis.ConnectionPool.from_url(
                settings.redis_url,
                max_connections=settings.redis_max_connections,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={},
                health_check_interval=30
            )
            
            # إنشاء اتصال Redis
            self.redis = Redis(connection_pool=self._connection_pool)
            
            # اختبار الاتصال
            await self._test_connection()
            
            self._is_initialized = True
            logger.info("✅ تم تهيئة Redis بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة Redis: {e}")
            raise
    
    async def _test_connection(self) -> None:
        """اختبار اتصال Redis"""
        try:
            result = await self.redis.ping()
            if result:
                logger.info("✅ اختبار اتصال Redis نجح")
            else:
                raise Exception("فشل ping Redis")
        except Exception as e:
            logger.error(f"❌ فشل اختبار اتصال Redis: {e}")
            raise
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """حفظ قيمة في Redis"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            # تحويل القيمة إلى JSON إذا لم تكن string
            if not isinstance(value, (str, bytes)):
                value = json.dumps(value, ensure_ascii=False, default=str)
            
            # حفظ مع TTL اختياري
            if ttl:
                result = await self.redis.setex(key, ttl, value)
            else:
                result = await self.redis.set(key, value)
                
            return bool(result)
            
        except Exception as e:
            logger.error(f"خطأ في حفظ البيانات في Redis: {key} - {e}")
            return False
    
    async def get(self, key: str, default: Any = None) -> Any:
        """جلب قيمة من Redis"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            value = await self.redis.get(key)
            
            if value is None:
                return default
                
            # محاولة تحويل من JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                # إرجاع القيمة كما هي إذا لم تكن JSON
                return value.decode('utf-8') if isinstance(value, bytes) else value
                
        except Exception as e:
            logger.error(f"خطأ في جلب البيانات من Redis: {key} - {e}")
            return default
    
    async def delete(self, *keys: str) -> int:
        """حذف مفاتيح من Redis"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return await self.redis.delete(*keys)
        except Exception as e:
            logger.error(f"خطأ في حذف البيانات من Redis: {keys} - {e}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """التحقق من وجود مفتاح"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return bool(await self.redis.exists(key))
        except Exception as e:
            logger.error(f"خطأ في التحقق من وجود المفتاح: {key} - {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """تعيين وقت انتهاء صلاحية لمفتاح"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return bool(await self.redis.expire(key, ttl))
        except Exception as e:
            logger.error(f"خطأ في تعيين انتهاء الصلاحية: {key} - {e}")
            return False
    
    async def ttl(self, key: str) -> int:
        """الحصول على وقت انتهاء الصلاحية المتبقي"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return await self.redis.ttl(key)
        except Exception as e:
            logger.error(f"خطأ في جلب TTL: {key} - {e}")
            return -2
    
    # ===== العمليات المتقدمة =====
    
    async def hset(self, hash_key: str, field: str, value: Any) -> bool:
        """حفظ في Hash"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            if not isinstance(value, (str, bytes)):
                value = json.dumps(value, ensure_ascii=False, default=str)
                
            result = await self.redis.hset(hash_key, field, value)
            return bool(result)
            
        except Exception as e:
            logger.error(f"خطأ في حفظ Hash: {hash_key}:{field} - {e}")
            return False
    
    async def hget(self, hash_key: str, field: str, default: Any = None) -> Any:
        """جلب من Hash"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            value = await self.redis.hget(hash_key, field)
            
            if value is None:
                return default
                
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value.decode('utf-8') if isinstance(value, bytes) else value
                
        except Exception as e:
            logger.error(f"خطأ في جلب Hash: {hash_key}:{field} - {e}")
            return default
    
    async def hgetall(self, hash_key: str) -> Dict[str, Any]:
        """جلب جميع قيم Hash"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            data = await self.redis.hgetall(hash_key)
            result = {}
            
            for field, value in data.items():
                field_str = field.decode('utf-8') if isinstance(field, bytes) else field
                try:
                    result[field_str] = json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    result[field_str] = value.decode('utf-8') if isinstance(value, bytes) else value
                    
            return result
            
        except Exception as e:
            logger.error(f"خطأ في جلب جميع Hash: {hash_key} - {e}")
            return {}
    
    async def hdel(self, hash_key: str, *fields: str) -> int:
        """حذف من Hash"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return await self.redis.hdel(hash_key, *fields)
        except Exception as e:
            logger.error(f"خطأ في حذف Hash: {hash_key}:{fields} - {e}")
            return 0
    
    async def lpush(self, list_key: str, *values: Any) -> int:
        """إضافة إلى بداية القائمة"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            # تحويل القيم إلى JSON
            json_values = []
            for value in values:
                if not isinstance(value, (str, bytes)):
                    json_values.append(json.dumps(value, ensure_ascii=False, default=str))
                else:
                    json_values.append(value)
                    
            return await self.redis.lpush(list_key, *json_values)
            
        except Exception as e:
            logger.error(f"خطأ في إضافة إلى القائمة: {list_key} - {e}")
            return 0
    
    async def rpop(self, list_key: str, count: int = 1) -> List[Any]:
        """سحب من نهاية القائمة"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            if count == 1:
                value = await self.redis.rpop(list_key)
                if value is None:
                    return []
                    
                try:
                    return [json.loads(value)]
                except (json.JSONDecodeError, TypeError):
                    return [value.decode('utf-8') if isinstance(value, bytes) else value]
            else:
                values = await self.redis.rpop(list_key, count)
                result = []
                for value in values:
                    try:
                        result.append(json.loads(value))
                    except (json.JSONDecodeError, TypeError):
                        result.append(value.decode('utf-8') if isinstance(value, bytes) else value)
                return result
                
        except Exception as e:
            logger.error(f"خطأ في سحب من القائمة: {list_key} - {e}")
            return []
    
    async def llen(self, list_key: str) -> int:
        """الحصول على طول القائمة"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            return await self.redis.llen(list_key)
        except Exception as e:
            logger.error(f"خطأ في جلب طول القائمة: {list_key} - {e}")
            return 0
    
    async def zadd(self, sorted_set_key: str, mapping: Dict[str, float]) -> int:
        """إضافة إلى Sorted Set"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            # تحويل المفاتيح إلى JSON إذا لزم الأمر
            json_mapping = {}
            for member, score in mapping.items():
                if not isinstance(member, (str, bytes)):
                    json_key = json.dumps(member, ensure_ascii=False, default=str)
                    json_mapping[json_key] = score
                else:
                    json_mapping[member] = score
                    
            return await self.redis.zadd(sorted_set_key, json_mapping)
            
        except Exception as e:
            logger.error(f"خطأ في إضافة إلى Sorted Set: {sorted_set_key} - {e}")
            return 0
    
    async def zrevrange(self, sorted_set_key: str, start: int = 0, end: int = -1, 
                       withscores: bool = False) -> List[Any]:
        """جلب من Sorted Set مرتب تنازلياً"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            values = await self.redis.zrevrange(sorted_set_key, start, end, withscores=withscores)
            
            if not withscores:
                result = []
                for value in values:
                    try:
                        result.append(json.loads(value))
                    except (json.JSONDecodeError, TypeError):
                        result.append(value.decode('utf-8') if isinstance(value, bytes) else value)
                return result
            else:
                result = []
                for value, score in values:
                    try:
                        parsed_value = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        parsed_value = value.decode('utf-8') if isinstance(value, bytes) else value
                    result.append((parsed_value, score))
                return result
                
        except Exception as e:
            logger.error(f"خطأ في جلب Sorted Set: {sorted_set_key} - {e}")
            return []
    
    # ===== عمليات متخصصة للتتبع =====
    
    async def cache_user_session(self, session_id: str, session_data: Dict[str, Any], 
                                ttl: Optional[int] = None) -> bool:
        """تخزين مؤقت لجلسة المستخدم"""
        cache_key = f"session:{session_id}"
        cache_ttl = ttl or CACHE_CONFIG["user_sessions"]
        return await self.set(cache_key, session_data, cache_ttl)
    
    async def get_user_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """جلب جلسة المستخدم من التخزين المؤقت"""
        cache_key = f"session:{session_id}"
        return await self.get(cache_key)
    
    async def invalidate_user_session(self, session_id: str) -> bool:
        """إلغاء جلسة المستخدم من التخزين المؤقت"""
        cache_key = f"session:{session_id}"
        return bool(await self.delete(cache_key))
    
    async def track_user_activity(self, user_id: str, activity_data: Dict[str, Any]) -> bool:
        """تتبع نشاط المستخدم في الوقت الفعلي"""
        activity_key = f"activity:{user_id}"
        timestamp = datetime.now().isoformat()
        
        # إضافة النشاط إلى قائمة أنشطة المستخدم
        activity_with_timestamp = {
            "timestamp": timestamp,
            **activity_data
        }
        
        # إضافة إلى القائمة والاحتفاظ بآخر 100 نشاط
        await self.lpush(activity_key, activity_with_timestamp)
        
        # قطع القائمة للاحتفاظ بآخر 100 عنصر فقط
        await self.redis.ltrim(activity_key, 0, 99)
        
        # تعيين انتهاء صلاحية للنشاطات
        await self.expire(activity_key, CACHE_CONFIG["user_sessions"])
        
        return True
    
    async def get_user_activities(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """جلب أنشطة المستخدم الأخيرة"""
        activity_key = f"activity:{user_id}"
        activities = await self.redis.lrange(activity_key, 0, limit - 1)
        
        result = []
        for activity in activities:
            try:
                result.append(json.loads(activity))
            except (json.JSONDecodeError, TypeError):
                continue
                
        return result
    
    async def increment_interaction_counter(self, content_id: str, interaction_type: str) -> int:
        """زيادة عداد التفاعل"""
        counter_key = f"interaction_count:{content_id}:{interaction_type}"
        count = await self.redis.incr(counter_key)
        
        # تعيين انتهاء صلاحية للعدادات
        if count == 1:  # أول مرة يتم إنشاء العداد
            await self.expire(counter_key, CACHE_CONFIG["interaction_counters"])
            
        return count
    
    async def get_interaction_counts(self, content_id: str) -> Dict[str, int]:
        """جلب عدادات التفاعل لمحتوى معين"""
        pattern = f"interaction_count:{content_id}:*"
        keys = await self.redis.keys(pattern)
        
        counts = {}
        for key in keys:
            key_str = key.decode('utf-8') if isinstance(key, bytes) else key
            interaction_type = key_str.split(':')[-1]
            count = await self.redis.get(key)
            counts[interaction_type] = int(count) if count else 0
            
        return counts
    
    async def cache_reading_analytics(self, user_id: str, analytics_data: Dict[str, Any]) -> bool:
        """تخزين مؤقت لتحليلات القراءة"""
        cache_key = f"reading_analytics:{user_id}"
        return await self.set(cache_key, analytics_data, CACHE_CONFIG["reading_analytics"])
    
    async def get_reading_analytics(self, user_id: str) -> Optional[Dict[str, Any]]:
        """جلب تحليلات القراءة من التخزين المؤقت"""
        cache_key = f"reading_analytics:{user_id}"
        return await self.get(cache_key)
    
    async def store_context_snapshot(self, user_id: str, context_data: Dict[str, Any]) -> bool:
        """حفظ لقطة من بيانات السياق"""
        context_key = f"context:{user_id}"
        return await self.set(context_key, context_data, CACHE_CONFIG["context_data"])
    
    async def get_latest_context(self, user_id: str) -> Optional[Dict[str, Any]]:
        """جلب آخر بيانات السياق"""
        context_key = f"context:{user_id}"
        return await self.get(context_key)
    
    # ===== Rate Limiting =====
    
    async def check_rate_limit(self, identifier: str, limit: int, window: int) -> Dict[str, Any]:
        """فحص حدود المعدل"""
        rate_key = f"rate_limit:{identifier}"
        
        try:
            # الحصول على العدد الحالي
            current_count = await self.redis.get(rate_key)
            
            if current_count is None:
                # أول طلب في النافزة الزمنية
                await self.redis.setex(rate_key, window, 1)
                return {
                    "allowed": True,
                    "count": 1,
                    "limit": limit,
                    "remaining": limit - 1,
                    "reset_time": window
                }
            
            current_count = int(current_count)
            
            if current_count >= limit:
                # تم تجاوز الحد
                ttl = await self.ttl(rate_key)
                return {
                    "allowed": False,
                    "count": current_count,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": ttl
                }
            
            # زيادة العداد
            new_count = await self.redis.incr(rate_key)
            ttl = await self.ttl(rate_key)
            
            return {
                "allowed": True,
                "count": new_count,
                "limit": limit,
                "remaining": limit - new_count,
                "reset_time": ttl
            }
            
        except Exception as e:
            logger.error(f"خطأ في فحص Rate Limiting: {identifier} - {e}")
            # في حالة الخطأ، السماح بالطلب
            return {
                "allowed": True,
                "count": 0,
                "limit": limit,
                "remaining": limit,
                "reset_time": window,
                "error": str(e)
            }
    
    # ===== إدارة النظام =====
    
    async def health_check(self) -> Dict[str, Any]:
        """فحص صحة Redis"""
        try:
            start_time = asyncio.get_event_loop().time()
            
            # اختبار ping
            ping_result = await self.redis.ping()
            
            response_time = (asyncio.get_event_loop().time() - start_time) * 1000
            
            # الحصول على معلومات الخادم
            info = await self.redis.info()
            
            return {
                "status": "healthy" if ping_result else "unhealthy",
                "response_time_ms": round(response_time, 2),
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory_human", "0B"),
                "uptime": info.get("uptime_in_seconds", 0),
                "version": info.get("redis_version", "unknown"),
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            logger.error(f"فشل فحص صحة Redis: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": asyncio.get_event_loop().time()
            }
    
    async def flush_database(self, confirm: bool = False) -> bool:
        """تنظيف قاعدة بيانات Redis (خطر!)"""
        if not confirm:
            logger.warning("تنظيف Redis يتطلب تأكيد")
            return False
            
        try:
            await self.redis.flushdb()
            logger.warning("⚠️ تم تنظيف قاعدة بيانات Redis")
            return True
        except Exception as e:
            logger.error(f"فشل تنظيف Redis: {e}")
            return False
    
    async def close(self) -> None:
        """إغلاق اتصال Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("✅ تم إغلاق اتصال Redis")

# مثيل مشترك من مدير Redis
redis_manager = RedisManager()
