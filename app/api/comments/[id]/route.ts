import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/lib/prisma";
import { getEffectiveUserRoleById } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUserRole(userId: string): Promise<string> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role || "user";
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params || ({} as any);
    if (!id) {
      return NextResponse.json(
        { success: false, error: "معرّف التعليق مفقود" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const desiredStatus = (body?.status || "").toString();
    const allowed = new Set(["approved", "pending", "rejected", "spam"]);
    if (!allowed.has(desiredStatus as any)) {
      return NextResponse.json(
        { success: false, error: "حالة غير صالحة" },
        { status: 400 }
      );
    }

    // التحقق من الصلاحيات
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }
    const role = await getEffectiveUserRoleById(user.id);
    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "صلاحيات غير كافية" },
        { status: 403 }
      );
    }

    // جلب التعليق الحالي
    const existing = await prisma.comments.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "التعليق غير موجود" },
        { status: 404 }
      );
    }

    const prevStatus = existing.status;

    // تحديث الحالة
    const updated = await prisma.comments.update({
      where: { id },
      data: {
        status: desiredStatus,
        updated_at: new Date(),
        metadata: {
          ...(existing.metadata as any),
          moderation: {
            byUserId: user.id,
            at: new Date().toISOString(),
            from: prevStatus,
            to: desiredStatus,
          },
        },
      },
    });

    // عند الموافقة: جدولة/تسجيل تنويه عام (قابل للتخصيص لاحقاً)
    if (desiredStatus === "approved") {
      try {
        await prisma.smart_notifications.create({
          data: {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            user_id: null,
            title: "تعليق جديد",
            message: "تمت الموافقة على تعليق جديد على خبر قد يهمك",
            type: "user_engagement" as any,
            priority: "medium" as any,
            data: { comment_id: id, article_id: existing.article_id },
            created_at: new Date(),
          },
        } as any);
      } catch (e) {
        console.warn("تعذر تسجيل التنويه عند الموافقة على التعليق:", (e as any)?.message);
      }
    }

    // تحديث عدّاد التعليقات بالمقال في حال تغيّر شمولية الموافقة
    try {
      if (prevStatus !== "approved" && desiredStatus === "approved") {
        await prisma.$executeRaw`
          UPDATE articles SET comments_count = comments_count + 1, last_comment_at = NOW()
          WHERE id = ${existing.article_id}
        `;
      } else if (prevStatus === "approved" && desiredStatus !== "approved") {
        await prisma.$executeRaw`
          UPDATE articles SET comments_count = GREATEST(comments_count - 1, 0)
          WHERE id = ${existing.article_id}
        `;
      }
    } catch (e) {
      console.error("Failed to adjust article comment count", e);
    }

    try {
      revalidatePath(`/article/${existing.article_id}`);
    } catch {}
    return NextResponse.json(
      { success: true, comment: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Vercel-CDN-Cache-Control": "private, no-store",
          "CDN-Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("PATCH /api/comments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تحديث التعليق" },
      { status: 500 }
    );
  }
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
        { success: false, error: "يجب تسجيل الدخول" },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    const { id: commentId } = await context.params;

    // جلب التعليق الحالي
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "التعليق غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = await getUserRole(user.id);
    const canEdit =
      comment.user_id === user.id || ["admin", "moderator"].includes(userRole);

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: "ليس لديك صلاحية تعديل هذا التعليق" },
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
          editedBy: user.id,
        },
      },
    });

    // تسجيل عملية التعديل
    if (["admin", "moderator"].includes(userRole)) {
      // DISABLED: await prisma.commentModerationLog.create
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تحديث التعليق" },
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
        { success: false, error: "يجب تسجيل الدخول" },
        { status: 401 }
      );
    }

    const { id: commentId } = await context.params;

    // جلب التعليق
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "التعليق غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = await getUserRole(user.id);
    const canDelete =
      comment.user_id === user.id || ["admin", "moderator"].includes(userRole);

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: "ليس لديك صلاحية حذف هذا التعليق" },
        { status: 403 }
      );
    }

    // إذا كان للتعليق ردود، نقوم بتغيير المحتوى بدلاً من الحذف
    // نحتاج للتحقق من وجود ردود بطريقة منفصلة
    const repliesCount = await prisma.comments.count({
      where: { parent_id: commentId },
    });

    if (repliesCount > 0) {
      await prisma.comments.update({
        where: { id: commentId },
        data: {
          content: "[تم حذف هذا التعليق]",
          status: "archived",
        },
      });
    } else {
      // حذف التعليق نهائياً إذا لم يكن له ردود
      await prisma.comments.delete({
        where: { id: commentId },
      });
    }

    // تحديث عدد التعليقات في المقال
    if (comment.status === "approved") {
      await prisma.$executeRaw`
        UPDATE articles
        SET comments_count = comments_count - 1
        WHERE id = ${comment.article_id}
      `;
    }

    // تسجيل عملية الحذف
    if (["admin", "moderator"].includes(userRole)) {
      // DISABLED: await prisma.commentModerationLog.create
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف التعليق بنجاح",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "فشل في حذف التعليق" },
      { status: 500 }
    );
  }
}
