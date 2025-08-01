import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: تسجيل مشاهدة للخبر
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف الخبر مطلوب'
      }, { status: 400 });
    }

    // زيادة عدد المشاهدات
    await prisma.articles.updateMany({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        status: 'published'
      },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل المشاهدة'
    });

  } catch (error) {
    console.error('❌ خطأ في تسجيل المشاهدة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تسجيل المشاهدة'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}