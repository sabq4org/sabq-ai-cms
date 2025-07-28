import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';


// إعجاب/إلغاء إعجاب بتعليق
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    if (userId === 'anonymous') {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول للإعجاب' },
        { status: 401 }
      );
    }

    // التحقق من وجود التعليق
    const comment = await prisma.comments.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'التعليق غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من وجود إعجاب سابق
    const existingLike = await prisma.comment_likes?.findUnique({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: commentId
        }
      }
    });

    let isLiked = false;
    let newLikesCount = comment.likes;

    if (existingLike) {
      // إلغاء الإعجاب
      await prisma.comment_likes?.delete({
        where: { id: existingLike.id }
      });
      newLikesCount = Math.max(0, comment.likes - 1);
      isLiked = false;
    } else {
      // إضافة إعجاب
      await prisma.comment_likes?.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          comment_id: commentId,
          created_at: new Date()
        }
      });
      newLikesCount = comment.likes + 1;
      isLiked = true;

      // إضافة نقاط لصاحب التعليق
      if (comment.user_id && comment.user_id !== userId) {
        await addUserPoints(comment.user_id, 'comment_liked', commentId, 1);
      }
    }

    // تحديث عدد الإعجابات في التعليق
    await prisma.comments.update({
      where: { id: commentId },
      data: { likes: newLikesCount }
    });

    return NextResponse.json({
      success: true,
      isLiked,
      likes: newLikesCount
    });

  } catch (error) {
    console.error('خطأ في تسجيل الإعجاب:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تسجيل الإعجاب' },
      { status: 500 }
    );
  }
}

// إضافة نقاط للمستخدم
async function addUserPoints(userId: string, action: string, referenceId: string, points: number) {
  try {
    await prisma.loyalty_points.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        points,
        action,
        reference_id: referenceId,
        reference_type: 'comment_like',
        metadata: {
          timestamp: new Date().toISOString()
        },
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('خطأ في إضافة النقاط:', error);
  }
}
