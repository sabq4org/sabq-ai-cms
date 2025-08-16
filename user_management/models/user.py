# نماذج المستخدمين مع التشفير المتقدم - نظام سبق الذكية
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import hashlib
import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import json
from enum import Enum

Base = declarative_base()

# إعدادات التشفير المتقدمة
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRole(str, Enum):
    """أدوار المستخدمين في النظام"""
    ADMIN = "admin"
    EDITOR = "editor" 
    AUTHOR = "author"
    READER = "reader"
    MODERATOR = "moderator"

class UserStatus(str, Enum):
    """حالات المستخدم"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    DELETED = "deleted"

class User(Base):
    """
    نموذج المستخدم الأساسي مع التشفير المتقدم
    يطبق معايير الأمان المحددة في المستندات
    """
    __tablename__ = "users"
    
    # المعلومات الأساسية
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    
    # كلمة المرور المشفرة
    hashed_password = Column(String(255), nullable=False)
    
    # معلومات التشفير والأمان
    salt = Column(String(255), nullable=False)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    # معلومات الملف الشخصي (مشفرة)
    encrypted_personal_data = Column(Text, nullable=True)  # البيانات الحساسة مشفرة
    
    # معلومات النظام
    role = Column(String(50), default=UserRole.READER.value, nullable=False)
    status = Column(String(50), default=UserStatus.PENDING_VERIFICATION.value, nullable=False)
    
    # تفضيلات المستخدم (JSON)
    preferences = Column(JSON, default=dict)
    
    # بيانات تتبع السلوك (مجهولة الهوية)
    behavior_profile = Column(JSON, default=dict)
    
    # معلومات الجلسة والأمان
    last_login = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # معلومات التحقق
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255), nullable=True)
    phone_verified = Column(Boolean, default=False)
    
    # إعدادات الخصوصية
    privacy_settings = Column(JSON, default=dict)
    
    # التوقيتات
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # فهارس للأداء والأمان
    __table_args__ = (
        Index('idx_user_email_status', 'email', 'status'),
        Index('idx_user_created_at', 'created_at'),
        Index('idx_user_last_login', 'last_login'),
    )
    
    def __init__(self, **kwargs):
        """تهيئة المستخدم مع إعدادات الأمان الافتراضية"""
        super().__init__(**kwargs)
        if not self.salt:
            self.salt = self.generate_salt()
        if not self.preferences:
            self.preferences = self.get_default_preferences()
        if not self.privacy_settings:
            self.privacy_settings = self.get_default_privacy_settings()
    
    @staticmethod
    def generate_salt(length: int = 32) -> str:
        """توليد salt عشوائي آمن"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_password(password: str, salt: str = None) -> tuple[str, str]:
        """تشفير كلمة المرور باستخدام bcrypt مع salt"""
        if not salt:
            salt = User.generate_salt()
        
        # تجميع كلمة المرور مع salt
        password_with_salt = f"{password}{salt}"
        
        # تشفير باستخدام bcrypt مع rounds عالي للأمان
        hashed = bcrypt.hashpw(
            password_with_salt.encode('utf-8'), 
            bcrypt.gensalt(rounds=12)
        )
        
        return hashed.decode('utf-8'), salt
    
    def set_password(self, password: str) -> None:
        """تعيين كلمة مرور جديدة مع التشفير"""
        if len(password) < 8:
            raise ValueError("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        
        self.hashed_password, self.salt = self.hash_password(password, self.salt)
        self.password_reset_token = None
        self.password_reset_expires = None
    
    def verify_password(self, password: str) -> bool:
        """التحقق من صحة كلمة المرور"""
        try:
            password_with_salt = f"{password}{self.salt}"
            return bcrypt.checkpw(
                password_with_salt.encode('utf-8'),
                self.hashed_password.encode('utf-8')
            )
        except Exception:
            return False
    
    def encrypt_personal_data(self, data: Dict[str, Any], encryption_key: bytes) -> None:
        """تشفير البيانات الشخصية الحساسة"""
        cipher_suite = Fernet(encryption_key)
        json_data = json.dumps(data, ensure_ascii=False)
        encrypted_data = cipher_suite.encrypt(json_data.encode('utf-8'))
        self.encrypted_personal_data = encrypted_data.decode('utf-8')
    
    def decrypt_personal_data(self, encryption_key: bytes) -> Dict[str, Any]:
        """فك تشفير البيانات الشخصية"""
        if not self.encrypted_personal_data:
            return {}
        
        try:
            cipher_suite = Fernet(encryption_key)
            decrypted_data = cipher_suite.decrypt(
                self.encrypted_personal_data.encode('utf-8')
            )
            return json.loads(decrypted_data.decode('utf-8'))
        except Exception:
            return {}
    
    def generate_password_reset_token(self) -> str:
        """توليد رمز إعادة تعيين كلمة المرور"""
        token = secrets.token_urlsafe(32)
        self.password_reset_token = hashlib.sha256(token.encode()).hexdigest()
        self.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        return token
    
    def verify_password_reset_token(self, token: str) -> bool:
        """التحقق من صحة رمز إعادة تعيين كلمة المرور"""
        if not self.password_reset_token or not self.password_reset_expires:
            return False
        
        if datetime.utcnow() > self.password_reset_expires:
            return False
        
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return token_hash == self.password_reset_token
    
    def generate_email_verification_token(self) -> str:
        """توليد رمز التحقق من البريد الإلكتروني"""
        token = secrets.token_urlsafe(32)
        self.email_verification_token = hashlib.sha256(token.encode()).hexdigest()
        return token
    
    def verify_email_token(self, token: str) -> bool:
        """التحقق من رمز البريد الإلكتروني"""
        if not self.email_verification_token:
            return False
        
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        if token_hash == self.email_verification_token:
            self.email_verified = True
            self.email_verification_token = None
            self.status = UserStatus.ACTIVE.value
            return True
        return False
    
    def is_locked(self) -> bool:
        """فحص ما إذا كان الحساب مؤقتاً"""
        if not self.locked_until:
            return False
        return datetime.utcnow() < self.locked_until
    
    def increment_login_attempts(self) -> None:
        """زيادة عدد محاولات تسجيل الدخول الفاشلة"""
        self.login_attempts += 1
        
        # قفل الحساب بعد 5 محاولات فاشلة
        if self.login_attempts >= 5:
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)
    
    def reset_login_attempts(self) -> None:
        """إعادة تعيين محاولات تسجيل الدخول"""
        self.login_attempts = 0
        self.locked_until = None
        self.last_login = datetime.utcnow()
    
    def update_behavior_profile(self, behavior_data: Dict[str, Any]) -> None:
        """تحديث ملف السلوك (مجهول الهوية)"""
        if not self.behavior_profile:
            self.behavior_profile = {}
        
        # دمج البيانات الجديدة مع الموجودة
        self.behavior_profile.update(behavior_data)
    
    def get_default_preferences(self) -> Dict[str, Any]:
        """الحصول على التفضيلات الافتراضية"""
        return {
            "language": "ar",
            "timezone": "Asia/Riyadh",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False,
                "in_app": True
            },
            "content_preferences": {
                "categories": [],
                "authors": [],
                "reading_level": "intermediate"
            },
            "ui_preferences": {
                "theme": "light",
                "font_size": "medium",
                "layout": "grid"
            }
        }
    
    def get_default_privacy_settings(self) -> Dict[str, Any]:
        """الحصول على إعدادات الخصوصية الافتراضية"""
        return {
            "profile_visibility": "private",
            "allow_personalization": True,
            "allow_behavior_tracking": True,
            "allow_location_tracking": False,
            "data_retention_days": 365,
            "third_party_sharing": False,
            "analytics_participation": True
        }
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """تحويل المستخدم إلى قاموس للـ API"""
        base_data = {
            "id": self.id,
            "email": self.email if include_sensitive else None,
            "username": self.username,
            "role": self.role,
            "status": self.status,
            "email_verified": self.email_verified,
            "phone_verified": self.phone_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "preferences": self.preferences
        }
        
        if include_sensitive:
            base_data.update({
                "privacy_settings": self.privacy_settings,
                "login_attempts": self.login_attempts,
                "is_locked": self.is_locked()
            })
        
        return base_data
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"


class UserSession(Base):
    """نموذج جلسات المستخدم لتتبع الجلسات النشطة"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False)
    refresh_token = Column(String(255), unique=True, nullable=False)
    
    # معلومات الجلسة
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    user_agent = Column(Text, nullable=True)
    device_info = Column(JSON, default=dict)
    
    # التوقيتات
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    last_activity = Column(DateTime, nullable=True)
    
    # حالة الجلسة
    is_active = Column(Boolean, default=True)
    revoked_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index('idx_session_user_active', 'user_id', 'is_active'),
        Index('idx_session_expires', 'expires_at'),
    )
    
    def is_expired(self) -> bool:
        """فحص انتهاء صلاحية الجلسة"""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self) -> bool:
        """فحص صحة الجلسة"""
        return self.is_active and not self.is_expired() and not self.revoked_at
    
    def revoke(self) -> None:
        """إلغاء الجلسة"""
        self.is_active = False
        self.revoked_at = datetime.utcnow()
    
    def update_activity(self) -> None:
        """تحديث وقت آخر نشاط"""
        self.last_activity = datetime.utcnow()


class UserLoginLog(Base):
    """سجل محاولات تسجيل الدخول للمراقبة الأمنية"""
    __tablename__ = "user_login_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # قد يكون null للمحاولات الفاشلة
    email = Column(String(255), nullable=True, index=True)
    
    # معلومات المحاولة
    success = Column(Boolean, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # سبب الفشل (إن وجد)
    failure_reason = Column(String(255), nullable=True)
    
    # التوقيت
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_login_log_ip', 'ip_address', 'attempted_at'),
        Index('idx_login_log_user', 'user_id', 'attempted_at'),
    )
