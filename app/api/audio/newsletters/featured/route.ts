import { NextRequest, NextResponse } from 'next/server';

// استيراد آمن لـ Prisma
let prisma: any;
try {
  const prismaModule = require('@/lib/prisma');
  prisma = prismaModule.prisma;
} catch (importError) {
  console.error('❌ فشل في استيراد Prisma في audio/newsletters/featured:', importError);
}

export async function GET() {
  try {
    const featuredNewsletter = await prisma.audio_newsletters.findFirst({
      where: {
        is_published: true,
        is_featured: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (featuredNewsletter) {
      return NextResponse.json({
        success: true,
        newsletter: featuredNewsletter
      });
    }

    const latestNewsletter = await prisma.audio_newsletters.findFirst({
      where: {
        is_published: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: latestNewsletter ? true : false,
      newsletter: latestNewsletter,
      message: latestNewsletter ? null : 'لا توجد نشرات صوتية منشورة'
    });

  } catch (error) {
    console.error('Error fetching featured newsletter:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch featured newsletter' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
