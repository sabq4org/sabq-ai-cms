#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
نص تشغيل نظام تحليل المشاعر العربي
Arabic Sentiment Analysis System Startup Script
"""

import os
import sys
import asyncio
import argparse
import logging
from pathlib import Path
import uvicorn
from datetime import datetime

# إضافة مسار المشروع إلى Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# استيراد الإعدادات والتبعيات
try:
    from config.settings import settings, LOGGING_CONFIG
    from api.sentiment_api import app
    from services.database import DatabaseManager
    from services.redis_service import RedisManager
    from models.arabic_bert_sentiment import ArabicSentimentAnalyzer, SentimentModelConfig
except ImportError as e:
    print(f"❌ فشل في استيراد الوحدات المطلوبة: {e}")
    print("تأكد من تثبيت جميع المتطلبات: pip install -r requirements.txt")
    sys.exit(1)

# إعداد التسجيل
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class SentimentSystemLauncher:
    """مشغل نظام تحليل المشاعر"""
    
    def __init__(self):
        self.db_manager = None
        self.redis_manager = None
        self.sentiment_analyzer = None
        
    async def check_dependencies(self) -> bool:
        """فحص التبعيات والخدمات المطلوبة"""
        logger.info("🔍 فحص التبعيات والخدمات...")
        
        issues = []
        
        # فحص Python version
        if sys.version_info < (3, 11):
            issues.append(f"Python 3.11+ مطلوب. النسخة الحالية: {sys.version}")
        
        # فحص المجلدات المطلوبة
        required_dirs = ['logs', 'models', 'data', 'cache']
        for dir_name in required_dirs:
            dir_path = current_dir / dir_name
            if not dir_path.exists():
                dir_path.mkdir(parents=True, exist_ok=True)
                logger.info(f"✅ تم إنشاء مجلد: {dir_name}")
        
        # فحص المتطلبات المهمة
        try:
            import torch
            import transformers
            import fastapi
            import redis
            import psycopg2
            logger.info("✅ جميع المكتبات الأساسية متوفرة")
        except ImportError as e:
            issues.append(f"مكتبة مفقودة: {e}")
        
        # فحص متغيرات البيئة المهمة
        if not os.getenv('DATABASE_URL') and 'postgresql' not in settings.database_url:
            logger.warning("⚠️ DATABASE_URL غير محدد، سيتم استخدام الإعدادات الافتراضية")
        
        # عرض التقرير
        if issues:
            logger.error("❌ مشاكل في التبعيات:")
            for issue in issues:
                logger.error(f"  - {issue}")
            return False
        
        logger.info("✅ جميع التبعيات متوفرة")
        return True
    
    async def initialize_database(self) -> bool:
        """تهيئة قاعدة البيانات"""
        logger.info("🗄️ تهيئة قاعدة البيانات...")
        
        try:
            self.db_manager = DatabaseManager()
            await self.db_manager.initialize()
            
            # إنشاء الجداول إذا لم تكن موجودة
            await self.db_manager.create_tables()
            
            # اختبار الاتصال
            health = await self.db_manager.health_check()
            if health['status'] == 'healthy':
                logger.info("✅ تم تهيئة قاعدة البيانات بنجاح")
                return True
            else:
                logger.error(f"❌ مشكلة في قاعدة البيانات: {health}")
                return False
                
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة قاعدة البيانات: {str(e)}")
            return False
    
    async def initialize_redis(self) -> bool:
        """تهيئة Redis"""
        logger.info("🔴 تهيئة Redis...")
        
        try:
            self.redis_manager = RedisManager()
            await self.redis_manager.initialize()
            
            # اختبار الاتصال
            if await self.redis_manager.ping():
                logger.info("✅ تم تهيئة Redis بنجاح")
                return True
            else:
                logger.warning("⚠️ فشل في الاتصال بـ Redis، سيعمل النظام بدونه")
                return False
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في تهيئة Redis: {str(e)}")
            logger.info("📝 النظام سيعمل بدون Redis (بدون تخزين مؤقت)")
            return False
    
    async def initialize_models(self) -> bool:
        """تهيئة نماذج الذكاء الاصطناعي"""
        logger.info("🤖 تهيئة نماذج الذكاء الاصطناعي...")
        
        try:
            # إعداد النموذج
            config = SentimentModelConfig(
                model_name=settings.arabic_bert_model,
                max_length=settings.max_sequence_length,
                batch_size=settings.batch_size
            )
            
            self.sentiment_analyzer = ArabicSentimentAnalyzer(config)
            
            # محاولة تحميل النماذج
            self.sentiment_analyzer.load_models()
            
            # اختبار سريع
            test_result = self.sentiment_analyzer.analyze_sentiment(
                "هذا اختبار للنظام", include_confidence=True
            )
            
            if test_result and 'predicted_sentiment' in test_result:
                logger.info("✅ تم تهيئة نماذج الذكاء الاصطناعي بنجاح")
                return True
            else:
                logger.error("❌ فشل في اختبار النماذج")
                return False
                
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة النماذج: {str(e)}")
            return False
    
    async def run_health_checks(self) -> dict:
        """فحص صحة جميع مكونات النظام"""
        logger.info("🏥 إجراء فحص صحة شامل...")
        
        health_status = {
            'overall': 'healthy',
            'database': 'unknown',
            'redis': 'unknown',
            'models': 'unknown',
            'timestamp': datetime.now().isoformat()
        }
        
        # فحص قاعدة البيانات
        if self.db_manager:
            try:
                db_health = await self.db_manager.health_check()
                health_status['database'] = db_health['status']
            except Exception as e:
                health_status['database'] = 'unhealthy'
                logger.error(f"❌ مشكلة في قاعدة البيانات: {e}")
        
        # فحص Redis
        if self.redis_manager:
            try:
                if await self.redis_manager.ping():
                    health_status['redis'] = 'healthy'
                else:
                    health_status['redis'] = 'unhealthy'
            except Exception:
                health_status['redis'] = 'unhealthy'
        else:
            health_status['redis'] = 'disabled'
        
        # فحص النماذج
        if self.sentiment_analyzer:
            try:
                model_info = self.sentiment_analyzer.get_model_info()
                if model_info['sentiment_model_loaded']:
                    health_status['models'] = 'healthy'
                else:
                    health_status['models'] = 'unhealthy'
            except Exception:
                health_status['models'] = 'unhealthy'
        
        # تحديد الحالة العامة
        critical_components = ['database', 'models']
        if any(health_status[comp] == 'unhealthy' for comp in critical_components):
            health_status['overall'] = 'unhealthy'
        elif health_status['redis'] == 'unhealthy':
            health_status['overall'] = 'degraded'
        
        return health_status
    
    async def initialize_system(self) -> bool:
        """تهيئة النظام بالكامل"""
        logger.info("🚀 بدء تهيئة نظام تحليل المشاعر العربي...")
        logger.info(f"📋 الإصدار: {getattr(settings, 'app_version', '1.0.0')}")
        logger.info(f"🌍 البيئة: {'إنتاج' if not settings.debug else 'تطوير'}")
        
        # فحص التبعيات
        if not await self.check_dependencies():
            logger.error("❌ فشل في فحص التبعيات")
            return False
        
        # تهيئة قاعدة البيانات
        if not await self.initialize_database():
            logger.error("❌ فشل في تهيئة قاعدة البيانات")
            return False
        
        # تهيئة Redis (اختياري)
        await self.initialize_redis()
        
        # تهيئة النماذج
        if not await self.initialize_models():
            logger.error("❌ فشل في تهيئة النماذج")
            return False
        
        # فحص صحة شامل
        health = await self.run_health_checks()
        
        if health['overall'] in ['healthy', 'degraded']:
            logger.info("✅ تم تهيئة النظام بنجاح!")
            
            # عرض تقرير الحالة
            logger.info("📊 تقرير حالة النظام:")
            logger.info(f"  🗄️ قاعدة البيانات: {health['database']}")
            logger.info(f"  🔴 Redis: {health['redis']}")
            logger.info(f"  🤖 النماذج: {health['models']}")
            logger.info(f"  📈 الحالة العامة: {health['overall']}")
            
            return True
        else:
            logger.error("❌ فشل في تهيئة النظام")
            return False
    
    async def cleanup(self):
        """تنظيف الموارد عند الإغلاق"""
        logger.info("🧹 تنظيف الموارد...")
        
        try:
            if self.db_manager:
                await self.db_manager.close()
                logger.info("✅ تم إغلاق اتصال قاعدة البيانات")
            
            if self.redis_manager:
                await self.redis_manager.close()
                logger.info("✅ تم إغلاق اتصال Redis")
            
        except Exception as e:
            logger.warning(f"⚠️ مشكلة في التنظيف: {e}")

def create_argument_parser():
    """إنشاء معالج المعاملات"""
    parser = argparse.ArgumentParser(
        description="نظام تحليل المشاعر العربي المتقدم",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
أمثلة الاستخدام:
  python start_server.py                    # تشغيل عادي
  python start_server.py --reload           # تشغيل مع إعادة التحميل التلقائي
  python start_server.py --port 8002        # تشغيل على منفذ مختلف
  python start_server.py --workers 4        # تشغيل مع 4 عمليات
  python start_server.py --check-only       # فحص النظام فقط
        """
    )
    
    parser.add_argument(
        '--host',
        default='0.0.0.0',
        help='عنوان IP للخادم (افتراضي: 0.0.0.0)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=8001,
        help='منفذ الخادم (افتراضي: 8001)'
    )
    
    parser.add_argument(
        '--workers',
        type=int,
        default=1,
        help='عدد العمليات المتوازية (افتراضي: 1)'
    )
    
    parser.add_argument(
        '--reload',
        action='store_true',
        help='إعادة التحميل التلقائي عند تغيير الكود'
    )
    
    parser.add_argument(
        '--log-level',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default=settings.log_level,
        help='مستوى التسجيل'
    )
    
    parser.add_argument(
        '--check-only',
        action='store_true',
        help='فحص النظام فقط دون تشغيل الخادم'
    )
    
    parser.add_argument(
        '--config-file',
        help='مسار ملف الإعدادات المخصص'
    )
    
    return parser

async def main():
    """الوظيفة الرئيسية"""
    # معالجة المعاملات
    parser = create_argument_parser()
    args = parser.parse_args()
    
    # تحديث مستوى التسجيل
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    # إنشاء مشغل النظام
    launcher = SentimentSystemLauncher()
    
    try:
        # تهيئة النظام
        success = await launcher.initialize_system()
        
        if not success:
            logger.error("💥 فشل في تهيئة النظام")
            sys.exit(1)
        
        # إذا كان فحص فقط، إنهاء البرنامج
        if args.check_only:
            logger.info("✅ فحص النظام مكتمل بنجاح")
            return
        
        # تشغيل الخادم
        logger.info(f"🌐 بدء تشغيل الخادم على http://{args.host}:{args.port}")
        logger.info("📚 الوثائق متاحة على: http://localhost:8001/docs")
        logger.info("🔧 إيقاف الخادم: Ctrl+C")
        
        # إعداد Uvicorn
        uvicorn_config = {
            "app": "api.sentiment_api:app",
            "host": args.host,
            "port": args.port,
            "log_level": args.log_level.lower(),
            "access_log": True,
            "use_colors": True,
        }
        
        # إضافة إعدادات تطوير أو إنتاج
        if args.reload:
            uvicorn_config["reload"] = True
            uvicorn_config["reload_dirs"] = [str(current_dir)]
            logger.info("🔄 وضع إعادة التحميل التلقائي مفعل")
        else:
            uvicorn_config["workers"] = args.workers
            if args.workers > 1:
                logger.info(f"⚡ تشغيل مع {args.workers} عمليات متوازية")
        
        # تشغيل الخادم
        await uvicorn.run(**uvicorn_config)
        
    except KeyboardInterrupt:
        logger.info("⏹️ تم إيقاف الخادم بواسطة المستخدم")
    except Exception as e:
        logger.error(f"💥 خطأ في تشغيل النظام: {str(e)}")
        sys.exit(1)
    finally:
        # تنظيف الموارد
        await launcher.cleanup()
        logger.info("👋 تم إنهاء النظام بنجاح")

def sync_main():
    """نقطة دخول متزامنة"""
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"💥 خطأ في النظام: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # عرض معلومات النظام
    print("=" * 60)
    print("🤖 نظام تحليل المشاعر العربي المتقدم")
    print("Advanced Arabic Sentiment Analysis System")
    print("=" * 60)
    print(f"Python: {sys.version}")
    print(f"المجلد: {current_dir}")
    print(f"الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # تشغيل النظام
    sync_main()
