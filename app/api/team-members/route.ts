import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

// GET: جلب قائمة أعضاء الفريق
export async function GET() {
  try {
    // استيراد آمن لـ Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.prisma || prismaModule.default;
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }
    
    // التأكد من الاتصال بقاعدة البيانات مباشرة
    await prisma.$queryRaw`SELECT 1`;

    const members = await prisma.users.findMany({
      where: {
        role: {
          not: 'user' // استثناء المستخدمين العاديين
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      name: member.name || member.email.split('@')[0],
      email: member.email,
      roleId: member.role,
      role: member.role,
      avatar: member.avatar,
      isActive: true, // يمكن إضافة حقل في قاعدة البيانات لاحقاً
      isVerified: member.is_verified,
      createdAt: member.created_at.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب أعضاء الفريق', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: إضافة عضو جديد
export async function POST(request: NextRequest) {
  try {
    // استيراد آمن لـ Prisma
    const { prisma } = await import('@/lib/prisma');
    
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.email || !body.password || !body.roleId) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }
    
    // التحقق من طول كلمة المرور
    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار البريد الإلكتروني
    const existingUser = await prisma.users.findUnique({
      where: {
        email: body.email.toLowerCase()
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // إنشاء عضو جديد
    const newMember = await prisma.users.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: body.email.toLowerCase(),
        name: body.name,
        password_hash: hashedPassword,
        role: body.roleId, // استخدام role ID مباشرة
        avatar: body.avatar,
        is_verified: body.isVerified ?? false,
        is_admin: body.roleId === 'admin',
        updated_at: new Date()
      }
    });
    
    // إرجاع العضو بتنسيق متوافق
    const formattedMember = {
      id: newMember.id,
      name: newMember.name || newMember.email.split('@')[0],
      email: newMember.email,
      roleId: newMember.role,
      role: newMember.role,
      avatar: newMember.avatar,
      isActive: true,
      isVerified: newMember.is_verified,
      createdAt: newMember.created_at.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة عضو الفريق' },
      { status: 500 }
    );
  }
} 