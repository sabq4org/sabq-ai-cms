import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// تعطيل التخزين المؤقت لهذه الواجهة
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // البحث عن الخبر المميز الأحدث
    const featuredArticle = await prisma.articles.findFirst({
      where: {
        featured: true,
        status: 'published',
        published_at: {
          lte: new Date()
        }
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            reporter_profile: {
              select: {
                id: true,
                full_name: true,
                slug: true,
                title: true,
                is_verified: true,
                verification_badge: true
              }
            }
          }
        }
      },
      orderBy: [
        { updated_at: 'desc' },
        { published_at: 'desc' }
      ]
    });

    if (!featuredArticle) {
      return NextResponse.json({
        success: true,
        article: null,
        message: 'لا يوجد خبر مميز حالياً'
      });
    }

    // تنسيق البيانات
    const formattedArticle = {
      id: featuredArticle.id,
      title: featuredArticle.title,
      slug: featuredArticle.slug,
      excerpt: featuredArticle.excerpt,
      content: featuredArticle.content,
      featured_image: featuredArticle.featured_image,
      published_at: featuredArticle.published_at,
      reading_time: featuredArticle.reading_time,
      views: featuredArticle.views,
      likes: featuredArticle.likes,
      shares: featuredArticle.shares,
      category: featuredArticle.categories ? {
        id: featuredArticle.categories.id,
        name: featuredArticle.categories.name,
        icon: featuredArticle.categories.icon,
        color: featuredArticle.categories.color
      } : null,
      author: featuredArticle.author ? {
        id: featuredArticle.author.id,
        name: featuredArticle.author.name,
        reporter: featuredArticle.author.reporter_profile ? {
          id: featuredArticle.author.reporter_profile.id,
          full_name: featuredArticle.author.reporter_profile.full_name,
          slug: featuredArticle.author.reporter_profile.slug,
          title: featuredArticle.author.reporter_profile.title,
          is_verified: featuredArticle.author.reporter_profile.is_verified,
          verification_badge: featuredArticle.author.reporter_profile.verification_badge
        } : null
      } : null,
      metadata: featuredArticle.metadata,
      created_at: featuredArticle.created_at,
      updated_at: featuredArticle.updated_at
    };

    return NextResponse.json({
      success: true,
      article: formattedArticle
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الخبر المميز:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الخبر المميز',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}