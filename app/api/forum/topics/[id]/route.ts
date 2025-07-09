import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب موضوع واحد بالتفصيل
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    if (!topicId) {
      return NextResponse.json(
        { error: 'معرف الموضوع مطلوب' },
        { status: 400 }
      );
    }

    // جلب بيانات الموضوع
    const topic = await prisma.$queryRawUnsafe(`
      SELECT 
        t.id,
        t.title,
        t.content,
        t.views,
        t.is_pinned,
        t.is_locked,
        t.is_featured,
        t.created_at,
        t.last_reply_at,
        t.category_id,
        t.author_id,
        c.name_ar as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.name as author_name,
        u.email as author_email
      FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON t.author_id = u.id
      WHERE t.id = ? AND t.status = 'active'
    `, topicId);

    if (!topic || (topic as any[]).length === 0) {
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    const topicData = (topic as any[])[0];

    // جلب عدد الردود
    const replyCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM forum_replies 
      WHERE topic_id = ? AND status = 'active'
    `, topicId);

    // جلب عدد الإعجابات
    const likeCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM forum_votes 
      WHERE target_id = ? AND target_type = 'topic' AND vote_type = 'like'
    `, topicId);

    // تحديث عدد المشاهدات
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET views = COALESCE(views, 0) + 1 
      WHERE id = ?
    `, topicId);

    // تنسيق البيانات
    const formattedTopic = {
      id: topicData.id,
      title: topicData.title,
      content: topicData.content,
      views: Number(topicData.views) + 1, // +1 للمشاهدة الحالية
      is_pinned: Boolean(topicData.is_pinned),
      is_locked: Boolean(topicData.is_locked),
      is_featured: Boolean(topicData.is_featured),
      created_at: topicData.created_at,
      last_reply_at: topicData.last_reply_at,
      category: {
        id: topicData.category_id,
        name: topicData.category_name,
        slug: topicData.category_slug,
        color: topicData.category_color
      },
      author: {
        id: topicData.author_id,
        name: topicData.author_name,
        avatar: `/images/authors/default-avatar.jpg`
      },
      replies: Number((replyCount as any[])[0]?.count || 0),
      likes: Number((likeCount as any[])[0]?.count || 0)
    };

    return NextResponse.json({
      topic: formattedTopic
    });
  } catch (error: any) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب الموضوع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: تحديث موضوع (للمؤلف أو المشرف)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: إضافة التحقق من تسجيل الدخول والصلاحيات
    const { id: topicId } = await params;
    const body = await request.json();
    const { title, content, category_id } = body;

    if (!topicId) {
      return NextResponse.json(
        { error: 'معرف الموضوع مطلوب' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET title = ?, content = ?, category_id = ?, updated_at = NOW()
      WHERE id = ?
    `, title, content, category_id, topicId);

    return NextResponse.json({
      message: 'تم تحديث الموضوع بنجاح'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الموضوع' },
      { status: 500 }
    );
  }
}

// DELETE: حذف موضوع (للمؤلف أو المشرف)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: إضافة التحقق من تسجيل الدخول والصلاحيات
    const { id: topicId } = await params;

    if (!topicId) {
      return NextResponse.json(
        { error: 'معرف الموضوع مطلوب' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics SET status = 'deleted' WHERE id = ?
    `, topicId);

    return NextResponse.json({
      message: 'تم حذف الموضوع بنجاح'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الموضوع' },
      { status: 500 }
    );
  }
} 