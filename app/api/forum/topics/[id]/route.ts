import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

const supabase = getSupabaseClient();

// جلب موضوع واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await context.params;
    console.log('Fetching topic with ID:', topicId);

    // جلب الموضوع من قاعدة البيانات
    const topicResult = await prisma.$queryRawUnsafe(`
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
        t.last_reply_at,
        t.category_id,
        t.author_id,
        c.name_ar as category_name,
        c.slug as category_slug,
        c.color as category_color
      FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.status = 'active'
    `, topicId);

    if (!topicResult || (topicResult as any[]).length === 0) {
      console.log('Topic not found:', topicId);
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    const topic = (topicResult as any[])[0];

    // جلب معلومات المؤلف
    const authorResult = await prisma.$queryRawUnsafe(`
      SELECT id, name, email FROM users WHERE id = $1
    `, topic.author_id);

    const author = (authorResult as any[])[0] || {
      id: topic.author_id,
      name: 'مستخدم مجهول',
      email: ''
    };

    // جلب عدد الردود
    const replyCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM forum_replies 
      WHERE topic_id = $1 AND status = 'active'
    `, topicId);

    const replyCount = Number((replyCountResult as any[])[0]?.count || 0);

    // تحديث عدد المشاهدات
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET views = views + 1 
      WHERE id = $1
    `, topicId);

    // تنسيق البيانات
    const formattedTopic = {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      views: Number(topic.views) + 1,
      is_pinned: Boolean(topic.is_pinned),
      is_locked: Boolean(topic.is_locked),
      is_featured: Boolean(topic.is_featured),
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      last_reply_at: topic.last_reply_at,
      categories: {
        id: topic.category_id,
        name: topic.category_name,
        slug: topic.category_slug,
        color: topic.category_color
      },
      author: {
        id: author.id,
        name: author.name,
        avatar: `/images/authors/default-avatar.jpg`
      },
      replies_count: replyCount
    };

    return NextResponse.json({ topic: formattedTopic });

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

// تحديث موضوع (للأدمن)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    // التحقق من الصلاحيات
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل المواضيع' },
        { status: 403 }
      );
    }

    const { id: topicId } = await context.params;
    const body = await request.json();
    const { title, content, is_pinned, is_locked } = body;

    // بناء الاستعلام الديناميكي
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }

    if (is_pinned !== undefined) {
      updates.push(`is_pinned = $${paramIndex}`);
      values.push(is_pinned);
      paramIndex++;
    }

    if (is_locked !== undefined) {
      updates.push(`is_locked = $${paramIndex}`);
      values.push(is_locked);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد بيانات للتحديث' },
        { status: 400 }
      );
    }

    // إضافة updated_at
    updates.push(`updated_at = NOW()`);

    // إضافة topic_id كآخر معامل
    values.push(topicId);

    // تنفيذ التحديث
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, ...values);

    return NextResponse.json({ message: 'تم تحديث الموضوع بنجاح' });

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

// حذف موضوع (للأدمن)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    // التحقق من الصلاحيات
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف المواضيع' },
        { status: 403 }
      );
    }

    const { id: topicId } = await context.params;

    // حذف الموضوع (soft delete)
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
    `, topicId);

    return NextResponse.json({ message: 'تم حذف الموضوع بنجاح' });

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