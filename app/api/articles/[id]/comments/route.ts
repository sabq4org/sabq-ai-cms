import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      skip: (page - 1) * limit
    });

    // جلب معلومات المؤلفين والردود بشكل منفصل
    const commentIds = comments.map(comment => comment.id);
    
    // جلب الردود
    const replies = commentIds.length > 0 ? await prisma.comments.findMany({
      where: {
        parent_id: { in: commentIds },
        status: 'approved'
      },
      orderBy: { created_at: 'asc' }
    }) : [];

    // تجميع البيانات
    const repliesMap = new Map();
    replies.forEach(reply => {
      if (!repliesMap.has(reply.parent_id)) {
        repliesMap.set(reply.parent_id, []);
      }
      repliesMap.get(reply.parent_id).push(reply);
    });

    // تحويل البيانات للشكل المطلوب
    const formattedComments = comments.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user_id || 'unknown',
        name: 'مستخدم مجهول',
        email: '',
        avatar: null,
        reputation: 0,
        badges: []
      },
      articleId: comment.article_id,
      parentId: comment.parent_id,
      likes: comment.likes,
      isLiked: false, // سيتم تحديدها لاحقاً بناء على المستخدم الحالي
      replies: repliesMap.get(comment.id) || [],
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
