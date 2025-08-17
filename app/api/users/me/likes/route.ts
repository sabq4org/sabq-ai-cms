import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'liked_date';
    
    const skip = (page - 1) * limit;

    // جلب التفاعلات مع المقالات
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: user.id,
        type: 'like'
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            featured_image: true,
            published_at: true,
            views: true,
            likes: true,
            saves: true,
            reading_time: true,
            status: true,
            categories: true,
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });

    // تصفية وتنسيق النتائج
    const articlesWithInteraction = interactions
      .filter(interaction => 
        interaction.articles && 
        interaction.articles.status === 'published' &&
        (!search || 
          interaction.articles.title.toLowerCase().includes(search.toLowerCase()) ||
          interaction.articles.excerpt?.toLowerCase().includes(search.toLowerCase())
        )
      )
      .map(interaction => {
        const article = interaction.articles!;
        return {
          ...article,
          liked_at: interaction.created_at,
          interaction_id: interaction.id,
          categories: Array.isArray(article.categories) 
            ? article.categories 
            : article.categories 
              ? [article.categories] 
              : []
        };
      });

    // ترتيب النتائج
    if (sortBy === 'published_date') {
      articlesWithInteraction.sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bDate - aDate;
      });
    } else if (sortBy === 'popularity') {
      articlesWithInteraction.sort((a, b) => 
        (b.likes + b.views) - (a.likes + a.views)
      );
    }

    // حساب العدد الإجمالي
    const totalCount = await prisma.interactions.count({
      where: {
        user_id: user.id,
        type: 'like'
      }
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        articles: articlesWithInteraction,
        total: totalCount,
        page,
        limit,
        totalPages,
        hasMore
      }
    });

  } catch (error: any) {
    console.error('Error fetching liked articles:', error);
    
    if (String(error?.message || error).includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات المعجب بها'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// إزالة الإعجاب من مقال
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // إزالة الإعجاب
    const deletedInteraction = await prisma.interactions.deleteMany({
      where: {
        user_id: user.id,
        article_id: articleId,
        type: 'like'
      }
    });

    if (deletedInteraction.count === 0) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على الإعجاب'
      }, { status: 404 });
    }

    // تحديث عداد الإعجابات في المقال
    await prisma.articles.update({
      where: { id: articleId },
      data: { likes: { decrement: 1 } }
    });

    // التأكد من عدم وجود قيم سالبة
    await prisma.articles.updateMany({
      where: { id: articleId, likes: { lt: 0 } },
      data: { likes: 0 }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء الإعجاب بنجاح'
    });

  } catch (error: any) {
    console.error('Error removing like:', error);
    
    if (String(error?.message || error).includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في إلغاء الإعجاب'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
