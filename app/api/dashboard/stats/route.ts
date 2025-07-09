import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'خطأ في الاتصال بقاعدة البيانات' }, { status: 500 });
    }

    // جلب إحصائيات المقالات
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, created_at, views, status, is_breaking, category');

    if (articlesError) throw articlesError;

    // حساب الإحصائيات
    const totalArticles = articles?.length || 0;
    
    // مقالات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayArticles = articles?.filter(article => 
      new Date(article.created_at) >= today
    ).length || 0;

    // الأخبار العاجلة
    const breakingNews = articles?.filter(article => 
      article.is_breaking === true
    ).length || 0;

    // إجمالي المشاهدات
    const totalViews = articles?.reduce((sum, article) => 
      sum + (article.views || 0), 0
    ) || 0;

    // جلب عدد المستخدمين النشطين
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, is_active, last_login');

    if (usersError) throw usersError;

    const activeUsers = users?.filter(user => 
      user.is_active !== false
    ).length || 0;

    // جلب التعليقات الجديدة (آخر 24 ساعة)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, created_at')
      .gte('created_at', yesterday.toISOString());

    const newComments = comments?.length || 0;

    // حساب معدل التفاعل
    const engagementRate = activeUsers > 0 
      ? Math.round((newComments / activeUsers) * 100) 
      : 0;

    // حساب نسبة النمو الأسبوعي
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastWeekArticles = articles?.filter(article => 
      new Date(article.created_at) < lastWeek
    ).length || 0;
    
    const weeklyGrowth = lastWeekArticles > 0 
      ? Math.round(((totalArticles - lastWeekArticles) / lastWeekArticles) * 100)
      : 0;

    // إحصائيات النشاط الأسبوعي
    const weeklyActivity = [];
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = articles?.filter(article => {
        const articleDate = new Date(article.created_at);
        return articleDate >= date && articleDate < nextDate;
      }).length || 0;
      
      weeklyActivity.push({
        day: days[date.getDay()],
        count: count
      });
    }

    // المقالات الأكثر قراءة
    const topArticles = articles
      ?.filter(article => article.views > 0)
      ?.sort((a, b) => (b.views || 0) - (a.views || 0))
      ?.slice(0, 4)
      ?.map((article, index) => ({
        rank: index + 1,
        id: article.id,
        views: article.views || 0,
        // يمكن إضافة title من جدول آخر إذا لزم الأمر
      })) || [];

    return NextResponse.json({
      stats: {
        totalArticles,
        activeUsers,
        newComments,
        engagementRate,
        breakingNews,
        totalViews,
        todayArticles,
        weeklyGrowth
      },
      weeklyActivity,
      topArticles
    });

  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
} 