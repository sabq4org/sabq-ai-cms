import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// GET: جلب ردود الموضوع
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    console.log('Fetching replies for topic:', topicId);

    // جلب الردود مع معلومات المؤلفين
    const { data: replies, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('topic_id', topicId)
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({ 
        error: 'حدث خطأ في جلب الردود',
        details: error.message 
      }, { status: 500 });
    }

    // تنسيق البيانات للواجهة
    const formattedReplies = (replies || []).map((reply: any) => ({
      id: reply.id,
      content: reply.content,
      author: {
        id: reply.author?.id || reply.author_id,
        name: reply.author?.name || 'مستخدم',
        avatar: reply.author?.avatar_url || `/images/authors/default-avatar.jpg`,
        role: reply.author?.role
      },
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      isAccepted: reply.is_accepted || false,
      isPinned: reply.is_pinned || false,
      isHighlighted: reply.is_highlighted || false,
      likes: reply.likes_count || 0,
      isLiked: false // سيتم تحديثه لاحقاً بناءً على المستخدم الحالي
    }));

    console.log(`Found ${formattedReplies.length} replies for topic ${topicId}`);

    return NextResponse.json({
      success: true,
      replies: formattedReplies,
      total: formattedReplies.length
    });
  } catch (error: any) {
    console.error('Error in GET replies:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في جلب الردود',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST: إضافة رد جديد
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const body = await request.json();
    const { content } = body;

    // التحقق من المحتوى
    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: 'محتوى الرد يجب أن يكون أكثر من 5 أحرف' },
        { status: 400 }
      );
    }

    // استخراج معلومات المستخدم من الكوكيز
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    let userId = '00000000-0000-0000-0000-000000000001';
    let userName = 'مستخدم';
    let userEmail = 'user@sabq.org';
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        userId = user.id || userId;
        userName = user.name || userName;
        userEmail = user.email || userEmail;
        console.log('User from cookie:', { userId, userName });
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    
    // أو من الهيدرز المخصصة
    const headersList = request.headers;
    const customUserId = headersList.get('x-user-id');
    const customUserName = headersList.get('x-user-name');
    
    if (customUserId) userId = customUserId;
    if (customUserName) userName = decodeURIComponent(customUserName);

    console.log('Final user info:', { userId, userName });

    // التحقق من وجود الموضوع وحالته
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('id, is_locked, status')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        { error: 'الموضوع غير موجود' },
        { status: 404 }
      );
    }

    if (topic.is_locked) {
      return NextResponse.json(
        { error: 'لا يمكن الرد على موضوع مغلق' },
        { status: 403 }
      );
    }

    if (topic.status !== 'active') {
      return NextResponse.json(
        { error: 'لا يمكن الرد على موضوع غير نشط' },
        { status: 403 }
      );
    }

    // التحقق من وجود المستخدم أو إنشاؤه
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: userName,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (userError) {
        console.error('Error creating user:', userError);
      }
    }

    // إنشاء الرد
    const replyData = {
      id: crypto.randomUUID(),
      topic_id: topicId,
      author_id: userId,
      content: content.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newReply, error: replyError } = await supabase
      .from('forum_replies')
      .insert(replyData)
      .select(`
        *,
        author:users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single();

    if (replyError) {
      console.error('Error creating reply:', replyError);
      return NextResponse.json({ 
        error: 'حدث خطأ في إضافة الرد',
        details: replyError.message 
      }, { status: 500 });
    }

    // تحديث وقت آخر رد في الموضوع وعدد الردود
    await supabase
      .from('forum_topics')
      .update({ 
        last_reply_at: new Date().toISOString(),
        replies: supabase.rpc('increment', { x: 1 })
      })
      .eq('id', topicId);

    // تنسيق الرد للإرجاع
    const formattedReply = {
      id: newReply.id,
      content: newReply.content,
      author: {
        id: newReply.author?.id || userId,
        name: newReply.author?.name || userName,
        avatar: newReply.author?.avatar_url || `/images/authors/default-avatar.jpg`
      },
      createdAt: newReply.created_at,
      updatedAt: newReply.updated_at,
      isAccepted: false,
      isPinned: false,
      isHighlighted: false,
      likes: 0,
      isLiked: false
    };

    console.log('Reply created successfully:', replyData.id);

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      reply: formattedReply
    });
  } catch (error: any) {
    console.error('Error in POST reply:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في إضافة الرد',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 