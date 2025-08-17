#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
نماذج البيانات والمخططات
User Behavior Tracking System - Pydantic Schemas
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Union
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, validator, root_validator
from pydantic.types import StrictStr, StrictInt, StrictFloat, StrictBool

# ===== Enums =====

class InteractionType(str, Enum):
    """أنواع التفاعل المدعومة"""
    LIKE = "like"
    UNLIKE = "unlike"
    SAVE = "save"
    UNSAVE = "unsave"
    SHARE = "share"
    COMMENT = "comment"
    VIEW = "view"
    CLICK = "click"

class DeviceType(str, Enum):
    """أنواع الأجهزة"""
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    TV = "tv"
    WATCH = "watch"
    UNKNOWN = "unknown"

class ContentType(str, Enum):
    """أنواع المحتوى"""
    ARTICLE = "article"
    VIDEO = "video"
    PODCAST = "podcast"
    IMAGE = "image"
    INFOGRAPHIC = "infographic"
    POLL = "poll"

class ActivityType(str, Enum):
    """أنواع النشاط"""
    READING = "reading"
    BROWSING = "browsing"
    SEARCHING = "searching"
    COMMENTING = "commenting"
    SHARING = "sharing"

class ScrollDirection(str, Enum):
    """اتجاه التمرير"""
    UP = "up"
    DOWN = "down"
    NONE = "none"

class ProcessingStatus(str, Enum):
    """حالة معالجة الأحداث"""
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    RETRY = "retry"

# ===== Base Models =====

class BaseSchema(BaseModel):
    """النموذج الأساسي لجميع المخططات"""
    
    class Config:
        orm_mode = True
        validate_assignment = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            UUID: lambda uuid: str(uuid)
        }

class TimestampMixin(BaseModel):
    """خليط لإضافة الطوابع الزمنية"""
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===== Request Schemas =====

class UserInteractionRequest(BaseSchema):
    """طلب تسجيل تفاعل مستخدم"""
    user_id: StrictStr = Field(..., description="معرف المستخدم")
    session_id: StrictStr = Field(..., description="معرف الجلسة")
    content_id: StrictStr = Field(..., description="معرف المحتوى")
    content_type: ContentType = Field(..., description="نوع المحتوى")
    interaction_type: InteractionType = Field(..., description="نوع التفاعل")
    
    # معلومات اختيارية
    interaction_value: Optional[StrictFloat] = Field(None, description="قيمة التفاعل")
    page_url: Optional[StrictStr] = Field(None, description="رابط الصفحة")
    element_id: Optional[StrictStr] = Field(None, description="معرف العنصر")
    element_type: Optional[StrictStr] = Field(None, description="نوع العنصر")
    scroll_position: Optional[StrictFloat] = Field(None, ge=0, le=100, description="موقع التمرير (نسبة مئوية)")
    viewport_position: Optional[Dict[str, Any]] = Field(None, description="موقع العنصر في المنطقة المرئية")
    time_on_page: Optional[StrictInt] = Field(None, ge=0, description="الوقت المقضي في الصفحة (ثواني)")
    
    # بيانات إضافية
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")
    
    @validator('scroll_position')
    def validate_scroll_position(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('موقع التمرير يجب أن يكون بين 0 و 100')
        return v

class ReadingSessionRequest(BaseSchema):
    """طلب تسجيل جلسة قراءة"""
    user_id: StrictStr = Field(..., description="معرف المستخدم")
    session_id: StrictStr = Field(..., description="معرف الجلسة")
    content_id: StrictStr = Field(..., description="معرف المحتوى")
    reading_session_id: StrictStr = Field(..., description="معرف جلسة القراءة")
    
    # معلومات القراءة
    start_time: Optional[datetime] = Field(None, description="وقت بداية القراءة")
    end_time: Optional[datetime] = Field(None, description="وقت نهاية القراءة")
    total_reading_time: Optional[StrictInt] = Field(None, ge=0, description="إجمالي وقت القراءة (ثواني)")
    active_reading_time: Optional[StrictInt] = Field(None, ge=0, description="وقت القراءة الفعلي (ثواني)")
    
    # معلومات التمرير
    scroll_depth_max: Optional[StrictFloat] = Field(None, ge=0, le=100, description="أقصى عمق تمرير")
    scroll_events_count: Optional[StrictInt] = Field(None, ge=0, description="عدد أحداث التمرير")
    content_length: Optional[StrictInt] = Field(None, ge=0, description="طول المحتوى")
    
    # سلوك القراءة
    reading_speed: Optional[StrictFloat] = Field(None, ge=0, description="سرعة القراءة (كلمة/دقيقة)")
    pause_count: Optional[StrictInt] = Field(None, ge=0, description="عدد التوقفات")
    pause_duration_total: Optional[StrictInt] = Field(None, ge=0, description="إجمالي وقت التوقف")
    
    # معلومات الإنجاز
    is_completed: Optional[StrictBool] = Field(False, description="هل تم إكمال القراءة")
    completion_percentage: Optional[StrictFloat] = Field(None, ge=0, le=100, description="نسبة الإنجاز")
    exit_point: Optional[StrictFloat] = Field(None, ge=0, le=100, description="نقطة الخروج")
    
    # معلومات الجهاز
    device_orientation: Optional[StrictStr] = Field(None, description="اتجاه الجهاز")
    page_visibility_changes: Optional[StrictInt] = Field(None, ge=0, description="تغييرات رؤية الصفحة")
    
    # بيانات إضافية
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")

class ScrollEventRequest(BaseSchema):
    """طلب تسجيل حدث تمرير"""
    reading_session_id: StrictStr = Field(..., description="معرف جلسة القراءة")
    user_id: StrictStr = Field(..., description="معرف المستخدم")
    content_id: StrictStr = Field(..., description="معرف المحتوى")
    
    # معلومات التمرير
    scroll_position: StrictFloat = Field(..., ge=0, le=100, description="موقع التمرير (نسبة مئوية)")
    scroll_direction: ScrollDirection = Field(..., description="اتجاه التمرير")
    scroll_speed: Optional[StrictFloat] = Field(None, ge=0, description="سرعة التمرير (بكسل/ثانية)")
    
    # معلومات زمنية
    timestamp: Optional[datetime] = Field(None, description="وقت الحدث")
    time_since_start: StrictInt = Field(..., ge=0, description="الوقت منذ بداية القراءة (ثواني)")
    
    # معلومات السياق
    viewport_height: Optional[StrictInt] = Field(None, ge=0, description="ارتفاع المنطقة المرئية")
    content_height: Optional[StrictInt] = Field(None, ge=0, description="ارتفاع المحتوى")
    is_pause_point: Optional[StrictBool] = Field(False, description="هل هي نقطة توقف")
    pause_duration: Optional[StrictInt] = Field(None, ge=0, description="مدة التوقف (ثواني)")
    
    # معلومات المحتوى
    content_section: Optional[StrictStr] = Field(None, description="قسم المحتوى")
    visible_text_length: Optional[StrictInt] = Field(None, ge=0, description="طول النص المرئي")
    
    # بيانات إضافية
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")

class ContextDataRequest(BaseSchema):
    """طلب تسجيل بيانات السياق"""
    user_id: StrictStr = Field(..., description="معرف المستخدم")
    session_id: StrictStr = Field(..., description="معرف الجلسة")
    
    # معلومات زمنية
    timestamp: Optional[datetime] = Field(None, description="وقت الحدث")
    local_time: Optional[datetime] = Field(None, description="الوقت المحلي")
    day_of_week: Optional[StrictInt] = Field(None, ge=0, le=6, description="يوم الأسبوع (0-6)")
    hour_of_day: Optional[StrictInt] = Field(None, ge=0, le=23, description="ساعة اليوم (0-23)")
    
    # معلومات البيئة
    weather_condition: Optional[StrictStr] = Field(None, description="حالة الطقس")
    temperature: Optional[StrictFloat] = Field(None, description="درجة الحرارة")
    is_weekend: Optional[StrictBool] = Field(None, description="هل هو عطلة نهاية أسبوع")
    is_holiday: Optional[StrictBool] = Field(None, description="هل هو عطلة رسمية")
    
    # معلومات النشاط
    activity_type: ActivityType = Field(..., description="نوع النشاط")
    content_category: Optional[StrictStr] = Field(None, description="تصنيف المحتوى")
    current_mood: Optional[StrictStr] = Field(None, description="المزاج الحالي")
    
    # معلومات الشبكة
    connection_type: Optional[StrictStr] = Field(None, description="نوع الاتصال")
    connection_speed: Optional[StrictStr] = Field(None, description="سرعة الاتصال")
    page_load_time: Optional[StrictInt] = Field(None, ge=0, description="وقت تحميل الصفحة (مللي ثانية)")
    
    # معلومات التفاعل الاجتماعي
    social_context: Optional[StrictStr] = Field(None, description="السياق الاجتماعي")
    notification_source: Optional[StrictStr] = Field(None, description="مصدر الإشعار")
    
    # بيانات إضافية
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")
    environmental_data: Optional[Dict[str, Any]] = Field(None, description="بيانات بيئية إضافية")

class UserSessionRequest(BaseSchema):
    """طلب إنشاء/تحديث جلسة مستخدم"""
    user_id: StrictStr = Field(..., description="معرف المستخدم")
    session_id: StrictStr = Field(..., description="معرف الجلسة الفريد")
    
    # معلومات الجهاز والمتصفح
    user_agent: Optional[StrictStr] = Field(None, description="معلومات المتصفح")
    device_type: Optional[DeviceType] = Field(None, description="نوع الجهاز")
    browser: Optional[StrictStr] = Field(None, description="المتصفح")
    os: Optional[StrictStr] = Field(None, description="نظام التشغيل")
    
    # معلومات الشاشة
    screen_width: Optional[StrictInt] = Field(None, ge=0, description="عرض الشاشة")
    screen_height: Optional[StrictInt] = Field(None, ge=0, description="ارتفاع الشاشة")
    viewport_width: Optional[StrictInt] = Field(None, ge=0, description="عرض المنطقة المرئية")
    viewport_height: Optional[StrictInt] = Field(None, ge=0, description="ارتفاع المنطقة المرئية")
    
    # معلومات الموقع
    ip_address: Optional[StrictStr] = Field(None, description="عنوان IP")
    country: Optional[StrictStr] = Field(None, min_length=2, max_length=2, description="رمز الدولة")
    city: Optional[StrictStr] = Field(None, description="المدينة")
    timezone: Optional[StrictStr] = Field(None, description="المنطقة الزمنية")
    language: Optional[StrictStr] = Field(None, description="اللغة")
    
    # معلومات المرجع
    referrer_url: Optional[StrictStr] = Field(None, description="رابط المرجع")
    utm_source: Optional[StrictStr] = Field(None, description="مصدر UTM")
    utm_medium: Optional[StrictStr] = Field(None, description="وسيط UTM")
    utm_campaign: Optional[StrictStr] = Field(None, description="حملة UTM")
    utm_term: Optional[StrictStr] = Field(None, description="مصطلح UTM")
    utm_content: Optional[StrictStr] = Field(None, description="محتوى UTM")
    
    # بيانات إضافية
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")

# ===== Response Schemas =====

class UserInteractionResponse(BaseSchema, TimestampMixin):
    """استجابة تفاعل المستخدم"""
    id: UUID
    user_id: str
    session_id: str
    content_id: str
    content_type: ContentType
    interaction_type: InteractionType
    interaction_value: Optional[float] = None
    page_url: Optional[str] = None
    element_id: Optional[str] = None
    element_type: Optional[str] = None
    scroll_position: Optional[float] = None
    viewport_position: Optional[Dict[str, Any]] = None
    timestamp: datetime
    time_on_page: Optional[int] = None
    is_duplicate: bool = False
    confidence_score: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class ReadingSessionResponse(BaseSchema, TimestampMixin):
    """استجابة جلسة القراءة"""
    id: UUID
    user_id: str
    session_id: str
    content_id: str
    reading_session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    total_reading_time: Optional[int] = None
    active_reading_time: Optional[int] = None
    scroll_depth_max: Optional[float] = None
    scroll_events_count: int = 0
    content_length: Optional[int] = None
    reading_speed: Optional[float] = None
    pause_count: int = 0
    pause_duration_total: Optional[int] = None
    engagement_score: Optional[float] = None
    attention_points: Optional[Dict[str, Any]] = None
    is_completed: bool = False
    completion_percentage: Optional[float] = None
    exit_point: Optional[float] = None
    device_orientation: Optional[str] = None
    page_visibility_changes: int = 0
    metadata: Optional[Dict[str, Any]] = None

class UserSessionResponse(BaseSchema, TimestampMixin):
    """استجابة جلسة المستخدم"""
    id: UUID
    user_id: str
    session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    last_activity: datetime
    user_agent: Optional[str] = None
    device_type: Optional[DeviceType] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None
    ip_address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    referrer_url: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    is_active: bool = True
    session_duration: Optional[int] = None
    page_views: int = 0
    metadata: Optional[Dict[str, Any]] = None

class ContextDataResponse(BaseSchema, TimestampMixin):
    """استجابة بيانات السياق"""
    id: UUID
    user_id: str
    session_id: str
    timestamp: datetime
    local_time: Optional[datetime] = None
    day_of_week: Optional[int] = None
    hour_of_day: Optional[int] = None
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None
    is_weekend: Optional[bool] = None
    is_holiday: Optional[bool] = None
    activity_type: ActivityType
    content_category: Optional[str] = None
    current_mood: Optional[str] = None
    connection_type: Optional[str] = None
    connection_speed: Optional[str] = None
    page_load_time: Optional[int] = None
    social_context: Optional[str] = None
    notification_source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    environmental_data: Optional[Dict[str, Any]] = None

class UserBehaviorSummaryResponse(BaseSchema):
    """استجابة ملخص سلوك المستخدم"""
    id: UUID
    user_id: str
    date: datetime
    total_sessions: int = 0
    total_session_duration: int = 0
    avg_session_duration: Optional[float] = None
    total_reading_time: int = 0
    articles_read: int = 0
    articles_completed: int = 0
    avg_reading_speed: Optional[float] = None
    avg_engagement_score: Optional[float] = None
    total_interactions: int = 0
    likes_count: int = 0
    saves_count: int = 0
    shares_count: int = 0
    comments_count: int = 0
    most_active_hour: Optional[int] = None
    preferred_device: Optional[str] = None
    avg_scroll_depth: Optional[float] = None
    preferred_content_categories: Optional[List[str]] = None
    reading_patterns: Optional[Dict[str, Any]] = None
    engagement_patterns: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    last_updated: datetime

# ===== Analytics Schemas =====

class InteractionAnalytics(BaseSchema):
    """تحليلات التفاعل"""
    total_interactions: int
    interactions_by_type: Dict[str, int]
    interactions_by_content: Dict[str, int]
    interactions_by_hour: Dict[str, int]
    interactions_by_device: Dict[str, int]
    avg_time_to_interact: Optional[float] = None
    most_engaging_content: List[Dict[str, Any]]

class ReadingAnalytics(BaseSchema):
    """تحليلات القراءة"""
    total_reading_time: int
    avg_reading_time: Optional[float] = None
    avg_reading_speed: Optional[float] = None
    completion_rate: Optional[float] = None
    avg_scroll_depth: Optional[float] = None
    popular_reading_times: List[Dict[str, Any]]
    reading_patterns: Dict[str, Any]
    engagement_trends: Dict[str, Any]

class UserBehaviorAnalytics(BaseSchema):
    """تحليلات سلوك المستخدم الشاملة"""
    user_id: str
    analysis_period: Dict[str, datetime]
    interaction_analytics: InteractionAnalytics
    reading_analytics: ReadingAnalytics
    session_analytics: Dict[str, Any]
    context_analytics: Dict[str, Any]
    behavioral_insights: List[str]
    recommendations: List[str]

# ===== Batch Processing Schemas =====

class BatchInteractionRequest(BaseSchema):
    """طلب معالجة دفعة من التفاعلات"""
    interactions: List[UserInteractionRequest] = Field(..., min_items=1, max_items=1000)
    batch_id: Optional[str] = Field(None, description="معرف الدفعة")
    priority: Optional[int] = Field(1, ge=1, le=5, description="أولوية المعالجة")

class BatchProcessingResponse(BaseSchema):
    """استجابة معالجة دفعة"""
    batch_id: str
    total_items: int
    processed_items: int
    failed_items: int
    processing_time: float
    errors: List[str]
    warnings: List[str]

# ===== Error Schemas =====

class ErrorResponse(BaseSchema):
    """استجابة خطأ"""
    error_code: str
    error_message: str
    error_details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    request_id: Optional[str] = None

class ValidationErrorResponse(BaseSchema):
    """استجابة خطأ التحقق"""
    error_code: str = "validation_error"
    error_message: str = "خطأ في التحقق من البيانات"
    validation_errors: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===== Health Check Schemas =====

class HealthCheckResponse(BaseSchema):
    """استجابة فحص الصحة"""
    status: str
    timestamp: datetime
    services: Dict[str, str]
    version: str
    uptime: int
    metrics: Optional[Dict[str, Any]] = None
