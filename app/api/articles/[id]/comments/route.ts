import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب التعليقات لمقال معين
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let orderBy: any = { created_at: 'desc' };
    
    switch (sort) {
      case 'oldest':
        orderBy = { created_at: 'asc' };
        break;
      case 'popular':
        orderBy = { likes: 'desc' };
        break;
      default:
        orderBy = { created_at: 'desc' };
    }

    // جلب التعليقات الرئيسية فقط (بدون parent_id)
    const comments = await prisma.comments.findMany({
      where: {
        article_id: params.id,
        parent_id: null,
        status: 'approved' // فقط التعليقات المعتمدة
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        // جلب الردود
        replies: {
          where: { status: 'approved' },
          orderBy: { created_at: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                reputation: true,
                badges: true
              }
            }
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            reputation: true,
            badges: true
          }
        }
      }
    });

    // تحويل البيانات للشكل المطلوب
    const formattedComments = comments.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author?.id || comment.user_id || 'unknown',
        name: comment.author?.name || 'مستخدم مجهول',
        email: comment.author?.email || '',
        avatar: comment.author?.avatar,
        reputation: comment.author?.reputation || 0,
        badges: comment.author?.badges || []
      },
      articleId: comment.article_id,
      parentId: comment.parent_id,
      likes: comment.likes,
      isLiked: false, // سيتم تحديدها لاحقاً بناء على المستخدم الحالي
      replies: comment.replies?.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.author?.id || reply.user_id || 'unknown',
          name: reply.author?.name || 'مستخدم مجهول',
          email: reply.author?.email || '',
          avatar: reply.author?.avatar,
          reputation: reply.author?.reputation || 0,
          badges: reply.author?.badges || []
        },
        articleId: reply.article_id,
        parentId: reply.parent_id,
        likes: reply.likes,
        isLiked: false,
        replies: [],
        status: reply.status,
        createdAt: reply.created_at.toISOString(),
        updatedAt: reply.updated_at.toISOString(),
        metadata: typeof reply.metadata === 'object' ? reply.metadata : {}
      })) || [],
      status: comment.status,
      createdAt: comment.created_at.toISOString(),
      updatedAt: comment.updated_at.toISOString(),
      metadata: typeof comment.metadata === 'object' ? comment.metadata : {}
    }));

    // إحصائيات
    const totalComments = await prisma.comments.count({
      where: {
        article_id: params.id,
        status: 'approved'
      }
    });

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      total: totalComments,
      page,
      hasMore: totalComments > page * limit
    });

  } catch (error) {
    console.error('خطأ في جلب التعليقات:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التعليقات' },
      { status: 500 }
    );
  }
}
