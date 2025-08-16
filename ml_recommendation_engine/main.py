#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محرك التوصيات الذكي - سبق الذكية
الخدمة الرئيسية
Sabq AI Recommendation Engine - Main Service
"""

import asyncio
import logging
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import sys
from pathlib import Path

# إضافة المسار الحالي
sys.path.append(str(Path(__file__).parent))

from config import settings, LOGGING_CONFIG
from infrastructure.database_manager import DatabaseManager
from infrastructure.redis_manager import RedisManager
from infrastructure.s3_manager import S3Manager
from infrastructure.ml_pipeline import MLPipeline
from api.recommendation_routes import router as recommendation_router
from models.continuous_learning import ContinuousLearning

# إعداد السجلات
import logging.config
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("recommendation_engine")

# المدراء العامين
db_manager = DatabaseManager()
redis_manager = RedisManager()
s3_manager = S3Manager()
ml_pipeline = MLPipeline()
continuous_learner = ContinuousLearning()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """إدارة دورة حياة التطبيق"""
    # بدء التشغيل
    logger.info("🚀 بدء تشغيل محرك التوصيات الذكي - سبق")
    
    try:
        # تهيئة الاتصالات
        await db_manager.initialize()
        await redis_manager.initialize()
        
        if settings.aws_access_key_id:
            await s3_manager.initialize()
        
        # تهيئة خط إنتاج ML
        await ml_pipeline.initialize()
        
        # بدء التعلم المستمر
        if settings.environment == "production":
            await continuous_learner.start_background_learning()
        
        logger.info("✅ تم تهيئة جميع الخدمات بنجاح")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ خطأ في تهيئة الخدمات: {e}")
        raise
    
    finally:
        # إيقاف التشغيل
        logger.info("🔄 إيقاف تشغيل محرك التوصيات...")
        
        try:
            await continuous_learner.stop_background_learning()
            await ml_pipeline.cleanup()
            await db_manager.close()
            await redis_manager.close()
            
            if settings.aws_access_key_id:
                await s3_manager.close()
            
            logger.info("✅ تم إيقاف جميع الخدمات بنجاح")
            
        except Exception as e:
            logger.error(f"❌ خطأ في إيقاف الخدمات: {e}")

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="محرك التوصيات الذكي - سبق",
    description="Sabq AI Intelligent Recommendation Engine",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
    lifespan=lifespan
)

# إضافة الـ Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# معالج الأخطاء العام
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"خطأ غير متوقع: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "خطأ داخلي في الخادم",
            "message": str(exc) if settings.debug else "حدث خطأ غير متوقع"
        }
    )

# معالج 404
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "غير موجود",
            "message": "المسار المطلوب غير موجود"
        }
    )

# الصفحة الرئيسية
@app.get("/")
async def root():
    """الصفحة الرئيسية لمحرك التوصيات"""
    return {
        "message": "مرحباً بكم في محرك التوصيات الذكي - سبق",
        "service": "Sabq AI Recommendation Engine",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.environment,
        "docs": "/docs" if settings.environment == "development" else "disabled"
    }

# فحص الصحة
@app.get("/health")
async def health_check():
    """فحص صحة النظام"""
    try:
        # فحص قاعدة البيانات
        db_status = await db_manager.health_check()
        
        # فحص Redis
        redis_status = await redis_manager.health_check()
        
        # فحص النماذج
        models_status = await ml_pipeline.health_check()
        
        # الحالة العامة
        overall_status = all([db_status, redis_status, models_status])
        
        return {
            "status": "healthy" if overall_status else "unhealthy",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "database": "connected" if db_status else "disconnected",
                "redis": "connected" if redis_status else "disconnected",
                "ml_models": "loaded" if models_status else "not_loaded"
            },
            "environment": settings.environment
        }
        
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# معلومات النظام
@app.get("/info")
async def system_info():
    """معلومات النظام والإحصائيات"""
    try:
        # إحصائيات قاعدة البيانات
        db_stats = await db_manager.get_statistics()
        
        # إحصائيات Redis
        redis_stats = await redis_manager.get_statistics()
        
        # إحصائيات النماذج
        model_stats = await ml_pipeline.get_model_statistics()
        
        return {
            "system": {
                "environment": settings.environment,
                "version": "1.0.0",
                "max_recommendations": settings.max_recommendations,
                "cache_ttl": settings.cache_ttl
            },
            "database": db_stats,
            "cache": redis_stats,
            "models": model_stats,
            "continuous_learning": {
                "enabled": settings.environment == "production",
                "learning_rate": settings.learning_rate,
                "retrain_threshold": settings.retrain_threshold
            }
        }
        
    except Exception as e:
        logger.error(f"خطأ في جلب معلومات النظام: {e}")
        raise HTTPException(status_code=500, detail="خطأ في جلب معلومات النظام")

# إحصائيات الأداء
@app.get("/metrics")
async def performance_metrics():
    """إحصائيات الأداء للمراقبة"""
    try:
        # جمع إحصائيات مختلفة
        metrics = {
            "recommendations_served": await redis_manager.get("metrics:recommendations_served") or 0,
            "cache_hit_rate": await redis_manager.get("metrics:cache_hit_rate") or 0.0,
            "average_response_time": await redis_manager.get("metrics:avg_response_time") or 0.0,
            "active_users": await db_manager.get_active_users_count(),
            "total_articles": await db_manager.get_articles_count(),
            "model_accuracy": await ml_pipeline.get_current_accuracy(),
            "system_load": await get_system_load()
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"خطأ في جلب إحصائيات الأداء: {e}")
        raise HTTPException(status_code=500, detail="خطأ في جلب إحصائيات الأداء")

async def get_system_load():
    """حساب حمولة النظام"""
    try:
        import psutil
        return {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }
    except ImportError:
        return {"error": "psutil not available"}

# تحديث النماذج يدوياً
@app.post("/admin/retrain")
async def retrain_models(background_tasks: BackgroundTasks):
    """إعادة تدريب النماذج يدوياً"""
    try:
        # إضافة مهمة إعادة التدريب في الخلفية
        background_tasks.add_task(ml_pipeline.retrain_all_models)
        
        return {
            "message": "تم بدء إعادة تدريب النماذج في الخلفية",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"خطأ في بدء إعادة التدريب: {e}")
        raise HTTPException(status_code=500, detail="خطأ في بدء إعادة التدريب")

# تنظيف التخزين المؤقت
@app.post("/admin/clear-cache")
async def clear_cache():
    """تنظيف التخزين المؤقت"""
    try:
        await redis_manager.clear_all_caches()
        
        return {
            "message": "تم تنظيف التخزين المؤقت بنجاح",
            "status": "cleared"
        }
        
    except Exception as e:
        logger.error(f"خطأ في تنظيف التخزين المؤقت: {e}")
        raise HTTPException(status_code=500, detail="خطأ في تنظيف التخزين المؤقت")

# إضافة router التوصيات
app.include_router(
    recommendation_router,
    prefix="/api/v1",
    tags=["recommendations"]
)

# middleware لقياس زمن الاستجابة
@app.middleware("http")
async def add_process_time_header(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # تحديث إحصائيات متوسط زمن الاستجابة
    try:
        await redis_manager.update_response_time_metric(process_time)
    except:
        pass  # تجاهل الأخطاء في التحديث
    
    return response

# middleware لحساب معدل استخدام التخزين المؤقت
@app.middleware("http")
async def cache_metrics_middleware(request, call_next):
    response = await call_next(request)
    
    # تحديث إحصائيات التخزين المؤقت
    if "X-Cache-Hit" in response.headers:
        try:
            await redis_manager.increment_cache_hit()
        except:
            pass
    elif request.url.path.startswith("/api/v1/recommendations"):
        try:
            await redis_manager.increment_cache_miss()
        except:
            pass
    
    return response

def create_app():
    """إنشاء التطبيق للاستخدام في الخارج"""
    return app

if __name__ == "__main__":
    # تشغيل الخادم
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
        workers=1,  # للتطوير فقط
        access_log=True
    )
