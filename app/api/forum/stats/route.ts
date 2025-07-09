import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // إحصائيات المواضيع
    const { count: totalTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true });

    const { count: activeTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: pinnedTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_pinned', true);

    const { count: lockedTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_locked', true);

    // إحصائيات الردود
    const { count: totalReplies } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true });

    // إحصائيات الأعضاء
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // إحصائيات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: todayReplies } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    return NextResponse.json({
      success: true,
      stats: {
        totalTopics: totalTopics || 0,
        totalReplies: totalReplies || 0,
        totalMembers: totalMembers || 0,
        activeTopics: activeTopics || 0,
        pinnedTopics: pinnedTopics || 0,
        lockedTopics: lockedTopics || 0,
        todayTopics: todayTopics || 0,
        todayReplies: todayReplies || 0
      }
    });
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 