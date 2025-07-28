import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';












// دالة مساعدة للتحقق من دور المستخدم
async function getUserRole(userId: string): Promise<string> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role || 'user';
}

// تحديث تعليق
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    const { id: commentId } = await context.params;

    // جلب التعليق الحالي
    const comment = await prisma.comments.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'التعليق غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = await getUserRole(user.id);
    const canEdit = comment.user_id === user.id || ['admin', 'moderator'].includes(userRole);

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية تعديل هذا التعليق' },
        { status: 403 }
      );
    }

    // تحديث التعليق
    const updatedComment = await prisma.comments.update({
      where: { id: commentId },
      data: {
        content,
        metadata: {
          ...((comment.metadata as any) || {}),
          editedAt: new Date().toISOString(),
          editedBy: user.id
        }
      }
    });

    // تسجيل عملية التعديل
    if (['admin', 'moderator'].includes(userRole)) {
      // DISABLED: await prisma.commentModerationLog.create
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث التعليق' },
      { status: 500 }
    );
  }
}

// حذف تعليق
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { id: commentId } = await context.params;

    // جلب التعليق
    const comment = await prisma.comments.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'التعليق غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = await getUserRole(user.id);
    const canDelete = comment.user_id === user.id || ['admin', 'moderator'].includes(userRole);

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية حذف هذا التعليق' },
        { status: 403 }
      );
    }

    // إذا كان للتعليق ردود، نقوم بتغيير المحتوى بدلاً من الحذف
    // نحتاج للتحقق من وجود ردود بطريقة منفصلة
    const repliesCount = await prisma.comments.count({
      where: { parent_id: commentId }
    });

    if (repliesCount > 0) {
      await prisma.comments.update({
        where: { id: commentId },
        data: {
          content: '[تم حذف هذا التعليق]',
          status: 'archived'
        }
      });
    } else {
      // حذف التعليق نهائياً إذا لم يكن له ردود
      await prisma.comments.delete({
        where: { id: commentId }
      });
    }

    // تحديث عدد التعليقات في المقال
    if (comment.status === 'approved') {
      await prisma.$executeRaw`
        UPDATE articles 
        SET comments_count = comments_count - 1
        WHERE id = ${comment.article_id}
      `;
    }

    // تسجيل عملية الحذف
    if (['admin', 'moderator'].includes(userRole)) {
      // DISABLED: await prisma.commentModerationLog.create
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف التعليق بنجاح'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف التعليق' },
      { status: 500 }
    );
  }
} 