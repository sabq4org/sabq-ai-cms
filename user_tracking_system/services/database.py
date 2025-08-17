#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
خدمة إدارة قاعدة البيانات
User Behavior Tracking System - Database Service
"""

import logging
from typing import Optional, AsyncGenerator, Dict, Any, List
from contextlib import asynccontextmanager
import asyncio

from sqlalchemy.ext.asyncio import (
    create_async_engine, 
    AsyncSession, 
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy import text, MetaData
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError

from config import settings, DATABASE_CONFIG
from models.database import Base

# إعداد السجلات
logger = logging.getLogger("sabq.tracking.database")

class DatabaseManager:
    """مدير قاعدة البيانات المتقدم"""
    
    def __init__(self):
        self.engine: Optional[AsyncEngine] = None
        self.async_session_factory: Optional[async_sessionmaker] = None
        self._is_initialized = False
        
    async def initialize(self) -> None:
        """تهيئة اتصال قاعدة البيانات"""
        if self._is_initialized:
            logger.warning("قاعدة البيانات مهيأة مسبقاً")
            return
            
        try:
            logger.info("بدء تهيئة اتصال قاعدة البيانات...")
            
            # إنشاء محرك قاعدة البيانات
            self.engine = create_async_engine(
                settings.database_url,
                poolclass=QueuePool,
                **DATABASE_CONFIG["pool_settings"],
                echo=settings.debug,
                echo_pool=settings.debug
            )
            
            # إنشاء مصنع الجلسات
            self.async_session_factory = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                **DATABASE_CONFIG["session_settings"]
            )
            
            # اختبار الاتصال
            await self._test_connection()
            
            self._is_initialized = True
            logger.info("✅ تم تهيئة قاعدة البيانات بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة قاعدة البيانات: {e}")
            raise
    
    async def _test_connection(self) -> None:
        """اختبار اتصال قاعدة البيانات"""
        try:
            async with self.engine.begin() as conn:
                result = await conn.execute(text("SELECT 1"))
                assert result.scalar() == 1
                logger.info("✅ اختبار اتصال قاعدة البيانات نجح")
        except Exception as e:
            logger.error(f"❌ فشل اختبار اتصال قاعدة البيانات: {e}")
            raise
    
    async def create_tables(self) -> None:
        """إنشاء جداول قاعدة البيانات"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            logger.info("بدء إنشاء جداول قاعدة البيانات...")
            
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                
            logger.info("✅ تم إنشاء جداول قاعدة البيانات بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء جداول قاعدة البيانات: {e}")
            raise
    
    async def drop_tables(self) -> None:
        """حذف جداول قاعدة البيانات"""
        if not self._is_initialized:
            await self.initialize()
            
        try:
            logger.warning("بدء حذف جداول قاعدة البيانات...")
            
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
                
            logger.warning("⚠️ تم حذف جداول قاعدة البيانات")
            
        except Exception as e:
            logger.error(f"❌ فشل في حذف جداول قاعدة البيانات: {e}")
            raise
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """الحصول على جلسة قاعدة بيانات"""
        if not self._is_initialized:
            await self.initialize()
            
        session = self.async_session_factory()
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
    
    async def get_session_simple(self) -> AsyncSession:
        """الحصول على جلسة بسيطة (للاستخدام مع dependency injection)"""
        if not self._is_initialized:
            await self.initialize()
            
        return self.async_session_factory()
    
    async def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """تنفيذ استعلام SQL مخصص"""
        async with self.get_session() as session:
            try:
                result = await session.execute(text(query), params or {})
                return result
            except Exception as e:
                logger.error(f"خطأ في تنفيذ الاستعلام: {e}")
                logger.error(f"الاستعلام: {query}")
                logger.error(f"المعاملات: {params}")
                raise
    
    async def fetch_one(self, query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """جلب سجل واحد"""
        result = await self.execute_query(query, params)
        row = result.fetchone()
        return dict(row) if row else None
    
    async def fetch_all(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """جلب جميع السجلات"""
        result = await self.execute_query(query, params)
        rows = result.fetchall()
        return [dict(row) for row in rows]
    
    async def health_check(self) -> Dict[str, Any]:
        """فحص صحة قاعدة البيانات"""
        try:
            start_time = asyncio.get_event_loop().time()
            
            # اختبار الاتصال الأساسي
            async with self.get_session() as session:
                await session.execute(text("SELECT 1"))
            
            response_time = (asyncio.get_event_loop().time() - start_time) * 1000
            
            # الحصول على إحصائيات الاتصال
            pool_status = self._get_pool_status()
            
            return {
                "status": "healthy",
                "response_time_ms": round(response_time, 2),
                "pool_status": pool_status,
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            logger.error(f"فشل فحص صحة قاعدة البيانات: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": asyncio.get_event_loop().time()
            }
    
    def _get_pool_status(self) -> Dict[str, Any]:
        """الحصول على حالة pool الاتصالات"""
        if not self.engine:
            return {}
            
        pool = self.engine.pool
        return {
            "size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "checked_in": pool.checkedin()
        }
    
    async def get_table_stats(self) -> Dict[str, Dict[str, Any]]:
        """الحصول على إحصائيات الجداول"""
        try:
            tables_query = """
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_tuples,
                n_dead_tup as dead_tuples
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
            """
            
            result = await self.fetch_all(tables_query)
            
            stats = {}
            for row in result:
                table_name = row['tablename']
                stats[table_name] = {
                    "inserts": row['inserts'],
                    "updates": row['updates'],
                    "deletes": row['deletes'],
                    "live_tuples": row['live_tuples'],
                    "dead_tuples": row['dead_tuples']
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"خطأ في جلب إحصائيات الجداول: {e}")
            return {}
    
    async def optimize_tables(self) -> Dict[str, str]:
        """تحسين جداول قاعدة البيانات"""
        try:
            logger.info("بدء تحسين جداول قاعدة البيانات...")
            
            # الحصول على قائمة الجداول
            tables_query = """
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            """
            
            tables = await self.fetch_all(tables_query)
            results = {}
            
            async with self.get_session() as session:
                for table in tables:
                    table_name = table['tablename']
                    try:
                        # تشغيل ANALYZE لتحديث إحصائيات الجدول
                        await session.execute(text(f"ANALYZE {table_name}"))
                        results[table_name] = "success"
                        logger.info(f"✅ تم تحسين جدول {table_name}")
                        
                    except Exception as e:
                        results[table_name] = f"error: {str(e)}"
                        logger.error(f"❌ فشل تحسين جدول {table_name}: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"خطأ في تحسين الجداول: {e}")
            return {"error": str(e)}
    
    async def cleanup_old_data(self, days: int = None) -> Dict[str, int]:
        """تنظيف البيانات القديمة"""
        if days is None:
            days = settings.data_retention_days
            
        try:
            logger.info(f"بدء تنظيف البيانات الأقدم من {days} يوم...")
            
            cleanup_queries = [
                {
                    "table": "scroll_events",
                    "query": """
                    DELETE FROM scroll_events 
                    WHERE created_at < NOW() - INTERVAL '%s days'
                    """ % days
                },
                {
                    "table": "context_data",
                    "query": """
                    DELETE FROM context_data 
                    WHERE created_at < NOW() - INTERVAL '%s days'
                    """ % days
                },
                {
                    "table": "event_processing_log",
                    "query": """
                    DELETE FROM event_processing_log 
                    WHERE created_at < NOW() - INTERVAL '%s days'
                    AND processing_status = 'processed'
                    """ % (days // 2)  # حذف سجلات المعالجة بعد نصف المدة
                }
            ]
            
            results = {}
            
            async with self.get_session() as session:
                for cleanup in cleanup_queries:
                    try:
                        result = await session.execute(text(cleanup["query"]))
                        deleted_count = result.rowcount
                        results[cleanup["table"]] = deleted_count
                        logger.info(f"✅ تم حذف {deleted_count} سجل من جدول {cleanup['table']}")
                        
                    except Exception as e:
                        results[cleanup["table"]] = f"error: {str(e)}"
                        logger.error(f"❌ فشل تنظيف جدول {cleanup['table']}: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"خطأ في تنظيف البيانات: {e}")
            return {"error": str(e)}
    
    async def close(self) -> None:
        """إغلاق اتصال قاعدة البيانات"""
        if self.engine:
            await self.engine.dispose()
            logger.info("✅ تم إغلاق اتصال قاعدة البيانات")

# مثيل مشترك من مدير قاعدة البيانات
db_manager = DatabaseManager()

# Dependency للاستخدام مع FastAPI
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency للحصول على جلسة قاعدة البيانات"""
    session = await db_manager.get_session_simple()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

# دوال مساعدة للتعامل مع الأخطاء
class DatabaseError(Exception):
    """خطأ قاعدة البيانات المخصص"""
    pass

class DuplicateRecordError(DatabaseError):
    """خطأ سجل مكرر"""
    pass

class RecordNotFoundError(DatabaseError):
    """خطأ عدم وجود سجل"""
    pass

def handle_db_error(func):
    """مُزخرف للتعامل مع أخطاء قاعدة البيانات"""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except IntegrityError as e:
            logger.error(f"خطأ تكامل البيانات في {func.__name__}: {e}")
            raise DuplicateRecordError(f"سجل مكرر: {str(e)}")
        except DataError as e:
            logger.error(f"خطأ في صيغة البيانات في {func.__name__}: {e}")
            raise DatabaseError(f"خطأ في صيغة البيانات: {str(e)}")
        except SQLAlchemyError as e:
            logger.error(f"خطأ قاعدة بيانات في {func.__name__}: {e}")
            raise DatabaseError(f"خطأ في قاعدة البيانات: {str(e)}")
        except Exception as e:
            logger.error(f"خطأ غير متوقع في {func.__name__}: {e}")
            raise DatabaseError(f"خطأ غير متوقع: {str(e)}")
    
    return wrapper
