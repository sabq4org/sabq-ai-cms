import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/roles - جلب جميع الأدوار
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 طلب جلب الأدوار من لوحة التحكم...');
    
    // ملاحظة: تم تعطيل Authentication مؤقتاً لحل مشكلة Build
    // سيتم إعادة تفعيله بعد استقرار النظام
    
    // جلب جميع الأدوار مع ترتيب حسب الاسم المعروض
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        display_name: true,
        description: true,
        permissions: true,
        is_system: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        display_name: 'asc'
      }
    });
    
    console.log(`✅ تم جلب ${roles.length} دور بنجاح`);
    
    // معالجة البيانات للعرض
    const processedRoles = roles.map(role => ({
      ...role,
      permissions: typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions || [],
      permissionsCount: Array.isArray(role.permissions) 
        ? role.permissions.length 
        : (typeof role.permissions === 'string' 
          ? JSON.parse(role.permissions).length 
          : 0)
    }));
    
    return NextResponse.json({
      success: true,
      data: processedRoles,
      count: roles.length
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب الأدوار:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الأدوار',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/roles - إنشاء دور جديد
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📝 طلب إنشاء دور جديد...');
    
    // ملاحظة: تم تعطيل Authentication مؤقتاً لحل مشكلة Build
    
    const body = await request.json();
    const { name, display_name, description, permissions } = body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !display_name) {
      return NextResponse.json(
        { success: false, error: 'اسم الدور والاسم المعروض مطلوبان' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار الاسم
    const existingRole = await prisma.roles.findFirst({
      where: { name: name }
    });
    
    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'اسم الدور موجود بالفعل' },
        { status: 400 }
      );
    }
    
    // إنشاء الدور الجديد
    const newRole = await prisma.roles.create({
      data: {
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        display_name: display_name,
        description: description || '',
        permissions: permissions || [],
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم إنشاء الدور الجديد: ${newRole.name}`);
    
    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'تم إنشاء الدور بنجاح'
    });
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الدور:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في إنشاء الدور',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}