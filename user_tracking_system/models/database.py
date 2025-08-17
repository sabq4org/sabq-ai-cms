#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تتبع سلوك المستخدم - سبق الذكية
نماذج قاعدة البيانات
User Behavior Tracking System - Database Models
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from uuid import uuid4, UUID
import json

from sqlalchemy import (
    Column, String, Integer, DateTime, Boolean, Text, 
    JSON, Float, Index, ForeignKey, UniqueConstraint,
    BigInteger, SmallInteger
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.sql import func

Base = declarative_base()

class BaseModel(Base):
    """النموذج الأساسي لجميع الجداول"""
    __abstract__ = True
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل النموذج إلى قاموس"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def to_json(self) -> str:
        """تحويل النموذج إلى JSON"""
        data = self.to_dict()
        # تحويل التواريخ إلى strings
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, UUID):
                data[key] = str(value)
        return json.dumps(data, ensure_ascii=False, default=str)

class UserSession(BaseModel):
    """جدول جلسات المستخدمين"""
    __tablename__ = "user_sessions"
    
    # معرف المستخدم
    user_id = Column(String(100), nullable=False, index=True)
    
    # معرف الجلسة الفريد
    session_id = Column(String(100), nullable=False, unique=True, index=True)
    
    # معلومات الجلسة
    start_time = Column(DateTime(timezone=True), nullable=False, default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), nullable=False, default=func.now())
    
    # معلومات الجهاز والمتصفح
    user_agent = Column(Text, nullable=True)
    device_type = Column(String(50), nullable=True)  # mobile, tablet, desktop
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    
    # معلومات الشاشة والعرض
    screen_width = Column(Integer, nullable=True)
    screen_height = Column(Integer, nullable=True)
    viewport_width = Column(Integer, nullable=True)
    viewport_height = Column(Integer, nullable=True)
    
    # معلومات الموقع والسياق
    ip_address = Column(String(45), nullable=True)  # دعم IPv6
    country = Column(String(2), nullable=True)  # ISO country code
    city = Column(String(100), nullable=True)
    timezone = Column(String(50), nullable=True)
    language = Column(String(10), nullable=True)
    
    # معلومات المرجع
    referrer_url = Column(Text, nullable=True)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    utm_term = Column(String(100), nullable=True)
    utm_content = Column(String(100), nullable=True)
    
    # معلومات إضافية
    is_active = Column(Boolean, default=True, nullable=False)
    session_duration = Column(Integer, nullable=True)  # بالثواني
    page_views = Column(Integer, default=0, nullable=False)
    
    # بيانات إضافية مرنة
    metadata = Column(JSONB, nullable=True)
    
    # العلاقات
    interactions = relationship("UserInteraction", back_populates="session")
    reading_sessions = relationship("ReadingSession", back_populates="user_session")
    
    # فهارس
    __table_args__ = (
        Index('idx_user_sessions_user_id', 'user_id'),
        Index('idx_user_sessions_start_time', 'start_time'),
        Index('idx_user_sessions_active', 'is_active'),
    )

class UserInteraction(BaseModel):
    """جدول تفاعلات المستخدمين"""
    __tablename__ = "user_interactions"
    
    # معرفات أساسية
    user_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), ForeignKey('user_sessions.session_id'), nullable=False)
    content_id = Column(String(100), nullable=False, index=True)
    content_type = Column(String(50), nullable=False)  # article, video, etc.
    
    # نوع التفاعل
    interaction_type = Column(String(50), nullable=False, index=True)  # like, save, share, etc.
    interaction_value = Column(Float, nullable=True)  # قيمة إضافية (تقييم، وقت، etc.)
    
    # معلومات السياق
    page_url = Column(Text, nullable=False)
    element_id = Column(String(100), nullable=True)  # معرف العنصر المتفاعل معه
    element_type = Column(String(50), nullable=True)  # button, link, etc.
    
    # معلومات الموقع في الصفحة
    scroll_position = Column(Float, nullable=True)  # نسبة مئوية
    viewport_position = Column(JSONB, nullable=True)  # إحداثيات العنصر
    
    # معلومات زمنية
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())
    time_on_page = Column(Integer, nullable=True)  # بالثواني
    
    # معلومات إضافية
    is_duplicate = Column(Boolean, default=False, nullable=False)
    confidence_score = Column(Float, nullable=True)  # مستوى الثقة في صحة التفاعل
    
    # بيانات إضافية مرنة
    metadata = Column(JSONB, nullable=True)
    
    # العلاقات
    session = relationship("UserSession", back_populates="interactions")
    
    # فهارس
    __table_args__ = (
        Index('idx_interactions_user_content', 'user_id', 'content_id'),
        Index('idx_interactions_type_timestamp', 'interaction_type', 'timestamp'),
        Index('idx_interactions_session', 'session_id'),
        Index('idx_interactions_timestamp', 'timestamp'),
    )

class ReadingSession(BaseModel):
    """جدول جلسات القراءة المفصلة"""
    __tablename__ = "reading_sessions"
    
    # معرفات أساسية
    user_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), ForeignKey('user_sessions.session_id'), nullable=False)
    content_id = Column(String(100), nullable=False, index=True)
    
    # معرف جلسة القراءة الفريد
    reading_session_id = Column(String(100), nullable=False, unique=True, index=True)
    
    # أوقات القراءة
    start_time = Column(DateTime(timezone=True), nullable=False, default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    total_reading_time = Column(Integer, nullable=True)  # بالثواني
    active_reading_time = Column(Integer, nullable=True)  # وقت القراءة الفعلي
    
    # معلومات التمرير والتقدم
    scroll_depth_max = Column(Float, nullable=True)  # أقصى عمق تمرير (نسبة مئوية)
    scroll_events_count = Column(Integer, default=0, nullable=False)
    content_length = Column(Integer, nullable=True)  # طول المحتوى بالأحرف
    
    # سلوك القراءة
    reading_speed = Column(Float, nullable=True)  # كلمة في الدقيقة
    pause_count = Column(Integer, default=0, nullable=False)
    pause_duration_total = Column(Integer, nullable=True)  # إجمالي وقت التوقف بالثواني
    
    # نقاط اهتمام
    engagement_score = Column(Float, nullable=True)  # نقاط الاهتمام (0-1)
    attention_points = Column(JSONB, nullable=True)  # نقاط التركيز في المحتوى
    
    # حالة القراءة
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_percentage = Column(Float, nullable=True)
    exit_point = Column(Float, nullable=True)  # نقطة الخروج (نسبة مئوية)
    
    # معلومات الجهاز
    device_orientation = Column(String(20), nullable=True)  # portrait, landscape
    page_visibility_changes = Column(Integer, default=0, nullable=False)
    
    # بيانات إضافية مرنة
    metadata = Column(JSONB, nullable=True)
    
    # العلاقات
    user_session = relationship("UserSession", back_populates="reading_sessions")
    scroll_events = relationship("ScrollEvent", back_populates="reading_session")
    
    # فهارس
    __table_args__ = (
        Index('idx_reading_sessions_user_content', 'user_id', 'content_id'),
        Index('idx_reading_sessions_start_time', 'start_time'),
        Index('idx_reading_sessions_completed', 'is_completed'),
        UniqueConstraint('reading_session_id', name='uq_reading_session_id'),
    )

class ScrollEvent(BaseModel):
    """جدول أحداث التمرير المفصلة"""
    __tablename__ = "scroll_events"
    
    # معرفات أساسية
    reading_session_id = Column(String(100), ForeignKey('reading_sessions.reading_session_id'), nullable=False)
    user_id = Column(String(100), nullable=False, index=True)
    content_id = Column(String(100), nullable=False, index=True)
    
    # معلومات التمرير
    scroll_position = Column(Float, nullable=False)  # نسبة مئوية
    scroll_direction = Column(String(10), nullable=False)  # up, down
    scroll_speed = Column(Float, nullable=True)  # بكسل/ثانية
    
    # معلومات زمنية
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())
    time_since_start = Column(Integer, nullable=False)  # منذ بداية جلسة القراءة (ثواني)
    
    # معلومات السياق
    viewport_height = Column(Integer, nullable=True)
    content_height = Column(Integer, nullable=True)
    is_pause_point = Column(Boolean, default=False, nullable=False)
    pause_duration = Column(Integer, nullable=True)  # مدة التوقف بالثواني
    
    # معلومات إضافية
    content_section = Column(String(100), nullable=True)  # قسم المحتوى
    visible_text_length = Column(Integer, nullable=True)  # طول النص المرئي
    
    # بيانات إضافية مرنة
    metadata = Column(JSONB, nullable=True)
    
    # العلاقات
    reading_session = relationship("ReadingSession", back_populates="scroll_events")
    
    # فهارس
    __table_args__ = (
        Index('idx_scroll_events_reading_session', 'reading_session_id'),
        Index('idx_scroll_events_timestamp', 'timestamp'),
        Index('idx_scroll_events_user_content', 'user_id', 'content_id'),
    )

class ContextData(BaseModel):
    """جدول بيانات السياق والبيئة"""
    __tablename__ = "context_data"
    
    # معرفات أساسية
    user_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), ForeignKey('user_sessions.session_id'), nullable=False)
    
    # معلومات زمنية
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())
    local_time = Column(DateTime, nullable=True)  # الوقت المحلي للمستخدم
    day_of_week = Column(SmallInteger, nullable=True)  # 0-6 (الاثنين-الأحد)
    hour_of_day = Column(SmallInteger, nullable=True)  # 0-23
    
    # معلومات الطقس والبيئة
    weather_condition = Column(String(50), nullable=True)
    temperature = Column(Float, nullable=True)
    is_weekend = Column(Boolean, nullable=True)
    is_holiday = Column(Boolean, nullable=True)
    
    # معلومات النشاط
    activity_type = Column(String(50), nullable=False)  # reading, browsing, searching
    content_category = Column(String(100), nullable=True)
    current_mood = Column(String(50), nullable=True)  # مستنتج من السلوك
    
    # معلومات الشبكة والأداء
    connection_type = Column(String(20), nullable=True)  # wifi, mobile, etc.
    connection_speed = Column(String(20), nullable=True)  # fast, slow, etc.
    page_load_time = Column(Integer, nullable=True)  # بالميلي ثانية
    
    # معلومات التفاعل الاجتماعي
    social_context = Column(String(100), nullable=True)  # shared_by_friend, trending, etc.
    notification_source = Column(String(100), nullable=True)  # push, email, etc.
    
    # بيانات إضافية مرنة
    metadata = Column(JSONB, nullable=True)
    environmental_data = Column(JSONB, nullable=True)  # بيانات بيئية إضافية
    
    # فهارس
    __table_args__ = (
        Index('idx_context_data_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_context_data_activity', 'activity_type'),
        Index('idx_context_data_session', 'session_id'),
    )

class UserBehaviorSummary(BaseModel):
    """جدول ملخص سلوك المستخدم (محدث يومياً)"""
    __tablename__ = "user_behavior_summary"
    
    # معرفات أساسية
    user_id = Column(String(100), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # إحصائيات الجلسات
    total_sessions = Column(Integer, default=0, nullable=False)
    total_session_duration = Column(Integer, default=0, nullable=False)  # بالثواني
    avg_session_duration = Column(Float, nullable=True)
    
    # إحصائيات القراءة
    total_reading_time = Column(Integer, default=0, nullable=False)  # بالثواني
    articles_read = Column(Integer, default=0, nullable=False)
    articles_completed = Column(Integer, default=0, nullable=False)
    avg_reading_speed = Column(Float, nullable=True)  # كلمة/دقيقة
    avg_engagement_score = Column(Float, nullable=True)
    
    # إحصائيات التفاعل
    total_interactions = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    saves_count = Column(Integer, default=0, nullable=False)
    shares_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    
    # أنماط السلوك
    most_active_hour = Column(SmallInteger, nullable=True)
    preferred_device = Column(String(50), nullable=True)
    avg_scroll_depth = Column(Float, nullable=True)
    
    # التفضيلات المستنتجة
    preferred_content_categories = Column(JSONB, nullable=True)  # قائمة التصنيفات
    reading_patterns = Column(JSONB, nullable=True)  # أنماط القراءة
    engagement_patterns = Column(JSONB, nullable=True)  # أنماط التفاعل
    
    # معلومات إضافية
    metadata = Column(JSONB, nullable=True)
    last_updated = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # فهارس
    __table_args__ = (
        Index('idx_behavior_summary_user_date', 'user_id', 'date'),
        Index('idx_behavior_summary_date', 'date'),
        UniqueConstraint('user_id', 'date', name='uq_user_behavior_summary_date'),
    )

class EventProcessingLog(BaseModel):
    """جدول سجل معالجة الأحداث"""
    __tablename__ = "event_processing_log"
    
    # معلومات الحدث
    event_id = Column(String(100), nullable=False, unique=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    event_source = Column(String(100), nullable=False)  # kafka, api, etc.
    
    # معلومات المعالجة
    processing_status = Column(String(20), nullable=False, index=True)  # pending, processed, failed
    processing_start = Column(DateTime(timezone=True), nullable=True)
    processing_end = Column(DateTime(timezone=True), nullable=True)
    processing_duration = Column(Integer, nullable=True)  # بالميلي ثانية
    
    # معلومات الخطأ
    error_message = Column(Text, nullable=True)
    error_details = Column(JSONB, nullable=True)
    retry_count = Column(SmallInteger, default=0, nullable=False)
    
    # بيانات الحدث
    event_data = Column(JSONB, nullable=True)
    processed_data = Column(JSONB, nullable=True)
    
    # معلومات إضافية
    processor_id = Column(String(100), nullable=True)
    batch_id = Column(String(100), nullable=True, index=True)
    
    # فهارس
    __table_args__ = (
        Index('idx_event_log_status_timestamp', 'processing_status', 'created_at'),
        Index('idx_event_log_type', 'event_type'),
        Index('idx_event_log_batch', 'batch_id'),
    )
