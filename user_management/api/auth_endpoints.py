# نقاط نهاية API للمصادقة - نظام سبق الذكية
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from ..schemas.user_schemas import (
    LoginRequest, LoginResponse, UserCreate, UserResponse,
    RefreshTokenRequest, TokenResponse, PasswordChange,
    PasswordReset, PasswordResetConfirm, EmailVerificationRequest,
    EmailVerificationConfirm, ErrorResponse, ValidationErrorResponse
)
from ..services.auth_service import auth_service
from ..config.database import get_db
from ..models.user import User, UserRole, UserStatus

# إعداد الموجه والأمان
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
logger = logging.getLogger(__name__)

# دالة للحصول على المستخدم الحالي
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """الحصول على المستخدم الحالي من الرمز"""
    token = credentials.credentials
    user = auth_service.verify_access_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز الوصول غير صحيح أو منتهي الصلاحية",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# دالة للحصول على المستخدم الاختياري
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """الحصول على المستخدم الحالي (اختياري)"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

# دالة للتحقق من دور المستخدم
def require_role(required_role: UserRole):
    """التحقق من دور المستخدم المطلوب"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role.value and current_user.role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية للوصول لهذا المورد"
            )
        return current_user
    return role_checker

# دالة للحصول على معلومات الطلب
def get_client_info(request: Request) -> tuple[str, str]:
    """الحصول على IP والـ User Agent"""
    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    # التحقق من وجود proxy
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    
    return ip_address, user_agent

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="تسجيل مستخدم جديد",
    description="إنشاء حساب مستخدم جديد مع التحقق من البيانات والأمان",
    responses={
        201: {"description": "تم إنشاء المستخدم بنجاح"},
        400: {"model": ValidationErrorResponse, "description": "خطأ في البيانات المدخلة"},
        409: {"model": ErrorResponse, "description": "المستخدم موجود بالفعل"}
    }
)
async def register(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    تسجيل مستخدم جديد
    
    - **email**: البريد الإلكتروني (مطلوب ومميز)
    - **username**: اسم المستخدم (مطلوب ومميز)
    - **password**: كلمة المرور (8 أحرف على الأقل مع متطلبات قوة)
    - **confirm_password**: تأكيد كلمة المرور
    - **role**: دور المستخدم (افتراضي: reader)
    - **first_name**: الاسم الأول (اختياري)
    - **last_name**: الاسم الأخير (اختياري)
    - **phone**: رقم الهاتف (اختياري)
    """
    try:
        result = auth_service.register_user(user_data)
        
        if not result.success:
            if "موجود" in result.error_message:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=result.error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=result.error_message
                )
        
        logger.info(f"New user registered: {result.user.email}")
        
        return UserResponse.from_orm(result.user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="تسجيل الدخول",
    description="مصادقة المستخدم وإنشاء جلسة جديدة",
    responses={
        200: {"description": "تم تسجيل الدخول بنجاح"},
        401: {"model": ErrorResponse, "description": "بيانات المستخدم غير صحيحة"},
        423: {"model": ErrorResponse, "description": "الحساب مقفل مؤقتاً"}
    }
)
async def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    تسجيل الدخول
    
    - **email**: البريد الإلكتروني
    - **password**: كلمة المرور
    - **remember_me**: تذكرني (لفترة صلاحية أطول)
    """
    try:
        ip_address, user_agent = get_client_info(request)
        
        result = auth_service.authenticate_user(
            login_data, ip_address, user_agent
        )
        
        if not result.success:
            if "مقفل" in result.error_message:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=result.error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=result.error_message
                )
        
        # تعيين cookies آمنة للرموز
        response.set_cookie(
            key="access_token",
            value=result.access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=15 * 60  # 15 دقيقة
        )
        
        response.set_cookie(
            key="refresh_token", 
            value=result.refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=30 * 24 * 60 * 60  # 30 يوم
        )
        
        logger.info(f"User logged in: {result.user.email}")
        
        return LoginResponse(
            access_token=result.access_token,
            refresh_token=result.refresh_token,
            expires_in=15 * 60,
            user=UserResponse.from_orm(result.user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="تجديد الرمز",
    description="تجديد access token باستخدام refresh token",
    responses={
        200: {"description": "تم تجديد الرمز بنجاح"},
        401: {"model": ErrorResponse, "description": "refresh token غير صحيح"}
    }
)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    تجديد access token
    
    - **refresh_token**: رمز التجديد
    """
    try:
        result = auth_service.refresh_token(refresh_data.refresh_token)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="رمز التجديد غير صحيح أو منتهي الصلاحية"
            )
        
        new_access_token, new_refresh_token = result
        
        # تحديث cookies
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=15 * 60
        )
        
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=30 * 24 * 60 * 60
        )
        
        return TokenResponse(
            access_token=new_access_token,
            expires_in=15 * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/logout",
    summary="تسجيل الخروج",
    description="إنهاء الجلسة الحالية",
    responses={
        200: {"description": "تم تسجيل الخروج بنجاح"},
        401: {"model": ErrorResponse, "description": "غير مصرح"}
    }
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """تسجيل الخروج وإلغاء الجلسة"""
    try:
        access_token = credentials.credentials
        success = auth_service.logout_user(access_token)
        
        # حذف cookies
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")
        
        if success:
            logger.info(f"User logged out: {current_user.email}")
            return {"message": "تم تسجيل الخروج بنجاح"}
        else:
            return {"message": "تم تسجيل الخروج (جلسة غير نشطة)"}
            
    except Exception as e:
        logger.error(f"Logout endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.get(
    "/me",
    response_model=UserResponse,
    summary="معلومات المستخدم الحالي",
    description="الحصول على معلومات المستخدم الحالي",
    responses={
        200: {"description": "معلومات المستخدم"},
        401: {"model": ErrorResponse, "description": "غير مصرح"}
    }
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """الحصول على معلومات المستخدم الحالي"""
    return UserResponse.from_orm(current_user)

@router.post(
    "/change-password",
    summary="تغيير كلمة المرور",
    description="تغيير كلمة مرور المستخدم الحالي",
    responses={
        200: {"description": "تم تغيير كلمة المرور بنجاح"},
        400: {"model": ErrorResponse, "description": "كلمة المرور الحالية غير صحيحة"},
        401: {"model": ErrorResponse, "description": "غير مصرح"}
    }
)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """
    تغيير كلمة المرور
    
    - **current_password**: كلمة المرور الحالية
    - **new_password**: كلمة المرور الجديدة
    - **confirm_new_password**: تأكيد كلمة المرور الجديدة
    """
    try:
        success = auth_service.change_password(
            current_user,
            password_data.current_password,
            password_data.new_password
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="كلمة المرور الحالية غير صحيحة"
            )
        
        logger.info(f"Password changed for user: {current_user.email}")
        
        return {"message": "تم تغيير كلمة المرور بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/forgot-password",
    summary="نسيت كلمة المرور",
    description="طلب إعادة تعيين كلمة المرور",
    responses={
        200: {"description": "تم إرسال رابط إعادة التعيين"},
        404: {"model": ErrorResponse, "description": "البريد الإلكتروني غير موجود"}
    }
)
async def forgot_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """
    طلب إعادة تعيين كلمة المرور
    
    - **email**: البريد الإلكتروني
    """
    try:
        user = db.query(User).filter(User.email == reset_data.email).first()
        
        if not user:
            # لأغراض الأمان، نرسل نفس الرسالة حتى لو لم يكن البريد موجود
            return {"message": "إذا كان البريد الإلكتروني موجود، ستستلم رابط إعادة التعيين"}
        
        reset_token = user.generate_password_reset_token()
        db.commit()
        
        # هنا يمكن إرسال البريد الإلكتروني
        # await send_password_reset_email(user.email, reset_token)
        
        logger.info(f"Password reset requested for: {user.email}")
        
        return {"message": "إذا كان البريد الإلكتروني موجود، ستستلم رابط إعادة التعيين"}
        
    except Exception as e:
        logger.error(f"Forgot password endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/reset-password",
    summary="إعادة تعيين كلمة المرور",
    description="إعادة تعيين كلمة المرور باستخدام الرمز",
    responses={
        200: {"description": "تم إعادة تعيين كلمة المرور بنجاح"},
        400: {"model": ErrorResponse, "description": "الرمز غير صحيح أو منتهي الصلاحية"}
    }
)
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    إعادة تعيين كلمة المرور
    
    - **token**: رمز إعادة التعيين
    - **new_password**: كلمة المرور الجديدة
    - **confirm_new_password**: تأكيد كلمة المرور الجديدة
    """
    try:
        user = db.query(User).filter(
            User.password_reset_token.isnot(None),
            User.password_reset_expires > datetime.utcnow()
        ).all()
        
        target_user = None
        for u in user:
            if u.verify_password_reset_token(reset_data.token):
                target_user = u
                break
        
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="رمز إعادة التعيين غير صحيح أو منتهي الصلاحية"
            )
        
        target_user.set_password(reset_data.new_password)
        db.commit()
        
        logger.info(f"Password reset completed for: {target_user.email}")
        
        return {"message": "تم إعادة تعيين كلمة المرور بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/verify-email",
    summary="التحقق من البريد الإلكتروني",
    description="التحقق من البريد الإلكتروني باستخدام الرمز",
    responses={
        200: {"description": "تم التحقق من البريد الإلكتروني بنجاح"},
        400: {"model": ErrorResponse, "description": "رمز التحقق غير صحيح"}
    }
)
async def verify_email(
    verification_data: EmailVerificationConfirm,
    db: Session = Depends(get_db)
):
    """
    التحقق من البريد الإلكتروني
    
    - **token**: رمز التحقق
    """
    try:
        success = auth_service.verify_email(verification_data.token)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="رمز التحقق غير صحيح"
            )
        
        return {"message": "تم التحقق من البريد الإلكتروني بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )

@router.post(
    "/resend-verification",
    summary="إعادة إرسال رمز التحقق",
    description="إعادة إرسال رمز التحقق من البريد الإلكتروني",
    responses={
        200: {"description": "تم إرسال رمز التحقق"},
        404: {"model": ErrorResponse, "description": "البريد الإلكتروني غير موجود"}
    }
)
async def resend_verification(
    verification_data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    إعادة إرسال رمز التحقق
    
    - **email**: البريد الإلكتروني
    """
    try:
        user = db.query(User).filter(
            User.email == verification_data.email,
            User.email_verified == False
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="البريد الإلكتروني غير موجود أو تم التحقق منه بالفعل"
            )
        
        verification_token = user.generate_email_verification_token()
        db.commit()
        
        # هنا يمكن إرسال البريد الإلكتروني
        # await send_verification_email(user.email, verification_token)
        
        return {"message": "تم إرسال رمز التحقق"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend verification endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )
