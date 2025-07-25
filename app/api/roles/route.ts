import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET - جلب جميع الأدوار
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: بدء جلب الأدوار من قاعدة البيانات...');
    
    const roles = await prisma.roles.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 API: تم العثور على ${roles.length} أدوار في قاعدة البيانات`);
    
    if (roles.length === 0) {
      console.log('⚠️ API: لا توجد أدوار في قاعدة البيانات');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'لا توجد أدوار مُعرَّفة في النظام'
      });
    }
    
    // حساب عدد المستخدمين لكل دور
    const rolesWithCount = await Promise.all(
      roles.map(async (role: any) => {
        try {
          const userCount = await prisma.users.count({
            where: {
              role: role.name
            }
          });
          
          // التأكد من وجود display_name
          const displayName = role.display_name || role.name;
          
          return {
            ...role,
            display_name: displayName,
            users: userCount,
            permissions: typeof role.permissions === 'string' 
              ? JSON.parse(role.permissions as string) 
              : (role.permissions || [])
          };
        } catch (userCountError) {
          console.error(`❌ API: خطأ في حساب المستخدمين للدور ${role.name}:`, userCountError);
          return {
            ...role,
            display_name: role.display_name || role.name,
            users: 0,
            permissions: []
          };
        }
      })
    );
    
    console.log('✅ API: تم تحضير البيانات بنجاح:', rolesWithCount.map(r => r.name));
    
    return NextResponse.json({
      success: true,
      data: rolesWithCount,
      count: rolesWithCount.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ API: خطأ في جلب الأدوار:', error);
    
    // إرسال تفاصيل أكثر عن الخطأ
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الأدوار',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - إنشاء دور جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, display_name, description, permissions = [], color = '#4B82F2' } = body;
    
    if (!name || !display_name || !description) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال جميع البيانات المطلوبة' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار اسم الدور
    const existingRole = await prisma.roles.findUnique({
      where: { name }
    });
    
    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'يوجد دور بنفس الاسم' },
        { status: 400 }
      );
    }
    
    const newRole = await prisma.roles.create({
      data: {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        display_name,
        description,
        permissions: JSON.stringify(permissions),
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...newRole,
        permissions: permissions,
        users: 0
      },
      message: 'تم إنشاء الدور بنجاح' 
    });
    
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الدور' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
