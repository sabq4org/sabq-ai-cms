import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

// GET: جلب بيانات عضو محدد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const member = await prisma.users.findUnique({
      where: { id }
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedMember = {
      id: member.id,
      name: member.name || member.email.split('@')[0],
      email: member.email,
      roleId: member.role,
      role: member.role,
      avatar: member.avatar,
      isActive: true,
      isVerified: member.is_verified,
      createdAt: member.created_at.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات العضو' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: تحديث بيانات عضو
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // التحقق من وجود العضو
    const currentMember = await prisma.users.findUnique({
      where: { id }
    });
    
    if (!currentMember) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // بناء البيانات للتحديث
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    
    if (body.email && body.email !== currentMember.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني غير صالح' },
          { status: 400 }
        );
      }
      
      const emailExists = await prisma.users.findUnique({
        where: {
          email: body.email.toLowerCase()
        }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        );
      }
      
      updateData.email = body.email.toLowerCase();
    }
    
    if (body.roleId !== undefined) {
      updateData.role = body.roleId;
      updateData.is_admin = body.roleId === 'admin';
    }
    
    if (body.isVerified !== undefined) {
      updateData.is_verified = body.isVerified;
    }
    
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar || null;
    }
    
    // تحديث كلمة المرور إذا تم توفيرها
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
          { status: 400 }
        );
      }
      updateData.password_hash = await bcrypt.hash(body.password, 10);
    }
    
    // تحديث العضو
    const updatedMember = await prisma.users.update({
      where: { id },
      data: updateData
    });
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedMember = {
      id: updatedMember.id,
      name: updatedMember.name || updatedMember.email.split('@')[0],
      email: updatedMember.email,
      roleId: updatedMember.role,
      role: updatedMember.role,
      avatar: updatedMember.avatar,
      isActive: true,
      isVerified: updatedMember.is_verified,
      createdAt: updatedMember.created_at.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث بيانات العضو' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: حذف عضو
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // التحقق من وجود العضو
    const member = await prisma.users.findUnique({
      where: { id }
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // حذف العضو
    await prisma.users.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العضو بنجاح',
      data: { id: member.id, name: member.name || member.email }
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف العضو' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 