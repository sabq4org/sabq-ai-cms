import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { ai_summary } = await request.json();

    if (!ai_summary) {
      return NextResponse.json(
        { error: 'الملخص مطلوب' },
        { status: 400 }
      );
    }

    // جلب metadata الحالية
    const article = await prisma.articles.findUnique({
      where: { id: resolvedParams.id },
      select: { metadata: true }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    const currentMetadata = (article.metadata as any) || {};

    // تحديث الملخص في metadata
    await prisma.articles.update({
      where: { id: resolvedParams.id },
      data: {
        metadata: {
          ...currentMetadata,
          ai_summary,
          summary_updated_at: new Date().toISOString()
        },
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الملخص بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في حفظ الملخص:', error);
    return NextResponse.json(
      {
        error: 'فشل في حفظ الملخص',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
} 