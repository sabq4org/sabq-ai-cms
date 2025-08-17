# خدمة المصادقة المتقدمة - نظام سبق الذكية
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import jwt
import secrets
import hashlib
from cryptography.fernet import Fernet
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import logging
import redis
import json
from dataclasses import dataclass

from ..models.user import User, UserSession, UserLoginLog, UserRole, UserStatus
from ..schemas.user_schemas import LoginRequest, UserCreate
from ..config.database import get_db_session

# إعدادات التشفير والأمان
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# إعدادات JWT
JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

# إعدادات Redis للجلسات
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

# إعداد logging
logger = logging.getLogger(__name__)

@dataclass
class AuthResult:
    """نتيجة عملية المصادقة"""
    success: bool
    user: Optional[User] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    error_message: Optional[str] = None
    requires_2fa: bool = False

class SecurityManager:
    """مدير الأمان المتقدم"""
    
    def __init__(self):
        self.encryption_key = self._load_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
        self.redis_client = self._get_redis_client()
    
    def _load_encryption_key(self) -> bytes:
        """تحميل مفتاح التشفير"""
        # في الإنتاج، يجب تحميل المفتاح من متغيرات البيئة أو خدمة إدارة المفاتيح
        return Fernet.generate_key()
    
    def _get_redis_client(self):
        """الحصول على عميل Redis"""
        try:
            return redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            return None
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """تشفير البيانات الحساسة"""
        encrypted_data = self.cipher_suite.encrypt(data.encode('utf-8'))
        return encrypted_data.decode('utf-8')
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات الحساسة"""
        decrypted_data = self.cipher_suite.decrypt(encrypted_data.encode('utf-8'))
        return decrypted_data.decode('utf-8')
    
    def generate_secure_token(self, length: int = 32) -> str:
        """توليد رمز آمن عشوائي"""
        return secrets.token_urlsafe(length)
    
    def hash_token(self, token: str) -> str:
        """تشفير الرمز بـ SHA-256"""
        return hashlib.sha256(token.encode()).hexdigest()

class JWTManager:
    """مدير JWT tokens المتقدم"""
    
    def __init__(self, security_manager: SecurityManager):
        self.security_manager = security_manager
    
    def create_access_token(self, user: User, expires_delta: Optional[timedelta] = None) -> str:
        """إنشاء access token"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
            "jti": self.security_manager.generate_secure_token(16)
        }
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    def create_refresh_token(self, user: User) -> str:
        """إنشاء refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode = {
            "sub": str(user.id),
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": self.security_manager.generate_secure_token(16)
        }
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """التحقق من صحة الرمز"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            if payload.get("type") != token_type:
                return None
            
            # التحقق من انتهاء الصلاحية
            if datetime.utcnow() > datetime.fromtimestamp(payload.get("exp", 0)):
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Tuple[str, str]]:
        """تجديد access token باستخدام refresh token"""
        payload = self.verify_token(refresh_token, "refresh")
        if not payload:
            return None
        
        user_id = int(payload.get("sub"))
        
        with get_db_session() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user or user.status != UserStatus.ACTIVE.value:
                return None
            
            # إنشاء tokens جديدة
            new_access_token = self.create_access_token(user)
            new_refresh_token = self.create_refresh_token(user)
            
            return new_access_token, new_refresh_token

class SessionManager:
    """مدير الجلسات المتقدم"""
    
    def __init__(self, security_manager: SecurityManager):
        self.security_manager = security_manager
    
    def create_session(self, db: Session, user: User, access_token: str, 
                      refresh_token: str, ip_address: str = None, 
                      user_agent: str = None) -> UserSession:
        """إنشاء جلسة جديدة"""
        
        # تشفير الرموز قبل الحفظ
        encrypted_access = self.security_manager.hash_token(access_token)
        encrypted_refresh = self.security_manager.hash_token(refresh_token)
        
        session = UserSession(
            user_id=user.id,
            session_token=encrypted_access,
            refresh_token=encrypted_refresh,
            ip_address=ip_address,
            user_agent=user_agent,
            device_info={},
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            last_activity=datetime.utcnow()
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # حفظ في Redis للوصول السريع
        if self.security_manager.redis_client:
            session_data = {
                "user_id": user.id,
                "created_at": session.created_at.isoformat(),
                "ip_address": ip_address,
                "user_agent": user_agent
            }
            self.security_manager.redis_client.setex(
                f"session:{encrypted_access}",
                ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                json.dumps(session_data)
            )
        
        return session
    
    def validate_session(self, db: Session, access_token: str) -> Optional[UserSession]:
        """التحقق من صحة الجلسة"""
        token_hash = self.security_manager.hash_token(access_token)
        
        # البحث في Redis أولاً
        if self.security_manager.redis_client:
            cached_session = self.security_manager.redis_client.get(f"session:{token_hash}")
            if cached_session:
                session_data = json.loads(cached_session)
                # تحديث وقت آخر نشاط
                self.security_manager.redis_client.expire(
                    f"session:{token_hash}",
                    ACCESS_TOKEN_EXPIRE_MINUTES * 60
                )
        
        # البحث في قاعدة البيانات
        session = db.query(UserSession).filter(
            UserSession.session_token == token_hash,
            UserSession.is_active == True
        ).first()
        
        if session and session.is_valid():
            session.update_activity()
            db.commit()
            return session
        
        return None
    
    def revoke_session(self, db: Session, access_token: str) -> bool:
        """إلغاء الجلسة"""
        token_hash = self.security_manager.hash_token(access_token)
        
        session = db.query(UserSession).filter(
            UserSession.session_token == token_hash
        ).first()
        
        if session:
            session.revoke()
            db.commit()
            
            # حذف من Redis
            if self.security_manager.redis_client:
                self.security_manager.redis_client.delete(f"session:{token_hash}")
            
            return True
        
        return False
    
    def revoke_all_user_sessions(self, db: Session, user_id: int) -> int:
        """إلغاء جميع جلسات المستخدم"""
        sessions = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).all()
        
        revoked_count = 0
        for session in sessions:
            session.revoke()
            
            # حذف من Redis
            if self.security_manager.redis_client:
                self.security_manager.redis_client.delete(f"session:{session.session_token}")
            
            revoked_count += 1
        
        db.commit()
        return revoked_count

class AuthenticationService:
    """خدمة المصادقة الرئيسية"""
    
    def __init__(self):
        self.security_manager = SecurityManager()
        self.jwt_manager = JWTManager(self.security_manager)
        self.session_manager = SessionManager(self.security_manager)
    
    def register_user(self, user_data: UserCreate) -> AuthResult:
        """تسجيل مستخدم جديد"""
        try:
            with get_db_session() as db:
                # التحقق من عدم وجود المستخدم
                existing_user = db.query(User).filter(
                    (User.email == user_data.email) | 
                    (User.username == user_data.username)
                ).first()
                
                if existing_user:
                    return AuthResult(
                        success=False,
                        error_message="المستخدم موجود بالفعل"
                    )
                
                # إنشاء المستخدم الجديد
                user = User(
                    email=user_data.email,
                    username=user_data.username,
                    role=user_data.role.value if user_data.role else UserRole.READER.value,
                    status=UserStatus.PENDING_VERIFICATION.value
                )
                
                # تعيين كلمة المرور
                user.set_password(user_data.password)
                
                # تشفير البيانات الشخصية إذا وجدت
                if user_data.first_name or user_data.last_name or user_data.phone:
                    personal_data = {
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "phone": user_data.phone
                    }
                    user.encrypt_personal_data(personal_data, self.security_manager.encryption_key)
                
                # تعيين التفضيلات
                if user_data.preferences:
                    user.preferences = user_data.preferences
                
                if user_data.privacy_settings:
                    user.privacy_settings = user_data.privacy_settings
                
                # توليد رمز التحقق من البريد
                verification_token = user.generate_email_verification_token()
                
                db.add(user)
                db.commit()
                db.refresh(user)
                
                # هنا يمكن إرسال بريد التحقق
                # await send_verification_email(user.email, verification_token)
                
                logger.info(f"User registered successfully: {user.email}")
                
                return AuthResult(
                    success=True,
                    user=user
                )
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return AuthResult(
                success=False,
                error_message="خطأ في التسجيل"
            )
    
    def authenticate_user(self, login_data: LoginRequest, 
                         ip_address: str = None, 
                         user_agent: str = None) -> AuthResult:
        """مصادقة المستخدم"""
        try:
            with get_db_session() as db:
                # البحث عن المستخدم
                user = db.query(User).filter(User.email == login_data.email).first()
                
                # تسجيل محاولة الدخول
                login_log = UserLoginLog(
                    user_id=user.id if user else None,
                    email=login_data.email,
                    success=False,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                if not user:
                    login_log.failure_reason = "المستخدم غير موجود"
                    db.add(login_log)
                    db.commit()
                    
                    return AuthResult(
                        success=False,
                        error_message="بيانات المستخدم غير صحيحة"
                    )
                
                # فحص حالة الحساب
                if user.status == UserStatus.SUSPENDED.value:
                    login_log.failure_reason = "الحساب موقوف"
                    db.add(login_log)
                    db.commit()
                    
                    return AuthResult(
                        success=False,
                        error_message="الحساب موقوف"
                    )
                
                # فحص القفل المؤقت
                if user.is_locked():
                    login_log.failure_reason = "الحساب مقفل مؤقتاً"
                    db.add(login_log)
                    db.commit()
                    
                    return AuthResult(
                        success=False,
                        error_message="الحساب مقفل مؤقتاً بسبب محاولات دخول فاشلة متكررة"
                    )
                
                # التحقق من كلمة المرور
                if not user.verify_password(login_data.password):
                    user.increment_login_attempts()
                    login_log.failure_reason = "كلمة مرور خاطئة"
                    db.add(login_log)
                    db.commit()
                    
                    return AuthResult(
                        success=False,
                        error_message="بيانات المستخدم غير صحيحة"
                    )
                
                # نجح تسجيل الدخول
                user.reset_login_attempts()
                
                # إنشاء الرموز
                access_token = self.jwt_manager.create_access_token(user)
                refresh_token = self.jwt_manager.create_refresh_token(user)
                
                # إنشاء الجلسة
                session = self.session_manager.create_session(
                    db, user, access_token, refresh_token, ip_address, user_agent
                )
                
                # تحديث سجل الدخول
                login_log.success = True
                login_log.failure_reason = None
                db.add(login_log)
                db.commit()
                
                logger.info(f"User authenticated successfully: {user.email}")
                
                return AuthResult(
                    success=True,
                    user=user,
                    access_token=access_token,
                    refresh_token=refresh_token
                )
                
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return AuthResult(
                success=False,
                error_message="خطأ في المصادقة"
            )
    
    def verify_access_token(self, access_token: str) -> Optional[User]:
        """التحقق من صحة access token"""
        payload = self.jwt_manager.verify_token(access_token, "access")
        if not payload:
            return None
        
        user_id = int(payload.get("sub"))
        
        with get_db_session() as db:
            # التحقق من الجلسة
            session = self.session_manager.validate_session(db, access_token)
            if not session:
                return None
            
            # جلب المستخدم
            user = db.query(User).filter(
                User.id == user_id,
                User.status == UserStatus.ACTIVE.value
            ).first()
            
            return user
    
    def logout_user(self, access_token: str) -> bool:
        """تسجيل خروج المستخدم"""
        try:
            with get_db_session() as db:
                return self.session_manager.revoke_session(db, access_token)
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return False
    
    def refresh_token(self, refresh_token: str) -> Optional[Tuple[str, str]]:
        """تجديد access token"""
        try:
            return self.jwt_manager.refresh_access_token(refresh_token)
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            return None
    
    def change_password(self, user: User, current_password: str, new_password: str) -> bool:
        """تغيير كلمة المرور"""
        try:
            if not user.verify_password(current_password):
                return False
            
            with get_db_session() as db:
                user_obj = db.query(User).filter(User.id == user.id).first()
                if user_obj:
                    user_obj.set_password(new_password)
                    
                    # إلغاء جميع الجلسات الأخرى
                    self.session_manager.revoke_all_user_sessions(db, user.id)
                    
                    db.commit()
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Password change error: {e}")
            return False
    
    def verify_email(self, token: str) -> bool:
        """التحقق من البريد الإلكتروني"""
        try:
            with get_db_session() as db:
                user = db.query(User).filter(
                    User.email_verification_token.isnot(None)
                ).all()
                
                for u in user:
                    if u.verify_email_token(token):
                        db.commit()
                        return True
                
                return False
                
        except Exception as e:
            logger.error(f"Email verification error: {e}")
            return False

# إنشاء instance عام للخدمة
auth_service = AuthenticationService()
