import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: جلب الردود على موضوع معين
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get('topic_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!topicId) {
      return NextResponse.json(
        { error: 'معرف الموضوع مطلوب' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // جلب الردود
    const replies = await prisma.$queryRawUnsafe(`
      SELECT 
        r.id,
        r.content,
        r.created_at,
        r.updated_at,
        r.topic_id,
        r.author_id,
        r.parent_reply_id,
        u.name as author_name,
        u.email as author_email
      FROM forum_replies r
      JOIN users u ON r.author_id = u.id
      WHERE r.topic_id = ? AND r.status = 'active'
      ORDER BY r.created_at ASC
      LIMIT ? OFFSET ?
    `, topicId, limit, offset);

    // جلب عدد الإعجابات لكل رد
    const replyIds = (replies as any[]).map(r => r.id);
    const likeCounts = replyIds.length > 0 ? await prisma.$queryRawUnsafe(`
      SELECT target_id, COUNT(*) as count 
      FROM forum_votes 
      WHERE target_id IN (${replyIds.map(() => '?').join(',')}) AND target_type = 'reply' AND vote_type = 'like'
      GROUP BY target_id
    `, ...replyIds) : [];

    const likeCountsMap = new Map((likeCounts as any[]).map(l => [l.target_id, Number(l.count)]));

    // جلب العدد الإجمالي
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM forum_replies WHERE topic_id = ? AND status = 'active'
    `, topicId);
    
    const total = Number((countResult as any)[0]?.total || 0);

    // تنسيق البيانات
    const formattedReplies = (replies as any[]).map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      topicId: reply.topic_id,
      parentReplyId: reply.parent_reply_id,
      author: {
        id: reply.author_id,
        name: reply.author_name,
        avatar: `/images/authors/default-avatar.jpg`
      },
      likes: likeCountsMap.get(reply.id) || 0,
      relativeTime: getRelativeTime(new Date(reply.created_at))
    }));

    return NextResponse.json({
      replies: formattedReplies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الردود' },
      { status: 500 }
    );
  }
}

// POST: إضافة رد جديد
export async function POST(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من تسجيل الدخول
    const body = await request.json();
    const { topic_id, content, parent_reply_id } = body;

    if (!topic_id || !content) {
      return NextResponse.json(
        { error: 'معرف الموضوع والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من وجود الموضوع
    const topic = await prisma.$queryRawUnsafe(`
      SELECT id, is_locked FROM forum_topics WHERE id = ? AND status = 'active'
    `, topic_id);

    if ((topic as any[]).length === 0) {
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    if ((topic as any)[0].is_locked) {
      return NextResponse.json(
        { error: 'الموضوع مغلق للردود' },
        { status: 403 }
      );
    }

    const replyId = crypto.randomUUID();
    const userId = 'user1'; // مؤقتاً حتى يتم تنفيذ نظام المصادقة

    // إضافة الرد
    await prisma.$executeRawUnsafe(`
      INSERT INTO forum_replies (id, content, topic_id, author_id, parent_reply_id)
      VALUES (?, ?, ?, ?, ?)
    `, replyId, content, topic_id, userId, parent_reply_id);

    // تحديث وقت آخر رد في الموضوع
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics SET last_reply_at = NOW() WHERE id = ?
    `, topic_id);

    // إضافة نقاط السمعة
    await prisma.$executeRawUnsafe(`
      INSERT INTO forum_reputation (id, user_id, points, action_type, target_type, target_id, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, crypto.randomUUID(), userId, 5, 'reply_posted', 'reply', replyId, 'إضافة رد');

    return NextResponse.json({
      id: replyId,
      message: 'تم إضافة الرد بنجاح'
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة الرد' },
      { status: 500 }
    );
  }
}

// PUT: تحديث رد (للمؤلف فقط)
export async function PUT(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من تسجيل الدخول والصلاحيات
    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'معرف الرد والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      UPDATE forum_replies 
      SET content = ?, updated_at = NOW()
      WHERE id = ?
    `, content, id);

    return NextResponse.json({
      message: 'تم تحديث الرد بنجاح'
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الرد' },
      { status: 500 }
    );
  }
}

// DELETE: حذف رد (للمؤلف أو المشرف)
export async function DELETE(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من تسجيل الدخول والصلاحيات
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الرد مطلوب' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      UPDATE forum_replies SET status = 'deleted' WHERE id = ?
    `, id);

    return NextResponse.json({
      message: 'تم حذف الرد بنجاح'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الرد' },
      { status: 500 }
    );
  }
}

// دالة مساعدة لحساب الوقت النسبي
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  if (diffDays < 30) return `قبل ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn'
  });
} 