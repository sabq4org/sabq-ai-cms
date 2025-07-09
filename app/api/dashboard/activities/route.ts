import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'خطأ في الاتصال بقاعدة البيانات' }, { status: 500 });
    }

    // جلب آخر الأنشطة من جدول timeline_events
    const { data: events, error: eventsError } = await supabase
      .from('timeline_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      // إذا لم يكن الجدول موجود، نحاول جلب من جداول أخرى
      console.log('جدول timeline_events غير موجود، جلب من جداول أخرى');
      
      const activities = [];
      
      // جلب آخر المقالات
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, created_at, author_id')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (articles) {
        articles.forEach(article => {
          activities.push({
            type: 'article_published',
            title: 'مقال جديد',
            description: article.title || 'تم نشر مقال جديد',
            created_at: article.created_at,
            metadata: { article_id: article.id }
          });
        });
      }
      
      // جلب آخر التعليقات
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (comments) {
        comments.forEach(comment => {
          activities.push({
            type: 'comment_posted',
            title: 'تعليق جديد',
            description: comment.content?.substring(0, 50) + '...' || 'تم إضافة تعليق جديد',
            created_at: comment.created_at,
            metadata: { comment_id: comment.id }
          });
        });
      }
      
      // جلب آخر المستخدمين المسجلين
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (users) {
        users.forEach(user => {
          activities.push({
            type: 'user_registered',
            title: 'مستخدم جديد',
            description: `انضم ${user.name || user.email} إلى المنصة`,
            created_at: user.created_at,
            metadata: { user_id: user.id }
          });
        });
      }
      
      // ترتيب الأنشطة حسب التاريخ
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return NextResponse.json({
        activities: activities.slice(0, 10)
      });
    }

    // معالجة الأنشطة من جدول timeline_events
    const activities = events?.map(event => ({
      type: event.event_type,
      title: getEventTitle(event.event_type),
      description: event.description || getEventDescription(event),
      created_at: event.created_at,
      metadata: event.metadata || {}
    })) || [];

    return NextResponse.json({
      activities
    });

  } catch (error) {
    console.error('خطأ في جلب الأنشطة:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الأنشطة' },
      { status: 500 }
    );
  }
}

// دالة مساعدة لتحديد عنوان النشاط
function getEventTitle(eventType: string): string {
  const titles: { [key: string]: string } = {
    'article_published': 'مقال جديد',
    'user_registered': 'مستخدم جديد',
    'comment_posted': 'تعليق جديد',
    'achievement_unlocked': 'إنجاز مفتوح',
    'category_created': 'تصنيف جديد',
    'user_login': 'تسجيل دخول',
    'article_updated': 'تحديث مقال',
    'comment_deleted': 'حذف تعليق'
  };
  
  return titles[eventType] || 'نشاط جديد';
}

// دالة مساعدة لتحديد وصف النشاط
function getEventDescription(event: any): string {
  switch (event.event_type) {
    case 'article_published':
      return 'تم نشر مقال جديد';
    case 'user_registered':
      return 'انضم مستخدم جديد إلى المنصة';
    case 'comment_posted':
      return 'تم إضافة تعليق جديد';
    case 'achievement_unlocked':
      return 'تم فتح إنجاز جديد';
    default:
      return 'حدث نشاط جديد في النظام';
  }
} 