import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const runtime = 'nodejs';

// GET /api/roles/[id] - الحصول على تفاصيل دور محدد
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const role = await prisma.roles.findUnique({
      where: { id }
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // حساب عدد المستخدمين
    const userCount = await prisma.users.count({
      where: {
        role: role.name
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...role,
        users: userCount,
        permissions: typeof role.permissions === 'string' 
          ? JSON.parse(role.permissions as string) 
          : role.permissions
      }
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الدور' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - تحديث دور
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, display_name, description, permissions, color } = body;
    
    // البحث عن الدور
    const existingRole = await prisma.roles.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // التحقق من عدم تكرار اسم الدور
    if (name && name !== existingRole.name) {
      const duplicateRole = await prisma.roles.findUnique({
        where: { name }
      });
      
      if (duplicateRole) {
        return NextResponse.json(
          { success: false, error: 'يوجد دور آخر بنفس الاسم' },
          { status: 400 }
        );
      }
    }
    
    // تحديث الدور
    const updatedRole = await prisma.roles.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(display_name && { display_name }),
        ...(description && { description }),
        ...(permissions && { permissions: JSON.stringify(permissions) }),
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedRole,
        permissions: permissions || (typeof updatedRole.permissions === 'string' 
          ? JSON.parse(updatedRole.permissions as string) 
          : updatedRole.permissions)
      },
      message: 'تم تحديث الدور بنجاح'
    });
    
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الدور' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - حذف دور
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // البحث عن الدور
    const role = await prisma.roles.findUnique({
      where: { id }
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }
    
    // منع حذف أدوار النظام
    if (role.is_system) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف أدوار النظام الأساسية' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود مستخدمين مرتبطين بالدور
    const usersWithRole = await prisma.users.count({
      where: {
        role: role.name
      }
    });
    
    if (usersWithRole > 0) {
      return NextResponse.json(
        { success: false, error: `لا يمكن حذف الدور لأن هناك ${usersWithRole} مستخدم مرتبط به` },
        { status: 400 }
      );
    }
    
    // حذف الدور
    await prisma.roles.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    });
    
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف الدور' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 