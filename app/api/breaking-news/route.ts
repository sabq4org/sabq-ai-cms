import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('🔴 جلب الأخبار العاجلة...');
    
    // جلب آخر خبر عاجل منشور
    const breakingNews = await prisma.articles.findFirst({
      where: {
        breaking: true, // الشرط الأساسي: خبر عاجل
        status: 'published',
        article_type: {
          notIn: ['opinion', 'analysis', 'interview'] // أخبار فقط، لا مقالات رأي
        }
      },
      orderBy: {
        published_at: 'desc' // الأحدث أولاً
      },
      include: {
        categories: true,
        author: {
          include: {
            reporter_profile: true
          }
        }
      }
    });

    // إذا لم يوجد خبر عاجل
    if (!breakingNews) {
      return NextResponse.json({
        success: true,
        breakingNews: null,
        message: 'لا توجد أخبار عاجلة حالياً'
      });
    }

    // تنسيق بيانات الخبر العاجل
    const formattedBreakingNews = {
      id: breakingNews.id,
      title: breakingNews.title,
      slug: breakingNews.slug,
      excerpt: breakingNews.excerpt,
      content: breakingNews.content,
      featured_image: breakingNews.featured_image,
      published_at: breakingNews.published_at,
      reading_time: breakingNews.reading_time,
      views: breakingNews.views || 0,
      likes: breakingNews.likes || 0,
      shares: breakingNews.shares || 0,
      breaking: breakingNews.breaking,
      category: breakingNews.categories ? {
        id: breakingNews.categories.id,
        name: breakingNews.categories.name,
        icon: breakingNews.categories.icon || '',
        color: breakingNews.categories.color || ''
      } : null,
      author: breakingNews.author ? {
        id: breakingNews.author.id,
        name: breakingNews.author.name,
        reporter: breakingNews.author.reporter_profile ? {
          id: breakingNews.author.reporter_profile.id,
          full_name: breakingNews.author.reporter_profile.full_name,
          slug: breakingNews.author.reporter_profile.slug,
          title: breakingNews.author.reporter_profile.title,
          is_verified: breakingNews.author.reporter_profile.is_verified,
          verification_badge: breakingNews.author.reporter_profile.verification_badge || 'verified'
        } : null
      } : null,
      metadata: breakingNews.metadata,
      created_at: breakingNews.created_at,
      updated_at: breakingNews.updated_at
    };

    console.log('✅ تم جلب خبر عاجل:', formattedBreakingNews.title);

    return NextResponse.json({
      success: true,
      breakingNews: formattedBreakingNews,
      message: 'تم جلب الخبر العاجل بنجاح'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // كاش قصير للأخبار العاجلة
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الأخبار العاجلة:', error);
    
    return NextResponse.json({
      success: false,
      breakingNews: null,
      error: 'حدث خطأ في جلب الأخبار العاجلة',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}