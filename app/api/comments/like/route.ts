import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';


// إعجاب/إلغاء إعجاب بتعليق
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId } = body;
    // نحاول استخراج المستخدم الحالي من الكوكيز عبر /api/user/me
    let userId: string | null = null;
    try {
      const meUrl = new URL("/api/user/me", request.url);
      const meRes = await fetch(meUrl.toString(), { headers: { cookie: request.headers.get('cookie') || '' }, cache: 'no-store' });
      if (meRes.ok) {
        const me = await meRes.json();
        userId = me?.id || null;
      }
    } catch {}

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

    // مبدئياً: إن لم يتوفر جدول comment_likes في المخطط، سنستخدم likes كعداد فقط ونمنع التكرار عبر المفتاح المحلي
    let existingLike: any = null;

    let isLiked = false;
    let newLikesCount = comment.likes;

    if (existingLike) {
      // إلغاء الإعجاب
      // حذف إعجاب سابق (غير مفعل لعدم وجود الجدول)
      newLikesCount = Math.max(0, comment.likes - 1);
      isLiked = false;
    } else {
      // إضافة إعجاب
      // إنشاء إعجاب جديد (غير مفعل لعدم وجود الجدول)
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

    // عند الإعجاب لأول مرة: تسجيل اهتمام بالمؤلف لمتابعة نشاطه لاحقاً
    if (isLiked && comment.user_id && comment.user_id !== userId) {
      try {
        await prisma.user_preferences.upsert({
          where: { user_id_key: { user_id: userId!, key: `follow_person:${comment.user_id}` } as any },
          update: { value: { set: true }, updated_at: new Date() },
          create: { user_id: userId!, key: `follow_person:${comment.user_id}`, value: true, created_at: new Date(), updated_at: new Date() },
        } as any);
      } catch (e) {
        console.warn('تعذر تسجيل المتابعة للمؤلف:', (e as any)?.message);
      }
    }

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
