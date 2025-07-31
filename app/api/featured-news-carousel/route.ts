import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// تعطيل التخزين المؤقت لهذه الواجهة
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // جلب آخر 3 مقالات مميزة منشورة
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: 'published'
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 3,
      include: {
        categories: true,
        author: {
          include: {
            reporter_profile: true
          }
        }
      }
    });

    if (!featuredArticles || featuredArticles.length === 0) {
      return NextResponse.json({
        success: true,
        articles: [],
        message: 'لا توجد أخبار مميزة حالياً'
      });
    }

    // تنسيق البيانات
    const formattedArticles = featuredArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featured_image: article.featured_image,
      published_at: article.published_at,
      reading_time: article.reading_time,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      category: article.categories ? {
        id: article.categories.id,
        name: article.categories.name,
        icon: article.categories.icon || '',
        color: article.categories.color || ''
      } : null,
      author: article.author ? {
        id: article.author.id,
        name: article.author.name,
        reporter: article.author.reporter_profile ? {
          id: article.author.reporter_profile.id,
          full_name: article.author.reporter_profile.full_name,
          slug: article.author.reporter_profile.slug,
          title: article.author.reporter_profile.title,
          is_verified: article.author.reporter_profile.is_verified,
          verification_badge: article.author.reporter_profile.verification_badge || 'verified'
        } : null
      } : null,
      metadata: article.metadata,
      created_at: article.created_at,
      updated_at: article.updated_at
    }));

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      count: formattedArticles.length
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الأخبار المميزة:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الأخبار المميزة',
        details: error.message 
      },
      { status: 500 }
    );
  }
}