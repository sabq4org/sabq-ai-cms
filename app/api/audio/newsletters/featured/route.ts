import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // الحصول على آخر نشرة مميزة ومنشورة
    const newsletter = await prisma.audioNewsletter.findFirst({
      where: {
        is_published: true,
        is_featured: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!newsletter) {
      // إذا لم توجد نشرة مميزة، احصل على آخر نشرة منشورة
      const latestNewsletter = await prisma.audioNewsletter.findFirst({
        where: {
          is_published: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        newsletter: latestNewsletter
      });
    }

    // زيادة عداد التشغيل
    await prisma.audioNewsletter.update({
      where: { id: newsletter.id },
      data: {
        play_count: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      newsletter
    });
  } catch (error) {
    console.error('Error fetching featured newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured newsletter' },
      { status: 500 }
    );
  }
} 