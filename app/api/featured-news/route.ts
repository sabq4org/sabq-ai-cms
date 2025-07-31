import { NextRequest, NextResponse } from 'next/server';
import { FeaturedArticleManager } from '@/lib/services/featured-article-manager';

// تعطيل التخزين المؤقت لهذه الواجهة
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // جلب المقال المميز باستخدام المدير المركزي
    const featuredArticle = await FeaturedArticleManager.getCurrentFeatured();

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
  }
}