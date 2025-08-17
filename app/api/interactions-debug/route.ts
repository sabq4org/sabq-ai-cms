import { NextRequest, NextResponse } from 'next/server';

// محاكاة قاعدة بيانات بسيطة في الذاكرة للاختبار
let interactions: any[] = [];
let articles: any[] = [
  {
    id: 'test-article-1',
    title: 'مقال تجريبي للاختبار',
    status: 'published',
    likes: 0,
    saves: 0,
    views: 0,
    shares: 0
  },
  {
    id: 'test-article-2', 
    title: 'مقال تجريبي ثاني',
    status: 'published',
    likes: 0,
    saves: 0,
    views: 0,
    shares: 0
  }
];

let users: any[] = [
  {
    id: 'test-user-1',
    name: 'مستخدم تجريبي',
    email: 'test@example.com'
  },
  {
    id: 'test-user-2',
    name: 'مستخدم تجريبي ثاني', 
    email: 'test2@example.com'
  }
];

// GET: جلب البيانات أو حالة التفاعلات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url!);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const articleId = searchParams.get('articleId');

    switch (action) {
      case 'users':
        return NextResponse.json({
          success: true,
          users: users,
          message: `تم جلب ${users.length} مستخدم`
        });

      case 'articles':
        return NextResponse.json({
          success: true,
          articles: articles,
          message: `تم جلب ${articles.length} مقال`
        });

      case 'interactions':
        if (userId && articleId) {
          const userInteractions = interactions.filter(i => 
            i.user_id === userId && i.article_id === articleId
          );
          
          const state = {
            liked: userInteractions.some(i => i.type === 'like'),
            saved: userInteractions.some(i => i.type === 'save'),
            shared: userInteractions.some(i => i.type === 'share')
          };

          return NextResponse.json({
            success: true,
            data: state,
            interactions: userInteractions,
            message: `تم العثور على ${userInteractions.length} تفاعل`
          });
        } else {
          return NextResponse.json({
            success: true,
            interactions: interactions,
            total: interactions.length,
            message: `تم جلب جميع التفاعلات (${interactions.length})`
          });
        }

      case 'status':
        return NextResponse.json({
          success: true,
          status: {
            users_count: users.length,
            articles_count: articles.length,
            interactions_count: interactions.length,
            memory_usage: 'in-memory database',
            last_interaction: interactions.length > 0 ? interactions[interactions.length - 1] : null
          },
          message: 'النظام يعمل بنجاح (محاكاة)'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'action مطلوب: users, articles, interactions, status'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ خطأ في GET interactions-debug:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في معالجة الطلب',
      details: error.message
    }, { status: 500 });
  }
}

// POST: إنشاء أو حذف تفاعل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleId, type, action = 'add' } = body;

    console.log('🎯 معالجة تفاعل تجريبي:', { userId, articleId, type, action });

    // التحقق من البيانات
    if (!userId || !articleId || !type) {
      return NextResponse.json({
        success: false,
        error: 'userId, articleId, type مطلوبة'
      }, { status: 400 });
    }

    // التحقق من وجود المستخدم والمقال
    const user = users.find(u => u.id === userId);
    const article = articles.find(a => a.id === articleId);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 });
    }

    // البحث عن التفاعل الموجود
    const existingIndex = interactions.findIndex(i => 
      i.user_id === userId && i.article_id === articleId && i.type === type
    );

    if (action === 'add') {
      if (existingIndex >= 0) {
        return NextResponse.json({
          success: true,
          message: `${type} موجود مسبقاً`,
          action: 'already_exists'
        });
      }

      // إضافة تفاعل جديد
      const newInteraction = {
        id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        article_id: articleId,
        type: type,
        created_at: new Date().toISOString()
      };

      interactions.push(newInteraction);

      // تحديث عدادات المقال
      if (type === 'like') article.likes++;
      else if (type === 'save') article.saves++;
      else if (type === 'share') article.shares++;
      else if (type === 'view') article.views++;

      console.log('✅ تم إضافة التفاعل:', newInteraction.id);
      
      return NextResponse.json({
        success: true,
        message: `تم إضافة ${type} بنجاح`,
        action: 'added',
        data: newInteraction,
        article_stats: {
          likes: article.likes,
          saves: article.saves,
          shares: article.shares,
          views: article.views
        }
      });

    } else if (action === 'remove') {
      if (existingIndex < 0) {
        return NextResponse.json({
          success: false,
          message: `لا يوجد ${type} للحذف`,
          action: 'not_found'
        });
      }

      // حذف التفاعل
      const removedInteraction = interactions.splice(existingIndex, 1)[0];

      // تحديث عدادات المقال
      if (type === 'like') article.likes = Math.max(0, article.likes - 1);
      else if (type === 'save') article.saves = Math.max(0, article.saves - 1);
      else if (type === 'share') article.shares = Math.max(0, article.shares - 1);
      else if (type === 'view') article.views = Math.max(0, article.views - 1);

      console.log('🗑️ تم حذف التفاعل:', removedInteraction.id);

      return NextResponse.json({
        success: true,
        message: `تم حذف ${type} بنجاح`,
        action: 'removed',
        data: removedInteraction,
        article_stats: {
          likes: article.likes,
          saves: article.saves,
          shares: article.shares,
          views: article.views
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'action يجب أن يكون add أو remove'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ خطأ في POST interactions-debug:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في معالجة التفاعل',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE: مسح جميع البيانات التجريبية
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url!);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json({
        success: false,
        error: 'أضف ?confirm=true لتأكيد مسح جميع البيانات'
      }, { status: 400 });
    }

    const oldCounts = {
      interactions: interactions.length,
      articles: articles.length,
      users: users.length
    };

    // إعادة تعيين كل شيء
    interactions = [];
    
    // إعادة تعيين عدادات المقالات
    articles.forEach(article => {
      article.likes = 0;
      article.saves = 0;
      article.views = 0;
      article.shares = 0;
    });

    console.log('🗑️ تم مسح جميع البيانات التجريبية');

    return NextResponse.json({
      success: true,
      message: 'تم مسح جميع البيانات التجريبية',
      old_counts: oldCounts,
      new_counts: {
        interactions: interactions.length,
        articles: articles.length,
        users: users.length
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في DELETE interactions-debug:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في مسح البيانات',
      details: error.message
    }, { status: 500 });
  }
} 