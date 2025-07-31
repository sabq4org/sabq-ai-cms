import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب جميع الأدوار والصلاحيات
export async function GET(request: NextRequest) {
  try {
    // التحقق من وجود جدول roles
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      // إذا لم توجد الجداول، استخدم النظام القديم
      return await getOldSystemRoles();
    }

    // جلب جميع الأدوار من جدول roles
    const roles = await prisma.$queryRaw`
      SELECT 
        r.*,
        COUNT(DISTINCT u.id) as users_count
      FROM roles r
      LEFT JOIN users u ON u.role = r.name
      GROUP BY r.id
      ORDER BY r.created_at ASC
    `;

    // جلب جميع الصلاحيات
    const permissions = await prisma.$queryRaw`
      SELECT * FROM permissions ORDER BY category, name
    `;

    // جلب الإحصائيات
    const totalUsers = await prisma.users.count();
    const adminUsers = await prisma.users.count({ where: { is_admin: true } });

    // تحويل البيانات للتنسيق المطلوب
    const formattedRoles = roles.map((role: any) => {
      // تحديد اللون والمستوى بناءً على اسم الدور
      const roleDetails = getRoleDetails(role.name);
      
      return {
        id: role.id,
        name: role.name,
        displayName: role.display_name || roleDetails.displayName,
        description: role.description || roleDetails.description,
        usersCount: parseInt(role.users_count),
        permissions: role.permissions || roleDetails.permissions,
        isActive: true, // افتراض أن جميع الأدوار نشطة
        color: roleDetails.color,
        createdAt: role.created_at,
        level: roleDetails.level,
        isSystem: role.is_system || roleDetails.level <= 1
      };
    });

    return NextResponse.json({
      success: true,
      roles: formattedRoles,
      permissions: permissions,
      stats: {
        totalRoles: formattedRoles.length,
        activeRoles: formattedRoles.filter((r: any) => r.isActive).length,
        totalUsers: totalUsers,
        adminUsers: adminUsers
      }
    });

  } catch (error: any) {
    console.error('خطأ في جلب الأدوار:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب الأدوار',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// POST: إضافة دور جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, displayName, description, permissions } = data;

    // التحقق من البيانات المطلوبة
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: 'الاسم والاسم المعروض مطلوبان' },
        { status: 400 }
      );
    }

    // إنشاء slug من الاسم
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // إنشاء الدور
    const newRole = await prisma.$queryRaw`
      INSERT INTO roles (id, name, slug, display_name, description, permissions, is_system)
      VALUES (
        concat('role_', extract(epoch from now())::bigint::text, '_', substr(md5(random()::text), 1, 8)),
        ${name}, 
        ${slug},
        ${displayName}, 
        ${description || ''}, 
        ${permissions ? JSON.stringify(permissions) : '[]'}::jsonb,
        false
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      role: newRole[0],
      message: 'تم إنشاء الدور بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في إنشاء الدور:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إنشاء الدور',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// دالة للتحقق من وجود الجداول
async function checkTablesExist() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM roles LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}

// دالة للحصول على الأدوار من النظام القديم
async function getOldSystemRoles() {
  // جلب جميع الأدوار الفريدة من المستخدمين
  const uniqueRoles = await prisma.users.groupBy({
    by: ['role'],
    _count: {
      role: true
    }
  });

  // جلب عدد المستخدمين الإجماليين
  const totalUsers = await prisma.users.count();

  // جلب عدد المستخدمين المدراء
  const adminCount = await prisma.users.count({
    where: { is_admin: true }
  });

  // جلب أقدم مستخدم لكل دور لمعرفة تاريخ إنشاء الدور
  const roleCreationDates = await prisma.users.groupBy({
    by: ['role'],
    _min: {
      created_at: true
    }
  });

  // تحويل الأدوار إلى التنسيق المطلوب
  const rolesData = uniqueRoles.map((roleGroup, index) => {
    const role = roleGroup.role;
    const count = roleGroup._count.role;

    // تحديد خصائص الدور بناءً على اسمه
    const roleDetails = getRoleDetails(role);
    
    // الحصول على تاريخ إنشاء الدور من أقدم مستخدم
    const creationDate = roleCreationDates.find(r => r.role === role)?._min.created_at || new Date();
    
    return {
      id: `role-${index + 1}`,
      name: role,
      displayName: roleDetails.displayName,
      description: roleDetails.description,
      usersCount: count,
      permissions: roleDetails.permissions,
      isActive: true,
      color: roleDetails.color,
      createdAt: creationDate.toISOString(),
      level: roleDetails.level
    };
  });

  // ترتيب الأدوار حسب المستوى
  rolesData.sort((a, b) => a.level - b.level);

  // إحصائيات إضافية
  const stats = {
    totalRoles: rolesData.length,
    activeRoles: rolesData.filter(r => r.isActive).length,
    totalUsers: totalUsers,
    adminUsers: adminCount
  };

  return NextResponse.json({
    success: true,
    roles: rolesData,
    stats,
    // الصلاحيات المتاحة في النظام
    permissions: getSystemPermissions()
  });
}

// دالة لتحديد تفاصيل كل دور
function getRoleDetails(role: string) {
  const rolesMap: Record<string, any> = {
    'super_admin': {
      displayName: 'مدير النظام',
      description: 'صلاحيات كاملة على النظام بدون قيود',
      permissions: ['*'],
      color: 'red',
      level: 0
    },
    'admin': {
      displayName: 'مدير',
      description: 'إدارة كاملة للنظام والمحتوى',
      permissions: ['*'],
      color: 'red',
      level: 1
    },
    'editor': {
      displayName: 'محرر أول',
      description: 'تحرير ونشر المقالات والمحتوى',
      permissions: ['articles.*', 'media.*', 'categories.view'],
      color: 'blue',
      level: 2
    },
    'content-manager': {
      displayName: 'مدير محتوى',
      description: 'إدارة المحتوى والنشر',
      permissions: ['articles.*', 'media.*', 'categories.*'],
      color: 'purple',
      level: 2
    },
    'correspondent': {
      displayName: 'مراسل',
      description: 'كتابة الأخبار والتقارير الميدانية',
      permissions: ['articles.create', 'articles.edit', 'media.upload'],
      color: 'purple',
      level: 3
    },
    'moderator': {
      displayName: 'مشرف',
      description: 'مراقبة وإدارة التعليقات والمحتوى',
      permissions: ['comments.*', 'articles.view'],
      color: 'yellow',
      level: 3
    },
    'author': {
      displayName: 'كاتب',
      description: 'كتابة المقالات والمحتوى',
      permissions: ['articles.create', 'articles.edit', 'media.upload'],
      color: 'green',
      level: 4
    },
    'كاتب': {
      displayName: 'كاتب',
      description: 'كتابة المقالات والمحتوى',
      permissions: ['articles.create', 'articles.edit', 'media.upload'],
      color: 'green',
      level: 4
    },
    'member': {
      displayName: 'عضو',
      description: 'عضو في المنتدى والتفاعل',
      permissions: ['articles.view', 'comments.create', 'forum.*'],
      color: 'blue',
      level: 5
    },
    'subscriber': {
      displayName: 'مشترك',
      description: 'قراءة المحتوى المميز والتفاعل',
      permissions: ['articles.view', 'comments.create', 'premium.content'],
      color: 'yellow',
      level: 5
    },
    'user': {
      displayName: 'مستخدم',
      description: 'قراءة المحتوى والتفاعل معه',
      permissions: ['articles.view', 'comments.create'],
      color: 'gray',
      level: 6
    }
  };

  return rolesMap[role] || {
    displayName: role,
    description: 'دور مخصص',
    permissions: ['articles.view'],
    color: 'gray',
    level: 10
  };
}

// دالة لجلب جميع الصلاحيات المتاحة
function getSystemPermissions() {
  return [
    // مقالات
    { id: '1', name: 'articles.view', displayName: 'عرض المقالات', description: 'عرض جميع المقالات', category: 'articles', isSystem: false },
    { id: '2', name: 'articles.create', displayName: 'إنشاء مقال', description: 'إنشاء مقالات جديدة', category: 'articles', isSystem: false },
    { id: '3', name: 'articles.edit', displayName: 'تحرير المقالات', description: 'تحرير المقالات الموجودة', category: 'articles', isSystem: false },
    { id: '4', name: 'articles.delete', displayName: 'حذف المقالات', description: 'حذف المقالات', category: 'articles', isSystem: false },
    { id: '5', name: 'articles.publish', displayName: 'نشر المقالات', description: 'نشر وإلغاء نشر المقالات', category: 'articles', isSystem: false },
    { id: '6', name: 'articles.*', displayName: 'جميع صلاحيات المقالات', description: 'جميع صلاحيات المقالات', category: 'articles', isSystem: false },
    
    // مستخدمين
    { id: '7', name: 'users.view', displayName: 'عرض المستخدمين', description: 'عرض قائمة المستخدمين', category: 'users', isSystem: false },
    { id: '8', name: 'users.create', displayName: 'إضافة مستخدم', description: 'إضافة مستخدمين جدد', category: 'users', isSystem: false },
    { id: '9', name: 'users.edit', displayName: 'تحرير المستخدمين', description: 'تحرير بيانات المستخدمين', category: 'users', isSystem: false },
    { id: '10', name: 'users.delete', displayName: 'حذف المستخدمين', description: 'حذف المستخدمين', category: 'users', isSystem: false },
    { id: '11', name: 'users.*', displayName: 'جميع صلاحيات المستخدمين', description: 'جميع صلاحيات المستخدمين', category: 'users', isSystem: false },
    
    // تصنيفات
    { id: '12', name: 'categories.view', displayName: 'عرض التصنيفات', description: 'عرض التصنيفات', category: 'categories', isSystem: false },
    { id: '13', name: 'categories.create', displayName: 'إنشاء تصنيف', description: 'إنشاء تصنيفات جديدة', category: 'categories', isSystem: false },
    { id: '14', name: 'categories.edit', displayName: 'تحرير التصنيفات', description: 'تحرير التصنيفات', category: 'categories', isSystem: false },
    { id: '15', name: 'categories.delete', displayName: 'حذف التصنيفات', description: 'حذف التصنيفات', category: 'categories', isSystem: false },
    { id: '16', name: 'categories.*', displayName: 'جميع صلاحيات التصنيفات', description: 'جميع صلاحيات التصنيفات', category: 'categories', isSystem: false },
    
    // وسائط
    { id: '17', name: 'media.view', displayName: 'عرض الوسائط', description: 'عرض مكتبة الوسائط', category: 'media', isSystem: false },
    { id: '18', name: 'media.upload', displayName: 'رفع الوسائط', description: 'رفع ملفات جديدة', category: 'media', isSystem: false },
    { id: '19', name: 'media.delete', displayName: 'حذف الوسائط', description: 'حذف الملفات', category: 'media', isSystem: false },
    { id: '20', name: 'media.*', displayName: 'جميع صلاحيات الوسائط', description: 'جميع صلاحيات الوسائط', category: 'media', isSystem: false },
    
    // تعليقات
    { id: '21', name: 'comments.view', displayName: 'عرض التعليقات', description: 'عرض التعليقات', category: 'comments', isSystem: false },
    { id: '22', name: 'comments.create', displayName: 'إضافة تعليق', description: 'إضافة تعليقات جديدة', category: 'comments', isSystem: false },
    { id: '23', name: 'comments.edit', displayName: 'تحرير التعليقات', description: 'تحرير التعليقات', category: 'comments', isSystem: false },
    { id: '24', name: 'comments.delete', displayName: 'حذف التعليقات', description: 'حذف التعليقات', category: 'comments', isSystem: false },
    
    // إعدادات النظام
    { id: '25', name: 'system.settings', displayName: 'إعدادات النظام', description: 'تعديل إعدادات النظام', category: 'system', isSystem: true },
    { id: '26', name: 'system.backup', displayName: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية', category: 'system', isSystem: true },
    { id: '27', name: 'system.analytics', displayName: 'التحليلات', description: 'عرض تحليلات النظام', category: 'system', isSystem: false },
    
    // صلاحية الكل
    { id: '28', name: '*', displayName: 'جميع الصلاحيات', description: 'صلاحيات كاملة على النظام', category: 'system', isSystem: true }
  ];
}
