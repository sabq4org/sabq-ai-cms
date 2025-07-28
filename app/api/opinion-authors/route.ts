import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // استيراد آمن لـ Prisma
    let prisma;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
    } catch (error) {
      console.error('❌ فشل تحميل Prisma:', error);
      return NextResponse.json({
        success: false,
        error: 'خطأ في النظام',
        authors: []
      }, { status: 500 });
    }

    // محاولة جلب كتاب الرأي - معطل مؤقتاً
    console.log('⚠️ API opinion-authors معطل مؤقتاً - جدول opinion_authors غير موجود');
    
    return NextResponse.json({
      success: false,
      authors: [],
      error: 'API معطل مؤقتاً',
      message: 'جدول opinion_authors غير موجود في قاعدة البيانات'
    }, { status: 404 });
    
    /*
    const authors = await prisma.opinion_authors.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        displayOrder: true,
        title: true,
        email: true
      }
    });

    return NextResponse.json({
      success: true,
      authors
    });
    */
  } catch (error) {
    console.error('❌ خطأ عام:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في النظام',
      authors: []
    }, { status: 500 });
  }
}
