import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: تحديث مدة النشرة الصوتية بالمدة الحقيقية
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, duration } = body;

    if (!id || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'معرف النشرة والمدة مطلوبان' },
        { status: 400 }
      );
    }

    const updatedNewsletter = await prisma.audio_newsletters.update({
      where: { id },
      data: { duration }
    });

    return NextResponse.json({
      success: true,
      newsletter: updatedNewsletter,
      message: 'تم تحديث مدة النشرة بنجاح'
    });

  } catch (error) {
    console.error('Error updating newsletter duration:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث مدة النشرة' },
      { status: 500 }
    );
  }
}
