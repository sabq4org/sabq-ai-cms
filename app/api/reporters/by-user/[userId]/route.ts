import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // البحث عن المراسل بواسطة user_id
    const reporter = await prisma.reporters.findUnique({
      where: {
        user_id: userId,
        is_active: true
      },
      select: {
        id: true,
        slug: true,
        full_name: true,
        title: true,
        avatar_url: true,
        is_verified: true,
        verification_badge: true,
        is_active: true
      }
    });

    if (!reporter) {
      return NextResponse.json(
        { 
          success: false,
          error: 'لا يوجد بروفايل مراسل لهذا المستخدم',
          hasProfile: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasProfile: true,
      reporter: {
        ...reporter,
        profileUrl: `/reporter/${reporter.slug}`
      }
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات المراسل بواسطة user_id:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الخادم',
        hasProfile: false
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}