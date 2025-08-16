# Pydantic schemas للمستخدمين - نظام سبق الذكية
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import re

class UserRole(str, Enum):
    """أدوار المستخدمين"""
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

# Base schemas
class UserBase(BaseModel):
    """Schema أساسي للمستخدم"""
    email: EmailStr = Field(..., description="البريد الإلكتروني")
    username: str = Field(..., min_length=3, max_length=100, description="اسم المستخدم")
    
    @validator('username')
    def validate_username(cls, v):
        """التحقق من صحة اسم المستخدم"""
        if not re.match(r'^[a-zA-Z0-9_\u0600-\u06FF]+$', v):
            raise ValueError('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط')
        return v

class UserCreate(UserBase):
    """Schema لإنشاء مستخدم جديد"""
    password: str = Field(..., min_length=8, max_length=128, description="كلمة المرور")
    confirm_password: str = Field(..., description="تأكيد كلمة المرور")
    role: Optional[UserRole] = Field(UserRole.READER, description="دور المستخدم")
    
    # بيانات الملف الشخصي الاختيارية
    first_name: Optional[str] = Field(None, max_length=100, description="الاسم الأول")
    last_name: Optional[str] = Field(None, max_length=100, description="الاسم الأخير")
    phone: Optional[str] = Field(None, max_length=20, description="رقم الهاتف")
    
    # تفضيلات أولية
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="تفضيلات المستخدم")
    privacy_settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="إعدادات الخصوصية")
    
    @validator('password')
    def validate_password(cls, v):
        """التحقق من قوة كلمة المرور"""
        if len(v) < 8:
            raise ValueError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
        
        if not re.search(r'\d', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
        
        return v
    
    @validator('confirm_password')
    def validate_passwords_match(cls, v, values):
        """التحقق من تطابق كلمتي المرور"""
        if 'password' in values and v != values['password']:
            raise ValueError('كلمتا المرور غير متطابقتين')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """التحقق من صحة رقم الهاتف"""
        if v and not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('رقم الهاتف غير صحيح')
        return v

class UserUpdate(BaseModel):
    """Schema لتحديث بيانات المستخدم"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    
    # تحديث التفضيلات
    preferences: Optional[Dict[str, Any]] = None
    privacy_settings: Optional[Dict[str, Any]] = None
    
    @validator('username')
    def validate_username(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9_\u0600-\u06FF]+$', v):
            raise ValueError('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('رقم الهاتف غير صحيح')
        return v

class UserAdminUpdate(UserUpdate):
    """Schema لتحديث المستخدم من قبل المدير"""
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    email_verified: Optional[bool] = None
    phone_verified: Optional[bool] = None

class PasswordChange(BaseModel):
    """Schema لتغيير كلمة المرور"""
    current_password: str = Field(..., description="كلمة المرور الحالية")
    new_password: str = Field(..., min_length=8, max_length=128, description="كلمة المرور الجديدة")
    confirm_new_password: str = Field(..., description="تأكيد كلمة المرور الجديدة")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        """التحقق من قوة كلمة المرور الجديدة"""
        if len(v) < 8:
            raise ValueError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
        
        if not re.search(r'\d', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
        
        return v
    
    @validator('confirm_new_password')
    def validate_passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('كلمتا المرور غير متطابقتين')
        return v

class PasswordReset(BaseModel):
    """Schema لإعادة تعيين كلمة المرور"""
    email: EmailStr = Field(..., description="البريد الإلكتروني")

class PasswordResetConfirm(BaseModel):
    """Schema لتأكيد إعادة تعيين كلمة المرور"""
    token: str = Field(..., description="رمز إعادة التعيين")
    new_password: str = Field(..., min_length=8, max_length=128, description="كلمة المرور الجديدة")
    confirm_new_password: str = Field(..., description="تأكيد كلمة المرور الجديدة")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        return v
    
    @validator('confirm_new_password')
    def validate_passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('كلمتا المرور غير متطابقتين')
        return v

# Response schemas
class UserResponse(BaseModel):
    """Schema لعرض بيانات المستخدم"""
    id: int
    email: EmailStr
    username: str
    role: UserRole
    status: UserStatus
    email_verified: bool
    phone_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    preferences: Dict[str, Any]
    
    class Config:
        from_attributes = True

class UserPublicResponse(BaseModel):
    """Schema لعرض البيانات العامة للمستخدم"""
    id: int
    username: str
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    """Schema مفصل لبيانات المستخدم"""
    privacy_settings: Dict[str, Any]
    login_attempts: int
    is_locked: bool
    
    class Config:
        from_attributes = True

# Authentication schemas
class LoginRequest(BaseModel):
    """Schema لطلب تسجيل الدخول"""
    email: EmailStr = Field(..., description="البريد الإلكتروني")
    password: str = Field(..., description="كلمة المرور")
    remember_me: bool = Field(False, description="تذكرني")

class LoginResponse(BaseModel):
    """Schema لاستجابة تسجيل الدخول"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    """Schema لطلب تجديد الرمز"""
    refresh_token: str = Field(..., description="رمز التجديد")

class TokenResponse(BaseModel):
    """Schema لاستجابة الرمز"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Email verification schemas
class EmailVerificationRequest(BaseModel):
    """Schema لطلب التحقق من البريد الإلكتروني"""
    email: EmailStr = Field(..., description="البريد الإلكتروني")

class EmailVerificationConfirm(BaseModel):
    """Schema لتأكيد التحقق من البريد الإلكتروني"""
    token: str = Field(..., description="رمز التحقق")

# User preferences schemas
class NotificationPreferences(BaseModel):
    """تفضيلات الإشعارات"""
    email: bool = True
    push: bool = True
    sms: bool = False
    in_app: bool = True

class ContentPreferences(BaseModel):
    """تفضيلات المحتوى"""
    categories: List[str] = Field(default_factory=list)
    authors: List[str] = Field(default_factory=list)
    reading_level: str = "intermediate"

class UIPreferences(BaseModel):
    """تفضيلات واجهة المستخدم"""
    theme: str = "light"
    font_size: str = "medium"
    layout: str = "grid"

class UserPreferences(BaseModel):
    """جميع تفضيلات المستخدم"""
    language: str = "ar"
    timezone: str = "Asia/Riyadh"
    notifications: NotificationPreferences = Field(default_factory=NotificationPreferences)
    content_preferences: ContentPreferences = Field(default_factory=ContentPreferences)
    ui_preferences: UIPreferences = Field(default_factory=UIPreferences)

class PrivacySettings(BaseModel):
    """إعدادات الخصوصية"""
    profile_visibility: str = "private"
    allow_personalization: bool = True
    allow_behavior_tracking: bool = True
    allow_location_tracking: bool = False
    data_retention_days: int = 365
    third_party_sharing: bool = False
    analytics_participation: bool = True

# Pagination and filtering
class UserListRequest(BaseModel):
    """Schema لطلب قائمة المستخدمين"""
    page: int = Field(1, ge=1, description="رقم الصفحة")
    size: int = Field(10, ge=1, le=100, description="حجم الصفحة")
    role: Optional[UserRole] = Field(None, description="فلترة حسب الدور")
    status: Optional[UserStatus] = Field(None, description="فلترة حسب الحالة")
    search: Optional[str] = Field(None, max_length=100, description="البحث في الاسم أو البريد")

class UserListResponse(BaseModel):
    """Schema لاستجابة قائمة المستخدمين"""
    users: List[UserResponse]
    total: int
    page: int
    size: int
    pages: int

# Error schemas
class ErrorResponse(BaseModel):
    """Schema للأخطاء"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ValidationErrorResponse(BaseModel):
    """Schema لأخطاء التحقق"""
    error: str = "validation_error"
    message: str
    field_errors: Dict[str, List[str]]
