#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
سكريبت تشغيل الخادم
User Behavior Tracking System - Server Startup Script
"""

import asyncio
import sys
import os
import logging
from pathlib import Path

# إضافة المسار الحالي إلى Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    import uvicorn
    from api import app
    from config import settings
    from services.database import db_manager
    from services.redis_service import redis_manager
except ImportError as e:
    print(f"❌ خطأ في استيراد المكتبات: {e}")
    print("يرجى تثبيت المتطلبات: pip install -r requirements.txt")
    sys.exit(1)

# إعداد السجلات
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("sabq.tracking.startup")

async def check_dependencies():
    """فحص المتطلبات والاعتماديات"""
    logger.info("🔍 فحص المتطلبات...")
    
    # فحص متغيرات البيئة
    required_env_vars = [
        'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
        'REDIS_HOST', 'REDIS_PORT'
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"⚠️  متغيرات البيئة المفقودة: {', '.join(missing_vars)}")
        logger.info("سيتم استخدام القيم الافتراضية...")
    
    try:
        # فحص اتصال قاعدة البيانات
        logger.info("🔗 فحص اتصال قاعدة البيانات...")
        await db_manager.initialize()
        logger.info("✅ قاعدة البيانات متصلة")
        
        # فحص اتصال Redis
        logger.info("🔗 فحص اتصال Redis...")
        await redis_manager.initialize()
        logger.info("✅ Redis متصل")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ فشل في فحص الاتصالات: {e}")
        return False

async def setup_database():
    """إعداد قاعدة البيانات"""
    try:
        logger.info("🗄️  إعداد قاعدة البيانات...")
        await db_manager.create_tables()
        logger.info("✅ تم إعداد الجداول بنجاح")
        
        # تحسين الجداول
        logger.info("⚡ تحسين قاعدة البيانات...")
        await db_manager.optimize_tables()
        logger.info("✅ تم تحسين قاعدة البيانات")
        
    except Exception as e:
        logger.error(f"❌ فشل في إعداد قاعدة البيانات: {e}")
        raise

def print_startup_banner():
    """طباعة شعار البدء"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                    نظام تتبع سلوك المستخدم                     ║
║                      سبق الذكية المتطورة                       ║
║                                                              ║
║    User Behavior Tracking System - Sabq AI Advanced         ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def print_server_info():
    """طباعة معلومات الخادم"""
    info = f"""
🚀 تم تشغيل خادم تتبع سلوك المستخدم بنجاح!

📡 معلومات الخادم:
   • المضيف: 0.0.0.0:8000
   • البيئة: {settings.environment}
   • الإصدار: {settings.app_version}
   • وضع التطوير: {settings.debug}

🔗 الروابط المهمة:
   • الواجهة التفاعلية: http://localhost:8000/docs
   • المراقبة الصحية: http://localhost:8000/health
   • التوثيق البديل: http://localhost:8000/redoc

🗄️  قاعدة البيانات:
   • النوع: PostgreSQL
   • المضيف: {settings.db_host}:{settings.db_port}
   • قاعدة البيانات: {settings.db_name}

🚀 Redis:
   • المضيف: {settings.redis_host}:{settings.redis_port}
   • قاعدة البيانات: {settings.redis_db}

💡 لإيقاف الخادم: اضغط Ctrl+C
    """
    print(info)

async def main():
    """الدالة الرئيسية"""
    print_startup_banner()
    
    try:
        # فحص المتطلبات
        if not await check_dependencies():
            logger.error("❌ فشل في فحص المتطلبات")
            return
        
        # إعداد قاعدة البيانات
        await setup_database()
        
        # طباعة معلومات الخادم
        print_server_info()
        
        # تشغيل الخادم
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=8000,
            reload=settings.debug,
            workers=1 if settings.debug else settings.worker_processes,
            log_level=settings.log_level.lower(),
            access_log=True,
            loop="asyncio"
        )
        
        server = uvicorn.Server(config)
        await server.serve()
        
    except KeyboardInterrupt:
        logger.info("⏹️  تم إيقاف الخادم بواسطة المستخدم")
    except Exception as e:
        logger.error(f"❌ خطأ في تشغيل الخادم: {e}")
    finally:
        # تنظيف الموارد
        logger.info("🧹 تنظيف الموارد...")
        try:
            await db_manager.close()
            await redis_manager.close()
        except:
            pass
        logger.info("✅ تم تنظيف الموارد")

def run_server():
    """تشغيل الخادم (للاستدعاء من خارج async)"""
    try:
        asyncio.run(main())
    except Exception as e:
        logger.error(f"❌ فشل في تشغيل الخادم: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_server()
