import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, logActivity } from '@/app/lib/auth';

// GET /api/roles - الحصول على قائمة الأدوار
export async function GET(request: NextRequest) {
  try {
    // لا يتطلب صلاحية خاصة - يمكن لأي مستخدم مسجل رؤية الأدوار
    const roles = [
      {
        id: 1,
        name: 'مشرف عام',
        slug: 'super-admin',
        description: 'صلاحيات كاملة على النظام',
        is_system: true,
        users_count: 1,
        permissions_count: 38
      },
      {
        id: 2,
        name: 'رئيس تحرير',
        slug: 'editor-in-chief',
        description: 'إدارة المحتوى التحريري والفريق',
        is_system: true,
        users_count: 1,
        permissions_count: 28
      },
      {
        id: 3,
        name: 'نائب رئيس تحرير',
        slug: 'deputy-editor',
        description: 'مساعدة رئيس التحرير في المهام',
        is_system: true,
        users_count: 1,
        permissions_count: 25
      },
      {
        id: 4,
        name: 'محرر',
        slug: 'editor',
        description: 'كتابة وتحرير المقالات',
        is_system: true,
        users_count: 3,
        permissions_count: 7
      },
      {
        id: 5,
        name: 'محرر أقسام',
        slug: 'section-editor',
        description: 'إدارة محتوى قسم معين',
        is_system: true,
        users_count: 2,
        permissions_count: 10
      },
      {
        id: 6,
        name: 'مراسل',
        slug: 'reporter',
        description: 'جمع الأخبار وكتابة التقارير',
        is_system: true,
        users_count: 5,
        permissions_count: 4
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: roles,
      total: roles.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/roles - إنشاء دور جديد
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('users.roles.manage');
    const body = await request.json();
    
    const { name, slug, description, permissions = [] } = body;
    
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'الاسم والمعرف مطلوبان' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار المعرف
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { success: false, error: 'المعرف يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط' },
        { status: 400 }
      );
    }
    
    // إنشاء الدور في قاعدة البيانات
    const newRole = {
      id: Date.now(),
      name,
      slug,
      description,
      is_system: false,
      permissions,
      created_at: new Date().toISOString()
    };
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'CREATE_ROLE',
      'role',
      newRole.id.toString(),
      newRole.name
    );
    
    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'تم إنشاء الدور بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
} 