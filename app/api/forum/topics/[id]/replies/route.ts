import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// GET: جلب ردود الموضوع
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    console.log('Fetching replies for topic:', topicId);

    // جلب الردود مع معلومات المؤلفين
    const replies = await prisma.$queryRawUnsafe(`
      SELECT 
        r.id,
        r.content,
        r.created_at,
        r.updated_at,
        r.is_accepted,
        r.is_pinned,
        r.author_id,
        u.name as author_name,
        u.email as author_email
      FROM forum_replies r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.topic_id = $1 AND r.status = 'active'
      ORDER BY r.is_pinned DESC, r.created_at ASC
    `, topicId);

    // جلب عدد الإعجابات لكل رد
    const replyIds = (replies as any[]).map(r => r.id);
    let likeCounts = new Map();
    
    if (replyIds.length > 0) {
      const likes = await prisma.$queryRawUnsafe(`
        SELECT target_id, COUNT(*) as count 
        FROM forum_votes 
        WHERE target_id IN (${replyIds.map((_, i) => '$' + (i + 2)).join(',')}) 
        AND target_type = 'reply' 
        AND vote_type = 'like'
        GROUP BY target_id
      `, topicId, ...replyIds);
      
      likeCounts = new Map((likes as any[]).map(l => [l.target_id, Number(l.count)]));
    }

    // تنسيق البيانات
    const formattedReplies = (replies as any[]).map(reply => ({
      id: reply.id,
      content: reply.content,
      author: {
        id: reply.author_id,
        name: reply.author_name || 'مستخدم',
        avatar: `/images/authors/default-avatar.jpg`
      },
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      isAccepted: Boolean(reply.is_accepted),
      isPinned: Boolean(reply.is_pinned),
      likes: likeCounts.get(reply.id) || 0
    }));

    return NextResponse.json({
      replies: formattedReplies,
      total: formattedReplies.length
    });
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب الردود',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST: إضافة رد جديد
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإضافة رد' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: 'محتوى الرد يجب أن يكون أكثر من 5 أحرف' },
        { status: 400 }
      );
    }

    // التحقق من وجود الموضوع
    const topicCheck = await prisma.$queryRawUnsafe(`
      SELECT id, is_locked FROM forum_topics WHERE id = $1 AND status = 'active'
    `, topicId);
    
    if (!topicCheck || (topicCheck as any[]).length === 0) {
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    const topic = (topicCheck as any[])[0];
    if (topic.is_locked) {
      return NextResponse.json(
        { error: 'لا يمكن الرد على موضوع مغلق' },
        { status: 403 }
      );
    }

    // استخراج معلومات المستخدم
    let userId = '00000000-0000-0000-0000-000000000001';
    let userName = 'مستخدم';
    
    try {
      const cookieHeader = headersList.get('cookie') || '';
      const userIdMatch = cookieHeader.match(/user_id=([^;]+)/);
      const userNameMatch = cookieHeader.match(/user_name=([^;]+)/);
      
      if (userIdMatch) userId = decodeURIComponent(userIdMatch[1]);
      if (userNameMatch) userName = decodeURIComponent(userNameMatch[1]);
      
      const customUserId = headersList.get('x-user-id');
      const customUserName = headersList.get('x-user-name');
      
      if (customUserId) userId = customUserId;
      if (customUserName) userName = decodeURIComponent(customUserName);
    } catch (error) {
      console.error('Error extracting user info:', error);
    }

    // التحقق من وجود المستخدم أو إنشاؤه
    const userCheck = await prisma.$queryRawUnsafe(`
      SELECT id FROM users WHERE id = $1
    `, userId);
    
    if (!userCheck || (userCheck as any[]).length === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO users (id, name, email, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, updated_at = NOW()
      `, userId, userName, `${userId}@sabq.org`);
    }

    // إنشاء الرد
    const replyId = crypto.randomUUID();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO forum_replies (id, topic_id, author_id, content, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, replyId, topicId, userId, content.trim());

    // تحديث وقت آخر رد في الموضوع
    await prisma.$executeRawUnsafe(`
      UPDATE forum_topics SET last_reply_at = NOW() WHERE id = $1
    `, topicId);

    return NextResponse.json({
      id: replyId,
      message: 'تم إضافة الرد بنجاح'
    });
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إضافة الرد',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 