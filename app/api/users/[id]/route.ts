import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, hashPassword, logActivity } from '@/app/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - الحصول على بيانات مستخدم محدد
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.view');
    const { id } = await params;
    
    // استعلام المستخدم من قاعدة البيانات
    // هنا نرجع بيانات تجريبية
    const userData = {
      id,
      email: 'user@sabq.org',
      name: 'اسم المستخدم',
      role: { id: 4, name: 'محرر' },
      status: 'active',
      phone: '+966501234567',
      bio: 'نبذة عن المستخدم',
      sections: [
        { id: 1, name: 'أخبار محلية', can_publish: false },
        { id: 3, name: 'اقتصاد', can_publish: false }
      ],
      permissions: {
        granted: ['articles.create', 'articles.edit.own'],
        revoked: []
      },
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}

// PUT /api/users/[id] - تحديث بيانات مستخدم
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.edit');
    const { id } = await params;
    const body = await request.json();
    
    const updateData: any = {};
    
    // تحديث البيانات الأساسية
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.phone) updateData.phone = body.phone;
    if (body.bio) updateData.bio = body.bio;
    if (body.role_id) updateData.role_id = body.role_id;
    if (body.status) updateData.status = body.status;
    
    // تحديث كلمة المرور إذا تم إرسالها
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }
      updateData.password_hash = await hashPassword(body.password);
    }
    
    // تحديث الأقسام
    if (body.sections) {
      updateData.sections = body.sections;
    }
    
    // تحديث الصلاحيات الإضافية
    if (body.permissions) {
      updateData.permissions = body.permissions;
    }
    
    // تحديث المستخدم في قاعدة البيانات
    // هنا نرجع بيانات تجريبية
    const updatedUser = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'UPDATE_USER',
      'user',
      id,
      updateData.name || 'User'
    );
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'تم تحديث بيانات المستخدم بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}

// DELETE /api/users/[id] - حذف مستخدم
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.delete');
    const { id } = await params;
    
    // التحقق من عدم حذف المستخدم نفسه
    if (user.id === id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 400 }
      );
    }
    
    // حذف المستخدم من قاعدة البيانات
    // هنا نرجع رسالة نجاح
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'DELETE_USER',
      'user',
      id,
      'Deleted User'
    );
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}

// PATCH /api/users/[id]/suspend - تعليق/تفعيل مستخدم
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.suspend');
    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;
    
    if (!['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // تحديث حالة المستخدم في قاعدة البيانات
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'user',
      id,
      'User',
      { reason }
    );
    
    return NextResponse.json({
      success: true,
      message: status === 'suspended' ? 'تم تعليق المستخدم' : 'تم تفعيل المستخدم'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
} 