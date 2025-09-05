import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processArticleImage, getSafeImageUrl } from '@/lib/image-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10);
    
    // تجربة بسيطة بدون العلاقات أولاً
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        social_image: true,
        breaking: true,
        featured: true,
        status: true,
        published_at: true,
        views: true,
      },
      orderBy: {
        published_at: 'desc',
      },
      take: limit,
    });

    // معالجة شاملة للصور مع نظام fallback متقدم
    const processedArticles = articles.map(article => ({
      ...article,
      // معالجة الصورة المميزة مع fallback
      featured_image: processArticleImage(article.featured_image, article.title, 'featured'),
      // معالجة صورة المشاركة مع fallback
      social_image: processArticleImage(article.social_image, article.title, 'article'),
    }));
    
    const payload = {
      success: true,
      data: processedArticles,
      message: 'تم جلب الأخبار المميزة مع معالجة متقدمة للصور',
    };
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        data: [], 
        error: 'حدث خطأ في جلب الأخبار المميزة', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
