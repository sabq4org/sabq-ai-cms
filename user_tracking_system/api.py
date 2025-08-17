#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
API Server - خادم الـ APIs
User Behavior Tracking System - API Server
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import settings, LOGGING_CONFIG
from services.database import db_manager, get_db_session
from services.redis_service import redis_manager
from models.database import (
    UserInteraction, ReadingSession, ScrollEvent, 
    ContextData, UserSession, UserBehaviorSummary
)
from models.schemas import (
    UserInteractionRequest, UserInteractionResponse,
    ReadingSessionRequest, ReadingSessionResponse,
    ScrollEventRequest, ContextDataRequest, ContextDataResponse,
    UserSessionRequest, UserSessionResponse,
    BatchInteractionRequest, BatchProcessingResponse,
    InteractionAnalytics, ReadingAnalytics, UserBehaviorAnalytics,
    HealthCheckResponse, ErrorResponse
)

# إعداد السجلات
import logging.config
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("sabq.tracking.api")

# حدث بدء التطبيق
@asynccontextmanager
async def lifespan(app: FastAPI):
    """إدارة دورة حياة التطبيق"""
    # بدء التطبيق
    logger.info("🚀 بدء تشغيل نظام تتبع سلوك المستخدم...")
    
    try:
        # تهيئة قاعدة البيانات
        await db_manager.initialize()
        await db_manager.create_tables()
        
        # تهيئة Redis
        await redis_manager.initialize()
        
        logger.info("✅ تم تشغيل النظام بنجاح")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ فشل في تشغيل النظام: {e}")
        raise
    finally:
        # إيقاف التطبيق
        logger.info("⏹️  إيقاف نظام تتبع سلوك المستخدم...")
        await db_manager.close()
        await redis_manager.close()
        logger.info("✅ تم إيقاف النظام بنجاح")

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="نظام تتبع سلوك المستخدم - سبق الذكية",
    description="نظام متقدم لتتبع وتحليل سلوك المستخدمين في منصة سبق الذكية",
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# إضافة Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

if settings.is_production():
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["sabq.ai", "*.sabq.ai", "localhost"]
    )

# معالج الأخطاء العام
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """معالج الأخطاء العام"""
    logger.error(f"خطأ غير متوقع: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "internal_server_error",
            "error_message": "حدث خطأ داخلي في الخادم",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

# ===== Health Check Endpoints =====

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """فحص صحة النظام"""
    try:
        # فحص قاعدة البيانات
        db_health = await db_manager.health_check()
        
        # فحص Redis
        redis_health = await redis_manager.health_check()
        
        # تحديد الحالة العامة
        is_healthy = (
            db_health.get("status") == "healthy" and 
            redis_health.get("status") == "healthy"
        )
        
        return HealthCheckResponse(
            status="healthy" if is_healthy else "unhealthy",
            timestamp=datetime.now(timezone.utc),
            services={
                "database": db_health.get("status", "unknown"),
                "redis": redis_health.get("status", "unknown")
            },
            version=settings.app_version,
            uptime=int((datetime.now() - datetime.fromtimestamp(0)).total_seconds()),
            metrics={
                "database": db_health,
                "redis": redis_health
            }
        )
        
    except Exception as e:
        logger.error(f"فشل فحص الصحة: {e}")
        return HealthCheckResponse(
            status="unhealthy",
            timestamp=datetime.now(timezone.utc),
            services={"error": str(e)},
            version=settings.app_version,
            uptime=0
        )

# ===== User Interaction Endpoints =====

@app.post("/api/v1/interactions", response_model=UserInteractionResponse)
async def create_interaction(
    request: UserInteractionRequest,
    background_tasks: BackgroundTasks,
    session = Depends(get_db_session)
):
    """تسجيل تفاعل مستخدم جديد"""
    try:
        logger.info(f"تسجيل تفاعل جديد: {request.user_id} -> {request.content_id} ({request.interaction_type})")
        
        # إنشاء التفاعل في قاعدة البيانات
        interaction = UserInteraction(
            user_id=request.user_id,
            session_id=request.session_id,
            content_id=request.content_id,
            content_type=request.content_type,
            interaction_type=request.interaction_type,
            interaction_value=request.interaction_value,
            page_url=request.page_url,
            element_id=request.element_id,
            element_type=request.element_type,
            scroll_position=request.scroll_position,
            viewport_position=request.viewport_position,
            time_on_page=request.time_on_page,
            metadata=request.metadata
        )
        
        session.add(interaction)
        await session.commit()
        await session.refresh(interaction)
        
        # تحديث التخزين المؤقت
        background_tasks.add_task(
            update_interaction_cache,
            request.user_id,
            request.content_id,
            request.interaction_type
        )
        
        # إرسال للمعالجة في الوقت الفعلي
        background_tasks.add_task(
            process_interaction_real_time,
            interaction.to_dict()
        )
        
        return UserInteractionResponse(**interaction.to_dict())
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل التفاعل: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في تسجيل التفاعل"
        )

@app.get("/api/v1/interactions")
async def get_interactions(
    user_id: Optional[str] = None,
    content_id: Optional[str] = None,
    interaction_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session = Depends(get_db_session)
):
    """جلب التفاعلات بناءً على المعايير المحددة"""
    try:
        # بناء الاستعلام
        query = session.query(UserInteraction)
        
        if user_id:
            query = query.filter(UserInteraction.user_id == user_id)
        if content_id:
            query = query.filter(UserInteraction.content_id == content_id)
        if interaction_type:
            query = query.filter(UserInteraction.interaction_type == interaction_type)
            
        # ترتيب وتطبيق الحدود
        query = query.order_by(UserInteraction.timestamp.desc())
        total = await query.count()
        interactions = await query.offset(offset).limit(limit).all()
        
        return {
            "success": True,
            "data": [interaction.to_dict() for interaction in interactions],
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"خطأ في جلب التفاعلات: {e}")
        raise HTTPException(
            status_code=500,
            detail="فشل في جلب التفاعلات"
        )

# ===== Reading Session Endpoints =====

@app.post("/api/v1/reading-sessions", response_model=ReadingSessionResponse)
async def create_reading_session(
    request: ReadingSessionRequest,
    background_tasks: BackgroundTasks,
    session = Depends(get_db_session)
):
    """تسجيل جلسة قراءة جديدة"""
    try:
        reading_session = ReadingSession(
            user_id=request.user_id,
            session_id=request.session_id,
            content_id=request.content_id,
            reading_session_id=request.reading_session_id,
            start_time=request.start_time or datetime.now(timezone.utc),
            end_time=request.end_time,
            total_reading_time=request.total_reading_time,
            active_reading_time=request.active_reading_time,
            scroll_depth_max=request.scroll_depth_max,
            scroll_events_count=request.scroll_events_count,
            content_length=request.content_length,
            reading_speed=request.reading_speed,
            pause_count=request.pause_count,
            pause_duration_total=request.pause_duration_total,
            is_completed=request.is_completed,
            completion_percentage=request.completion_percentage,
            exit_point=request.exit_point,
            device_orientation=request.device_orientation,
            page_visibility_changes=request.page_visibility_changes,
            metadata=request.metadata
        )
        
        session.add(reading_session)
        await session.commit()
        await session.refresh(reading_session)
        
        # معالجة في الخلفية
        background_tasks.add_task(
            analyze_reading_behavior,
            reading_session.to_dict()
        )
        
        return ReadingSessionResponse(**reading_session.to_dict())
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل جلسة القراءة: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في تسجيل جلسة القراءة"
        )

# ===== Scroll Event Endpoints =====

@app.post("/api/v1/scroll-events")
async def create_scroll_event(
    request: ScrollEventRequest,
    background_tasks: BackgroundTasks,
    session = Depends(get_db_session)
):
    """تسجيل حدث تمرير"""
    try:
        scroll_event = ScrollEvent(
            reading_session_id=request.reading_session_id,
            user_id=request.user_id,
            content_id=request.content_id,
            scroll_position=request.scroll_position,
            scroll_direction=request.scroll_direction,
            scroll_speed=request.scroll_speed,
            timestamp=request.timestamp or datetime.now(timezone.utc),
            time_since_start=request.time_since_start,
            viewport_height=request.viewport_height,
            content_height=request.content_height,
            is_pause_point=request.is_pause_point,
            pause_duration=request.pause_duration,
            content_section=request.content_section,
            visible_text_length=request.visible_text_length,
            metadata=request.metadata
        )
        
        session.add(scroll_event)
        await session.commit()
        
        # تحديث نقاط الاهتمام في الوقت الفعلي
        background_tasks.add_task(
            update_attention_points,
            request.reading_session_id,
            request.scroll_position,
            request.is_pause_point
        )
        
        return {"success": True, "message": "تم تسجيل حدث التمرير"}
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل حدث التمرير: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في تسجيل حدث التمرير"
        )

# ===== Context Data Endpoints =====

@app.post("/api/v1/context-data", response_model=ContextDataResponse)
async def create_context_data(
    request: ContextDataRequest,
    session = Depends(get_db_session)
):
    """تسجيل بيانات السياق"""
    try:
        context_data = ContextData(
            user_id=request.user_id,
            session_id=request.session_id,
            timestamp=request.timestamp or datetime.now(timezone.utc),
            local_time=request.local_time,
            day_of_week=request.day_of_week,
            hour_of_day=request.hour_of_day,
            weather_condition=request.weather_condition,
            temperature=request.temperature,
            is_weekend=request.is_weekend,
            is_holiday=request.is_holiday,
            activity_type=request.activity_type,
            content_category=request.content_category,
            current_mood=request.current_mood,
            connection_type=request.connection_type,
            connection_speed=request.connection_speed,
            page_load_time=request.page_load_time,
            social_context=request.social_context,
            notification_source=request.notification_source,
            metadata=request.metadata,
            environmental_data=request.environmental_data
        )
        
        session.add(context_data)
        await session.commit()
        await session.refresh(context_data)
        
        return ContextDataResponse(**context_data.to_dict())
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل بيانات السياق: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في تسجيل بيانات السياق"
        )

# ===== User Session Endpoints =====

@app.post("/api/v1/user-sessions", response_model=UserSessionResponse)
async def create_user_session(
    request: UserSessionRequest,
    session = Depends(get_db_session)
):
    """إنشاء/تحديث جلسة مستخدم"""
    try:
        # البحث عن جلسة موجودة
        existing_session = await session.query(UserSession).filter(
            UserSession.session_id == request.session_id
        ).first()
        
        if existing_session:
            # تحديث الجلسة الموجودة
            for field, value in request.dict(exclude_unset=True).items():
                if hasattr(existing_session, field):
                    setattr(existing_session, field, value)
            existing_session.last_activity = datetime.now(timezone.utc)
            
            await session.commit()
            await session.refresh(existing_session)
            return UserSessionResponse(**existing_session.to_dict())
        else:
            # إنشاء جلسة جديدة
            user_session = UserSession(
                user_id=request.user_id,
                session_id=request.session_id,
                start_time=datetime.now(timezone.utc),
                last_activity=datetime.now(timezone.utc),
                user_agent=request.user_agent,
                device_type=request.device_type,
                browser=request.browser,
                os=request.os,
                screen_width=request.screen_width,
                screen_height=request.screen_height,
                viewport_width=request.viewport_width,
                viewport_height=request.viewport_height,
                ip_address=request.ip_address,
                country=request.country,
                city=request.city,
                timezone=request.timezone,
                language=request.language,
                referrer_url=request.referrer_url,
                utm_source=request.utm_source,
                utm_medium=request.utm_medium,
                utm_campaign=request.utm_campaign,
                utm_term=request.utm_term,
                utm_content=request.utm_content,
                metadata=request.metadata
            )
            
            session.add(user_session)
            await session.commit()
            await session.refresh(user_session)
            
            return UserSessionResponse(**user_session.to_dict())
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء/تحديث جلسة المستخدم: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في إنشاء/تحديث جلسة المستخدم"
        )

# ===== Analytics Endpoints =====

@app.get("/api/v1/analytics/user/{user_id}", response_model=UserBehaviorAnalytics)
async def get_user_analytics(
    user_id: str,
    days: int = 30,
    session = Depends(get_db_session)
):
    """جلب تحليلات شاملة لسلوك المستخدم"""
    try:
        # حساب نطاق التواريخ
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # جلب التفاعلات
        interactions = await session.query(UserInteraction).filter(
            UserInteraction.user_id == user_id,
            UserInteraction.timestamp >= start_date
        ).all()
        
        # جلب جلسات القراءة
        reading_sessions = await session.query(ReadingSession).filter(
            ReadingSession.user_id == user_id,
            ReadingSession.start_time >= start_date
        ).all()
        
        # تحليل التفاعلات
        interaction_analytics = analyze_interactions(interactions)
        
        # تحليل القراءة
        reading_analytics = analyze_reading_sessions(reading_sessions)
        
        # تحليل الجلسات
        session_analytics = await analyze_user_sessions(session, user_id, start_date)
        
        # تحليل السياق
        context_analytics = await analyze_context_data(session, user_id, start_date)
        
        # استخراج الرؤى السلوكية
        behavioral_insights = generate_behavioral_insights(
            interaction_analytics, reading_analytics, session_analytics
        )
        
        # توليد التوصيات
        recommendations = generate_user_recommendations(behavioral_insights)
        
        return UserBehaviorAnalytics(
            user_id=user_id,
            analysis_period={
                "start": start_date,
                "end": end_date
            },
            interaction_analytics=interaction_analytics,
            reading_analytics=reading_analytics,
            session_analytics=session_analytics,
            context_analytics=context_analytics,
            behavioral_insights=behavioral_insights,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"خطأ في جلب تحليلات المستخدم: {e}")
        raise HTTPException(
            status_code=500,
            detail="فشل في جلب تحليلات المستخدم"
        )

# ===== Batch Processing Endpoints =====

@app.post("/api/v1/interactions/batch", response_model=BatchProcessingResponse)
async def process_interactions_batch(
    request: BatchInteractionRequest,
    background_tasks: BackgroundTasks,
    session = Depends(get_db_session)
):
    """معالجة دفعة من التفاعلات"""
    try:
        start_time = datetime.now()
        processed_count = 0
        failed_count = 0
        errors = []
        warnings = []
        
        for interaction_req in request.interactions:
            try:
                # إنشاء التفاعل
                interaction = UserInteraction(
                    user_id=interaction_req.user_id,
                    session_id=interaction_req.session_id,
                    content_id=interaction_req.content_id,
                    content_type=interaction_req.content_type,
                    interaction_type=interaction_req.interaction_type,
                    interaction_value=interaction_req.interaction_value,
                    page_url=interaction_req.page_url,
                    element_id=interaction_req.element_id,
                    element_type=interaction_req.element_type,
                    scroll_position=interaction_req.scroll_position,
                    viewport_position=interaction_req.viewport_position,
                    time_on_page=interaction_req.time_on_page,
                    metadata=interaction_req.metadata
                )
                
                session.add(interaction)
                processed_count += 1
                
            except Exception as e:
                failed_count += 1
                errors.append(f"فشل في معالجة التفاعل: {str(e)}")
                logger.warning(f"فشل في معالجة تفاعل في الدفعة: {e}")
        
        # حفظ جميع التفاعلات المعالجة
        await session.commit()
        
        # معالجة في الخلفية
        background_tasks.add_task(
            process_batch_analytics,
            request.batch_id,
            processed_count
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchProcessingResponse(
            batch_id=request.batch_id or f"batch_{int(start_time.timestamp())}",
            total_items=len(request.interactions),
            processed_items=processed_count,
            failed_items=failed_count,
            processing_time=processing_time,
            errors=errors,
            warnings=warnings
        )
        
    except Exception as e:
        logger.error(f"خطأ في معالجة الدفعة: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="فشل في معالجة دفعة التفاعلات"
        )

# ===== Background Tasks =====

async def update_interaction_cache(user_id: str, content_id: str, interaction_type: str):
    """تحديث التخزين المؤقت للتفاعلات"""
    try:
        # تحديث عدادات التفاعل
        await redis_manager.increment_interaction_counter(content_id, interaction_type)
        
        # تحديث نشاط المستخدم
        await redis_manager.track_user_activity(user_id, {
            "type": "interaction",
            "content_id": content_id,
            "interaction_type": interaction_type
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث التخزين المؤقت: {e}")

async def process_interaction_real_time(interaction_data: Dict[str, Any]):
    """معالجة التفاعل في الوقت الفعلي"""
    try:
        # هنا يمكن إرسال البيانات إلى Kafka للمعالجة المتقدمة
        # أو تشغيل خوارزميات التحليل الفوري
        logger.info(f"معالجة تفاعل في الوقت الفعلي: {interaction_data['user_id']} -> {interaction_data['content_id']}")
        
    except Exception as e:
        logger.error(f"خطأ في المعالجة الفورية: {e}")

async def analyze_reading_behavior(reading_session_data: Dict[str, Any]):
    """تحليل سلوك القراءة"""
    try:
        # تحليل أنماط القراءة واستخراج الرؤى
        user_id = reading_session_data["user_id"]
        
        # حساب نقاط الاهتمام
        engagement_score = calculate_engagement_score(reading_session_data)
        
        # تحديث ملف المستخدم
        await redis_manager.cache_reading_analytics(user_id, {
            "last_reading_session": reading_session_data,
            "engagement_score": engagement_score,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل سلوك القراءة: {e}")

async def update_attention_points(reading_session_id: str, scroll_position: float, is_pause_point: bool):
    """تحديث نقاط الاهتمام"""
    try:
        if is_pause_point:
            # حفظ نقطة اهتمام في Redis
            attention_key = f"attention_points:{reading_session_id}"
            current_points = await redis_manager.get(attention_key, [])
            current_points.append({
                "position": scroll_position,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            await redis_manager.set(attention_key, current_points, 3600)  # ساعة واحدة
            
    except Exception as e:
        logger.error(f"خطأ في تحديث نقاط الاهتمام: {e}")

async def process_batch_analytics(batch_id: str, processed_count: int):
    """معالجة تحليلات الدفعة"""
    try:
        logger.info(f"معالجة تحليلات الدفعة {batch_id}: {processed_count} عنصر")
        # هنا يمكن إضافة تحليلات متقدمة للدفعة
        
    except Exception as e:
        logger.error(f"خطأ في معالجة تحليلات الدفعة: {e}")

# ===== Helper Functions =====

def calculate_engagement_score(reading_session_data: Dict[str, Any]) -> float:
    """حساب نقاط الاهتمام"""
    try:
        reading_time = reading_session_data.get("total_reading_time", 0)
        scroll_depth = reading_session_data.get("scroll_depth_max", 0)
        completion = reading_session_data.get("completion_percentage", 0)
        
        # خوارزمية بسيطة لحساب الاهتمام
        engagement = (reading_time * 0.3 + scroll_depth * 0.4 + completion * 0.3) / 100
        return min(1.0, max(0.0, engagement))
        
    except Exception:
        return 0.0

def analyze_interactions(interactions: List[UserInteraction]) -> InteractionAnalytics:
    """تحليل التفاعلات"""
    # تنفيذ تحليل التفاعلات
    pass

def analyze_reading_sessions(reading_sessions: List[ReadingSession]) -> ReadingAnalytics:
    """تحليل جلسات القراءة"""
    # تنفيذ تحليل القراءة
    pass

async def analyze_user_sessions(session, user_id: str, start_date: datetime) -> Dict[str, Any]:
    """تحليل جلسات المستخدم"""
    # تنفيذ تحليل الجلسات
    pass

async def analyze_context_data(session, user_id: str, start_date: datetime) -> Dict[str, Any]:
    """تحليل بيانات السياق"""
    # تنفيذ تحليل السياق
    pass

def generate_behavioral_insights(interaction_analytics, reading_analytics, session_analytics) -> List[str]:
    """توليد الرؤى السلوكية"""
    # تنفيذ توليد الرؤى
    pass

def generate_user_recommendations(behavioral_insights) -> List[str]:
    """توليد توصيات للمستخدم"""
    # تنفيذ توليد التوصيات
    pass

# ===== Server Entry Point =====

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        workers=settings.worker_processes if settings.is_production() else 1,
        log_level=settings.log_level.lower(),
        access_log=True
    )
