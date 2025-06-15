import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, logActivity } from '@/app/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/roles/[id] - الحصول على تفاصيل دور محدد
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // استعلام الدور من قاعدة البيانات
    // هنا نرجع بيانات تجريبية
    const role = {
      id: parseInt(id),
      name: 'محرر',
      slug: 'editor',
      description: 'كتابة وتحرير المقالات',
      is_system: true,
      permissions: [
        { id: 3, name: 'عرض جميع المقالات', slug: 'articles.view.all', category: 'articles' },
        { id: 4, name: 'إنشاء مقال', slug: 'articles.create', category: 'articles' },
        { id: 5, name: 'تعديل مقالاتي', slug: 'articles.edit.own', category: 'articles' },
        { id: 6, name: 'حذف مقالاتي', slug: 'articles.delete.own', category: 'articles' },
        { id: 9, name: 'جدولة مقالات', slug: 'articles.schedule', category: 'articles' },
        { id: 17, name: 'إدارة الوسائط', slug: 'content.media.manage', category: 'content' },
        { id: 25, name: 'عرض الإحصائيات', slug: 'system.stats.view', category: 'system' }
      ],
      users_count: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: role
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/roles/[id] - تحديث دور
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.roles.manage');
    const { id } = await params;
    const body = await request.json();
    
    const { name, description, permissions } = body;
    
    // التحقق من عدم تعديل الأدوار الأساسية للنظام
    // في التطبيق الحقيقي، يجب التحقق من قاعدة البيانات
    const systemRoleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (systemRoleIds.includes(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن تعديل أدوار النظام الأساسية' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (permissions) updateData.permissions = permissions;
    
    // تحديث الدور في قاعدة البيانات
    const updatedRole = {
      id: parseInt(id),
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'UPDATE_ROLE',
      'role',
      id,
      updateData.name || 'Role'
    );
    
    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'تم تحديث الدور بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}

// DELETE /api/roles/[id] - حذف دور
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('users.roles.manage');
    const { id } = await params;
    
    // التحقق من عدم حذف الأدوار الأساسية للنظام
    const systemRoleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (systemRoleIds.includes(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف أدوار النظام الأساسية' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود مستخدمين مرتبطين بهذا الدور
    // في التطبيق الحقيقي، يجب التحقق من قاعدة البيانات
    
    // حذف الدور من قاعدة البيانات
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'DELETE_ROLE',
      'role',
      id,
      'Deleted Role'
    );
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
} 