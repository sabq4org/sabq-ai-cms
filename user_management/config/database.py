# إعدادات قاعدة البيانات - نظام سبق الذكية
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import os
from typing import Generator
import logging
from contextlib import contextmanager

# إعدادات قاعدة البيانات
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://sabq_user:sabq_password@localhost:5432/sabq_smart_db"
)

# إعدادات محرك قاعدة البيانات مع تحسينات الأداء
engine = create_engine(
    DATABASE_URL,
    # إعدادات الاتصال
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=300,
    
    # إعدادات الأمان
    echo=False,  # تعطيل SQL logging في الإنتاج
    connect_args={
        "sslmode": "prefer",
        "application_name": "sabq_smart_cms",
        "options": "-c timezone=UTC"
    }
)

# إنشاء sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class للنماذج
Base = declarative_base()

# إعداد logging
logger = logging.getLogger(__name__)

def get_db() -> Generator[Session, None, None]:
    """
    Generator لجلب session قاعدة البيانات
    للاستخدام مع FastAPI Dependency Injection
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

@contextmanager
def get_db_session():
    """
    Context manager لإدارة جلسات قاعدة البيانات
    للاستخدام خارج FastAPI
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        logger.error(f"Database transaction error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_tables():
    """إنشاء جميع الجداول"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

def drop_tables():
    """حذف جميع الجداول (للاختبار فقط)"""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        raise

async def check_database_connection() -> bool:
    """فحص الاتصال بقاعدة البيانات"""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def get_database_info() -> dict:
    """معلومات قاعدة البيانات للمراقبة"""
    try:
        with engine.connect() as connection:
            result = connection.execute("""
                SELECT 
                    version() as version,
                    current_database() as database_name,
                    current_user as current_user,
                    inet_server_addr() as server_ip,
                    inet_server_port() as server_port
            """)
            row = result.fetchone()
            
            return {
                "version": row[0],
                "database_name": row[1], 
                "current_user": row[2],
                "server_ip": row[3],
                "server_port": row[4],
                "pool_size": engine.pool.size(),
                "checked_out": engine.pool.checkedout(),
                "overflow": engine.pool.overflow(),
                "checked_in": engine.pool.checkedin()
            }
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        return {"error": str(e)}
