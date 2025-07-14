import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'published';

    // جلب التحليلات العميقة
    const deepAnalyses = await prisma.deep_analyses.findMany({
      where: {
        status: status
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        published_at: 'desc'
      },
      take: limit,
      skip: offset
    });

    // جلب العدد الإجمالي
    const total = await prisma.deep_analyses.count({
      where: {
        status: status
      }
    });

    return NextResponse.json({
      success: true,
      data: deepAnalyses,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('خطأ في جلب التحليلات العميقة:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب التحليلات العميقة' 
      },
      { status: 500 }
    );
  }
} 