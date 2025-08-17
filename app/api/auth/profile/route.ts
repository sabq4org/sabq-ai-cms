// API لإدارة الملف الشخصي - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';
import { authMiddleware } from '@/lib/auth/middleware';

// الحصول على بيانات المستخدم الحالي
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await authMiddleware(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'غير مصرح بالوصول'
        },
        { status: 401 }
      );
    }

    // إرسال بيانات المستخدم
    return NextResponse.json(
      {
        success: true,
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          name: authResult.user.name,
          role: authResult.user.role,
          is_admin: authResult.user.is_admin,
          is_verified: authResult.user.is_verified,
          avatar: authResult.user.avatar,
          phone: authResult.user.phone,
          city: authResult.user.city,
          country: authResult.user.country,
          interests: authResult.user.interests,
          preferred_language: authResult.user.preferred_language,
          profile_completed: authResult.user.profile_completed,
          loyalty_points: authResult.user.loyalty_points,
          notification_preferences: authResult.user.notification_preferences,
          created_at: authResult.user.created_at,
          last_login_at: authResult.user.last_login_at
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Profile GET API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم'
      },
      { status: 500 }
    );
  }
}

// تحديث بيانات المستخدم
export async function PUT(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await authMiddleware(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'غير مصرح بالوصول'
        },
        { status: 401 }
      );
    }

    // قراءة البيانات المحدثة
    const body = await request.json();
    
    // قائمة الحقول المسموح تحديثها
    const allowedFields = [
      'name', 'phone', 'city', 'country', 'interests', 
      'preferred_language', 'notification_preferences', 'avatar'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // تحديث الملف الشخصي
    const result = await UserManagementService.updateUserProfile(
      authResult.user.id,
      updateData
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name,
          role: result.user?.role,
          avatar: result.user?.avatar,
          phone: result.user?.phone,
          city: result.user?.city,
          country: result.user?.country,
          interests: result.user?.interests,
          preferred_language: result.user?.preferred_language,
          profile_completed: result.user?.profile_completed,
          notification_preferences: result.user?.notification_preferences
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Profile PUT API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
