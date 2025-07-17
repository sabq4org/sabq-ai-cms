import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف المستخدم مطلوب' 
      }, { status: 400 });
    }

    if (userId === 'anonymous') {
      return NextResponse.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          page,
          totalPages: 0
        }
      });
    }

    const skip = (page - 1) * limit;

    // جلب التفاعلات من نوع like
    const likedInteractions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        type: 'like'
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    });

    // جلب معرفات المقالات
    const articleIds = likedInteractions.map(interaction => interaction.article_id).filter(Boolean);

    // جلب تفاصيل المقالات
    const articles = await prisma.articles.findMany({
      where: {
        id: { in: articleIds },
        status: 'published'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      }
    });

    // ترتيب المقالات حسب ترتيب التفاعلات
    const sortedArticles = articleIds.map(id => articles.find(article => article.id === id)).filter(Boolean);

    // إضافة معلومات التفاعل
    const articlesWithInteraction = sortedArticles.map(article => {
      if (!article) return null;
      const interaction = likedInteractions.find(i => i.article_id === article.id);
      return {
        ...article,
        liked_at: interaction?.created_at,
        interaction_id: interaction?.id
      };
    }).filter(Boolean);

    // حساب العدد الإجمالي
    const totalLiked = await prisma.interactions.count({
      where: {
        user_id: userId,
        type: 'like'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        articles: articlesWithInteraction,
        total: totalLiked,
        page,
        totalPages: Math.ceil(totalLiked / limit),
        hasMore: page * limit < totalLiked
      }
    });

  } catch (error) {
    console.error('Error fetching liked articles:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'حدث خطأ في جلب المقالات المعجب بها' 
    }, { status: 500 });
  }
} 