import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

async function getDepth(commentId: string): Promise<number> {
  let depth = 1;
  let current = await prisma.comments.findUnique({ where: { id: commentId }, select: { parent_id: true } });
  while (current?.parent_id) {
    depth++;
    if (depth > 10) break;
    current = await prisma.comments.findUnique({ where: { id: current.parent_id }, select: { parent_id: true } });
  }
  return depth;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول للرد" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const articleId = body?.articleId || body?.article_id;
    const parentId = body?.parentId || body?.parent_id;
    const content = (body?.content || "").toString();

    if (!articleId || !parentId || !content.trim()) {
      return NextResponse.json({ success: false, error: "حقول مطلوبة ناقصة" }, { status: 400 });
    }

    const parent = await prisma.comments.findUnique({ where: { id: parentId }, select: { article_id: true, id: true } });
    if (!parent || parent.article_id !== articleId) {
      return NextResponse.json({ success: false, error: "تعليق أب غير صالح" }, { status: 400 });
    }

    const depth = await getDepth(parentId);
    if (depth >= 3) {
      return NextResponse.json({ success: false, error: "max_depth_reached" }, { status: 400 });
    }

    // تطبيق فلترة مبسطة جداً (يمكن توسيعها لاحقاً)
    if (content.length < 2 || content.length > 2000) {
      return NextResponse.json({ success: false, error: "طول المحتوى غير مسموح" }, { status: 400 });
    }

    const created = await prisma.comments.create({
      data: {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        article_id: articleId,
        user_id: user.id,
        parent_id: parentId,
        content: content.trim(),
        status: "pending",
        likes: 0,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {
          ...(parent as any)?.metadata,
          reply_to: parentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      status: "success",
      comment: {
        id: created.id,
        content: created.content,
        createdAt: created.created_at,
        status: created.status,
        is_approved: false,
        parentId: parentId,
      },
      message: "تم إضافة الرد وبانتظار المراجعة",
    });
  } catch (error) {
    console.error("خطأ في POST /api/comments/reply:", error);
    return NextResponse.json({ success: false, error: "فشل في إضافة الرد" }, { status: 500 });
  }
}


