import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: جلب جميع الأدوار والصلاحيات
export async function GET(request: NextRequest) {
  try {
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
      displayName: 'محرر',
      description: 'تحرير ونشر المقالات والمحتوى',
      permissions: ['articles.*', 'media.*', 'categories.view'],
      color: 'blue',
      level: 2
    },
    'correspondent': {
      displayName: 'مراسل',
      description: 'كتابة الأخبار والتقارير الميدانية',
      permissions: ['articles.create', 'articles.edit', 'media.upload'],
      color: 'purple',
      level: 3
    },
    'author': {
      displayName: 'كاتب',
      description: 'كتابة المقالات والمحتوى',
      permissions: ['articles.create', 'articles.edit', 'media.upload'],
      color: 'green',
      level: 4
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
