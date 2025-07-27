import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📰 بدء جلب المقال: ${id}`);
    
    const article = await prisma.articles.findUnique({
      where: {
        id: id
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
        _count: {
          select: {
            interactions: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود',
        article: null
      }, { status: 404 });
    }

    console.log(`✅ تم جلب المقال بنجاح: ${article.title}`);

    return NextResponse.json({
      success: true,
      article,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.warn(`❌ خطأ في جلب المقال ${id}:`, error);
    
    return NextResponse.json({
      success: false,
      article: null,
      error: 'فشل في جلب المقال',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 503 });
  }
}
