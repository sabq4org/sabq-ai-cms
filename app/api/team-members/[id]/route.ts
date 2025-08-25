import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    console.log(`📝 تحديث عضو الفريق: ${id}`);
    
    // التحقق من وجود العضو
    const existingMember = await prisma.team_members.findUnique({
      where: { id }
    });
    
    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // تحديث العضو في قاعدة البيانات
    const updatedMember = await prisma.team_members.update({
      where: { id },
      data: {
        name: data.name || existingMember.name,
        email: data.email || existingMember.email,
        role: data.role || existingMember.role,
        department: data.department !== undefined ? data.department : existingMember.department,
        bio: data.bio !== undefined ? data.bio : existingMember.bio,
        avatar: data.avatar !== undefined ? data.avatar : existingMember.avatar,
        phone: data.phone !== undefined ? data.phone : existingMember.phone,
        social_links: data.social_links !== undefined ? data.social_links : existingMember.social_links,
        is_active: data.is_active !== undefined ? data.is_active : existingMember.is_active,
        display_order: data.display_order !== undefined ? data.display_order : existingMember.display_order,
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم تحديث العضو بنجاح في قاعدة البيانات');
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث العضو بنجاح',
      member: updatedMember
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث العضو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في تحديث العضو',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log(`🗑️ حذف عضو الفريق: ${id}`);
    
    // التحقق من وجود العضو
    const existingMember = await prisma.team_members.findUnique({
      where: { id }
    });
    
    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // حذف العضو من قاعدة البيانات
    await prisma.team_members.delete({
      where: { id }
    });
    
    console.log('✅ تم حذف العضو بنجاح من قاعدة البيانات');
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العضو بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في حذف العضو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في حذف العضو',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}