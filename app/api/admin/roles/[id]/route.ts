import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/roles/[id] - جلب دور محدد
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 طلب جلب الدور: ${params.id}`);
    
    // ملاحظة: تم تعطيل Authentication مؤقتاً لحل مشكلة Build
    
    // جلب الدور
    const role = await prisma.roles.findUnique({
      where: { id: params.id },
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
      }
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // معالجة الصلاحيات
    const processedRole = {
      ...role,
      permissions: typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions || []
    };
    
    console.log(`✅ تم جلب الدور: ${role.name}`);
    
    return NextResponse.json({
      success: true,
      data: processedRole
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب الدور:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الدور',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

/**
 * PUT /api/admin/roles/[id] - تحديث دور محدد
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 طلب تحديث الدور: ${params.id}`);
    
    // ملاحظة: تم تعطيل Authentication مؤقتاً لحل مشكلة Build
    
    const body = await request.json();
    const { display_name, description, permissions } = body;
    
    // التحقق من وجود الدور
    const existingRole = await prisma.roles.findUnique({
      where: { id: params.id }
    });
    
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // منع تعديل الأدوار النظام للأسماء الأساسية
    if (existingRole.is_system && ['admin', 'editor'].includes(existingRole.name)) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن تعديل أدوار النظام الأساسية' },
        { status: 400 }
      );
    }
    
    // تحديث الدور
    const updatedRole = await prisma.roles.update({
      where: { id: params.id },
      data: {
        display_name: display_name || existingRole.display_name,
        description: description || existingRole.description,
        permissions: permissions || existingRole.permissions,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحديث الدور: ${updatedRole.name}`);
    
    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'تم تحديث الدور بنجاح'
    });
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الدور:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تحديث الدور',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

/**
 * DELETE /api/admin/roles/[id] - حذف دور محدد
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ طلب حذف الدور: ${params.id}`);
    
    // ملاحظة: تم تعطيل Authentication مؤقتاً لحل مشكلة Build
    
    // التحقق من وجود الدور
    const existingRole = await prisma.roles.findUnique({
      where: { id: params.id }
    });
    
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // منع حذف الأدوار النظام
    if (existingRole.is_system) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف أدوار النظام' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم استخدام الدور من قبل مستخدمين
    const usersWithRole = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users WHERE role = ${existingRole.name}
    `;
    
    if (Array.isArray(usersWithRole) && usersWithRole[0]?.count > 0) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف دور مستخدم من قبل مستخدمين' },
        { status: 400 }
      );
    }
    
    // حذف الدور
    await prisma.roles.delete({
      where: { id: params.id }
    });
    
    console.log(`✅ تم حذف الدور: ${existingRole.name}`);
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    });
    
  } catch (error) {
    console.error('❌ خطأ في حذف الدور:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في حذف الدور',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}