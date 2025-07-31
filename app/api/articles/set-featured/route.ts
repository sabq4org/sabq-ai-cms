import { NextRequest, NextResponse } from 'next/server';
import { FeaturedArticleManager } from '@/lib/services/featured-article-manager';
import { revalidatePath } from 'next/cache';

/**
 * تعيين خبر كمميز وإلغاء التمييز عن الأخبار الأخرى
 * POST /api/articles/set-featured
 * Body: { articleId: string, featured: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, featured = true, categoryId } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    // إذا كان المطلوب هو تعيين المقال كمميز
    if (featured) {
      const result = await FeaturedArticleManager.setFeaturedArticle(articleId, {
        categoryId: categoryId
      });

      if (result.success) {
        // إعادة التحقق من صحة مسار الصفحة الرئيسية
        revalidatePath('/');
        
        return NextResponse.json({
          success: true,
          message: result.message,
          featuredArticle: result.featuredArticle,
          previouslyFeatured: result.previouslyFeatured
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: result.message
          },
          { status: 400 }
        );
      }
    } else {
      // إلغاء تمييز المقال
      const result = await FeaturedArticleManager.unsetFeaturedArticle(articleId);

      if (result.success) {
        // إعادة التحقق من صحة مسار الصفحة الرئيسية
        revalidatePath('/');
        
        return NextResponse.json({
          success: true,
          message: result.message
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: result.message
          },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error('❌ خطأ في تعيين الخبر المميز:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تعيين الخبر المميز',
        details: error.message 
      },
      { status: 500 }
    );
  }
}