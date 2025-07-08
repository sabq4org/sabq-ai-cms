import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

// GET: جلب المراسلين والكتاب
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role'); // مثل: correspondent,editor,author
    
    console.log('🔍 جلب المراسلين مع فلتر الأدوار:', roleFilter);
    
    // بناء شروط البحث
    let whereCondition: any = {
      // استثناء المستخدمين العاديين
      role: {
        not: 'user'
      }
    };
    
    // إضافة فلتر الأدوار إذا تم تحديده
    if (roleFilter) {
      const allowedRoles = roleFilter.split(',').map(role => role.trim());
      console.log('🎯 الأدوار المطلوبة:', allowedRoles);
      whereCondition.role = {
        in: allowedRoles
      };
    }
    
    // جلب المستخدمين من قاعدة البيانات
    const users = await prisma.users.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('📊 عدد المستخدمين:', users.length);
    
    // جلب الأدوار لعرض الأسماء بالعربية
    const roles = await prisma.roles.findMany();
    const rolesMap = new Map(roles.map(role => [role.name, role.display_name || role.name]));
    
    // تحويل البيانات للتوافق مع الواجهة
    const authorsWithRoles = users.map(user => ({
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar || '/default-avatar.png',
      role: user.role,
      roleDisplayName: rolesMap.get(user.role) || user.role,
      isVerified: user.is_verified,
      isActive: true, // يمكن إضافة حقل في قاعدة البيانات لاحقاً
      createdAt: user.created_at.toISOString()
    }));
    
    console.log(`✅ تم العثور على ${authorsWithRoles.length} مستخدم:`, authorsWithRoles.map(a => `${a.name} (${a.roleDisplayName})`));
    
    return NextResponse.json({
      success: true,
      data: authorsWithRoles,
      total: authorsWithRoles.length
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب المراسلين:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب المراسلين',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: إضافة مراسل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.email || !body.roleId) {
      return NextResponse.json({
        success: false,
        error: 'الاسم والبريد الإلكتروني والدور مطلوبة'
      }, { status: 400 });
    }
    
    // التحقق من صحة الدور
    const roles = await prisma.roles.findMany();
    const validRole = roles.find(r => r.id === body.roleId);
    if (!validRole) {
      return NextResponse.json({
        success: false,
        error: 'الدور غير صالح'
      }, { status: 400 });
    }
    
    // التحقق من عدم تكرار البريد الإلكتروني
    const users = await prisma.users.findMany();
    const emailExists = users.some(user => 
      user.email.toLowerCase() === body.email.toLowerCase()
    );
    
    if (emailExists) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      }, { status: 400 });
    }
    
    // إنشاء مراسل جديد
    const newAuthor = await prisma.users.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: body.name,
        email: body.email,
        role: body.roleId,
        is_verified: body.isVerified ?? false,
        avatar: body.avatar,
        updated_at: new Date()
      }
    });
    
    // إرجاع المراسل الجديد مع معلومات الدور
    const role = roles.find(r => r.id === newAuthor.role);
    const authorWithRole = {
      id: newAuthor.id,
      name: newAuthor.name || newAuthor.email.split('@')[0],
      email: newAuthor.email,
      avatar: newAuthor.avatar || '/default-avatar.png',
      role: newAuthor.role,
      roleDisplayName: role?.display_name || newAuthor.role,
      isVerified: newAuthor.is_verified,
      isActive: true,
      createdAt: newAuthor.created_at.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: authorWithRole,
      message: 'تم إضافة المراسل بنجاح'
    }, { status: 201 });
    
  } catch (error) {
    console.error('خطأ في إضافة المراسل:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في إضافة المراسل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 