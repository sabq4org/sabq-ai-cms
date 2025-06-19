import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, hashPassword, logActivity } from '@/app/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    const { id: userId } = await params;
    const body = await request.json();
    const { name, status, role, isVerified, newPassword } = body;

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const data = JSON.parse(usersData);
    const users = data.users || [];

    // العثور على المستخدم
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // تحديث البيانات
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      status: status || users[userIndex].status,
      role: role || users[userIndex].role,
      isVerified: isVerified !== undefined ? isVerified : users[userIndex].isVerified,
      updated_at: new Date().toISOString()
    };

    // تحديث كلمة المرور إذا تم توفيرها
    if (newPassword && newPassword.trim() !== '') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      users[userIndex].password = hashedPassword;
    }

    // حفظ التحديثات
    await fs.writeFile(usersPath, JSON.stringify({ users }, null, 2));

    // إرسال إشعار للمستخدم (يمكن إضافة هذا لاحقاً)
    // await sendNotificationEmail(users[userIndex].email, 'تم تحديث بيانات حسابك');

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        status: users[userIndex].status,
        role: users[userIndex].role,
        isVerified: users[userIndex].isVerified
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث بيانات المستخدم' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - حذف مستخدم
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const data = JSON.parse(usersData);
    let users = data.users || [];

    // العثور على المستخدم
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // حفظ نسخة من البيانات قبل الحذف (للأرشفة)
    const deletedUser = users[userIndex];
    
    // حذف المستخدم من القائمة
    users = users.filter((u: any) => u.id !== userId);

    // حفظ التحديثات
    await fs.writeFile(usersPath, JSON.stringify({ users }, null, 2));

    // حذف البيانات المرتبطة (يمكن تحسين هذا لاحقاً)
    // - حذف التفضيلات
    // - حذف نقاط الولاء
    // - حذف التفاعلات
    // - أرشفة البيانات إذا لزم الأمر

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم نهائياً',
      deletedUser: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المستخدم' },
      { status: 500 }
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