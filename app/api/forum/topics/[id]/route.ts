import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب موضوع محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    console.log('Fetching topic:', topicId);

    // جلب الموضوع مع معلومات المؤلف والفئة
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
        t.updated_at,
        t.category_id,
        t.author_id,
        c.name_ar as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.name as author_name,
        u.email as author_email
      FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.author_id = u.id
      WHERE t.id = $1 AND t.status = 'active'
    `, topicId);

    if (!topic || (topic as any[]).length === 0) {
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    const topicData = (topic as any[])[0];

    // زيادة عدد المشاهدات
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics SET views = views + 1 WHERE id = $1
    `, topicId);

    // جلب عدد الردود
    const replyCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM forum_replies 
      WHERE topic_id = $1 AND status = 'active'
    `, topicId);

    // جلب عدد الإعجابات
    const likeCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM forum_votes 
      WHERE target_id = $1 AND target_type = 'topic' AND vote_type = 'like'
    `, topicId);

    // تنسيق البيانات
    const formattedTopic = {
      id: topicData.id,
      title: topicData.title,
      content: topicData.content,
      views: Number(topicData.views) + 1,
      is_pinned: Boolean(topicData.is_pinned),
      is_locked: Boolean(topicData.is_locked),
      is_featured: Boolean(topicData.is_featured),
      created_at: topicData.created_at,
      updated_at: topicData.updated_at,
      category: {
        id: topicData.category_id,
        name: topicData.category_name,
        slug: topicData.category_slug,
        color: topicData.category_color
      },
      author: {
        id: topicData.author_id,
        name: topicData.author_name || 'مستخدم',
        email: topicData.author_email,
        avatar: `/images/authors/default-avatar.jpg`
      },
      replies_count: Number((replyCount as any)[0]?.count || 0),
      likes_count: Number((likeCount as any)[0]?.count || 0)
    };

    return NextResponse.json(formattedTopic);
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

// PUT: تحديث موضوع
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const body = await request.json();
    const { title, content } = body;

    // التحقق من البيانات
    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    // تحديث الموضوع
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET title = $2, content = $3, updated_at = NOW()
      WHERE id = $1
    `, topicId, title.trim(), content.trim());

    return NextResponse.json({
      message: 'تم تحديث الموضوع بنجاح'
    });
  } catch (error: any) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في تحديث الموضوع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE: حذف موضوع (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    // حذف ناعم للموضوع
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
    `, topicId);

    return NextResponse.json({
      message: 'تم حذف الموضوع بنجاح'
    });
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في حذف الموضوع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 