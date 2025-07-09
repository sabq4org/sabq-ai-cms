import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// جلب موضوع واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories (
          id,
          name,
          slug,
          color
        ),
        author:users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching topic:', error);
      return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // زيادة عدد المشاهدات
    await supabase
      .from('forum_topics')
      .update({ views: (topic.views || 0) + 1 })
      .eq('id', id);

    // جلب الردود
    const { data: replies, error: repliesError } = await supabase
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
      .eq('topic_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    }

    return NextResponse.json({
      success: true,
      topic: {
        ...topic,
        replies: replies || []
      }
    });
  } catch (error) {
    console.error('Error in GET /api/forum/topics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// تحديث موضوع
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون مشرف أو صاحب الموضوع)
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('author_id')
      .eq('id', id)
      .single();
      
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    const isAuthor = topic.author_id === user.id;
    
    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // السماح بتحديث حقول معينة فقط
    const allowedFields = ['title', 'content', 'category_id'];
    const adminOnlyFields = ['is_pinned', 'is_locked', 'status'];
    
    const updateData: any = {};
    
    // إضافة الحقول المسموحة للجميع
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    // إضافة الحقول المسموحة للمشرفين فقط
    if (isAdmin) {
      adminOnlyFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      });
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating topic:', error);
      return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      topic: data
    });
  } catch (error) {
    console.error('Error in PATCH /api/forum/topics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// حذف موضوع
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون مشرف أو صاحب الموضوع)
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('author_id')
      .eq('id', id)
      .single();
      
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    const isAuthor = topic.author_id === user.id;
    
    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // حذف الردود أولاً
    await supabase
      .from('forum_replies')
      .delete()
      .eq('topic_id', id);
    
    // حذف الموضوع
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting topic:', error);
      return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/forum/topics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 