import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'معرف الفريق مطلوب' },
        { status: 400 }
      );
    }
    
    // البحث عن المراسل في جدول reporters بناءً على team_member
    const teamMember = await prisma.team_members.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!teamMember || teamMember.role !== 'reporter') {
      return NextResponse.json(
        { error: 'المراسل غير موجود' },
        { status: 404 }
      );
    }
    
    // البحث عن البروفايل في جدول reporters
    const user = await prisma.users.findFirst({
      where: { email: teamMember.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }
    
    const reporter = await prisma.reporters.findFirst({
      where: { user_id: user.id },
      select: {
        id: true,
        full_name: true,
        slug: true,
        is_verified: true,
        verification_badge: true,
        title: true,
        avatar_url: true
      }
    });
    
    if (!reporter) {
      return NextResponse.json(
        { error: 'بروفايل المراسل غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      reporter: {
        id: reporter.id,
        full_name: reporter.full_name,
        slug: reporter.slug,
        is_verified: reporter.is_verified,
        verification_badge: reporter.verification_badge,
        title: reporter.title,
        avatar_url: reporter.avatar_url
      }
    });
    
  } catch (error: any) {
    console.error('خطأ في جلب المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات المراسل' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}